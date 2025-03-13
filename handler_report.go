package main

import (
	"net/http"
	"strconv"
	"time"

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
		respondWithError(w, http.StatusInternalServerError, "Couldn't decode year", err)
		return
	}

	result, err := cfg.db.GetReportMonths(r.Context(), database.GetReportMonthsParams{
		InputUserID: userID,
		InputYear:   int32(year),
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get months result.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, result)
}

func (cfg *apiConfig) handlerGetReportWeeks(w http.ResponseWriter, r *http.Request) {

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
	month := r.PathValue("month")

	year, err := strconv.Atoi(yearString)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't decode year", err)
		return
	}

	result, err := cfg.db.GetReportWeeks(r.Context(), database.GetReportWeeksParams{
		InputUserID: userID,
		InputYear:   int32(year),
		InputMonth:  month,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get weeks result.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, result)
}

func (cfg *apiConfig) handlerGetReportDays(w http.ResponseWriter, r *http.Request) {

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
	month := r.PathValue("month")
	weekString := r.PathValue("week")

	year, err := strconv.Atoi(yearString)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't decode year", err)
		return
	}

	week, err := time.Parse(time.DateOnly, weekString)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't decode week", err)
		return
	}

	result, err := cfg.db.GetReportDays(r.Context(), database.GetReportDaysParams{
		InputUserID: userID,
		InputYear:   int32(year),
		InputMonth:  month,
		InputWeek:   week,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get weeks result.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, result)
}
