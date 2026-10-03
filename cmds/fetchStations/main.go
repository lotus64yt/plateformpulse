package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"plateformpulse/internal/database"
	"plateformpulse/utils"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type StationRecord struct {
	RouteID        string `json:"id"`
	RouteShortName string `json:"shortname"`
	RouteLongName  string `json:"route_long_name"`
	StopID         string `json:"stop_id"`
	StopName       string `json:"stop_name"`
	OperatorName   string `json:"operatorname"`
	Mode           string `json:"mode"`
}

func main() {
	db, err := database.ConnectDB()
	if err != nil {
		fmt.Printf("Connection db error : %s", err)
		return
	}
	db.Logger = db.Logger.LogMode(logger.Silent)
	db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&database.Station{})

	endpoint := "https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/arrets-lignes/exports/json?lang=fr&timezone=Europe%2FBerlin"
	client := &http.Client{Timeout: 45 * time.Second}

	resp, err := client.Get(endpoint)
	if err != nil {
		fmt.Println("Error fetching api:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("Error api status %d", resp.StatusCode)
		return
	}

	var records []StationRecord
	if err := json.NewDecoder(resp.Body).Decode(&records); err != nil {
		fmt.Printf("Error api decode: %v\n", err)
		return
	}

	processed := 0
	for i, record := range records {
		lineIdentifier := record.RouteID
		if lineIdentifier == "" {
			lineIdentifier = record.RouteShortName
		}

		if record.StopID == "" || lineIdentifier == "" {
			continue
		}

		isRail := false
		switch record.Mode {
		case "Metro", "RapidTransit", "LocalTrain", "Tramway", "RailShuttle", "regionalRail", "Funicular":
			isRail = true
		}

		if !isRail {
			continue
		}

		normalizeName := utils.StationNameNormalize(record.StopName)

		initialLines, _ := json.Marshal([]string{lineIdentifier})

		station := database.Station{
			Name:  normalizeName,
			UID:   database.StationUID(record.StopID),
			Lines: datatypes.JSON(initialLines),
		}
		SaveStation(db, station)
		processed++

		if (i+1)%100 == 0 {
			percent := float64(i+1) / float64(len(records)) * 100
			fmt.Printf("%.2f%%", percent)
		}
	}
}

func SaveStation(db *gorm.DB, station database.Station) {
	var existing database.Station

	result := db.Where("uid = ?", station.UID).First(&existing)

	if result.Error != nil {
		db.Create(&station)
	} else {
		var existingLines []string
		_ = json.Unmarshal(existing.Lines, &existingLines)

		var newLines []string
		_ = json.Unmarshal(station.Lines, &newLines)

		if len(newLines) == 0 {
			return
		}
		newLine := newLines[0]

		found := false
		for _, line := range existingLines {
			if line == newLine {
				found = true
				break
			}
		}

		if !found {
			existingLines = append(existingLines, newLine)
			updatedJSON, _ := json.Marshal(existingLines)
			existing.Lines = datatypes.JSON(updatedJSON)
			db.Save(&existing)
		}
	}
}
