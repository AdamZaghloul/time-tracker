-- +goose Up
CREATE TABLE activities(
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    activity TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    override_duration INTEGER,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID,
    FOREIGN KEY (project_id)
    REFERENCES projects(id),
    category_id UUID,
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
);

-- +goose Down
DROP TABLE activities;