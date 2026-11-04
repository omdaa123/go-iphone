import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const collectionsRouter = Router();
collectionsRouter.use(requireAuth);

collectionsRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(pc.product_id)::int AS product_count
       FROM collections c LEFT JOIN product_collections pc ON pc.collection_id = c.id
       GROUP BY c.id ORDER BY c.sort_order`
    );
    res.json({ collections: rows });
  } catch (err) { next(err); }
});

const createSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only."),
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional().nullable(),
});
collectionsRouter.post("/", requirePermission("cms.write"), validateBody(createSchema), async (req, res, next) => {
  try {
    const { rows: maxRows } = await pool.query(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM collections`);
    const { rows } = await pool.query(
      `INSERT INTO collections (id, name, description, is_system, sort_order) VALUES ($1,$2,$3,false,$4) RETURNING *`,
      [req.body.id, req.body.name, req.body.description ?? null, maxRows[0].next]
    );
    await logAudit({ adminUserId: req.admin.id, action: "collection.create", resourceType: "collection", resourceId: rows[0].id, after: rows[0], ip: req.ip });
    res.status(201).json({ collection: rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "A collection with that id already exists." });
    next(err);
  }
});

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional().nullable(),
  visible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
collectionsRouter.patch("/:id", requirePermission("cms.write"), validateBody(patchSchema), async (req, res, next) => {
  try {
    const b = req.body;
    const fields = { name: b.name, description: b.description, visible: b.visible, sort_order: b.sortOrder };
    const sets = []; const params = [];
    for (const [col, val] of Object.entries(fields)) {
      if (val === undefined) continue;
      params.push(val); sets.push(`${col} = $${params.length}`);
    }
    if (!sets.length) return res.status(400).json({ error: "No fields to update." });
    params.push(req.params.id);
    const { rows } = await pool.query(`UPDATE collections SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`, params);
    if (!rows[0]) return res.status(404).json({ error: "Collection not found." });
    await logAudit({ adminUserId: req.admin.id, action: "collection.update", resourceType: "collection", resourceId: req.params.id, after: rows[0], ip: req.ip });
    res.json({ collection: rows[0] });
  } catch (err) { next(err); }
});

collectionsRouter.delete("/:id", requirePermission("cms.write"), async (req, res, next) => {
  try {
    const existing = await pool.query(`SELECT * FROM collections WHERE id = $1`, [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Collection not found." });
    if (existing.rows[0].is_system) return res.status(400).json({ error: "Built-in collections can't be deleted." });

    await pool.query(`DELETE FROM collections WHERE id = $1`, [req.params.id]);
    await logAudit({ adminUserId: req.admin.id, action: "collection.delete", resourceType: "collection", resourceId: req.params.id, before: existing.rows[0], ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
