package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"plateformpulse/internal/database"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func hasCommonRoute(routesA, routesB []string) bool {
	for _, ra := range routesA {
		for _, rb := range routesB {
			if ra == rb {
				return true
			}
		}
	}
	return false
}

func init() {
	Register(ApiRoute{
		Method: http.MethodGet,
		Path:   "/stations",
		Handler: func(c *gin.Context, db *gorm.DB) {
			lastStationId := c.Query("last")

			var stations []database.Station
			res := db.Find(&stations)

			if res.Error != nil {
				c.Status(http.StatusInternalServerError)
				fmt.Println(res.Error)
				return
			}

			if lastStationId != "" {
				id := strings.ReplaceAll(lastStationId, "IDFM", "")
				id = strings.ReplaceAll(id, ":", "")

				var station *database.Station
				for i := range stations {
					s := &stations[i]
					
					var uids []string
					if err := json.Unmarshal(s.UIDs, &uids); err == nil {
						for _, uid := range uids {
							if uid == id {
								station = s
								break
							}
						}
					}
					if station != nil {
						break
					}
				}

				if station == nil {
					c.JSON(http.StatusNotFound, gin.H{
						"error": "Cannot find the station",
					})
					return
				}

				var targetRoutes []string
				if err := json.Unmarshal(station.Routes, &targetRoutes); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse station routes"})
					return
				}

				var possibleStations []database.Station
				for _, s := range stations {
					if s.Name == station.Name {
						continue
					}

					var sRoutes []string
					if err := json.Unmarshal(s.Routes, &sRoutes); err != nil {
						continue
					}

					if hasCommonRoute(targetRoutes, sRoutes) {
						possibleStations = append(possibleStations, s)
					}
				}

				c.JSON(http.StatusOK, gin.H{
					"total":  len(possibleStations),
					"result": possibleStations,
				})
			} else {
				c.JSON(http.StatusOK, gin.H{
					"total":  len(stations),
					"result": stations,
				})
			}
		},
	})
}
