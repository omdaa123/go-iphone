import rateLimit from "express-rate-limit";
import { pool } from "../db.js";

// Shared PostgreSQL-backed store: limits remain consistent across serverless
// instances and deployments that use the same database.
class PostgresRateLimitStore {
  windowMs = 60_000;

  constructor(namespace) { this.namespace = namespace; }
  scopedKey(key) { return `${this.namespace}:${key}`; }

  init(options) {
    this.windowMs = options.windowMs;
  }

  async increment(key) {
    key = this.scopedKey(key);
    const now = Date.now();
    const resetAt = new Date(now + this.windowMs);
    const { rows } = await pool.query(
      `INSERT INTO rate_limit_hits (key, total_hits, reset_at)
       VALUES ($1, 1, $2)
       ON CONFLICT (key) DO UPDATE SET
         total_hits = CASE
           WHEN rate_limit_hits.reset_at <= now() THEN 1
           ELSE rate_limit_hits.total_hits + 1
         END,
         reset_at = CASE
           WHEN rate_limit_hits.reset_at <= now() THEN EXCLUDED.reset_at
           ELSE rate_limit_hits.reset_at
         END
       RETURNING total_hits, reset_at`,
      [key, resetAt]
    );

    // Opportunistic bounded cleanup; expired rows never affect active limits.
    if (Math.random() < 0.01) {
      await pool.query("DELETE FROM rate_limit_hits WHERE reset_at < now() - interval '1 hour'").catch(() => {});
    }

    return {
      totalHits: Number(rows[0].total_hits),
      resetTime: new Date(rows[0].reset_at),
    };
  }

  async decrement(key) {
    key = this.scopedKey(key);
    await pool.query(
      "UPDATE rate_limit_hits SET total_hits = GREATEST(0, total_hits - 1) WHERE key = $1",
      [key]
    );
  }

  async resetKey(key) {
    key = this.scopedKey(key);
    await pool.query("DELETE FROM rate_limit_hits WHERE key = $1", [key]);
  }

  async get(key) {
    key = this.scopedKey(key);
    const { rows } = await pool.query(
      "SELECT total_hits, reset_at FROM rate_limit_hits WHERE key = $1",
      [key]
    );
    if (!rows.length) return undefined;
    if (new Date(rows[0].reset_at).getTime() <= Date.now()) {
      await this.resetKey(key);
      return undefined;
    }
    return {
      totalHits: Number(rows[0].total_hits),
      resetTime: new Date(rows[0].reset_at),
    };
  }
}

const sharedStore = (namespace) => new PostgresRateLimitStore(namespace);

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  store: sharedStore("login"),
  message: { error: "Too many login attempts. Please wait 15 minutes and try again." },
});

export const totpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: sharedStore("totp"),
  message: { error: "Too many 2FA attempts. Please wait 10 minutes and try again." },
});

export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: sharedStore("write"),
  message: { error: "Too many requests. Please slow down." },
});
