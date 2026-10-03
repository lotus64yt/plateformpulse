package utils

import "strings"

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
