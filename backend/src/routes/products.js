import { Router } from "express";
import { z } from "zod";
import { pool, withTransaction } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const productsRouter = Router();
productsRouter.use(requireAuth);

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(80).optional().nullable(),
  meta: z.record(z.any()).default({}),
  categoryKey: z.string().min(1),
  productType: z.string().min(1),
  name: z.string().min(1).max(200),
  tagline: z.string().max(300).optional().nullable(),
  specs: z.record(z.string()).default({}),
  storageOptions: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  variants: z.array(z.object({
    storage: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    priceCents: z.number().int().nonnegative(),
    stockQty: z.number().int().nonnegative().optional().nullable(),
  })).default([]),
  salesMode: z.enum(["for_sale", "reservation"]).default("for_sale"),
  availability: z.string().default("in_stock"),
  reservationCfg: z.record(z.any()).optional().nullable(),
  badges: z.array(z.string()).default([]),
  hasUnits: z.boolean().default(false),
  visibility: z.enum(["published", "draft", "hidden"]).default("published"),
  primaryImageMediaId: z.string().uuid().optional().nullable(),
  galleryMediaIds: z.array(z.string().uuid()).default([]),
  collectionIds: z.array(z.string()).default([]),
});

// ---------- GET /admin/products ----------
productsRouter.get("/", async (req, res, next) => {
  try {
    const { category, salesMode, visibility, q } = req.query;
    const clauses = [];
    const params = [];
    if (category) { params.push(category); clauses.push(`p.category_key = $${params.length}`); }
    if (salesMode) { params.push(salesMode); clauses.push(`p.sales_mode = $${params.length}`); }
    if (visibility) { params.push(visibility); clauses.push(`p.visibility = $${params.length}`); }
    if (q) { params.push(`%${q}%`); clauses.push(`p.name ILIKE $${params.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `SELECT p.*, m.url AS image_url,
              (SELECT MIN(price_cents) FROM product_variants WHERE product_id = p.id) AS from_price_cents,
              (SELECT MIN(price_cents) FROM inventory_units WHERE product_id = p.id AND status = 'available') AS from_unit_price_cents,
              (SELECT count(*)::int FROM inventory_units WHERE product_id = p.id AND status = 'available') AS available_units
       FROM products p LEFT JOIN media m ON m.id = p.primary_image_media_id
       ${where} ORDER BY p.updated_at DESC`,
      params
    );
    res.json({ products: rows });
  } catch (err) { next(err); }
});

// ---------- GET /admin/products/:id ----------
productsRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Product not found." });

    const variants = await pool.query(`SELECT * FROM product_variants WHERE product_id = $1`, [req.params.id]);
    const collections = await pool.query(
      `SELECT collection_id FROM product_collections WHERE product_id = $1`,
      [req.params.id]
    );
    const primary = rows[0].primary_image_media_id
      ? (await pool.query(`SELECT id, url FROM media WHERE id = $1`, [rows[0].primary_image_media_id])).rows[0]
      : null;
    const gallery = (await pool.query(
      `SELECT m.id, m.url FROM unnest($1::uuid[]) WITH ORDINALITY AS u(mid, ord)
       JOIN media m ON m.id = u.mid ORDER BY u.ord`,
      [rows[0].gallery_media_ids]
    )).rows;
    res.json({
      product: rows[0],
      primaryImage: primary,
      gallery,
      variants: variants.rows,
      collectionIds: collections.rows.map((r) => r.collection_id),
    });
  } catch (err) { next(err); }
});

// ---------- POST /admin/products ----------
productsRouter.post("/", requirePermission("products.write"), validateBody(productSchema), async (req, res, next) => {
  try {
    const b = req.body;
    const product = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO products
           (slug, meta, category_key, product_type, name, tagline, specs, storage_options, colors,
            sales_mode, availability, reservation_cfg, badges, has_units, visibility,
            primary_image_media_id, gallery_media_ids)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING *`,
        [b.slug || `${slugify(b.name)}-${Math.random().toString(36).slice(2, 6)}`, b.meta, b.categoryKey, b.productType, b.name, b.tagline ?? null, b.specs, b.storageOptions, b.colors,
         b.salesMode, b.availability, b.reservationCfg ?? null, b.badges, b.hasUnits, b.visibility,
         b.primaryImageMediaId ?? null, b.galleryMediaIds]
      );
      const product = rows[0];

      for (const v of b.variants) {
        await client.query(
          `INSERT INTO product_variants (product_id, storage, color, price_cents, stock_qty) VALUES ($1,$2,$3,$4,$5)`,
          [product.id, v.storage ?? null, v.color ?? null, v.priceCents, v.stockQty ?? null]
        );
      }
      for (const collectionId of b.collectionIds) {
        await client.query(
          `INSERT INTO product_collections (product_id, collection_id) VALUES ($1,$2)
           ON CONFLICT DO NOTHING`,
          [product.id, collectionId]
        );
      }
      return product;
    });

    await logAudit({ adminUserId: req.admin.id, action: "product.create", resourceType: "product", resourceId: product.id, after: product, ip: req.ip });
    res.status(201).json({ product });
  } catch (err) { next(err); }
});

