package main

import (
	"encoding/json"
	"net/http"

	"github.com/AdamZaghloul/time-tracker/internal/auth"
	"github.com/AdamZaghloul/time-tracker/internal/database"
)

func (cfg *apiConfig) handlerGetReportYears(w http.ResponseWriter, r *http.Request) {

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

	result, err := cfg.db.GetReportYears(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get years result.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, result)
}

func (cfg *apiConfig) handlerGetReportMonths(w http.ResponseWriter, r *http.Request) {

	type parameters struct {
		Year int32 `json:"year"`
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

	result, err := cfg.db.GetReportMonths(r.Context(), database.GetReportMonthsParams{
		InputUserID: userID,
		InputYear:   params.Year,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get years result.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, result)
}
