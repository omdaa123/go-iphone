import { Router } from "express";
import { z } from "zod";
import { pool, withTransaction } from "../db.js";
import { validateBody } from "../middleware/validate.js";
import { writeLimiter } from "../middleware/rateLimit.js";

export const publicRouter = Router();

// Everything in this file is intentionally unauthenticated — it's what the
// storefront calls. Reads only ever expose published, non-sensitive data.
// Writes (orders/reservations) are rate-limited and validated, and — most
// importantly — NEVER trust prices, availability, or totals sent by the
// browser: everything that affects money or inventory is looked up and
// computed here, from the database.

const egp = (piastres) => Math.round(Number(piastres) / 100); // DB stores piastres; the storefront works in whole EGP

// ---------- GET /api/catalog ----------
// One call returns everything the storefront needs to render, already shaped
// the way the storefront's components expect. Small-store friendly: a few
// hundred products fit comfortably in a single cached response.
publicRouter.get("/catalog", async (req, res, next) => {
  try {
    await pool.query(`INSERT INTO categories (key, label, sort_order) VALUES ($1, $2, $3) ON CONFLICT (key) DO NOTHING`, ["other-devices", "Other Devices", 7]);
    const [cats, cols, prods, variants, units, hero, content, settings, pcs] = await Promise.all([
      pool.query(`SELECT c.key, c.label, c.sort_order, m.url AS image_url FROM categories c LEFT JOIN media m ON m.id = c.image_media_id ORDER BY c.sort_order`),
      pool.query(`SELECT id, name, description, is_system, visible, sort_order FROM collections ORDER BY sort_order`),
      pool.query(
        `SELECT p.*, m.url AS image_url,
                COALESCE((SELECT array_agg(g.url ORDER BY ord) FROM unnest(p.gallery_media_ids) WITH ORDINALITY AS u(mid, ord)
                          JOIN media g ON g.id = u.mid), '{}') AS gallery_urls
         FROM products p LEFT JOIN media m ON m.id = p.primary_image_media_id
         WHERE p.visibility = 'published' ORDER BY p.created_at`
      ),
      pool.query(`SELECT v.product_id, v.storage, v.color, v.price_cents, v.stock_qty FROM product_variants v JOIN products p ON p.id = v.product_id WHERE p.visibility = 'published'`),
      pool.query(
        `SELECT u.*, m.url AS photo_url FROM inventory_units u
         JOIN products p ON p.id = u.product_id AND p.visibility = 'published'
         LEFT JOIN media m ON m.id = u.photo_media_id
         WHERE u.status = 'available' ORDER BY u.battery_pct DESC NULLS LAST`
      ),
      pool.query(
        `SELECT s.*, mi.url AS image_url, mm.url AS mobile_image_url FROM hero_slides s
         LEFT JOIN media mi ON mi.id = s.image_media_id LEFT JOIN media mm ON mm.id = s.mobile_image_media_id
         WHERE s.active = true ORDER BY s.sort_order`
      ),
      pool.query(`SELECT section_key, data FROM homepage_content`),
      pool.query(`SELECT key, value FROM site_settings`),
      pool.query(`SELECT product_id, collection_id FROM product_collections`),
    ]);

    const collectionsByProduct = {};
    for (const r of pcs.rows) (collectionsByProduct[r.product_id] ||= []).push(r.collection_id);

    const variantsByProduct = {};
    for (const v of variants.rows) (variantsByProduct[v.product_id] ||= []).push(v);

    const products = prods.rows.map((p) => {
      const vs = variantsByProduct[p.id] || [];
      const variantPricing = {};
      for (const v of vs) variantPricing[v.storage || "Standard"] = egp(v.price_cents);
      return {
        id: p.id,
        slug: p.slug,
        category: p.category_key,
        productType: p.product_type,
        name: p.name,
        tagline: p.tagline,
        specs: p.specs,
        storageOptions: p.storage_options,
        colors: p.colors,
        variantPricing,
        salesMode: p.sales_mode,
        availability: p.availability,
        reservation: p.reservation_cfg,
        badges: p.badges,
        hasUnits: p.has_units,
        collections: collectionsByProduct[p.id] || [],
        image: p.image_url || null,
        gallery: p.gallery_urls || [],
        // storefront-only extras (recommendation scores, screen size, launch date)
        ...(p.meta || {}),
        status: p.sales_mode === "reservation" ? "preorder" : "in-stock",
      };
    });

    const deviceUnits = units.rows.map((u) => ({
      id: u.id, productId: u.product_id, storage: u.storage, color: u.color, battery: u.battery_pct,
      condition: u.condition, price: egp(u.price_cents), sku: u.sku, warranty: u.warranty,
      availability: "available", photo: u.photo_url || null,
    }));

    const heroSlides = hero.rows.map((s) => ({
      id: s.id, eyebrow: s.eyebrow || "", title: s.title, sub: s.subtitle || "", cta: s.cta_text || "Shop now",
      badge: s.badge || "", active: true, duration: s.duration_ms,
      image: s.image_url || "", mobileImage: s.mobile_image_url || "",
      target: s.link_product_id
        ? { view: "product", params: { id: s.link_product_id } }
        : { view: "catalog", params: { category: s.link_category_key || "iphone" } },
    }));

    const siteContent = Object.fromEntries(content.rows.map((r) => [r.section_key, r.data]));
    siteContent.categoryImages = Object.fromEntries(cats.rows.filter((c) => c.image_url).map((c) => [c.key, c.image_url]));
    const collectionDetails = siteContent.collectionDetails || {};
    siteContent.collections = cols.rows.map((c) => ({
      id: c.id, name: c.name, description: c.description || "", visible: c.visible, order: c.sort_order, system: c.is_system,
      ...(collectionDetails[c.id] || {}),
    }));
    siteContent.settings = Object.fromEntries(settings.rows.map((r) => [r.key, r.value]));

    res.set("Cache-Control", "public, max-age=15"); // admin edits show up within seconds
    res.json({
      categories: cats.rows.map((c) => ({ key: c.key, label: c.label })),
      products, deviceUnits, heroSlides, siteContent,
    });
  } catch (err) { next(err); }
});

