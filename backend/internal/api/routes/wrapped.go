package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"plateformpulse/internal/database"
	"plateformpulse/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func init() {
	Register(ApiRoute{
		Method: http.MethodPost,
		Path:   "/wrapped",
		Handler: func(c *gin.Context, db *gorm.DB) {
			ip := c.ClientIP()
			if limiter := utils.GetLimiter(ip); !limiter.Allow() {
				c.JSON(http.StatusTooManyRequests, gin.H{
					"error": "Opopop pls wait",
				})
				return
			}

			body := c.Request.Body
			defer body.Close()

			var stations []database.Station
			res := db.Find(&stations)
			if res.Error != nil {
				c.Status(http.StatusInternalServerError)
				return
			}

			var lines []database.Line
			res = db.Find(&lines)
			if res.Error != nil {
				c.Status(http.StatusInternalServerError)
				return
			}

			var data utils.WrappedEBody
			err := json.NewDecoder(body).Decode(&data)
			if err != nil {
				c.Status(http.StatusInternalServerError)
				return
			}

			fromMs, _ := strconv.ParseInt(data.From, 10, 64)
			toMs, _ := strconv.ParseInt(data.To, 10, 64)
			fromDate := time.UnixMilli(fromMs)
			toDate := time.UnixMilli(toMs)

			var parsedData utils.WrappedParsedData = utils.WrappedParsedData{
				Steps:    []utils.WrappedStep{},
				SnapShot: []database.TrainSnapshot{},
			}

			for _, ts := range data.Trip {
				station, exist := utils.FindStation(stations, ts.From)
				if !exist {
					c.Status(http.StatusNotFound)
					return
				}
				stepRes := utils.WrappedStep{
					Name:     station.Name,
					TakeLine: ts.Via,
				}
				parsedData.Steps = append(parsedData.Steps, stepRes)

				var possibleSnapshots []database.TrainSnapshot
				db.Where("line = ? AND departure_station_id = ? AND arrival_station_id = ? AND scheduled_departure >= ? AND scheduled_departure <= ?", ts.Via, ts.From, ts.To, fromDate, toDate).Find(&possibleSnapshots)

				for _, snap := range possibleSnapshots {
					dayOk := false
					for _, d := range data.Days {
						if int(snap.ScheduledDeparture.Weekday()) == d {
							dayOk = true
							break
						}
					}
					if !dayOk {
						continue
					}

					timeOk := false
					snapTime := snap.ScheduledDeparture.Format("15:04")
					for _, slot := range data.TimeSlots {
						if snapTime >= slot.Start && snapTime <= slot.End {
							timeOk = true
							break
						}
					}

					if timeOk {
						parsedData.SnapShot = append(parsedData.SnapShot, snap)
					}
				}
			}

			openrouterRes, err := utils.GenerateWrappedWithOpenRouter(parsedData)
			if err != nil {
				c.Status(http.StatusInternalServerError)
				fmt.Println(err)
				return
			}

			c.JSON(http.StatusOK, openrouterRes)
		},
	})
}
