// Safety check: run against a local API started with NODE_ENV=development
// and WITHOUT ENABLE_ADMIN_WRITES / ENABLE_COMMERCE_WRITES.
// No database writes are performed by this test.
const B = process.env.API_URL || "http://127.0.0.1:4060";
const checks = [
  ["health endpoint remains available", "GET", "/health", 200],
  ["admin mutations are blocked before authentication", "POST", "/admin/products", 503],
  ["checkout is blocked in local development", "POST", "/api/orders", 503],
  ["reservations are blocked in local development", "POST", "/api/reservations", 503],
];
let passed = 0;
let failed = 0;
for (const [label, method, path, expected] of checks) {
  const response = await fetch(B + path, {
    method,
    headers: { "content-type": "application/json" },
    body: method === "GET" ? undefined : JSON.stringify({}),
  });
  const ok = response.status === expected;
  ok ? passed++ : failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label} (expected ${expected}, got ${response.status})`);
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
