package utils

import "strings"

func StationNameNormalize(name string) string {
	return strings.Title(strings.TrimSpace(name))
}
