-- Go iPhone production schema.
-- NOTE: all money columns named *_cents store PIASTRES (1 EGP = 100), as integers.
-- Run once via `npm run migrate`. Safe to re-run (IF NOT EXISTS guards).

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- case-insensitive email

-- ===================== Identity & access =====================

CREATE TABLE IF NOT EXISTS roles (
  name TEXT PRIMARY KEY,                  -- OWNER | MANAGER | STAFF | CONTENT
  permissions JSONB NOT NULL
);

INSERT INTO roles (name, permissions) VALUES
  ('OWNER',   '{"admin.manage":true,"products.write":true,"inventory.write":true,"orders.write":true,"reservations.write":true,"cms.write":true,"media.write":true,"settings.write":true}'),
  ('MANAGER', '{"admin.manage":false,"products.write":true,"inventory.write":true,"orders.write":true,"reservations.write":true,"cms.write":true,"media.write":true,"settings.write":false}'),
  ('STAFF',   '{"admin.manage":false,"products.write":false,"inventory.write":true,"orders.write":true,"reservations.write":true,"cms.write":false,"media.write":false,"settings.write":false}'),
  ('CONTENT', '{"admin.manage":false,"products.write":false,"inventory.write":false,"orders.write":false,"reservations.write":false,"cms.write":true,"media.write":true,"settings.write":false}')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL REFERENCES roles(name),
  totp_secret TEXT,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token_hash TEXT UNIQUE NOT NULL,   -- SHA-256 of the cookie value; raw token is never stored
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(admin_user_id) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  before JSONB,
  after JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_events (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  reason TEXT,                            -- 'bad_password' | 'locked' | 'totp_required' | 'totp_invalid' | 'ok'
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== Catalog =====================

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  file_name TEXT,
  usage_tag TEXT,
  width INT,
  height INT,
  bytes INT,
  uploaded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  image_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,                          -- stable human-readable id, e.g. 'iphone-15-pro'
  meta JSONB NOT NULL DEFAULT '{}',          -- storefront-only extras: screenSize, rec scores, launchDate
  category_key TEXT NOT NULL REFERENCES categories(key),
  product_type TEXT NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  specs JSONB NOT NULL DEFAULT '{}',
  storage_options TEXT[] NOT NULL DEFAULT '{}',
  colors TEXT[] NOT NULL DEFAULT '{}',
  sales_mode TEXT NOT NULL DEFAULT 'for_sale' CHECK (sales_mode IN ('for_sale','reservation')),
  availability TEXT NOT NULL DEFAULT 'in_stock',
  reservation_cfg JSONB,
  badges TEXT[] NOT NULL DEFAULT '{}',
  has_units BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'published' CHECK (visibility IN ('published','draft','hidden')),
  primary_image_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  gallery_media_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_key);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(visibility) WHERE visibility = 'published';

CREATE TABLE IF NOT EXISTS product_collections (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage TEXT,
  color TEXT,
  price_cents BIGINT NOT NULL,
  stock_qty INT,
  UNIQUE (product_id, storage, color)
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

CREATE TABLE IF NOT EXISTS inventory_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage TEXT,
  color TEXT,
  battery_pct INT,
  condition TEXT,
  sku TEXT,
  price_cents BIGINT NOT NULL,
  warranty TEXT,
  notes TEXT,
  photo_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','sold')),
  locked_by_order_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_units_product_status ON inventory_units(product_id, status);

-- ===================== Commerce =====================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  notes TEXT,
  total_cents BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Confirmed','Preparing','Ready','Completed','Cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'cod',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  inventory_unit_id UUID REFERENCES inventory_units(id),
  variant_label TEXT,
  unit_price_cents BIGINT NOT NULL,
  qty INT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  storage TEXT,
  color TEXT,
  qty INT NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Confirmed','Ready','Completed','Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reservations_product ON reservations(product_id);

-- ===================== CMS =====================

CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  cta_text TEXT,
  link_category_key TEXT REFERENCES categories(key),
  link_product_id UUID REFERENCES products(id),
  image_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  mobile_image_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  duration_ms INT NOT NULL DEFAULT 6500
);

CREATE TABLE IF NOT EXISTS homepage_content (
  section_key TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
