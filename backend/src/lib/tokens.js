import crypto from "node:crypto";

// Session design:
//  - Access session id: short-lived (15 min), stored in an HTTP-only cookie,
//    just an opaque random id we look up against `sessions` on every request.
//  - Refresh token: longer-lived (7-30 days), ALSO opaque + random. We never
//    store the raw refresh token in the database — only its SHA-256 hash —
//    so a leaked database dump doesn't hand out usable tokens.
export function newOpaqueToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function minutesFromNow(mins) {
  return new Date(Date.now() + mins * 60 * 1000);
}

export function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
