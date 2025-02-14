// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: activity.sql

package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const createActivity = `-- name: CreateActivity :one
INSERT INTO activities (id, created_at, updated_at, start_time, activity, end_time, user_id, category_id, project_id)
VALUES (
    gen_random_uuid (),
    NOW(),
    NOW(),
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
)
RETURNING id, created_at, updated_at, activity, start_time, end_time, user_id, project_id, category_id
`

type CreateActivityParams struct {
	StartTime  time.Time
	Activity   string
	EndTime    time.Time
	UserID     uuid.UUID
	CategoryID uuid.NullUUID
	ProjectID  uuid.NullUUID
}

func (q *Queries) CreateActivity(ctx context.Context, arg CreateActivityParams) (Activity, error) {
	row := q.db.QueryRowContext(ctx, createActivity,
		arg.StartTime,
		arg.Activity,
		arg.EndTime,
		arg.UserID,
		arg.CategoryID,
		arg.ProjectID,
	)
	var i Activity
	err := row.Scan(
		&i.ID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.Activity,
		&i.StartTime,
		&i.EndTime,
		&i.UserID,
		&i.ProjectID,
		&i.CategoryID,
	)
	return i, err
}
