import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth);

categoriesRouter.get("/", async (req, res, next) => {
  try {
    await pool.query(`INSERT INTO categories (key, label, sort_order) VALUES ($1, $2, $3) ON CONFLICT (key) DO NOTHING`, ["other-devices", "Other Devices", 7]);
    const { rows } = await pool.query(
      `SELECT c.*, m.url AS image_url FROM categories c LEFT JOIN media m ON m.id = c.image_media_id ORDER BY c.sort_order`
    );
    res.json({ categories: rows });
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
