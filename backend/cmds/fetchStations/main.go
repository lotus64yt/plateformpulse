package main

import (
	"archive/zip"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"plateformpulse/internal/database"
	"plateformpulse/utils"

	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	db, err := database.ConnectDB()
	if err != nil {
		fmt.Printf("Connection db error : %s\n", err)
		return
	}
	db.Logger = db.Logger.LogMode(logger.Silent)
	db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&database.Station{})

	zipPath := "./tmp/IDFM-gtfs.zip"
	if _, err := os.Stat(zipPath); os.IsNotExist(err) {
		out, err := os.Create(zipPath)
		if err != nil {
			panic(err)
		}
		defer out.Close()
		resp, err := http.Get("https://eu.ftp.opendatasoft.com/stif/GTFS/IDFM-gtfs.zip")
		if err != nil {
			panic(err)
		}
		defer resp.Body.Close()
		io.Copy(out, resp.Body)
	}

	fmt.Println("proc gtfs")
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		panic(err)
	}
	defer r.Close()

	var fileStops, fileRoutes, fileTrips, fileStopTimes *zip.File
	for _, f := range r.File {
		if f.Name == "stops.txt" {
			fileStops = f
		}
		if f.Name == "routes.txt" {
			fileRoutes = f
		}
		if f.Name == "trips.txt" {
			fileTrips = f
		}
		if f.Name == "stop_times.txt" {
			fileStopTimes = f
		}
	}

	routeMap := make(map[string]string)
	rc, _ := fileRoutes.Open()
	csvR := csv.NewReader(rc)
	csvR.Read()
	for {
		record, err := csvR.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}

		if record[5] == "0" || record[5] == "1" || record[5] == "2" || record[5] == "7" {
			routeMap[record[0]] = record[2]
		}
	}
	rc.Close()

	stopToParent := make(map[string]string)
	parentToName := make(map[string]string)
	stopToName := make(map[string]string)

	rc, _ = fileStops.Open()
	csvR = csv.NewReader(rc)
	csvR.Read()
	for {
		record, err := csvR.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}
		stopID := record[0]
		stopName := record[2]
		locationType := record[8]
		parentStation := record[9]

		if locationType == "1" {
			parentToName[stopID] = utils.StationNameNormalize(stopName)
		}
		if parentStation != "" {
			stopToParent[stopID] = parentStation
		}
		stopToName[stopID] = utils.StationNameNormalize(stopName)
	}
	rc.Close()

	fmt.Println("trips")
	tripShapes := make(map[string]string)
	tripRoutes := make(map[string]string)
	rc, _ = fileTrips.Open()
	csvR = csv.NewReader(rc)
	csvR.Read()
	for {
		record, err := csvR.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}
		routeID := record[0]
		tripID := record[2]
		shapeID := record[7]
		tripShapes[tripID] = shapeID
		tripRoutes[tripID] = routeID
	}
	rc.Close()

	fmt.Println("stop times")
	type StationData struct {
		UIDs   map[string]bool
		Lines  map[string]bool
		Routes map[string]bool
	}
	stationsData := make(map[string]*StationData)

	rc, _ = fileStopTimes.Open()
	csvR = csv.NewReader(rc)
	csvR.Read()
	for {
		record, err := csvR.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}
		tripID := record[0]
		stopID := record[5]

		routeID, ok := tripRoutes[tripID]
		if !ok {
			continue
		}

		shortName, ok := routeMap[routeID]
		if !ok {
			continue
		}

		shapeID, ok := tripShapes[tripID]
		if !ok {
			continue
		}

		name := ""
		if parentID, hasParent := stopToParent[stopID]; hasParent {
			if pName, hasPName := parentToName[parentID]; hasPName {
				name = pName
			}
		}
		if name == "" {
			name = stopToName[stopID]
		}
		if name == "" {
			continue
		}

		if stationsData[name] == nil {
			stationsData[name] = &StationData{
				UIDs:   make(map[string]bool),
				Lines:  make(map[string]bool),
				Routes: make(map[string]bool),
			}
		}

		shortID := utils.ExtractShortID(stopID)
		stationsData[name].UIDs[shortID] = true
		stationsData[name].Lines[shortName] = true
		stationsData[name].Routes[shapeID] = true
	}
	rc.Close()

	fmt.Printf("%d stations\n", len(stationsData))

	var stationsToInsert []database.Station
	for name, data := range stationsData {
		var uids []string
		for k := range data.UIDs {
			uids = append(uids, k)
		}
		var lines []string
		for k := range data.Lines {
			lines = append(lines, k)
		}
		var routes []string
		for k := range data.Routes {
			routes = append(routes, k)
		}

		uidsJSON, _ := json.Marshal(uids)
		linesJSON, _ := json.Marshal(lines)
		routesJSON, _ := json.Marshal(routes)

		station := database.Station{
			Name:   name,
			UIDs:   datatypes.JSON(uidsJSON),
			Lines:  datatypes.JSON(linesJSON),
			Routes: datatypes.JSON(routesJSON),
		}
		stationsToInsert = append(stationsToInsert, station)
	}

	result := db.CreateInBatches(stationsToInsert, 1000)
	if result.Error != nil {
		fmt.Println("Error saving to DB:", result.Error)
	} else {
		fmt.Println("sucess")
	}
}
