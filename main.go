package main

import (
	"fmt"
	"plateformpulse/internal/database"
	"plateformpulse/internal/scrapper"
)

func main() {
	db, err := database.ConnectDB()
	if err != nil {
		fmt.Printf("db error %s", err)
		return
	}

	scrapper.NewScrapper(db)
}
