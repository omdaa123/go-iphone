-- Explicit product sibling grouping for per-color product records.
-- Same product/configuration except finish/color receives the same key.
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_group_key TEXT;

CREATE OR REPLACE FUNCTION set_product_model_group_key() RETURNS trigger AS $$
BEGIN
  IF NEW.model_group_key IS NULL OR NEW.model_group_key LIKE 'auto-%' THEN
    NEW.model_group_key := 'auto-' || md5(jsonb_build_object(
      'category', NEW.category_key,
      'type', NEW.product_type,
      'name', lower(trim(NEW.name)),
      'specs', NEW.specs - 'Color' - 'Colour' - 'Finish' - 'Case color' - 'Body color',
      'storageOptions', NEW.storage_options
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_model_group_key ON products;
CREATE TRIGGER trg_products_model_group_key
BEFORE INSERT OR UPDATE OF model_group_key, category_key, product_type, name, specs, storage_options
ON products FOR EACH ROW EXECUTE FUNCTION set_product_model_group_key();

UPDATE products SET model_group_key = NULL WHERE model_group_key IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_model_group ON products(model_group_key) WHERE model_group_key IS NOT NULL;
