import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const unitsRouter = Router({ mergeParams: true }); // mounted at /admin/products/:productId/units
unitsRouter.use(requireAuth);

const unitSchema = z.object({
  storage: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  batteryPct: z.number().int().min(0).max(100).optional().nullable(),
  condition: z.string().optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  warranty: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  photoMediaId: z.string().uuid().optional().nullable(),
});

unitsRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM inventory_units WHERE product_id = $1 ORDER BY updated_at DESC`,
      [req.params.productId]
    );
    res.json({ units: rows });
  } catch (err) { next(err); }
});

unitsRouter.post("/", requirePermission("inventory.write"), validateBody(unitSchema), async (req, res, next) => {
  try {
    const b = req.body;
    const { rows } = await pool.query(
      `INSERT INTO inventory_units (product_id, storage, color, battery_pct, condition, price_cents, warranty, notes, photo_media_id, sku)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.params.productId, b.storage ?? null, b.color ?? null, b.batteryPct ?? null, b.condition ?? null,
       b.priceCents, b.warranty ?? null, b.notes ?? null, b.photoMediaId ?? null, b.sku ?? null]
    );
    await logAudit({ adminUserId: req.admin.id, action: "unit.create", resourceType: "inventory_unit", resourceId: rows[0].id, after: rows[0], ip: req.ip });
    res.status(201).json({ unit: rows[0] });
  } catch (err) { next(err); }
});

unitsRouter.patch("/:unitId", requirePermission("inventory.write"), validateBody(unitSchema.partial()), async (req, res, next) => {
  try {
    const existing = await pool.query(`SELECT * FROM inventory_units WHERE id = $1 AND product_id = $2`, [req.params.unitId, req.params.productId]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Unit not found." });

    const b = req.body;
    const fields = {
      storage: b.storage, color: b.color, battery_pct: b.batteryPct, condition: b.condition,
      price_cents: b.priceCents, sku: b.sku, warranty: b.warranty, notes: b.notes, photo_media_id: b.photoMediaId,
    };
    const sets = []; const params = [];
    for (const [col, val] of Object.entries(fields)) {
      if (val === undefined) continue;
      params.push(val); sets.push(`${col} = $${params.length}`);
    }
    sets.push(`updated_at = now()`);
    params.push(req.params.unitId);

    const { rows } = await pool.query(`UPDATE inventory_units SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`, params);
    await logAudit({ adminUserId: req.admin.id, action: "unit.update", resourceType: "inventory_unit", resourceId: req.params.unitId, before: existing.rows[0], after: rows[0], ip: req.ip });
    res.json({ unit: rows[0] });
  } catch (err) { next(err); }
});

// Manual status override (e.g. admin marks a unit Reserved after confirming
// a reservation by phone). For the *automatic* sold-on-checkout path, see
// the atomic UPDATE ... WHERE status = 'available' pattern in routes/orders.js
// — that's the one that actually prevents a double-sale race condition;
// this endpoint is an explicit admin action, not the concurrency guard.
const statusSchema = z.object({ status: z.enum(["available", "reserved", "sold"]) });
unitsRouter.patch("/:unitId/status", requirePermission("inventory.write"), validateBody(statusSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE inventory_units SET status = $1, updated_at = now()
       WHERE id = $2 AND product_id = $3 RETURNING *`,
      [req.body.status, req.params.unitId, req.params.productId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Unit not found." });
    await logAudit({ adminUserId: req.admin.id, action: "unit.status_change", resourceType: "inventory_unit", resourceId: req.params.unitId, after: rows[0], ip: req.ip });
    res.json({ unit: rows[0] });
  } catch (err) { next(err); }
});

unitsRouter.delete("/:unitId", requirePermission("inventory.write"), async (req, res, next) => {
  try {
    const existing = await pool.query(`SELECT * FROM inventory_units WHERE id = $1 AND product_id = $2`, [req.params.unitId, req.params.productId]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Unit not found." });
    await pool.query(`DELETE FROM inventory_units WHERE id = $1`, [req.params.unitId]);
    await logAudit({ adminUserId: req.admin.id, action: "unit.delete", resourceType: "inventory_unit", resourceId: req.params.unitId, before: existing.rows[0], ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
