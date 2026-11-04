import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

export const auditRouter = Router();
auditRouter.use(requireAuth, requirePermission("admin.manage")); // OWNER only

auditRouter.get("/audit-logs", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const { rows } = await pool.query(
      `SELECT a.id, a.action, a.resource_type, a.resource_id, a.ip_address, a.created_at, u.email AS admin_email
       FROM audit_logs a LEFT JOIN admin_users u ON u.id = a.admin_user_id
       ORDER BY a.id DESC LIMIT $1`,
      [limit]
    );
    res.json({ logs: rows });
  } catch (err) { next(err); }
});

auditRouter.get("/login-events", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const { rows } = await pool.query(`SELECT id, email, success, reason, ip_address, created_at FROM login_events ORDER BY id DESC LIMIT $1`, [limit]);
    res.json({ events: rows });
  } catch (err) { next(err); }
});
