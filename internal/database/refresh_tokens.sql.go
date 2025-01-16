// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: refresh_tokens.sql

package database

import (
	"context"

	"github.com/google/uuid"
)

const createRefreshToken = `-- name: CreateRefreshToken :one
INSERT INTO refresh_tokens (token, created_at, updated_at, expires_at, revoked_at, user_id)
VALUES (
    $1,
    NOW(),
    NOW(),
    NOW() + INTERVAL '60 days',
    NULL,
    $2
)
RETURNING token, created_at, updated_at, expires_at, revoked_at, user_id
`

type CreateRefreshTokenParams struct {
	Token  string
	UserID uuid.UUID
}

func (q *Queries) CreateRefreshToken(ctx context.Context, arg CreateRefreshTokenParams) (RefreshToken, error) {
	row := q.db.QueryRowContext(ctx, createRefreshToken, arg.Token, arg.UserID)
	var i RefreshToken
	err := row.Scan(
		&i.Token,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.ExpiresAt,
		&i.RevokedAt,
		&i.UserID,
	)
	return i, err
}