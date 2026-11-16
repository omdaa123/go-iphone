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
    // Reads must remain side-effect free. Category hierarchy and legacy-key
    // normalization are handled by the explicit schema migration instead.
    const { rows } = await pool.query(
      `SELECT c.*, m.url AS image_url
       FROM categories c
       LEFT JOIN media m ON m.id = c.image_media_id
       ORDER BY c.sort_order, c.label`
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

const updateCategorySchema = z.object({
  label: z.string().trim().min(2).max(80).optional(),
  parentKey: z.string().min(2).max(60).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
}).refine(value => Object.keys(value).length > 0, "Provide at least one category field.");

categoriesRouter.patch("/:key", requirePermission("cms.write"), validateBody(updateCategorySchema), async (req, res, next) => {
  try {
    const existing = await pool.query("SELECT * FROM categories WHERE key = $1", [req.params.key]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Category not found." });
    const parentKey = req.body.parentKey;
    if (parentKey === req.params.key) return res.status(400).json({ error: "A category cannot be its own parent." });
    if (parentKey) {
      const parent = await pool.query("SELECT key, parent_key FROM categories WHERE key = $1", [parentKey]);
      if (!parent.rows[0]) return res.status(400).json({ error: "Choose an existing parent category." });
      if (parent.rows[0].parent_key) return res.status(400).json({ error: "Categories can only have two levels." });
    }
    const fields = { label: req.body.label, parent_key: parentKey, sort_order: req.body.sortOrder };
    const sets = []; const params = [];
    for (const [column, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      params.push(value); sets.push(`${column} = ${params.length}`);
    }
    params.push(req.params.key);
    const { rows } = await pool.query(
      `UPDATE categories SET ${sets.join(", ")} WHERE key = ${params.length} RETURNING *`,
      params
    );
    await logAudit({ adminUserId: req.admin.id, action: "category.update", resourceType: "category", resourceId: req.params.key, before: existing.rows[0], after: rows[0], ip: req.ip });
    res.json({ category: rows[0] });
  } catch (err) { next(err); }
});

categoriesRouter.delete("/:key", requirePermission("cms.write"), async (req, res, next) => {
  try {
    const existing = await pool.query("SELECT * FROM categories WHERE key = $1", [req.params.key]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Category not found." });
    const [products, children] = await Promise.all([
      pool.query("SELECT 1 FROM products WHERE category_key = $1 LIMIT 1", [req.params.key]),
      pool.query("SELECT 1 FROM categories WHERE parent_key = $1 LIMIT 1", [req.params.key]),
    ]);
    if (products.rows.length) return res.status(409).json({ error: "Move the products out of this category before deleting it." });
    if (children.rows.length) return res.status(409).json({ error: "Move or delete its subcategories before deleting this category." });
    await pool.query("DELETE FROM categories WHERE key = $1", [req.params.key]);
    await logAudit({ adminUserId: req.admin.id, action: "category.delete", resourceType: "category", resourceId: req.params.key, before: existing.rows[0], ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
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
