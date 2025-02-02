// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: get_categories_for_user.sql

package database

import (
	"context"

	"github.com/google/uuid"
)

const getCategoriesForUser = `-- name: GetCategoriesForUser :many
SELECT id, category FROM categories WHERE user_id = $1
`

type GetCategoriesForUserRow struct {
	ID       uuid.UUID
	Category string
}

func (q *Queries) GetCategoriesForUser(ctx context.Context, userID uuid.UUID) ([]GetCategoriesForUserRow, error) {
	rows, err := q.db.QueryContext(ctx, getCategoriesForUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetCategoriesForUserRow
	for rows.Next() {
		var i GetCategoriesForUserRow
		if err := rows.Scan(&i.ID, &i.Category); err != nil {
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