// ---------- POST /api/orders ----------
// The browser sends WHAT it wants (which product/variant/unit, how many).
// The server decides the price, checks the product is actually for sale,
// claims the specific used unit atomically, and computes the total.
const orderItemSchema = z.object({
  productId: z.string().uuid(),
  inventoryUnitId: z.string().uuid().optional().nullable(),
  storage: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  qty: z.number().int().min(1).max(20),
});
const orderSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(5).max(30),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().max(400).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(orderItemSchema).min(1).max(30),
});

function httpError(status, message) {
  const err = new Error(message);
  err.statusCode = status;
  return err;
}

publicRouter.post("/orders", writeLimiter, validateBody(orderSchema), async (req, res, next) => {
  try {
    const b = req.body;

    const result = await withTransaction(async (client) => {
      const lines = [];

      for (const item of b.items) {
        const prod = await client.query(
          `SELECT id, name, sales_mode, visibility, has_units FROM products WHERE id = $1`,
          [item.productId]
        );
        const product = prod.rows[0];
        if (!product || product.visibility !== "published") throw httpError(400, "One of the products is no longer available.");
        if (product.sales_mode !== "for_sale") throw httpError(400, `${product.name} can't be ordered — it's reservation-only.`);

        if (item.inventoryUnitId) {
          // Claim THIS specific used device atomically. Either the UPDATE
          // matches an 'available' row (we now own it until COMMIT) or it
          // matches nothing and the whole order is rejected — two concurrent
          // buyers can never both win.
          const claim = await client.query(
            `UPDATE inventory_units SET status = 'sold', updated_at = now()
             WHERE id = $1 AND product_id = $2 AND status = 'available'
             RETURNING id, storage, color, condition, price_cents`,
            [item.inventoryUnitId, item.productId]
          );
          if (claim.rows.length === 0) throw httpError(409, "One of the items in your order was just purchased by someone else. Please refresh and try again.");
          const u = claim.rows[0];
          lines.push({
            productId: product.id, unitId: u.id, qty: 1, unitPrice: Number(u.price_cents),
            label: [u.storage, u.color, u.condition].filter(Boolean).join(" · "),
          });
        } else {
          if (product.has_units) throw httpError(400, "Please choose a specific device for this product.");
          const v = await client.query(
            `SELECT id, storage, color, price_cents, stock_qty FROM product_variants
             WHERE product_id = $1 AND storage IS NOT DISTINCT FROM $2
             ORDER BY (color IS NOT DISTINCT FROM $3) DESC LIMIT 1`,
            [item.productId, item.storage || null, item.color || null]
          );
          const variant = v.rows[0];
          if (!variant) throw httpError(400, "That configuration isn't available.");
          if (variant.stock_qty !== null) {
            const dec = await client.query(
              `UPDATE product_variants SET stock_qty = stock_qty - $1 WHERE id = $2 AND stock_qty >= $1 RETURNING id`,
              [item.qty, variant.id]
            );
            if (dec.rows.length === 0) throw httpError(409, `${product.name} is out of stock in that configuration.`);
          }
          lines.push({
            productId: product.id, unitId: null, qty: item.qty, unitPrice: Number(variant.price_cents),
            label: [variant.storage, item.color].filter(Boolean).join(" · "),
          });
        }
      }

      const totalCents = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
      const { rows } = await client.query(
        `INSERT INTO orders (customer_name, phone, email, address, city, notes, total_cents)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, status, payment_status, payment_method, total_cents, created_at`,
        [b.name, b.phone, b.email || null, b.address ?? null, b.city ?? null, b.notes ?? null, totalCents]
      );
      const order = rows[0];

      for (const l of lines) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, inventory_unit_id, variant_label, unit_price_cents, qty)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [order.id, l.productId, l.unitId, l.label, l.unitPrice, l.qty]
        );
        if (l.unitId) await client.query(`UPDATE inventory_units SET locked_by_order_id = $1 WHERE id = $2`, [order.id, l.unitId]);
      }
      return order;
    });

    res.status(201).json({ order: { id: result.id, status: result.status, paymentStatus: result.payment_status, total: egp(result.total_cents) } });
  } catch (err) { next(err); }
});

// ---------- POST /api/reservations ----------
const reservationSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1).max(200),
  phone: z.string().min(5).max(30),
  email: z.string().email().optional().nullable().or(z.literal("")),
  storage: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  qty: z.number().int().min(1).max(20).default(1),
  notes: z.string().max(500).optional().nullable(),
});

publicRouter.post("/reservations", writeLimiter, validateBody(reservationSchema), async (req, res, next) => {
  try {
    const b = req.body;
    const prod = await pool.query(`SELECT id, sales_mode, visibility FROM products WHERE id = $1`, [b.productId]);
    if (!prod.rows[0] || prod.rows[0].visibility !== "published") return res.status(400).json({ error: "That product isn't available." });
    if (prod.rows[0].sales_mode !== "reservation") return res.status(400).json({ error: "This product is for sale — please add it to your cart instead." });

    const { rows } = await pool.query(
      `INSERT INTO reservations (product_id, customer_name, phone, email, storage, color, qty, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, status`,
      [b.productId, b.name, b.phone, b.email || null, b.storage ?? null, b.color ?? null, b.qty, b.notes ?? null]
    );
    res.status(201).json({ reservation: rows[0] });
  } catch (err) { next(err); }
});
