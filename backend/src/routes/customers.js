import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

export const customersRouter = Router();
customersRouter.use(requireAuth, requirePermission("orders.write"));

customersRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      WITH activity AS (
        SELECT COALESCE(NULLIF(lower(email), ''), regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g')) AS customer_key,
               customer_name AS name, phone, email, address, city, created_at,
               'order'::text AS activity_type, total_cents AS amount_cents, status
        FROM orders
        UNION ALL
        SELECT COALESCE(NULLIF(lower(email), ''), regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g')) AS customer_key,
               customer_name AS name, phone, email, NULL::text AS address, NULL::text AS city, created_at,
               'reservation'::text AS activity_type, 0::bigint AS amount_cents, status
        FROM reservations
      )
      SELECT customer_key AS id, MAX(name) AS name, MAX(phone) AS phone, MAX(email) AS email,
             MAX(address) AS address, MAX(city) AS city,
             COUNT(*) FILTER (WHERE activity_type = 'order')::int AS orders_count,
             COUNT(*) FILTER (WHERE activity_type = 'reservation')::int AS reservations_count,
             COALESCE(SUM(amount_cents) FILTER (WHERE activity_type = 'order'), 0)::bigint AS total_spent_cents,
             MAX(created_at) AS last_activity
      FROM activity
      WHERE customer_key <> ''
      GROUP BY customer_key
      ORDER BY MAX(created_at) DESC
      LIMIT 1000
    `);
    res.json({ customers: rows });
  } catch (err) { next(err); }
});
