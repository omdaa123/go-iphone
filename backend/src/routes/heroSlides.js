import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const heroSlidesRouter = Router();
heroSlidesRouter.use(requireAuth);

heroSlidesRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, mi.url AS image_url, mm.url AS mobile_image_url FROM hero_slides s
       LEFT JOIN media mi ON mi.id = s.image_media_id LEFT JOIN media mm ON mm.id = s.mobile_image_media_id
       ORDER BY s.sort_order`
    );
    res.json({ heroSlides: rows });
  } catch (err) { next(err); }
});

const slideSchema = z.object({
  eyebrow: z.string().max(100).optional().nullable(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional().nullable(),
  badge: z.string().max(50).optional().nullable(),
  ctaText: z.string().max(50).optional().nullable(),
  linkCategoryKey: z.string().optional().nullable(),
  linkProductId: z.string().uuid().optional().nullable(),
  imageMediaId: z.string().uuid().optional().nullable(),
  mobileImageMediaId: z.string().uuid().optional().nullable(),
  active: z.boolean().default(true),
  durationMs: z.number().int().min(2000).max(30000).default(6500),
});

heroSlidesRouter.post("/", requirePermission("cms.write"), validateBody(slideSchema), async (req, res, next) => {
  try {
    const b = req.body;
    const { rows: maxRows } = await pool.query(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM hero_slides`);
    const { rows } = await pool.query(
      `INSERT INTO hero_slides (eyebrow, title, subtitle, badge, cta_text, link_category_key, link_product_id,
         image_media_id, mobile_image_media_id, active, sort_order, duration_ms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [b.eyebrow ?? null, b.title, b.subtitle ?? null, b.badge ?? null, b.ctaText ?? null,
       b.linkCategoryKey ?? null, b.linkProductId ?? null, b.imageMediaId ?? null, b.mobileImageMediaId ?? null,
       b.active, maxRows[0].next, b.durationMs]
    );
    await logAudit({ adminUserId: req.admin.id, action: "hero_slide.create", resourceType: "hero_slide", resourceId: rows[0].id, after: rows[0], ip: req.ip });
    res.status(201).json({ heroSlide: rows[0] });
  } catch (err) { next(err); }
});

heroSlidesRouter.patch("/:id", requirePermission("cms.write"), validateBody(slideSchema.partial()), async (req, res, next) => {
  try {
    const b = req.body;
    const fields = {
      eyebrow: b.eyebrow, title: b.title, subtitle: b.subtitle, badge: b.badge, cta_text: b.ctaText,
      link_category_key: b.linkCategoryKey, link_product_id: b.linkProductId, image_media_id: b.imageMediaId,
      mobile_image_media_id: b.mobileImageMediaId, active: b.active, duration_ms: b.durationMs,
    };
    const sets = []; const params = [];
    for (const [col, val] of Object.entries(fields)) {
      if (val === undefined) continue;
      params.push(val); sets.push(`${col} = $${params.length}`);
    }
    if (!sets.length) return res.status(400).json({ error: "No fields to update." });
    params.push(req.params.id);
    const { rows } = await pool.query(`UPDATE hero_slides SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`, params);
    if (!rows[0]) return res.status(404).json({ error: "Slide not found." });
    await logAudit({ adminUserId: req.admin.id, action: "hero_slide.update", resourceType: "hero_slide", resourceId: req.params.id, after: rows[0], ip: req.ip });
    res.json({ heroSlide: rows[0] });
  } catch (err) { next(err); }
});

const reorderSchema = z.object({ orderedIds: z.array(z.string().uuid()) });
heroSlidesRouter.post("/reorder", requirePermission("cms.write"), validateBody(reorderSchema), async (req, res, next) => {
  try {
    await Promise.all(
      req.body.orderedIds.map((id, i) => pool.query(`UPDATE hero_slides SET sort_order = $1 WHERE id = $2`, [i, id]))
    );
    await logAudit({ adminUserId: req.admin.id, action: "hero_slide.reorder", resourceType: "hero_slide", after: req.body, ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

heroSlidesRouter.delete("/:id", requirePermission("cms.write"), async (req, res, next) => {
  try {
    const existing = await pool.query(`SELECT * FROM hero_slides WHERE id = $1`, [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Slide not found." });
    await pool.query(`DELETE FROM hero_slides WHERE id = $1`, [req.params.id]);
    await logAudit({ adminUserId: req.admin.id, action: "hero_slide.delete", resourceType: "hero_slide", resourceId: req.params.id, before: existing.rows[0], ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
