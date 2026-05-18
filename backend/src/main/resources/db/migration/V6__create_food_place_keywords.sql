CREATE TABLE IF NOT EXISTS food_place_keywords (
    id BIGSERIAL PRIMARY KEY,
    food_item_id BIGINT NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    weight INT NOT NULL,
    match_type VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_food_place_keywords_food_item
        FOREIGN KEY (food_item_id)
        REFERENCES food_items(id)
);

CREATE INDEX IF NOT EXISTS idx_food_place_keywords_food_item_id
    ON food_place_keywords(food_item_id);

CREATE INDEX IF NOT EXISTS idx_food_place_keywords_keyword
    ON food_place_keywords(keyword);
