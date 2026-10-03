package database

import "time"

type StationUID string

type Station struct {
	UID  StationUID
	Name string
}

type TrainSnapshot struct {
	Id                    string
	Line                  string
	TrainNumber           string
	DerpartureStation     StationUID
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
