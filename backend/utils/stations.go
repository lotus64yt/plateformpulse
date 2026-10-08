package utils

import (
	"encoding/json"
	"plateformpulse/internal/database"
	"strings"
)

func StationNameNormalize(name string) string {
	return strings.Title(strings.TrimSpace(name))
}

func ExtractShortID(id string) string {
	id = strings.TrimSuffix(id, ":")
	parts := strings.Split(id, ":")
	if len(parts) > 0 {
		return parts[len(parts)-1]
	}
	return id
}

func ExtractTrainNumber(ref string) string {
	parts := strings.Split(ref, "::")
	if len(parts) == 2 {
		subParts := strings.Split(parts[1], ":")
		if len(subParts) > 0 {
			return subParts[0]
		}
	}
	return ref
}

func FindStation(stations []database.Station, uid string) (database.Station, bool) {
	for _, s := range stations {
		var uids []string
		if err := json.Unmarshal(s.UIDs, &uids); err != nil {
			continue
		}
		for _, stationUID := range uids {
			if stationUID == uid {
				return s, true
			}
		}
	}

	return database.Station{}, false
}
