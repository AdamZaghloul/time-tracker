-- name: UpdateActivity :one
UPDATE activities SET
    activity = $1,
    start_time = $2,
    end_time = $3,
    updated_at = NOW(),
    project_id = $4,
    category_id = $5
WHERE id = $6
RETURNING *;