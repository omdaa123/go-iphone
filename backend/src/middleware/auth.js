import { pool } from "../db.js";
import { hashToken } from "../lib/tokens.js";

export const PRIVILEGED_ROLES = ["OWNER", "MANAGER"];
export function twoFactorRequired(role, totpEnabled) {
  return process.env.REQUIRE_2FA !== "false" && PRIVILEGED_ROLES.includes(role) && !totpEnabled;
}

/** Verifies the session cookie against the database on every request.
 * This is the server-side enforcement the brief requires: the frontend
 * hiding a button means nothing if this middleware isn't the actual gate
 * on every admin route. No valid, unexpired, unrevoked session → 401. */
export async function requireAuth(req, res, next) {
  try {
  const sessionId = req.cookies?.gi_session;
  if (!sessionId) return res.status(401).json({ error: "Not authenticated." });

  const { rows } = await pool.query(
    `SELECT s.id AS session_id, s.expires_at, s.revoked_at,
            u.id AS user_id, u.email, u.role, u.is_active, u.totp_enabled
     FROM sessions s
     JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.session_token_hash = $1`,
    [hashToken(sessionId)]
  );
  const session = rows[0];

  if (!session || session.revoked_at || new Date(session.expires_at) < new Date() || !session.is_active) {
    res.clearCookie("gi_session");
    return res.status(401).json({ error: "Session expired or invalid." });
  }

  req.admin = { id: session.user_id, email: session.email, role: session.role, sessionId: session.session_id };

  // Mandatory 2FA for privileged roles — enforced HERE on the server, not in the
  // UI. Until an OWNER/MANAGER has enrolled, the only thing their session can do
  // is the /admin/auth/* endpoints (needed to enroll). Set REQUIRE_2FA=false only
  // for local testing.
  if (twoFactorRequired(session.role, session.totp_enabled) && !req.baseUrl.startsWith("/admin/auth")) {
    return res.status(403).json({ error: "2FA_REQUIRED" });
  }
  next();
  } catch (err) {
    next(err);
  }
}
