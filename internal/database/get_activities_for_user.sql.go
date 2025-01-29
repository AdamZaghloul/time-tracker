// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: get_activities_for_user.sql

package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const getActivitiesForUser = `-- name: GetActivitiesForUser :many
SELECT id, DATE(start_time) AS "date", start_time, end_time, ROUND(EXTRACT(EPOCH FROM (end_time - start_time))/60) AS "duration", activity FROM activities WHERE user_id = $1 ORDER BY start_time DESC
`

type GetActivitiesForUserRow struct {
	ID        uuid.UUID
	Date      time.Time
	StartTime time.Time
	EndTime   time.Time
	Duration  float64
	Activity  string
}

func (q *Queries) GetActivitiesForUser(ctx context.Context, userID uuid.UUID) ([]GetActivitiesForUserRow, error) {
	rows, err := q.db.QueryContext(ctx, getActivitiesForUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetActivitiesForUserRow
	for rows.Next() {
		var i GetActivitiesForUserRow
		if err := rows.Scan(
			&i.ID,
			&i.Date,
			&i.StartTime,
			&i.EndTime,
			&i.Duration,
			&i.Activity,
		); err != nil {
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
