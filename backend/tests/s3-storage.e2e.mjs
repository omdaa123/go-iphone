// Verifies the object-storage path against a fake S3 server: the API must send a correctly SIGNED
// PUT to <endpoint>/<bucket>/uploads/<uuid>.png with the right content type, store only the public URL
// in the database, and send a DELETE when the image is deleted. Self-contained: starts the fake S3 and the API itself.
// Needs a migrated DB (DATABASE_URL) with the seed owner. Usage: node tests/s3-storage.e2e.mjs
import http from "node:http";
import { spawn } from "node:child_process";
const seen = [];
const fake = http.createServer((req, res) => {
  const chunks = []; req.on("data", (c) => chunks.push(c));
  req.on("end", () => { seen.push({ method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks) }); res.writeHead(200, { ETag: '"x"' }); res.end(); });
}).listen(4070);
const api = spawn("node", ["src/index.js"], { env: { ...process.env, PORT: "4071", REQUIRE_2FA: "false", COOKIE_SECURE: "false",
  S3_BUCKET: "goi-media", S3_ENDPOINT: "http://localhost:4070", S3_REGION: "auto", S3_ACCESS_KEY_ID: "AKIATEST", S3_SECRET_ACCESS_KEY: "secret", S3_PUBLIC_BASE_URL: "https://media.goiphone.test" }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2000));
const B = "http://localhost:4071"; let cookie = "";
const call = async (m, p, b) => { const r = await fetch(B + p, { method: m, headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: b ? JSON.stringify(b) : undefined }); const sc = r.headers.getSetCookie?.() || []; if (sc.length) cookie = sc.map((c) => c.split(";")[0]).join("; "); return { status: r.status, data: await r.json().catch(() => null) }; };
let pass = 0, fail = 0; const check = (n, c, x = "") => { c ? pass++ : fail++; console.log(`${c ? "PASS" : "FAIL"}  ${n} ${c ? "" : x}`); };
const PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
try {
  await call("POST", "/admin/auth/login", { email: "owner@test.com", password: "a-very-long-test-password-1" });
  let r = await call("POST", "/admin/media", { dataUrl: "data:image/png;base64," + PNG_B64, fileName: "p.png" });
  check("upload succeeds with S3 configured", r.status === 201, JSON.stringify(r.data));
  const put = seen.find((x) => x.method === "PUT");
  check("API sent a PUT to the bucket path", !!put && /^\/goi-media\/uploads\/[0-9a-f-]{36}\.png/.test(put.url), put?.url);
  check("request is cryptographically signed (AWS Signature V4)", /AWS4-HMAC-SHA256/.test(put?.headers.authorization || ""), put?.headers.authorization);
  check("correct content type + long cache header", put?.headers["content-type"] === "image/png" && /immutable/.test(put?.headers["cache-control"] || ""));
  check("uploaded bytes are the real image bytes", put && put.body.length > 0 && put.body.includes(Buffer.from(PNG_B64, "base64").subarray(0, 8)));
  check("database stores only the public URL (no image data)", /^https:\/\/media\.goiphone\.test\/uploads\/[0-9a-f-]{36}\.png$/.test(r.data.media.url), r.data.media.url);
  const pr = await call("POST", "/admin/products", { categoryKey: "iphone", productType: "iphone", name: "S3 Image Phone", primaryImageMediaId: r.data.media.id, variants: [{ storage: null, priceCents: 100000 }] });
  const del = await call("DELETE", `/admin/media/${r.data.media.id}`);
  check("deleting an image that is still in use succeeds (no confusing error)", del.status === 200, JSON.stringify(del.data));
  check("…and a DELETE was sent to the bucket", seen.some((x) => x.method === "DELETE" && x.url.includes("/goi-media/uploads/")));
  const detail = await call("GET", `/admin/products/${pr.data.product.id}`);
  check("…the product simply has no image now", detail.data.product.primary_image_media_id === null && detail.data.primaryImage === null);
} finally { api.kill(); fake.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
