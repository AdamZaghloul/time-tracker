package main

import (
	"encoding/json"
	"net/http"

	"github.com/AdamZaghloul/time-tracker/internal/auth"
	"github.com/AdamZaghloul/time-tracker/internal/database"
	"github.com/google/uuid"
)

func (cfg *apiConfig) handlerCreateCategory(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Category string `json:"category"`
	}
	type response struct {
		database.Category
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

	category, err := cfg.db.CreateCategory(r.Context(), database.CreateCategoryParams{
		Category: params.Category,
		UserID:   userID,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Unable to create category", err)
		return
	}

	respondWithJSON(w, http.StatusOK, response{
		category,
	})
}

func (cfg *apiConfig) handlerGetCategories(w http.ResponseWriter, r *http.Request) {

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

	categories, err := cfg.db.GetCategoriesForUser(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get categories for user.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, categories)
}

func (cfg *apiConfig) handlerUpdateCategory(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		ID       uuid.UUID `json:"id"`
		Category string    `json:"category"`
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

	category, err := cfg.db.UpdateCategory(r.Context(), database.UpdateCategoryParams{
		ID:       params.ID,
		UserID:   userID,
		Category: params.Category,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Unable to update category", err)
		return
	}

	respondWithJSON(w, http.StatusOK, category)
}
