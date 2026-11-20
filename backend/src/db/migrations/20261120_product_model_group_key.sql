-- Explicit product sibling grouping for per-color product records.
-- A shared model_group_key means records are the same model/configuration and
-- differ only by finish/color; each record retains its own price, variants,
-- inventory and media gallery.
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_group_key TEXT;
CREATE INDEX IF NOT EXISTS idx_products_model_group ON products(model_group_key) WHERE model_group_key IS NOT NULL;
