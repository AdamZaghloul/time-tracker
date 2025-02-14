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

	category, err := cfg.getAutoCategory(r.Context(), userID, params.Activity)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't detect category", err)
		return
	}

	categoryID := uuid.NullUUID{}

	if category == uuid.Nil {
		categoryID.Valid = false
	} else {
		categoryID.Valid = true
		categoryID.UUID = category
	}

	project, err := cfg.getAutoProject(r.Context(), userID, params.Activity)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't detect category", err)
		return
	}

	projectID := uuid.NullUUID{}

	if project == uuid.Nil {
		projectID.Valid = false
	} else {
		projectID.Valid = true
		projectID.UUID = project
	}

	activity, err := cfg.db.CreateActivity(r.Context(), database.CreateActivityParams{
		StartTime:  params.StartTime,
		Activity:   params.Activity,
		EndTime:    params.EndTime,
		UserID:     userID,
		CategoryID: categoryID,
		ProjectID:  projectID,
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

	activity, err := cfg.db.UpdateActivity(r.Context(), database.UpdateActivityParams{
		ID:         params.ID,
		StartTime:  params.StartTime,
		Activity:   params.Activity,
		EndTime:    params.EndTime,
		UserID:     userID,
		ProjectID:  params.ProjectID,
		CategoryID: params.CategoryID,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Unable to update activity", err)
		return
	}

	respondWithJSON(w, http.StatusOK, activity)
}

func (cfg *apiConfig) handlerDeleteActivity(w http.ResponseWriter, r *http.Request) {

	type parameters struct {
		ID uuid.UUID `json:"id"`
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

	err = cfg.db.DeleteActivity(r.Context(), database.DeleteActivityParams{
		ID:     params.ID,
		UserID: userID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't delete activity.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, nil)
}
