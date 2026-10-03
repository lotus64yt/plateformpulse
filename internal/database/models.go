package database

import (
	"time"

	"gorm.io/datatypes"
)

type StationUID string

type Station struct {
	UID   StationUID
	Name  string
	Lines datatypes.JSON `gorm:"type:text"`
}

type TrainSnapshot struct {
	Id                    string
	Line                  string
	TrainNumber           string
	DepartureStation      StationUID
	ArrivalStation        StationUID
	ScheduledDeparture    time.Time
	ActualDeparture       time.Time
	DepartureDelayMinutes int
	ScheduledArrival      time.Time
	ActualArrival         time.Time
	ArrivalDelayMinutes   int
	IsCanceled            bool
	Date                  time.Time
}
