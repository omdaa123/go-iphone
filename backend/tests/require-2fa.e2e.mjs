// Run against a server started WITHOUT REQUIRE_2FA=false (enforcement ON), on a fresh DB with the seed owner.
// Usage: API_URL=http://localhost:4059 node tests/require-2fa.e2e.mjs
import { authenticator } from "otplib";
const B = process.env.API_URL || "http://localhost:4059";
const j = { cookies: {} };
async function call(method, path, body) {
  const cookie = Object.entries(j.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  const r = await fetch(B + path, { method, headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  for (const c of r.headers.getSetCookie?.() || []) { const [kv] = c.split(";"); const [k, v] = kv.split("="); if (/Max-Age=0|1970/.test(c)) delete j.cookies[k]; else j.cookies[k] = v; }
  let data; try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}
let pass = 0, fail = 0; const check = (n, c, x = "") => { c ? pass++ : fail++; console.log(`${c ? "PASS" : "FAIL"}  ${n} ${c ? "" : x}`); };
await call("POST", "/admin/auth/login", { email: "owner@test.com", password: "a-very-long-test-password-1" });
let r = await call("GET", "/admin/auth/me");
check("OWNER without 2FA can log in and sees twoFactorRequired=true", r.status === 200 && r.data.user.twoFactorRequired === true);
for (const path of ["/admin/products", "/admin/orders", "/admin/users", "/admin/stats", "/admin/media"]) {
  r = await call("GET", path);
  check(`…but ${path} is BLOCKED by the server (403 2FA_REQUIRED)`, r.status === 403 && r.data.error === "2FA_REQUIRED");
}
r = await call("DELETE", "/admin/products/00000000-0000-0000-0000-000000000000");
check("…and destructive calls are blocked too", r.status === 403);
r = await call("POST", "/admin/auth/totp-setup");
check("enrollment endpoint is still reachable", r.status === 200 && r.data.secret);
const secret = r.data.secret;
r = await call("POST", "/admin/auth/totp-confirm", { code: authenticator.generate(secret) });
check("owner completes enrollment", r.status === 200);
r = await call("GET", "/admin/products");
check("after enrolling, the same session works normally", r.status === 200);
r = await call("GET", "/admin/auth/me");
check("/me now reports twoFactorRequired=false", r.data.user.twoFactorRequired === false && r.data.user.totpEnabled === true);
console.log(`\n${pass} passed, ${fail} failed`);
