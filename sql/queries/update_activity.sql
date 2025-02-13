-- name: UpdateActivity :one
WITH inserted AS (
    UPDATE activities SET
    activity = CASE WHEN sqlc.arg(activity)::TEXT LIKE '' THEN activity ELSE sqlc.arg(activity)::TEXT END,
    start_time = CASE WHEN sqlc.arg(start_time)::TIMESTAMP = '0001-01-01 00:00:00 +0:00' THEN start_time ELSE sqlc.arg(start_time)::TIMESTAMP END,
    end_time = CASE WHEN sqlc.arg(end_time)::TIMESTAMP = '0001-01-01 00:00:00 +0:00' THEN end_time ELSE sqlc.arg(end_time)::TIMESTAMP END,
    updated_at = NOW(),
    project_id = CASE WHEN sqlc.arg(project_id)::UUID = '00000000-0000-0000-0000-000000000000' THEN NULL ELSE sqlc.arg(project_id)::UUID END,
    category_id = CASE WHEN sqlc.arg(category_id)::UUID = '00000000-0000-0000-0000-000000000000' THEN NULL ELSE sqlc.arg(category_id)::UUID END
    WHERE activities.id = $1 AND activities.user_id = $2
    RETURNING id, DATE(start_time) AS "date", start_time, end_time, ROUND(EXTRACT(EPOCH FROM (end_time - start_time))/60) AS "duration", activity, category_id, project_id
)

SELECT inserted.*, c.category, p.project FROM inserted LEFT JOIN categories c ON inserted.category_id = c.id LEFT JOIN projects p ON inserted.project_id = p.id;