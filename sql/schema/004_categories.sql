-- +goose Up
CREATE TABLE categories(
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    category TEXT NOT NULL,
    user_id UUID NOT NULL,
    autofill_terms TEXT NOT NULL,
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE categories;