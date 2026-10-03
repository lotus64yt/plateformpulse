package scrapper

import (
	"encoding/json"
	"net/http"
	"plateformpulse/utils"
	"time"
)

func FetchPrim() (SiriResponse, error) {
	apiKey := utils.GetEnv("PRIM_API_KEY")

	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest(http.MethodGet, "https://prim.iledefrance-mobilites.fr/marketplace/estimated-timetable", nil)
	if err != nil {
		return SiriResponse{}, err
	}
	req.Header.Set("apiKey", apiKey)

	resp, err := client.Do(req)
	if err != nil {
		return SiriResponse{}, err
	}
	defer resp.Body.Close()

	var siriResponse SiriResponse
	_ = json.NewDecoder(resp.Body).Decode(&siriResponse)

	return siriResponse, nil
}
