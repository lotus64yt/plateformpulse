package utils

import "plateformpulse/internal/database"

type WrappedTripStep struct {
	From string `json:"from"`
	To   string `json:"to"`
	Via  string `json:"via"`
}

type WrappedTimeSlot struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

type WrappedEBody struct {
	To        string            `json:"to"`
	From      string            `json:"from"`
	Trip      []WrappedTripStep `json:"trip"`
	Days      []int             `json:"Days"`
	TimeSlots []WrappedTimeSlot `json:"TimeSlots"`
}

type WrappedStep struct {
	Name     string
	TakeLine string
}

type WrappedParsedData struct {
	SnapShot []database.TrainSnapshot
	Steps    []WrappedStep
}

type WrappedReponse struct {
	Title  string         `json:"wrapped_title"`
	Scenes []WrappedScene `json:"scenes"`
}

type WrappedSceneType string

const (
	WrappedSceneTypeIntro WrappedSceneType = "intro"
	WrappedSceneTypeStat  WrappedSceneType = "stat"
	WrappedSceneTypeOutro WrappedSceneType = "outro"
)

type WrappedScene struct {
	Id        int              `json:"id"`
	Type      WrappedSceneType `json:"type"`
	Title     string           `json:"title"`
	Subtitle  string           `json:"subtitle"`
	Highlight string           `json:"highlight"`
	Emoji     string           `json:"emoji"`
}
