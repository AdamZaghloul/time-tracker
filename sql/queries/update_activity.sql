-- name: UpdateActivity :one
UPDATE activities SET
    activity = CASE WHEN sqlc.arg(activity)::TEXT LIKE '' THEN activity ELSE sqlc.arg(activity)::TEXT END,
    start_time = CASE WHEN sqlc.arg(start_time)::TIMESTAMP = '0001-01-01 00:00:00 +0:00' THEN start_time ELSE sqlc.arg(start_time)::TIMESTAMP END,
    end_time = CASE WHEN sqlc.arg(end_time)::TIMESTAMP = '0001-01-01 00:00:00 +0:00' THEN end_time ELSE sqlc.arg(end_time)::TIMESTAMP END,
    updated_at = NOW(),
    project_id = CASE WHEN sqlc.arg(project_id)::UUID = '00000000-0000-0000-0000-000000000000' THEN project_id ELSE sqlc.arg(project_id)::UUID END,
    category_id = CASE WHEN sqlc.arg(category_id)::UUID = '00000000-0000-0000-0000-000000000000' THEN category_id ELSE sqlc.arg(category_id)::UUID END
WHERE id = $1 AND user_id = $2
RETURNING id, DATE(start_time) AS "date", start_time, end_time, ROUND(EXTRACT(EPOCH FROM (end_time - start_time))/60) AS "duration", activity;