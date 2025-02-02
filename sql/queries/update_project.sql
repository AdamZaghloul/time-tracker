-- name: UpdateProject :one

UPDATE projects SET project = $1 WHERE id = $2 AND user_id = $3
RETURNING *;