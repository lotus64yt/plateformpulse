package database

import (
	"time"

	"gorm.io/datatypes"
)

type Station struct {
	Name  string         `gorm:"primaryKey;type:text"`
	UIDs  datatypes.JSON `gorm:"type:text"`
	Lines datatypes.JSON `gorm:"type:text"`
	Routes datatypes.JSON `gorm:"type:text" json:"-"`
}

type TrainSnapshot struct {
	Id                    string `gorm:"primaryKey"`
	Line                  string
	TrainNumber           string
	DepartureStationID    string
	ArrivalStationID      string
	ScheduledDeparture    time.Time
	ActualDeparture       time.Time
	DepartureDelayMinutes int
	ScheduledArrival      time.Time
	ActualArrival         time.Time
	ArrivalDelayMinutes   int
	IsCanceled            bool
	Date                  time.Time
}
