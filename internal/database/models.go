package database

import (
	"time"

	"gorm.io/datatypes"
)

type StationUID string

type Station struct {
	UID   StationUID     `gorm:"primaryKey;type:text"`
	Name  string
	Lines datatypes.JSON `gorm:"type:text"`
}

type TrainSnapshot struct {
	Id                    string     `gorm:"primaryKey"`
	Line                  string
	TrainNumber           string
	DepartureStationID    StationUID
	DepartureStation      Station    `gorm:"foreignKey:DepartureStationID;references:UID"`
	ArrivalStationID      StationUID
	ArrivalStation        Station    `gorm:"foreignKey:ArrivalStationID;references:UID"`
	ScheduledDeparture    time.Time
	ActualDeparture       time.Time
	DepartureDelayMinutes int
	ScheduledArrival      time.Time
	ActualArrival         time.Time
	ArrivalDelayMinutes   int
	IsCanceled            bool
	Date                  time.Time
}
