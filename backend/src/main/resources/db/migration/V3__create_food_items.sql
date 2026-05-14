CREATE TABLE IF NOT EXISTS food_items (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    situation TEXT[] NOT NULL DEFAULT '{}',
    weather TEXT[] NOT NULL DEFAULT '{}',
    taste TEXT[] NOT NULL DEFAULT '{}',
    fullness TEXT[] NOT NULL DEFAULT '{}',
    mood TEXT[] NOT NULL DEFAULT '{}',
    nation TEXT[] NOT NULL DEFAULT '{}',
    ingredient TEXT[] NOT NULL DEFAULT '{}',
    format TEXT[] NOT NULL DEFAULT '{}',
    temperature TEXT[] NOT NULL DEFAULT '{}',
    health_style TEXT[] NOT NULL DEFAULT '{}',
    season TEXT[] NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_food_items_category
        FOREIGN KEY (category_id)
        REFERENCES food_categories(id)
);
CREATE INDEX IF NOT EXISTS idx_food_items_category_id ON food_items(category_id);
