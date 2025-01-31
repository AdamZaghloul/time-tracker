-- name: UpdateActivity :one
UPDATE activities SET
    activity = CASE WHEN $1 IS NULL THEN activity ELSE $1 END,
    start_time = CASE WHEN $2 IS NULL THEN start_time ELSE $2 END,
    end_time = CASE WHEN $3 IS NULL THEN end_time ELSE $3 END,
    updated_at = NOW(),
    project_id = CASE WHEN $4 IS NULL THEN project_id ELSE $4 END,
    category_id = CASE WHEN $5 IS NULL THEN category_id ELSE $5 END
WHERE id = $6 AND user_id = $7
RETURNING *;