-- name: CreateActivity :one
INSERT INTO activities (id, created_at, updated_at, start_time, activity, end_time, user_id)
VALUES (
    gen_random_uuid (),
    NOW(),
    NOW(),
    $1,
    $2,
    $3,
    $4
)
RETURNING *;