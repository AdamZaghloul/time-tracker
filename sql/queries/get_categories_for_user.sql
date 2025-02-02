-- name: GetCategoriesForUser :many
SELECT id, category FROM categories WHERE user_id = $1;