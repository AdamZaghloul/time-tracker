-- name: DeleteActivity :exec
DELETE FROM activities WHERE id = $1 AND user_id = $2;