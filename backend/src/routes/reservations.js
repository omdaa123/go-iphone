import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const reservationsRouter = Router();
// Customer contact details live here — reading is restricted by role too, not only editing.
reservationsRouter.use(requireAuth, requirePermission("reservations.write"));

// Reservation *creation* is customer-facing/unauthenticated — see routes/publicApi.js.

reservationsRouter.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    const params = [];
    let where = "";
    if (status) { params.push(status); where = `WHERE status = $1`; }
    const { rows } = await pool.query(
      `SELECT r.*, p.name AS product_name FROM reservations r
       JOIN products p ON p.id = r.product_id ${where ? where.replace("status", "r.status") : ""}
       ORDER BY r.created_at DESC`,
      params
    );
    res.json({ reservations: rows });
  } catch (err) { next(err); }
});

const statusSchema = z.object({ status: z.enum(["New", "Contacted", "Confirmed", "Ready", "Completed", "Cancelled"]) });
reservationsRouter.patch("/:id/status", requirePermission("reservations.write"), validateBody(statusSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *`, [req.body.status, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Reservation not found." });
    await logAudit({ adminUserId: req.admin.id, action: "reservation.status_change", resourceType: "reservation", resourceId: req.params.id, after: rows[0], ip: req.ip });
    res.json({ reservation: rows[0] });
  } catch (err) { next(err); }
});
