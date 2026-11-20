import { Router } from "express";
import { z } from "zod";
import { pool, withTransaction } from "../db.js";
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
    const result = await withTransaction(async (client) => {
      const current = await client.query(`SELECT status FROM orders WHERE id = $1 FOR UPDATE`, [req.params.id]);
      if (!current.rows[0]) return { missing: true };
      const previousStatus = current.rows[0].status;
      const nextStatus = req.body.status;

      // Completed and cancelled orders are terminal to prevent accidental
      // stock being sold twice or released after fulfilment.
      if (["Completed", "Cancelled"].includes(previousStatus) && previousStatus !== nextStatus) {
        return { conflict: true };
      }

      if (previousStatus !== nextStatus) {
        const { rows } = await client.query(
          `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
          [nextStatus, req.params.id]
        );

        if (nextStatus === "Cancelled") {
          // Return tracked variant quantities that were held when the order
          // was created. Nullable stock_qty means unlimited stock.
          const items = await client.query(
            `SELECT variant_id, qty FROM order_items WHERE order_id = $1 AND variant_id IS NOT NULL`,
            [req.params.id]
          );
          for (const item of items.rows) {
            await client.query(
              `UPDATE product_variants SET stock_qty = stock_qty + $1
               WHERE id = $2 AND stock_qty IS NOT NULL`,
              [item.qty, item.variant_id]
            );
          }
          // Release individually tracked devices, including legacy orders
          // that marked units sold immediately when the order was placed.
          await client.query(
            `UPDATE inventory_units SET status = 'available', locked_by_order_id = NULL, updated_at = now()
             WHERE locked_by_order_id = $1 AND status IN ('reserved', 'sold')`,
            [req.params.id]
          );
        } else if (nextStatus === "Completed") {
          await client.query(
            `UPDATE inventory_units SET status = 'sold', updated_at = now()
             WHERE locked_by_order_id = $1 AND status = 'reserved'`,
            [req.params.id]
          );
        }
        return { order: rows[0] };
      }

      const unchanged = await client.query(`SELECT * FROM orders WHERE id = $1`, [req.params.id]);
      return { order: unchanged.rows[0] };
    });

    if (result.missing) return res.status(404).json({ error: "Order not found." });
    if (result.conflict) return res.status(409).json({ error: "Completed or cancelled orders cannot be reopened or changed." });
    await logAudit({ adminUserId: req.admin.id, action: "order.status_change", resourceType: "order", resourceId: req.params.id, after: result.order, ip: req.ip });
    res.json({ order: result.order });
  } catch (err) { next(err); }
});

const paymentStatusSchema = z.object({ paymentStatus: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]) });
ordersRouter.patch("/:id/payment-status", requirePermission("orders.write"), validateBody(paymentStatusSchema), async (req, res, next) => {
  try {
    // Until a verified gateway webhook exists, staff must not be able to
    // mark an order paid/refunded through a routine order-management role.
    // Any exceptional manual reconciliation is an explicit, owner-only opt-in.
    if (["paid", "refunded"].includes(req.body.paymentStatus) &&
        (req.admin.role !== "OWNER" || process.env.ALLOW_MANUAL_PAYMENT_STATUS !== "true")) {
      return res.status(403).json({ error: "Manual paid/refunded status changes are disabled. Use a verified payment reconciliation flow." });
    }
    const { rows } = await pool.query(
      `UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *`,
      [req.body.paymentStatus, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Order not found." });
    await logAudit({ adminUserId: req.admin.id, action: "order.payment_status_change", resourceType: "order", resourceId: req.params.id, after: rows[0], ip: req.ip });
    res.json({ order: rows[0] });
  } catch (err) { next(err); }
});
