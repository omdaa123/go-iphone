import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth, requirePermission("products.write"));

categoriesRouter.get("/", async (req, res, next) => {
  try {
    await pool.query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_key TEXT REFERENCES categories(key) ON DELETE SET NULL");
    await pool.query(`INSERT INTO categories (key, label, sort_order) VALUES ($1, $2, $3) ON CONFLICT (key) DO NOTHING`, ["other-devices", "Other Devices", 7]);
    await pool.query(
      `INSERT INTO categories (key, label, sort_order, parent_key)
       VALUES ('accessories', 'Accessories', 6, NULL)
       ON CONFLICT (key) DO UPDATE SET label = 'Accessories', parent_key = NULL`
    );
    const accessoryBranches = [
      ["apple-accessory", "Apple Accessories", 14],
      ["other-accessory", "Other Accessories", 15],
    ];
    for (const [key, label, sortOrder] of accessoryBranches) {
      await pool.query(
        `INSERT INTO categories (key, label, sort_order, parent_key)
         VALUES ($1, $2, $3, 'accessories')
         ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, parent_key = 'accessories'`,
        [key, label, sortOrder]
      );
    }
    // Consolidate duplicate branch keys from the earlier plural-key version.
    await pool.query(`UPDATE products SET category_key = 'apple-accessory' WHERE category_key = 'apple-accessories'`);
    await pool.query(`UPDATE products SET category_key = 'other-accessory' WHERE category_key = 'other-accessories'`);
    await pool.query(`DELETE FROM categories WHERE key IN ('apple-accessories', 'other-accessories')`);
    const otherDeviceBranches = [
      ["smartphone", "Smartphones", 8],
      ["smartwatch", "Smart Watches", 9],
      ["tablet", "Tablets", 10],
      ["speakers", "Speakers", 11],
      ["headphones", "Headphones", 12],
      ["other-electronics", "Other Electronics", 13],
    ];
    for (const [key, label, sortOrder] of otherDeviceBranches) {
      await pool.query(
        `INSERT INTO categories (key, label, sort_order, parent_key)
         VALUES ($1, $2, $3, 'other-devices')
         ON CONFLICT (key) DO UPDATE SET parent_key = 'other-devices'`,
        [key, label, sortOrder]
      );
    }
    const { rows } = await pool.query(
      `SELECT c.*, m.url AS image_url FROM categories c LEFT JOIN media m ON m.id = c.image_media_id ORDER BY c.sort_order`
    );
    res.json({ categories: rows });
  } catch (err) { next(err); }
});

const createCategorySchema = z.object({
  key: z.string().min(2).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  label: z.string().trim().min(2).max(80),
  parentKey: z.string().min(2).max(60).nullable().optional(),
});

categoriesRouter.post("/", requirePermission("cms.write"), validateBody(createCategorySchema), async (req, res, next) => {
  try {
    await pool.query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_key TEXT REFERENCES categories(key) ON DELETE SET NULL");
    const parentKey = req.body.parentKey || null;
    if (parentKey) {
      const parent = await pool.query("SELECT key FROM categories WHERE key = $1", [parentKey]);
      if (!parent.rows[0]) return res.status(400).json({ error: "Choose an existing parent category." });
    }
    const { rows: maxRows } = await pool.query("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM categories");
    const { rows } = await pool.query(
      "INSERT INTO categories (key, label, sort_order, parent_key) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.body.key, req.body.label, maxRows[0].next, parentKey]
    );
    await logAudit({ adminUserId: req.admin.id, action: "category.create", resourceType: "category", resourceId: rows[0].key, after: rows[0], ip: req.ip });
    res.status(201).json({ category: rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "A category with that name already exists." });
    next(err);
  }
});

const categoryImageSchema = z.object({ imageMediaId: z.string().uuid().nullable() });
categoriesRouter.patch("/:key/image", requirePermission("cms.write"), validateBody(categoryImageSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE categories SET image_media_id = $1 WHERE key = $2 RETURNING *`,
      [req.body.imageMediaId, req.params.key]
    );
    if (!rows[0]) return res.status(404).json({ error: "Category not found." });
    await logAudit({ adminUserId: req.admin.id, action: "category.image_change", resourceType: "category", resourceId: req.params.key, after: rows[0], ip: req.ip });
    res.json({ category: rows[0] });
  } catch (err) { next(err); }
});
