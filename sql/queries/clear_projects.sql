-- name: ClearProjects :exec
UPDATE activities SET project_id = NULL WHERE project_id = $1;