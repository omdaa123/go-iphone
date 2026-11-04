import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const ordersRouter = Router();
// Customer names, phones and addresses live here — reading is restricted by role too, not only editing.
ordersRouter.use(requireAuth, requirePermission("orders.write"));

// Order *creation* is customer-facing and unauthenticated — see
// routes/publicApi.js, where the inventory-unit claim happens atomically.
// Everything in this file is admin-only read/status-management.

ordersRouter.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    const params = [];
    let where = "";
    if (status) { params.push(status); where = `WHERE o.status = $1`; }
    const { rows } = await pool.query(
      `SELECT o.*,
              COALESCE(json_agg(json_build_object(
                'id', oi.id, 'productId', oi.product_id, 'productName', p.name, 'unitId', oi.inventory_unit_id,
                'variantLabel', oi.variant_label, 'unitPriceCents', oi.unit_price_cents, 'qty', oi.qty
              ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       ${where} GROUP BY o.id ORDER BY o.created_at DESC LIMIT 500`,
      params
    );
    res.json({ orders: rows });
  } catch (err) { next(err); }
});

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const order = await pool.query(`SELECT * FROM orders WHERE id = $1`, [req.params.id]);
    if (!order.rows[0]) return res.status(404).json({ error: "Order not found." });
    const items = await pool.query(`SELECT * FROM order_items WHERE order_id = $1`, [req.params.id]);
    res.json({ order: order.rows[0], items: items.rows });
  } catch (err) { next(err); }
});

const statusSchema = z.object({ status: z.enum(["New", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"]) });
ordersRouter.patch("/:id/status", requirePermission("orders.write"), validateBody(statusSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [req.body.status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Order not found." });
    await logAudit({ adminUserId: req.admin.id, action: "order.status_change", resourceType: "order", resourceId: req.params.id, after: rows[0], ip: req.ip });
    res.json({ order: rows[0] });
  } catch (err) { next(err); }
});

const paymentStatusSchema = z.object({ paymentStatus: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]) });
ordersRouter.patch("/:id/payment-status", requirePermission("orders.write"), validateBody(paymentStatusSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *`,
      [req.body.paymentStatus, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Order not found." });
    await logAudit({ adminUserId: req.admin.id, action: "order.payment_status_change", resourceType: "order", resourceId: req.params.id, after: rows[0], ip: req.ip });
    res.json({ order: rows[0] });
  } catch (err) { next(err); }
});
