import { Router } from "express";
import argon2 from "argon2";
import { z } from "zod";
import { pool, withTransaction } from "../db.js";
import { newOpaqueToken, hashToken, minutesFromNow, daysFromNow } from "../lib/tokens.js";
import { generateTotpSecret, totpQrDataUrl, verifyTotpCode } from "../lib/totp.js";
import { logLoginEvent, logAudit } from "../lib/audit.js";
import { validateBody } from "../middleware/validate.js";
import { loginLimiter, totpLimiter } from "../middleware/rateLimit.js";
import { requireAuth, twoFactorRequired } from "../middleware/auth.js";

export const authRouter = Router();

const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE !== "false", // HTTPS-only in production; set COOKIE_SECURE=false ONLY for local http:// dev
  sameSite: "strict",
  path: "/",
};

const PENDING_2FA_COOKIE = "gi_2fa_pending";
const MAX_FAILED_LOGINS = 6;
const LOCKOUT_MINUTES = 15;

// ---------- POST /admin/auth/login ----------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", loginLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;

    const { rows } = await pool.query(
      `SELECT id, email, password_hash, role, totp_enabled, totp_secret,
              is_active, failed_login_count, locked_until
       FROM admin_users WHERE email = $1`,
      [email]
    );
    const user = rows[0];

    // Deliberately identical error message whether the email exists or not —
    // don't let a login endpoint double as an "is this a real account?" oracle.
    const genericFail = async (reason) => {
      await logLoginEvent({ email, success: false, reason, ip });
      return res.status(401).json({ error: "Invalid email or password." });
    };

    if (!user || !user.is_active) return genericFail("no_such_user");

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await logLoginEvent({ email, success: false, reason: "locked", ip });
      return res.status(423).json({ error: "Account temporarily locked due to repeated failed attempts." });
    }

    const passwordOk = await argon2.verify(user.password_hash, password).catch(() => false);
    if (!passwordOk) {
      const failedCount = user.failed_login_count + 1;
      const lockUntil = failedCount >= MAX_FAILED_LOGINS ? minutesFromNow(LOCKOUT_MINUTES) : null;
      await pool.query(
        `UPDATE admin_users SET failed_login_count = $1, locked_until = $2 WHERE id = $3`,
        [failedCount, lockUntil, user.id]
      );
      return genericFail("bad_password");
    }

    // Password correct — reset the failure counter.
    await pool.query(`UPDATE admin_users SET failed_login_count = 0, locked_until = NULL WHERE id = $1`, [user.id]);

    if (user.totp_enabled) {
      // Don't issue a real session yet — only a short-lived "pending 2FA"
      // cookie identifying who's mid-login, scoped to nothing else.
      const pendingToken = newOpaqueToken();
      await pool.query(`DELETE FROM totp_login_challenges WHERE admin_user_id = $1`, [user.id]);
      await pool.query(
        `INSERT INTO totp_login_challenges (admin_user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, hashToken(pendingToken), minutesFromNow(5)]
      );
      res.cookie(PENDING_2FA_COOKIE, pendingToken, {
        ...SESSION_COOKIE_OPTS,
        maxAge: 5 * 60 * 1000,
      });
      await logLoginEvent({ email, success: false, reason: "totp_required", ip });
      return res.json({ totpRequired: true });
    }

    await issueSession(res, user, req);
    await logLoginEvent({ email, success: true, reason: "ok", ip });
    res.json({ user: { email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// ---------- POST /admin/auth/totp-verify ----------
const totpSchema = z.object({ code: z.string().length(6) });

authRouter.post("/totp-verify", totpLimiter, validateBody(totpSchema), async (req, res, next) => {
  try {
    const pending = req.cookies?.[PENDING_2FA_COOKIE];
    if (!pending) return res.status(401).json({ error: "No pending login." });

    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role, u.totp_secret
       FROM totp_login_challenges c
       JOIN admin_users u ON u.id = c.admin_user_id
       WHERE c.token_hash = $1 AND c.expires_at > now() AND u.totp_enabled = true AND u.is_active = true`,
      [hashToken(pending)]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "No pending login." });

    const valid = verifyTotpCode(user.totp_secret, req.body.code);
    if (!valid) {
      await logLoginEvent({ email: user.email, success: false, reason: "totp_invalid", ip: req.ip });
      return res.status(401).json({ error: "Invalid code." });
    }

    // Consume the one-time challenge atomically so it cannot be replayed or
    // used by two concurrent verification requests.
    const consumed = await pool.query(
      `DELETE FROM totp_login_challenges WHERE token_hash = $1 RETURNING admin_user_id`,
      [hashToken(pending)]
    );
    if (!consumed.rows[0]) return res.status(401).json({ error: "No pending login." });

    res.clearCookie(PENDING_2FA_COOKIE, SESSION_COOKIE_OPTS);
    await issueSession(res, user, req);
    await logLoginEvent({ email: user.email, success: true, reason: "ok", ip: req.ip });
    res.json({ user: { email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// ---------- POST /admin/auth/refresh ----------
authRouter.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.gi_refresh;
    if (!refreshToken) return res.status(401).json({ error: "Not authenticated." });

    const refreshHash = hashToken(refreshToken);
    const { rows } = await pool.query(
      `SELECT s.id, s.admin_user_id, s.expires_at, s.revoked_at, u.email, u.role, u.is_active
       FROM sessions s JOIN admin_users u ON u.id = s.admin_user_id
       WHERE s.refresh_token_hash = $1`,
      [refreshHash]
    );
    const session = rows[0];
    if (!session || session.revoked_at || !session.is_active || new Date(session.expires_at) < new Date()) {
      res.clearCookie("gi_session");
      res.clearCookie("gi_refresh");
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    // Rotate: revoke the old session/refresh pair, issue a brand new one.
    // If a refresh token is ever replayed after rotation, this makes that
    // detectable (the old session is already revoked) rather than silently
    // accepted.
    await pool.query(`UPDATE sessions SET revoked_at = now() WHERE id = $1`, [session.id]);
    await issueSession(res, { id: session.admin_user_id, email: session.email, role: session.role }, req);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- POST /admin/auth/logout ----------
authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    await pool.query(`UPDATE sessions SET revoked_at = now() WHERE id = $1`, [req.admin.sessionId]);
    res.clearCookie("gi_session");
    res.clearCookie("gi_refresh");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- POST /admin/auth/totp-setup (begin enrolling 2FA) ----------
authRouter.post("/totp-setup", requireAuth, async (req, res, next) => {
  try {
    const secret = generateTotpSecret();
    await pool.query(`UPDATE admin_users SET totp_secret = $1, totp_enabled = false WHERE id = $2`, [
      secret,
      req.admin.id,
    ]);
    const qr = await totpQrDataUrl(req.admin.email, secret);
    res.json({ qrDataUrl: qr, secret }); // secret shown once as manual-entry fallback
  } catch (err) {
    next(err);
  }
});

// ---------- POST /admin/auth/totp-confirm (finish enrolling 2FA) ----------
authRouter.post("/totp-confirm", requireAuth, totpLimiter, validateBody(totpSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT totp_secret FROM admin_users WHERE id = $1`, [req.admin.id]);
    const secret = rows[0]?.totp_secret;
    if (!secret || !verifyTotpCode(secret, req.body.code)) {
      return res.status(400).json({ error: "Invalid code. Scan the QR code again and try the newest code shown." });
    }
    await pool.query(`UPDATE admin_users SET totp_enabled = true WHERE id = $1`, [req.admin.id]);
    await logAudit({ adminUserId: req.admin.id, action: "admin.2fa_enabled", resourceType: "admin_user", resourceId: req.admin.id, ip: req.ip });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- POST /admin/auth/change-password ----------
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, "New password must be at least 12 characters.").max(200),
});
authRouter.post("/change-password", requireAuth, totpLimiter, validateBody(changePasswordSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT password_hash FROM admin_users WHERE id = $1`, [req.admin.id]);
    const ok = await argon2.verify(rows[0].password_hash, req.body.currentPassword).catch(() => false);
    if (!ok) return res.status(400).json({ error: "Your current password is incorrect." });
    if (req.body.currentPassword === req.body.newPassword) return res.status(400).json({ error: "Choose a password you haven't used just now." });
    const hash = await argon2.hash(req.body.newPassword, { type: argon2.argon2id });
    await pool.query(`UPDATE admin_users SET password_hash = $1 WHERE id = $2`, [hash, req.admin.id]);
    // Anyone else signed in with the old password (e.g. a stolen session) is signed out; this device stays in.
    await pool.query(`UPDATE sessions SET revoked_at = now() WHERE admin_user_id = $1 AND id <> $2 AND revoked_at IS NULL`, [req.admin.id, req.admin.sessionId]);
    await logAudit({ adminUserId: req.admin.id, action: "admin.password_changed", resourceType: "admin_user", resourceId: req.admin.id, ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------- GET /admin/auth/me ----------
authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.email, u.role, u.totp_enabled, r.permissions
       FROM admin_users u JOIN roles r ON r.name = u.role WHERE u.id = $1`,
      [req.admin.id]
    );
    const u = rows[0];
    res.json({ user: { email: u.email, role: u.role, totpEnabled: u.totp_enabled, twoFactorRequired: twoFactorRequired(u.role, u.totp_enabled), permissions: u.permissions } });
  } catch (err) { next(err); }
});

async function issueSession(res, user, req) {
  const sessionToken = newOpaqueToken();
  const refreshToken = newOpaqueToken();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO sessions (admin_user_id, session_token_hash, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [user.id, hashToken(sessionToken), hashToken(refreshToken), req.headers["user-agent"] || null, req.ip, daysFromNow(30)]
    );
    await client.query(`UPDATE admin_users SET last_login_at = now() WHERE id = $1`, [user.id]);
  });

  // The session cookie itself expires client-side after 15 minutes, forcing
  // the frontend to call /admin/auth/refresh regularly (limiting how long a
  // stolen cookie stays useful). The underlying `sessions` row is the real
  // source of truth and is valid up to 30 days, re-checked server-side on
  // every single request by requireAuth — not inferred from the cookie alone.
  res.cookie("gi_session", sessionToken, { ...SESSION_COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.cookie("gi_refresh", refreshToken, { ...SESSION_COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 });
}
