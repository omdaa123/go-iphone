-- Split legacy published Apple catalog entries that stored multiple finishes
-- in one products.colors array. Each finish becomes its own product record,
-- with a shared model_group_key so the storefront renders one color-family card.
-- The original row keeps the color that its current variant already represents.
-- Other finishes start with zero stock and no color-specific image until staff adds them.
-- A backup row is retained for safe rollback.

CREATE TABLE IF NOT EXISTS _backup_apple_color_split_20261121 (
  product_id UUID PRIMARY KEY,
  product_row JSONB NOT NULL,
  variants JSONB NOT NULL,
  collections JSONB NOT NULL
);

INSERT INTO _backup_apple_color_split_20261121 (product_id, product_row, variants, collections)
SELECT
  p.id,
  to_jsonb(p),
  COALESCE((SELECT jsonb_agg(to_jsonb(v) ORDER BY v.id) FROM product_variants v WHERE v.product_id = p.id), '[]'::jsonb),
  COALESCE((SELECT jsonb_agg(to_jsonb(pc) ORDER BY pc.collection_id) FROM product_collections pc WHERE pc.product_id = p.id), '[]'::jsonb)
FROM products p
WHERE p.category_key IN ('iphone', 'ipad', 'mac', 'watch', 'airpods')
  AND cardinality(p.colors) > 1
  AND p.has_units = false
  AND NOT EXISTS (SELECT 1 FROM inventory_units iu WHERE iu.product_id = p.id)
  AND EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id)
  AND NOT (COALESCE(p.meta, '{}'::jsonb) ? 'appleColorSplitVersion')
ON CONFLICT (product_id) DO NOTHING;

CREATE TEMP TABLE apple_color_split_parents ON COMMIT DROP AS
SELECT
  p.id AS original_id,
  p.name,
  p.slug,
  p.meta,
  p.specs,
  p.category_key,
  COALESCE(NULLIF(p.meta->>'modelName', ''), NULLIF(p.specs->>'Model', ''), p.name) AS model_name,
  COALESCE(
    (SELECT v.color FROM product_variants v
      WHERE v.product_id = p.id AND v.color = ANY(p.colors)
      ORDER BY v.id LIMIT 1),
    p.colors[1]
  ) AS canonical_color
FROM products p
WHERE p.category_key IN ('iphone', 'ipad', 'mac', 'watch', 'airpods')
  AND cardinality(p.colors) > 1
  AND p.has_units = false
  AND NOT EXISTS (SELECT 1 FROM inventory_units iu WHERE iu.product_id = p.id)
  AND EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id)
  AND NOT (COALESCE(p.meta, '{}'::jsonb) ? 'appleColorSplitVersion');

CREATE TEMP TABLE apple_color_split_items ON COMMIT DROP AS
SELECT
  parents.original_id,
  parents.model_name,
  parents.canonical_color,
  colors.color,
  gen_random_uuid() AS new_id
FROM apple_color_split_parents parents
JOIN products p ON p.id = parents.original_id
CROSS JOIN LATERAL unnest(p.colors) AS colors(color)
WHERE colors.color IS DISTINCT FROM parents.canonical_color;

INSERT INTO products (
  id, slug, meta, model_group_key, category_key, product_type, name, tagline,
  specs, storage_options, colors, sales_mode, availability, reservation_cfg,
  badges, has_units, visibility, primary_image_media_id, gallery_media_ids,
  created_at, updated_at
)
SELECT
  split.new_id,
  COALESCE(NULLIF(p.slug, ''), regexp_replace(lower(p.name), '[^a-z0-9]+', '-', 'g'))
    || '-' || regexp_replace(lower(split.color), '[^a-z0-9]+', '-', 'g')
    || '-' || left(split.new_id::text, 8),
  COALESCE(p.meta, '{}'::jsonb)
    || jsonb_build_object('color', split.color, 'appleColorSplitVersion', '2026-11-21',
                          'colorFamilySourceProductId', p.id::text),
  left(
    'apple-' || p.category_key || '-' ||
    trim(both '-' from regexp_replace(lower(trim(split.model_name)), '[^a-z0-9]+', '-', 'g')) || '-new',
    120
  ),
  p.category_key, p.product_type, p.name, p.tagline,
  jsonb_set(COALESCE(p.specs, '{}'::jsonb), '{Color}', to_jsonb(split.color), true),
  p.storage_options, ARRAY[split.color]::text[], p.sales_mode, p.availability,
  p.reservation_cfg, p.badges, false, p.visibility, NULL, '{}'::uuid[],
  p.created_at, now()
FROM apple_color_split_items split
JOIN products p ON p.id = split.original_id;

INSERT INTO product_variants (product_id, storage, color, price_cents, stock_qty)
SELECT
  split.new_id,
  chosen.storage,
  split.color,
  chosen.price_cents,
  CASE WHEN chosen.color = split.color THEN chosen.stock_qty ELSE 0 END
FROM apple_color_split_items split
JOIN LATERAL (
  SELECT DISTINCT ON (v.storage)
    v.storage, v.color, v.price_cents, v.stock_qty
  FROM product_variants v
  WHERE v.product_id = split.original_id
    AND (v.color IS NULL OR v.color = split.canonical_color OR v.color = split.color)
  ORDER BY v.storage,
    CASE WHEN v.color = split.color THEN 0
         WHEN v.color = split.canonical_color THEN 1
         ELSE 2 END,
    v.id
) chosen ON true;

INSERT INTO product_collections (product_id, collection_id)
SELECT split.new_id, pc.collection_id
FROM apple_color_split_items split
JOIN product_collections pc ON pc.product_id = split.original_id
ON CONFLICT DO NOTHING;

UPDATE products p
SET
  colors = ARRAY[parents.canonical_color]::text[],
  specs = jsonb_set(COALESCE(p.specs, '{}'::jsonb), '{Color}', to_jsonb(parents.canonical_color), true),
  meta = COALESCE(p.meta, '{}'::jsonb)
    || jsonb_build_object('color', parents.canonical_color,
                          'appleOriginalColors', to_jsonb(p.colors),
                          'appleColorSplitVersion', '2026-11-21'),
  model_group_key = left(
    'apple-' || p.category_key || '-' ||
    trim(both '-' from regexp_replace(lower(trim(parents.model_name)), '[^a-z0-9]+', '-', 'g')) || '-new',
    120
  ),
  updated_at = now()
FROM apple_color_split_parents parents
WHERE p.id = parents.original_id;

UPDATE product_variants v
SET color = parents.canonical_color
FROM apple_color_split_parents parents
WHERE v.product_id = parents.original_id AND v.color IS NULL;

DELETE FROM product_variants v
USING apple_color_split_parents parents
WHERE v.product_id = parents.original_id
  AND v.color IS DISTINCT FROM parents.canonical_color;

-- The backup table preserves original product rows, variant rows and collection links.
