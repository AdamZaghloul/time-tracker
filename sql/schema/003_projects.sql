-- +goose Up
CREATE TABLE projects(
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    project TEXT NOT NULL UNIQUE,
    autofill_terms TEXT NOT NULL,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE projects;