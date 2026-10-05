package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"plateformpulse/internal/database"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type APIRecord struct {
	Idrefligc     string `json:"idrefligc"`
	IndiceLig     string `json:"indice_lig"`
	ColourwebHexa string `json:"colourweb_hexa"`
	PictoFinal    string `json:"picto_final"`
	Mode          string `json:"mode"`
}

func main() {
	db, err := database.ConnectDB()
	if err != nil {
		fmt.Printf("Connection db error : %s\n", err)
		return
	}
	db.Logger = db.Logger.LogMode(logger.Silent)
	db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&database.Line{})

	resp, err := http.Get("https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/traces-du-reseau-ferre-idf/exports/json")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	var records []APIRecord
	if err := json.Unmarshal(body, &records); err != nil {
		panic(err)
	}

	linesMap := make(map[string]database.Line)
	for _, rec := range records {
		if _, exists := linesMap[rec.Idrefligc]; !exists && rec.Idrefligc != "" {
			var mode database.LineType
			switch rec.Mode {
			case "TRAMWAY":
				rec.IndiceLig = fmt.Sprintf("T%s", rec.IndiceLig)
				mode = database.LineTypeTram
			case "METRO":
				mode = database.LineTypeMetro
			case "RER":
				mode = database.LineTypeRer
			case "TRAIN":
				mode = database.LineTypeTrain
			default:
				continue
			}

			linesMap[rec.Idrefligc] = database.Line{
				Id:    rec.Idrefligc,
				Name:  rec.IndiceLig,
				Color: rec.ColourwebHexa,
				Type:  mode,
			}
		}
	}

	var linesToInsert []database.Line
	for _, line := range linesMap {
		linesToInsert = append(linesToInsert, line)
	}

	result := db.CreateInBatches(linesToInsert, 100)
	if result.Error != nil {
		fmt.Println("Error saving to DB:", result.Error)
	} else {
		fmt.Printf("success, %d", len(linesToInsert))
	}
}
