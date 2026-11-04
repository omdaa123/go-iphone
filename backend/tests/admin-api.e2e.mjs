// WARNING: run ONLY against a throwaway/test database, with the server started with REQUIRE_2FA=false.
// Run this suite FIRST (before security.e2e.mjs, which enables 2FA on the owner).
// Usage: API_URL=http://localhost:4058 node tests/admin-api.e2e.mjs
const B = process.env.API_URL || "http://localhost:4058";
const jar = () => ({ cookies: {} });
async function call(j, method, path, body) {
  const cookie = Object.entries(j.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  const r = await fetch(B + path, { method, headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  for (const c of r.headers.getSetCookie?.() || []) { const [kv] = c.split(";"); const [k, v] = kv.split("="); if (/Max-Age=0|1970/.test(c)) delete j.cookies[k]; else j.cookies[k] = v; }
  let data; try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}
let pass = 0, fail = 0; const check = (n, c, x = "") => { c ? pass++ : fail++; console.log(`${c ? "PASS" : "FAIL"}  ${n} ${c ? "" : x}`); };
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const owner = jar();
await call(owner, "POST", "/admin/auth/login", { email: "owner@test.com", password: "a-very-long-test-password-1" });
let r = await call(owner, "GET", "/admin/auth/me");
check("/me returns role, permissions and totpEnabled flag", r.status === 200 && r.data.user.permissions["products.write"] === true && typeof r.data.user.totpEnabled === "boolean", JSON.stringify(r.data));

r = await call(owner, "GET", "/admin/stats");
check("stats: product/order/reservation/unit counts present", r.status === 200 && r.data.products.published >= 22 && "revenueCents" in r.data && Array.isArray(r.data.recentOrders), JSON.stringify(r.data).slice(0, 200));

r = await call(owner, "POST", "/admin/media", { dataUrl: PNG, fileName: "pixel.png", usageTag: "test" });
check("media upload accepts a real PNG", r.status === 201 && r.data.media.url.includes("/uploads/"), JSON.stringify(r.data));
const mediaId = r.data.media.id;
r = await call(owner, "POST", "/admin/media", { dataUrl: "data:image/png;base64," + Buffer.from("MZ-this-is-an-exe-not-a-png").toString("base64"), fileName: "evil.png" });
check("fake image (wrong file signature) is rejected (415)", r.status === 415, JSON.stringify(r.data));

r = await call(owner, "POST", "/admin/products", {
  categoryKey: "iphone", productType: "iphone", name: "Stock Test Phone", specs: { chip: "A99" },
  storageOptions: ["128GB"], colors: ["Black"], primaryImageMediaId: mediaId, galleryMediaIds: [mediaId], collectionIds: ["new-arrivals"],
  variants: [{ storage: "128GB", priceCents: 1500000, stockQty: 2 }], meta: { screenSize: 6.1, rec: { camera: 9 } },
});
check("create product with variant stock + image + meta", r.status === 201, JSON.stringify(r.data));
const pid = r.data.product.id;
r = await call(owner, "GET", "/admin/products?q=Stock%20Test");
check("admin list includes image_url and from_price_cents", r.data.products[0]?.image_url?.includes("/uploads/") && Number(r.data.products[0].from_price_cents) === 1500000, JSON.stringify(r.data.products[0]));
r = await call(owner, "GET", `/admin/products/${pid}`);
check("admin detail returns primaryImage, gallery, variants with stock", r.data.primaryImage?.id === mediaId && r.data.gallery.length === 1 && r.data.variants[0].stock_qty === 2 && r.data.collectionIds.includes("new-arrivals"), JSON.stringify(r.data).slice(0, 300));
const pub = await (await fetch(B + "/api/catalog")).json();
const pp = pub.products.find((p) => p.id === pid);
check("public catalog shows the new product with image, price and meta", pp && pp.image && pp.variantPricing["128GB"] === 15000 && pp.screenSize === 6.1 && pp.rec.camera === 9, JSON.stringify(pp));

const order = (qty) => fetch(B + "/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "S", phone: "01000000099", items: [{ productId: pid, storage: "128GB", qty }] }) });
check("ordering more than stock is refused (409)", (await order(3)).status === 409);
check("ordering within stock works (201)", (await order(2)).status === 201);
check("sold-out variant now refuses even 1 (409)", (await order(1)).status === 409);
r = await call(owner, "PATCH", `/admin/products/${pid}`, { variants: [{ storage: "128GB", priceCents: 1600000, stockQty: 5 }] });
check("admin can restock and change price; storefront reflects it", r.status === 200 && (await (await fetch(B + "/api/catalog")).json()).products.find((p) => p.id === pid).variantPricing["128GB"] === 16000);
r = await call(owner, "GET", "/admin/stats");
check("low-stock list present", Array.isArray(r.data.lowStock));

r = await call(owner, "GET", "/admin/orders");
const o = r.data.orders.find((x) => x.items.some((i) => i.productName === "Stock Test Phone"));
check("admin orders list includes items with product names", !!o && o.items[0].qty === 2 && o.items[0].unitPriceCents == 1500000, JSON.stringify(r.data.orders[0]).slice(0, 200));

r = await call(owner, "POST", "/admin/hero-slides", { title: "Image Hero", imageMediaId: mediaId, ctaText: "Go", linkCategoryKey: "iphone" });
check("hero slide with independent image (no product link)", r.status === 201, JSON.stringify(r.data));
r = await call(owner, "GET", "/admin/hero-slides");
check("admin hero list returns image_url", r.data.heroSlides.some((s) => s.title === "Image Hero" && s.image_url));
const pubHero = (await (await fetch(B + "/api/catalog")).json()).heroSlides.find((s) => s.title === "Image Hero");
check("public hero slide has image + category target", pubHero?.image && pubHero.target.view === "catalog");
await call(owner, "PATCH", "/admin/categories/mac/image", { imageMediaId: mediaId });
r = await call(owner, "GET", "/admin/categories");
check("category image set and listed with url", r.data.categories.find((c) => c.key === "mac").image_url);
check("category image reaches storefront siteContent", (await (await fetch(B + "/api/catalog")).json()).siteContent.categoryImages.mac);

r = await call(owner, "PUT", "/admin/site-content/comparisonSection", { title: "Compare iPhone", description: "d", cta: "Compare", image: "https://x/y.png", visible: true });
check("comparison section saved", r.status === 200);
check("…and reaches storefront", (await (await fetch(B + "/api/catalog")).json()).siteContent.comparisonSection.title === "Compare iPhone");

r = await call(owner, "GET", "/admin/audit-logs");
check("OWNER can read audit logs, with actor emails", r.status === 200 && r.data.logs.length > 3 && r.data.logs.some((l) => l.admin_email === "owner@test.com"));
r = await call(owner, "GET", "/admin/login-events");
check("OWNER can read login events", r.status === 200 && r.data.events.length > 0);
const mgr = jar();
await call(owner, "POST", "/admin/users", { email: "mgr@test.com", password: "manager-password-long-1", role: "MANAGER" });
await call(mgr, "POST", "/admin/auth/login", { email: "mgr@test.com", password: "manager-password-long-1" });
r = await call(mgr, "GET", "/admin/audit-logs");
check("MANAGER cannot read audit logs (403)", r.status === 403);
r = await call(mgr, "GET", "/admin/products");
check("MANAGER can list products (200)", r.status === 200);
r = await call(mgr, "POST", "/admin/products", { categoryKey: "iphone", productType: "iphone", name: "Mgr Phone", visibility: "draft" });
check("MANAGER can create products (201)", r.status === 201);
r = await call(mgr, "PUT", "/admin/settings/storeInfo", { name: "x" });
check("MANAGER cannot change store settings (403)", r.status === 403);
r = await call(owner, "PUT", "/admin/settings/storeInfo", { name: "Go iPhone", phone: "0100" });
check("OWNER can change store settings", r.status === 200);
// reading customer data is restricted by role, not just editing
await call(owner, "POST", "/admin/users", { email: "writer@test.com", password: "writer-password-long-1", role: "CONTENT" });
const writer = jar();
await call(writer, "POST", "/admin/auth/login", { email: "writer@test.com", password: "writer-password-long-1" });
r = await call(writer, "GET", "/admin/orders");
check("CONTENT role cannot READ customer orders (403)", r.status === 403);
r = await call(writer, "GET", "/admin/reservations");
check("CONTENT role cannot READ customer reservations (403)", r.status === 403);
r = await call(writer, "GET", "/admin/stats");
check("CONTENT role's dashboard stats contain no revenue or customer data", r.status === 200 && !("revenueCents" in r.data) && !("recentOrders" in r.data) && !("orders" in r.data) && !("recentReservations" in r.data), JSON.stringify(Object.keys(r.data)));
r = await call(writer, "GET", "/admin/products");
check("CONTENT role can still list products (needed to link hero slides)", r.status === 200);

// changing your own password
const mgr2 = jar();
await call(mgr2, "POST", "/admin/auth/login", { email: "mgr@test.com", password: "manager-password-long-1" }); // a second device
r = await call(mgr, "POST", "/admin/auth/change-password", { currentPassword: "WRONG-current-password", newPassword: "a-brand-new-password-1" });
check("change password: wrong current password rejected (400)", r.status === 400);
r = await call(mgr, "POST", "/admin/auth/change-password", { currentPassword: "manager-password-long-1", newPassword: "short" });
check("change password: too-short new password rejected (400)", r.status === 400);
r = await call(mgr, "POST", "/admin/auth/change-password", { currentPassword: "manager-password-long-1", newPassword: "a-brand-new-password-1" });
check("change password: success (200)", r.status === 200, JSON.stringify(r.data));
check("…this device stays signed in", (await call(mgr, "GET", "/admin/auth/me")).status === 200);
check("…the OTHER device is signed out immediately", (await call(mgr2, "GET", "/admin/products")).status === 401);
check("…old password no longer works", (await call(jar(), "POST", "/admin/auth/login", { email: "mgr@test.com", password: "manager-password-long-1" })).status === 401);
check("…new password works", (await call(jar(), "POST", "/admin/auth/login", { email: "mgr@test.com", password: "a-brand-new-password-1" })).status === 200);
console.log(`\n${pass} passed, ${fail} failed`);
