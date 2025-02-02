-- name: GetProjectsForUser :many
SELECT id, project FROM projects WHERE user_id = $1;