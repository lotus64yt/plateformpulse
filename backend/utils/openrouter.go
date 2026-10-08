package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func GenerateWrappedWithOpenRouter(data WrappedParsedData) (WrappedReponse, error) {
	systemPrompt := `You are a creative, humorous, and slightly sarcastic assistant tasked with generating a "Spotify Wrapped" style summary for a Parisian public transit commuter.

Context: The JSON data provides the user's commute route (the Steps array shows the stations and lines they take) and the actual train records (the SnapShot array shows the exact delays) for a specific selected period.

CRITICAL RULES:
DO NOT assume this is a yearly summary (no "2026 Wrapped" or "this year").
ONLY mention lines and stations that actually appear in the user's JSON. Do NOT make jokes about the RER A, RER B, or any other line unless it is specifically in their Steps or SnapShot array. Tailor your narrative entirely to their actual route!
Pay attention to the Steps array to understand their full journey (e.g., transfers, destinations).

Your Mission:
Analyze their specific route and delays.
Write a storyboard with 4 to 6 "scenes". Explicitly name their stations (e.g., Saint-Nom-La-Bretèche, Gare Saint-Lazare) and their lines to make the Wrapped feel highly personalized.
Calculate totals based ONLY on the provided snapshots (e.g., sum up ArrivalDelayMinutes).
The tone must be fun, dynamic, and sarcastic regarding Parisian transit struggles, but heavily personalized to their data.

Strict Constraints:
The entire output MUST be in ENGLISH.
You must reply ONLY with a valid JSON object. No markdown formatting blocks.
Use exactly this JSON structure:
{
  "wrapped_title": "string (A funny, personalized title for their Wrapped)",
  "scenes": [
    {
      "id": 1,
      "type": "intro | stat | outro",
      "title": "string (Short, punchy main text)",
      "subtitle": "string (The supporting sentence or joke)",
      "highlight": "string (The stat to highlight, e.g., '15 Minutes Lost', 'Line L', or empty)",
      "emoji": "string (A single representative emoji)"
    }
  ]
}`

	dataBytes, _ := json.Marshal(data)
	userMessage := fmt.Sprintf("User's commute data:\n%s", string(dataBytes))

	url := "https://openrouter.ai/api/v1/chat/completions"

	requestBody, err := json.Marshal(map[string]interface{}{
		"model": "google/gemma-4-31b-it",
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": userMessage},
		},
		"response_format": map[string]string{"type": "json_object"},
	})
	if err != nil {
		return WrappedReponse{}, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return WrappedReponse{}, err
	}

	req.Header.Set("Authorization", "Bearer "+GetEnv("OPENROUTER_API_KEY"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("HTTP-Referer", "http://localhost:3000")
	req.Header.Set("X-Title", "PlateformPulse")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return WrappedReponse{}, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return WrappedReponse{}, err
	}

	if resp.StatusCode != http.StatusOK {
		return WrappedReponse{}, fmt.Errorf("openrouter api error: %s", string(bodyBytes))
	}

	type OpenRouterResponse struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	var orResp OpenRouterResponse
	if err := json.Unmarshal(bodyBytes, &orResp); err != nil {
		return WrappedReponse{}, err
	}

	if len(orResp.Choices) == 0 {
		return WrappedReponse{}, fmt.Errorf("no choices returned from orouter")
	}

	content := orResp.Choices[0].Message.Content
	var parsedRes WrappedReponse
	if err := json.Unmarshal([]byte(content), &parsedRes); err != nil {
		return WrappedReponse{}, fmt.Errorf("failed to parse ai res : %s", err)
	}

	return parsedRes, nil
}
