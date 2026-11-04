import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const statsRouter = Router();
statsRouter.use(requireAuth);

// Dashboard numbers, computed in the database so the admin app doesn't have to
// download every order just to count them.
statsRouter.get("/", async (req, res, next) => {
  try {
    // Customer data and revenue only go to roles allowed to see orders / reservations.
    const perms = (await pool.query(`SELECT permissions FROM roles WHERE name = $1`, [req.admin.role])).rows[0]?.permissions || {};
    const none = Promise.resolve({ rows: [] });
    const [products, orders, revenue, reservations, units, lowStock, recentOrders, recentReservations] = await Promise.all([
      pool.query(`SELECT visibility AS k, count(*)::int AS n FROM products GROUP BY visibility`),
      perms["orders.write"] ? pool.query(`SELECT status AS k, count(*)::int AS n FROM orders GROUP BY status`) : none,
      perms["orders.write"] ? pool.query(`SELECT COALESCE(SUM(total_cents),0) AS total FROM orders WHERE status <> 'Cancelled'`) : none,
      perms["reservations.write"] ? pool.query(`SELECT status AS k, count(*)::int AS n FROM reservations GROUP BY status`) : none,
      pool.query(`SELECT status AS k, count(*)::int AS n FROM inventory_units GROUP BY status`),
      pool.query(
        `SELECT p.id AS product_id, p.name, v.storage, v.stock_qty FROM product_variants v JOIN products p ON p.id = v.product_id
         WHERE v.stock_qty IS NOT NULL AND v.stock_qty <= 3 ORDER BY v.stock_qty, p.name LIMIT 10`
      ),
      perms["orders.write"] ? pool.query(`SELECT id, customer_name, total_cents, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`) : none,
      perms["reservations.write"] ? pool.query(
        `SELECT r.id, r.customer_name, r.status, r.created_at, p.name AS product_name
         FROM reservations r JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC LIMIT 5`
      ) : none,
    ]);
    const countMap = (rows) => Object.fromEntries(rows.map((r) => [r.k, r.n]));
    const out = { products: countMap(products.rows), units: countMap(units.rows), lowStock: lowStock.rows };
    if (perms["orders.write"]) { out.orders = countMap(orders.rows); out.revenueCents = Number(revenue.rows[0].total); out.recentOrders = recentOrders.rows; }
    if (perms["reservations.write"]) { out.reservations = countMap(reservations.rows); out.recentReservations = recentReservations.rows; }
    res.json(out);
  } catch (err) { next(err); }
});
