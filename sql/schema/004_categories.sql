-- +goose Up
CREATE TABLE categories(
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    category TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE categories;