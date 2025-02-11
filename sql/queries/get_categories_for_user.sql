-- name: GetCategoriesForUser :many
SELECT id, category, autofill_terms FROM categories WHERE user_id = $1;