-- name: CreateActivity :one
INSERT INTO activities (id, created_at, updated_at, start_time, activity, override_duration, end_time, user_id)
VALUES (
    gen_random_uuid (),
    NOW(),
    NOW(),
    $1,
    $2,
    $3,
    $4,
    $5
)
RETURNING *;