-- name: UpdateCategory :one

UPDATE categories SET 
category = CASE WHEN sqlc.arg(category)::TEXT LIKE '' THEN category ELSE sqlc.arg(category)::TEXT END, 
autofill_terms = CASE WHEN sqlc.arg(autofill_terms)::TEXT LIKE '' AND sqlc.arg(category)::TEXT LIKE '' THEN '' WHEN sqlc.arg(autofill_terms)::TEXT LIKE '' THEN autofill_terms ELSE sqlc.arg(autofill_terms)::TEXT END 
WHERE id = $1 AND user_id = $2
RETURNING *;