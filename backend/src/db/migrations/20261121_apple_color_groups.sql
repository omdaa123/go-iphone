-- Give each NEW Apple model a stable color-family key.
-- Products remain separate rows with independent images, pricing and inventory.
-- The storefront uses this key only to render color siblings in one product card.
UPDATE products
SET model_group_key =
  'apple-' || category_key || '-' ||
  left(
    regexp_replace(
      lower(trim(coalesce(meta->>'modelName', specs->>'Model', name))),
      '[^a-z0-9]+', '-', 'g'
    ),
    72
  ) || '-new'
WHERE category_key IN ('iphone', 'ipad', 'mac', 'watch', 'airpods')
  AND lower(trim(coalesce(specs->>'Condition', ''))) = 'new'
  AND coalesce(meta->>'modelName', specs->>'Model', name) IS NOT NULL
  AND length(trim(coalesce(meta->>'modelName', specs->>'Model', name))) > 0
  AND model_group_key IS DISTINCT FROM (
    'apple-' || category_key || '-' ||
    left(
      regexp_replace(
        lower(trim(coalesce(meta->>'modelName', specs->>'Model', name))),
        '[^a-z0-9]+', '-', 'g'
      ),
      72
    ) || '-new'
  );

CREATE INDEX IF NOT EXISTS idx_products_model_group
  ON products(model_group_key)
  WHERE model_group_key IS NOT NULL;
