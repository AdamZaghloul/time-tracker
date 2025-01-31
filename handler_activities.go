package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/AdamZaghloul/time-tracker/internal/auth"
	"github.com/AdamZaghloul/time-tracker/internal/database"
	"github.com/google/uuid"
)

func (cfg *apiConfig) handlerCreateActivity(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		StartTime time.Time `json:"startTime"`
		Activity  string    `json:"activity"`
		EndTime   time.Time `json:"endTime"`
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

func (cfg *apiConfig) handlerUpdateActivity(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		ID         uuid.UUID `json:"id"`
		StartTime  time.Time `json:"startTime"`
		Activity   string    `json:"activity"`
		EndTime    time.Time `json:"endTime"`
		CategoryID uuid.UUID `json:"category"`
		ProjectID  uuid.UUID `json:"project"`
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

	preparedProjectId := uuid.NullUUID{}
	preparedCategoryId := uuid.NullUUID{}

	if params.ProjectID == uuid.Nil {
		preparedProjectId.Valid = false
	} else {
		preparedProjectId.Valid = true
		preparedProjectId.UUID = params.ProjectID
	}

	if params.CategoryID == uuid.Nil {
		preparedCategoryId.Valid = false
	} else {
		preparedCategoryId.Valid = true
		preparedCategoryId.UUID = params.CategoryID
	}

	activity, err := cfg.db.UpdateActivity(r.Context(), database.UpdateActivityParams{
		ID:         params.ID,
		StartTime:  params.StartTime,
		Activity:   params.Activity,
		EndTime:    params.EndTime,
		UserID:     userID,
		ProjectID:  preparedProjectId,
		CategoryID: preparedCategoryId,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Unable to update activity", err)
		return
	}

	respondWithJSON(w, http.StatusOK, response{
		activity,
	})
}
