package main

import (
	"net/http"
	"strconv"

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

	yearString := r.PathValue("year")

	year, err := strconv.Atoi(yearString)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Couldn't decode year", err)
		return
	}

	result, err := cfg.db.GetReportMonths(r.Context(), database.GetReportMonthsParams{
		InputUserID: userID,
		InputYear:   int32(year),
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get years result.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, result)
}
