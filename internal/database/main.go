package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func ConnectDB() (*gorm.DB, error) {
	path := "database.sqlite"
	db, err := gorm.Open(sqlite.Open(path), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	db.AutoMigrate(&Station{}, &TrainSnapshot{})

	return db, nil
}
