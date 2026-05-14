CREATE TABLE IF NOT EXISTS intent_keywords (
    id BIGSERIAL PRIMARY KEY,
    tag_axis VARCHAR(50) NOT NULL,
    tag_value VARCHAR(50) NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_intent_keywords_axis_value
    ON intent_keywords(tag_axis, tag_value);
