package scrapper

import (
	"log"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func NewScrapper(db *gorm.DB) {
	runTask(db)

	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		runTask(db)
	}
}

func runTask(db *gorm.DB) {
	resp, err := FetchPrim()
	if err != nil {
		log.Println("err getting data:", err)
		return
	}

	snapshots := ParseSiriResponse(resp)

	if len(snapshots) > 0 {
		result := db.Clauses(clause.OnConflict{
			UpdateAll: true,
		}).CreateInBatches(snapshots, 100)

		if result.Error != nil {
			log.Println("err snapshots:", result.Error)
		} else {
			log.Printf("%d snapshots\n", result.RowsAffected)
		}
	}
}
