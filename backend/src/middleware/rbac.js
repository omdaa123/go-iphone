import { pool } from "../db.js";

/** requirePermission("products.write") — checked against the `roles` table
 * (not just trusted from a JWT claim), so revoking/changing a role in the
 * database takes effect on the admin's very next request, not just at their
 * next login. This is the "server-side permission check on every endpoint"
 * requirement — route handlers never decide authorization on their own. */
export function requirePermission(permission) {
  return async (req, res, next) => {
    try {
    if (!req.admin) return res.status(401).json({ error: "Not authenticated." });

    const { rows } = await pool.query(`SELECT permissions FROM roles WHERE name = $1`, [req.admin.role]);
    const permissions = rows[0]?.permissions || {};

    if (!permissions[permission]) {
      return res.status(403).json({ error: "You don't have permission to do this." });
    }
    next();
    } catch (err) {
      next(err);
    }
  };
}