// ---------- PATCH /admin/products/:id ----------
productsRouter.patch("/:id", requirePermission("products.write"), validateBody(productSchema.partial()), async (req, res, next) => {
  try {
    const existing = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Product not found." });
    const before = existing.rows[0];

    const b = req.body;
    const fields = {
      slug: b.slug, meta: b.meta, category_key: b.categoryKey, product_type: b.productType, name: b.name, tagline: b.tagline,
      specs: b.specs, storage_options: b.storageOptions, colors: b.colors, sales_mode: b.salesMode,
      availability: b.availability, reservation_cfg: b.reservationCfg, badges: b.badges,
      has_units: b.hasUnits, visibility: b.visibility, primary_image_media_id: b.primaryImageMediaId,
      gallery_media_ids: b.galleryMediaIds,
    };
    const sets = [];
    const params = [];
    for (const [col, val] of Object.entries(fields)) {
      if (val === undefined) continue;
      params.push(val);
      sets.push(`${col} = $${params.length}`);
    }
    sets.push(`updated_at = now()`);
    params.push(req.params.id);

    const product = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE products SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
        params
      );
      if (b.variants) {
        await client.query(`DELETE FROM product_variants WHERE product_id = $1`, [req.params.id]);
        for (const v of b.variants) {
          await client.query(
            `INSERT INTO product_variants (product_id, storage, color, price_cents, stock_qty) VALUES ($1,$2,$3,$4,$5)`,
            [req.params.id, v.storage ?? null, v.color ?? null, v.priceCents, v.stockQty ?? null]
          );
        }
      }
      if (b.collectionIds) {
        await client.query(`DELETE FROM product_collections WHERE product_id = $1`, [req.params.id]);
        for (const collectionId of b.collectionIds) {
          await client.query(
            `INSERT INTO product_collections (product_id, collection_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [req.params.id, collectionId]
          );
        }
      }
      return rows[0];
    });

    await logAudit({ adminUserId: req.admin.id, action: "product.update", resourceType: "product", resourceId: req.params.id, before, after: product, ip: req.ip });
    res.json({ product });
  } catch (err) { next(err); }
});

// ---------- DELETE /admin/products/:id ----------
productsRouter.delete("/:id", requirePermission("products.write"), async (req, res, next) => {
  try {
    const existing = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Product not found." });

    await pool.query(`DELETE FROM products WHERE id = $1`, [req.params.id]); // cascades variants/units/collections
    await logAudit({ adminUserId: req.admin.id, action: "product.delete", resourceType: "product", resourceId: req.params.id, before: existing.rows[0], ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
