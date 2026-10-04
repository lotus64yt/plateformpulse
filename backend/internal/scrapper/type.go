package scrapper

type SiriResponse struct {
	Siri struct {
		ServiceDelivery struct {
			ResponseTimestamp          string `json:"ResponseTimestamp"`
			ProducerRef                string `json:"ProducerRef"`
			ResponseMessageIdentifier  string `json:"ResponseMessageIdentifier"`
			EstimatedTimetableDelivery []struct {
				ResponseTimestamp            string `json:"ResponseTimestamp"`
				Version                      string `json:"Version"`
				EstimatedJourneyVersionFrame []struct {
					RecordedAtTime          string `json:"RecordedAtTime"`
					EstimatedVehicleJourney []struct {
						LineRef struct {
							Value string `json:"value"`
						} `json:"LineRef"`
						DirectionRef struct {
							Value string `json:"value"`
						} `json:"DirectionRef"`
						EstimatedVehicleJourneyCode string `json:"EstimatedVehicleJourneyCode"`
						DatedVehicleJourneyRef      struct {
							Value string `json:"value"`
						} `json:"DatedVehicleJourneyRef"`
						VehicleMode       []string `json:"VehicleMode"`
						PublishedLineName []struct {
							Value string `json:"value"`
						} `json:"PublishedLineName"`
						EstimatedCalls struct {
							EstimatedCall []struct {
								StopPointRef struct {
									Value string `json:"value"`
								} `json:"StopPointRef"`
								Order         int `json:"Order"`
								StopPointName []struct {
									Value string `json:"value"`
								} `json:"StopPointName"`
								DestinationDisplay []struct {
									Value string `json:"value"`
								} `json:"DestinationDisplay"`
								ExpectedArrivalTime   string `json:"ExpectedArrivalTime,omitempty"`
								ExpectedDepartureTime string `json:"ExpectedDepartureTime,omitempty"`
								AimedArrivalTime      string `json:"AimedArrivalTime,omitempty"`
								AimedDepartureTime    string `json:"AimedDepartureTime,omitempty"`
								ArrivalStatus         string `json:"ArrivalStatus,omitempty"`
								DepartureStatus       string `json:"DepartureStatus,omitempty"`
							} `json:"EstimatedCall"`
						} `json:"EstimatedCalls"`
					} `json:"EstimatedVehicleJourney"`
				} `json:"EstimatedJourneyVersionFrame"`
			} `json:"EstimatedTimetableDelivery"`
		} `json:"ServiceDelivery"`
	} `json:"Siri"`
}
