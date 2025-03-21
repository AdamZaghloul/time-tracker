// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: projects.sql

package database

import (
	"context"

	"github.com/google/uuid"
)

const createProject = `-- name: CreateProject :one
INSERT INTO projects (id, created_at, updated_at, project, user_id, autofill_terms)
VALUES (
    gen_random_uuid (),
    NOW(),
    NOW(),
    $1,
    $2,
    ''
)
RETURNING id, created_at, updated_at, project, autofill_terms, user_id
`

type CreateProjectParams struct {
	Project string
	UserID  uuid.UUID
}

func (q *Queries) CreateProject(ctx context.Context, arg CreateProjectParams) (Project, error) {
	row := q.db.QueryRowContext(ctx, createProject, arg.Project, arg.UserID)
	var i Project
	err := row.Scan(
		&i.ID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.Project,
		&i.AutofillTerms,
		&i.UserID,
	)
	return i, err
}
