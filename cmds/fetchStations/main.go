package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"plateformpulse/internal/database"
	"plateformpulse/utils"
	"time"

	"gorm.io/gorm"
)

type APIResponse struct {
	TotalCount int             `json:"total_count"`
	Results    []StationRecord `json:"results"`
}

type GeoPoint struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

type StationRecord struct {
	ID                   string    `json:"id"`
	Nom                  string    `json:"nom"`
	LibelleCourt         string    `json:"libellecourt"`
	CodesUIC             string    `json:"codes_uic"`
	Commune              string    `json:"commune"`
	Departement          string    `json:"departement"`
	PositionGeographique *GeoPoint `json:"position_geographique"`
}

func main() {
	fmt.Println("test")
	db, err := database.ConnectDB()
	if err != nil {
		fmt.Printf("Connection db error : %s", err)
		return
	}
	db.Exec("TRUNCATE TABLE stations")

	endpoint := "https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/gares-de-voyageurs/records"

	client := &http.Client{Timeout: 10 * time.Second}

	offset := 0
	total := -1
	processed := 0

	for {
		u, _ := url.Parse(endpoint)
		q := u.Query()
		q.Set("limit", fmt.Sprintf("%d", 20))
		q.Set("offset", fmt.Sprintf("%d", offset))
		u.RawQuery = q.Encode()

		resp, err := client.Get(u.String())
		if err != nil {
			fmt.Println("Error fetching api")
			continue
		}

		if resp.StatusCode != http.StatusOK {
			resp.Body.Close()
			fmt.Printf("Error api status %d", resp.StatusCode)
			break
		}

		var apiResp APIResponse
		if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
			resp.Body.Close()
			fmt.Printf("Error api decode %v", err)
			break
		}
		resp.Body.Close()

		total = apiResp.TotalCount

		if len(apiResp.Results) == 0 {
			break
		}

		for _, record := range apiResp.Results {
			normalizeName := utils.StationNameNormalize(record.Nom)
			station := database.Station{
				Name: normalizeName,
				UID:  database.StationUID(record.ID),
			}
			SaveStation(db, station)

			processed++
			percent := float64(processed) / float64(total) * 100
			fmt.Printf("%.2f%%\n", percent)
		}

		offset += 20
		if offset >= total {
			break
		}
	}

	fmt.Printf("Fetch %d station", total)
}

func SaveStation(db *gorm.DB, station database.Station) {
	db.Create(&station)
}
