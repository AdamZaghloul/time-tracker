package main

import (
	"encoding/json"
	"net/http"

	"github.com/AdamZaghloul/time-tracker/internal/auth"
	"github.com/AdamZaghloul/time-tracker/internal/database"
	"github.com/google/uuid"
)

func (cfg *apiConfig) handlerCreateProject(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Project string `json:"categoryProjectName"`
	}
	type response struct {
		database.Project
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

	project, err := cfg.db.CreateProject(r.Context(), database.CreateProjectParams{
		Project: params.Project,
		UserID:  userID,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Unable to create project", err)
		return
	}

	respondWithJSON(w, http.StatusOK, response{
		project,
	})
}

func (cfg *apiConfig) handlerGetProjects(w http.ResponseWriter, r *http.Request) {

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

	projects, err := cfg.db.GetProjectsForUser(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't get projects for user.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, projects)
}

func (cfg *apiConfig) handlerUpdateProject(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		ID            uuid.UUID `json:"id"`
		Project       string    `json:"categoryProjectName"`
		AutofillTerms string    `json:"categoryProjectTerms"`
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

	project, err := cfg.db.UpdateProject(r.Context(), database.UpdateProjectParams{
		ID:            params.ID,
		UserID:        userID,
		Project:       params.Project,
		AutofillTerms: params.AutofillTerms,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Unable to update project", err)
		return
	}

	respondWithJSON(w, http.StatusOK, project)
}

func (cfg *apiConfig) handlerDeleteProject(w http.ResponseWriter, r *http.Request) {

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

	projectID := uuid.NullUUID{
		UUID:  params.ID,
		Valid: true,
	}

	err = cfg.db.ClearProjects(r.Context(), projectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't remove project from activities.", err)
		return
	}

	err = cfg.db.DeleteProject(r.Context(), database.DeleteProjectParams{
		ID:     params.ID,
		UserID: userID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't delete project.", err)
		return
	}

	respondWithJSON(w, http.StatusOK, nil)
}
