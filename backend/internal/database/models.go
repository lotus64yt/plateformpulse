package database

import (
	"time"

	"gorm.io/datatypes"
)

type Station struct {
	Name   string         `gorm:"primaryKey;type:text"`
	UIDs   datatypes.JSON `gorm:"type:text"`
	Lines  datatypes.JSON `gorm:"type:text"`
	Routes datatypes.JSON `gorm:"type:text" json:"-"`
}

type LineType int

const (
	LineTypeTrain LineType = 0
	LineTypeRer   LineType = 1
	LineTypeMetro LineType = 2
	LineTypeTram  LineType = 3
)

type Line struct {
	Id    string `gorm:"primaryKey"`
	Name  string
	Color string
	Type  LineType
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
