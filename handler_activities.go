package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/AdamZaghloul/time-tracker/internal/auth"
	"github.com/AdamZaghloul/time-tracker/internal/database"
)

func (cfg *apiConfig) handlerCreateActivity(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		StartTime        time.Time `json:"startTime"`
		Activity         string    `json:"activity"`
		OverrideDuration string    `json:"overrideDuration"`
		EndTime          time.Time `json:"endTime"`
	}
	type response struct {
		database.Activity
	}

	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Couldn't find JWT", err)
		return
	}

	userID, err := auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Couldn't validate JWT", err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err = decoder.Decode(&params)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't decode parameters.", err)
		return
	}

	//TODO: Add auto project and category assignment

	//process the override duration
	preparedOverrideDuration := sql.NullInt32{}

	if params.OverrideDuration == "" {
		preparedOverrideDuration.Valid = false
	} else {
		tempInt, err := strconv.Atoi(params.OverrideDuration)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Invalid override duration. Integer required.", err)
			return
		}

		preparedOverrideDuration.Valid = true
		preparedOverrideDuration.Int32 = int32(tempInt)
	}

	activity, err := cfg.db.CreateActivity(r.Context(), database.CreateActivityParams{
		StartTime: params.StartTime,
		Activity:  params.Activity,
		EndTime:   params.EndTime,
		UserID:    userID,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Unable to create activity", err)
		return
	}

	respondWithJSON(w, http.StatusOK, response{
		activity,
	})
}

func (cfg *apiConfig) handlerGetActivities(w http.ResponseWriter, r *http.Request) {

	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Couldn't find JWT", err)
		return
	}

	userID, err := auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Couldn't validate JWT", err)
		return
	}

	activities, err := cfg.db.GetActivitiesForUser(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get activities for user.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, activities)
}
