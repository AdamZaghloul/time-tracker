-- name: UpdateProject :one

UPDATE projects SET 
project = CASE WHEN sqlc.arg(project)::TEXT LIKE '' THEN project ELSE sqlc.arg(project)::TEXT END, 
autofill_terms = CASE WHEN sqlc.arg(autofill_terms)::TEXT LIKE '' AND sqlc.arg(project)::TEXT LIKE '' THEN '' WHEN sqlc.arg(autofill_terms)::TEXT LIKE '' THEN autofill_terms ELSE sqlc.arg(autofill_terms)::TEXT END 
WHERE id = $1 AND user_id = $2
RETURNING *;