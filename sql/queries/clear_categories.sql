-- name: ClearCategories :exec
UPDATE activities SET category_id = NULL WHERE category_id = $1;