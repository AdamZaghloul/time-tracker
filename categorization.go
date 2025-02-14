package main

import (
	"context"
	"strings"

	"github.com/google/uuid"
)

func (cfg *apiConfig) getAutoCategory(ctx context.Context, userID uuid.UUID, activity string) (uuid.UUID, error) {
	categories, err := cfg.db.GetCategoriesForUser(ctx, userID)
	if err != nil {
		return uuid.UUID{}, err
	}

	for _, category := range categories {
		if activityInTerms(activity, category.AutofillTerms) {
			return category.ID, nil
		}
	}

	return uuid.UUID{}, nil
}

func (cfg *apiConfig) getAutoProject(ctx context.Context, userID uuid.UUID, activity string) (uuid.UUID, error) {
	categories, err := cfg.db.GetProjectsForUser(ctx, userID)
	if err != nil {
		return uuid.UUID{}, err
	}

	for _, category := range categories {
		if activityInTerms(activity, category.AutofillTerms) {
			return category.ID, nil
		}
	}

	return uuid.UUID{}, nil
}

func activityInTerms(activity string, terms string) bool {
	if terms == "" {
		return false
	}

	activity = strings.ToLower(activity)
	terms = strings.ToLower(terms)

	words := strings.Split(terms, ",")

	for _, word := range words {
		if strings.Contains(activity, strings.TrimSpace(word)) {
			return true
		}
	}

	return false
}
