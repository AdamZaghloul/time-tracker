// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: clear_categories.sql

package database

import (
	"context"

	"github.com/google/uuid"
)

const clearCategories = `-- name: ClearCategories :exec
UPDATE activities SET category_id = NULL WHERE category_id = $1
`

func (q *Queries) ClearCategories(ctx context.Context, categoryID uuid.NullUUID) error {
	_, err := q.db.ExecContext(ctx, clearCategories, categoryID)
	return err
}
