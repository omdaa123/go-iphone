-- Explicit product sibling grouping for per-color product records.
-- Same product/configuration except finish/color receives the same key.
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_group_key TEXT;
UPDATE products
SET model_group_key = 'auto-' || md5(jsonb_build_object(
  'category', category_key,
  'type', product_type,
  'name', lower(trim(name)),
  'specs', specs - 'Color' - 'Colour' - 'Finish' - 'Case color' - 'Body color',
  'storageOptions', storage_options
)::text)
WHERE model_group_key IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_model_group ON products(model_group_key) WHERE model_group_key IS NOT NULL;
