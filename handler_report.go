package main

import (
	"net/http"

	"github.com/AdamZaghloul/time-tracker/internal/auth"
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

	err = cfg.db.GetReportYearsCategories1(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get report step 1.", err)
		return
	}

	err = cfg.db.GetReportYearsCategories2(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get report step 2.", err)
		return
	}

	categoryData, err := cfg.db.GetReportYearsCategories3(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get report step 3.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, categoryData)
}
