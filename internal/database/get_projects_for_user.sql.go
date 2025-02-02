// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: get_projects_for_user.sql

package database

import (
	"context"

	"github.com/google/uuid"
)

const getProjectsForUser = `-- name: GetProjectsForUser :many
SELECT id, project FROM projects WHERE user_id = $1
`

type GetProjectsForUserRow struct {
	ID      uuid.UUID
	Project string
}

func (q *Queries) GetProjectsForUser(ctx context.Context, userID uuid.UUID) ([]GetProjectsForUserRow, error) {
	rows, err := q.db.QueryContext(ctx, getProjectsForUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetProjectsForUserRow
	for rows.Next() {
		var i GetProjectsForUserRow
		if err := rows.Scan(&i.ID, &i.Project); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
