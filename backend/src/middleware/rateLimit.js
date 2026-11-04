import rateLimit from "express-rate-limit";

// In-memory store is fine for a single server instance. If you scale to
// multiple backend instances, swap this for a Redis-backed store
// (rate-limit-redis) so limits are shared across instances.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait 15 minutes and try again." },
  keyGenerator: (req) => `${req.ip}:${String(req.body?.email || "").toLowerCase()}`,
});

export const totpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many 2FA attempts. Please wait 10 minutes and try again." },
});

export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
