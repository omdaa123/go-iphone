// Run against a server started WITHOUT REQUIRE_2FA=false (enforcement ON), on a fresh DB with the seed owner.
// Usage: API_URL=http://localhost:4059 node tests/require-2fa.e2e.mjs
import { authenticator } from "otplib";
const B = process.env.API_URL || "http://localhost:4059";
const j = { cookies: {} };
async function call(method, path, body, jar = j) {
  const cookie = Object.entries(jar.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  const r = await fetch(B + path, { method, headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  for (const c of r.headers.getSetCookie?.() || []) { const [kv] = c.split(";"); const [k, v] = kv.split("="); if (/Max-Age=0|1970/.test(c)) delete jar.cookies[k]; else jar.cookies[k] = v; }
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

// Full-access admins can manage the store/team, but must also enroll in 2FA.
r = await call("POST", "/admin/users", {
  email: "fullaccess@test.com",
  password: "full-access-test-password-1",
  role: "FULL_ACCESS_NO_DASHBOARD",
});
check("OWNER can create a Full Access account", r.status === 201);

const fullAccess = { cookies: {} };
r = await call("POST", "/admin/auth/login", {
  email: "fullaccess@test.com",
  password: "full-access-test-password-1",
}, fullAccess);
check("Full Access account can start sign-in", r.status === 200);
r = await call("GET", "/admin/auth/me", undefined, fullAccess);
check("Full Access account is required to enroll in 2FA", r.status === 200 && r.data.user.twoFactorRequired === true);
r = await call("GET", "/admin/orders", undefined, fullAccess);
check("Full Access cannot use admin APIs before 2FA", r.status === 403 && r.data.error === "2FA_REQUIRED");
r = await call("POST", "/admin/auth/totp-setup", undefined, fullAccess);
check("Full Access can open 2FA enrollment", r.status === 200 && r.data.secret);
const fullAccessSecret = r.data.secret;
r = await call("POST", "/admin/auth/totp-confirm", { code: authenticator.generate(fullAccessSecret) }, fullAccess);
check("Full Access completes 2FA enrollment", r.status === 200);
r = await call("GET", "/admin/orders", undefined, fullAccess);
check("Full Access can access orders after 2FA", r.status === 200);
console.log(`\n${pass} passed, ${fail} failed`);
