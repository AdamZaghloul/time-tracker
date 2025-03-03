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

	result, err := cfg.db.GetReportYears(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get years result.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, result)
}
