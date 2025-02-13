-- name: CreateCategory :one
INSERT INTO categories (id, created_at, updated_at, category, user_id, autofill_terms)
VALUES (
    gen_random_uuid (),
    NOW(),
    NOW(),
    $1,
    $2,
    ''
)
RETURNING *;