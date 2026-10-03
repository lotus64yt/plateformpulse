package scrapper

import (
	"plateformpulse/internal/database"
	"plateformpulse/utils"
	"time"
)

func ParseSiriResponse(resp SiriResponse) []database.TrainSnapshot {
	var snapshots []database.TrainSnapshot

	for _, delivery := range resp.Siri.ServiceDelivery.EstimatedTimetableDelivery {
		for _, frame := range delivery.EstimatedJourneyVersionFrame {
			for _, journey := range frame.EstimatedVehicleJourney {
				if len(journey.EstimatedCalls.EstimatedCall) < 2 || len(journey.VehicleMode) != 1 || journey.VehicleMode[0] != "RAIL" {
					continue
				}

				calls := journey.EstimatedCalls.EstimatedCall
				firstCall := calls[0]
				lastCall := calls[len(calls)-1]

				lineName := ""
				if len(journey.PublishedLineName) > 0 {
					lineName = journey.PublishedLineName[0].Value
				}

				trainNum := journey.EstimatedVehicleJourneyCode
				if trainNum == "" {
					trainNum = utils.ExtractTrainNumber(journey.DatedVehicleJourneyRef.Value)
				}

				scheduledDep, _ := time.Parse(time.RFC3339, firstCall.AimedDepartureTime)
				actualDep, _ := time.Parse(time.RFC3339, firstCall.ExpectedDepartureTime)
				if actualDep.IsZero() {
					actualDep = scheduledDep
				}
				
				scheduledArr, _ := time.Parse(time.RFC3339, lastCall.AimedArrivalTime)
				actualArr, _ := time.Parse(time.RFC3339, lastCall.ExpectedArrivalTime)
				if actualArr.IsZero() {
					actualArr = scheduledArr
				}

				depDelay := int(actualDep.Sub(scheduledDep).Minutes())
				arrDelay := int(actualArr.Sub(scheduledArr).Minutes())

				if depDelay < 0 {
					depDelay = 0
				}
				if arrDelay < 0 {
					arrDelay = 0
				}

				isCanceled := firstCall.DepartureStatus == "cancelled" || lastCall.ArrivalStatus == "cancelled"

				depShort := utils.ExtractShortID(firstCall.StopPointRef.Value)
				arrShort := utils.ExtractShortID(lastCall.StopPointRef.Value)

				snapshot := database.TrainSnapshot{
					Id:                    trainNum + "-" + scheduledDep.Format("20060102150405"),
					Line:                  lineName,
					TrainNumber:           trainNum,
					DepartureStationID:    database.StationUID(depShort),
					ArrivalStationID:      database.StationUID(arrShort),
					ScheduledDeparture:    scheduledDep,
					ActualDeparture:       actualDep,
					DepartureDelayMinutes: depDelay,
					ScheduledArrival:      scheduledArr,
					ActualArrival:         actualArr,
					ArrivalDelayMinutes:   arrDelay,
					IsCanceled:            isCanceled,
					Date:                  time.Now(),
				}
				snapshots = append(snapshots, snapshot)
			}
		}
	}

	return snapshots
}
