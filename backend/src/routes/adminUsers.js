import { Router } from "express";
import argon2 from "argon2";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const adminUsersRouter = Router();
adminUsersRouter.use(requireAuth, requirePermission("admin.manage")); // OWNER only, per the seeded role permissions

adminUsersRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, role, totp_enabled, is_active, created_at, last_login_at FROM admin_users ORDER BY created_at`
    );
    res.json({ adminUsers: rows });
  } catch (err) { next(err); }
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, "Password must be at least 12 characters."),
  role: z.enum(["OWNER", "MANAGER", "STAFF", "CONTENT"]),
});
adminUsersRouter.post("/", validateBody(createSchema), async (req, res, next) => {
  try {
    const hash = await argon2.hash(req.body.password, { type: argon2.argon2id });
    const { rows } = await pool.query(
      `INSERT INTO admin_users (email, password_hash, role) VALUES ($1,$2,$3)
       RETURNING id, email, role, created_at`,
      [req.body.email, hash, req.body.role]
    );
    await logAudit({ adminUserId: req.admin.id, action: "admin_user.create", resourceType: "admin_user", resourceId: rows[0].id, after: { email: rows[0].email, role: rows[0].role }, ip: req.ip });
    res.status(201).json({ adminUser: rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "An admin with that email already exists." });
    next(err);
  }
});

const roleSchema = z.object({ role: z.enum(["OWNER", "MANAGER", "STAFF", "CONTENT"]) });
adminUsersRouter.patch("/:id/role", validateBody(roleSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`UPDATE admin_users SET role = $1 WHERE id = $2 RETURNING id, email, role`, [req.body.role, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Admin not found." });
    await logAudit({ adminUserId: req.admin.id, action: "admin_user.role_change", resourceType: "admin_user", resourceId: req.params.id, after: rows[0], ip: req.ip });
    res.json({ adminUser: rows[0] });
  } catch (err) { next(err); }
});

// Deactivate rather than hard-delete, and revoke every active session —
// this is the "account/session revocation" requirement in practice.
adminUsersRouter.post("/:id/deactivate", async (req, res, next) => {
  try {
    if (req.params.id === req.admin.id) return res.status(400).json({ error: "You can't deactivate your own account." });
    const { rows } = await pool.query(`UPDATE admin_users SET is_active = false WHERE id = $1 RETURNING id, email`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Admin not found." });
    await pool.query(`UPDATE sessions SET revoked_at = now() WHERE admin_user_id = $1 AND revoked_at IS NULL`, [req.params.id]);
    await logAudit({ adminUserId: req.admin.id, action: "admin_user.deactivate", resourceType: "admin_user", resourceId: req.params.id, ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
