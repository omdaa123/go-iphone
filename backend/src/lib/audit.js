import { pool } from "../db.js";

/** Call after every successful admin write. `before`/`after` can be null for
 * creates/deletes respectively. This is what makes "who changed what, when"
 * answerable after the fact — required for the audit trail requirement. */
export async function logAudit({ adminUserId, action, resourceType, resourceId, before, after, ip }) {
  await pool.query(
    `INSERT INTO audit_logs (admin_user_id, action, resource_type, resource_id, before, after, ip_address)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [adminUserId, action, resourceType, resourceId ?? null, before ?? null, after ?? null, ip ?? null]
  );
}

export async function logLoginEvent({ email, success, reason, ip }) {
  await pool.query(
    `INSERT INTO login_events (email, success, reason, ip_address) VALUES ($1,$2,$3,$4)`,
    [email, success, reason ?? null, ip ?? null]
  );
}
