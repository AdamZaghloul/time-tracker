-- name: GetProjectsForUser :many
SELECT id, project, autofill_terms FROM projects WHERE user_id = $1;