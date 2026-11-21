import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { timingSafeEqual } from "node:crypto";

import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { unitsRouter } from "./routes/units.js";
import { ordersRouter } from "./routes/orders.js";
import { reservationsRouter } from "./routes/reservations.js";
import { categoriesRouter } from "./routes/categories.js";
import { collectionsRouter } from "./routes/collections.js";
import { heroSlidesRouter } from "./routes/heroSlides.js";
import { siteContentRouter, settingsRouter } from "./routes/siteContent.js";
import { mediaRouter } from "./routes/media.js";
import { adminUsersRouter } from "./routes/adminUsers.js";
import { customersRouter } from "./routes/customers.js";
import { statsRouter } from "./routes/stats.js";
import { auditRouter } from "./routes/audit.js";
import { publicRouter } from "./routes/publicApi.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { pool } from "./db.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());

// Neon Functions are public HTTPS endpoints. Only the two Cloudflare Pages
// server-side proxies know this secret; browser requests never receive it.
if (process.env.NEON_FUNCTION === "true") {
  const expected = process.env.CLOUDFLARE_ORIGIN_SECRET || "";
  if (expected.length < 32) throw new Error("CLOUDFLARE_ORIGIN_SECRET must be configured with at least 32 characters.");
  app.use((req, res, next) => {
    const supplied = req.get("x-go-iphone-origin-secret") || "";
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return res.status(404).json({ error: "Not found." });
    }
    next();
  });
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map((value) => value.trim()).filter(Boolean).map((value) => {
    if (value === "*") throw new Error("ALLOWED_ORIGINS must never contain a wildcard.");
    let parsed;
    try { parsed = new URL(value); } catch { throw new Error(`Invalid ALLOWED_ORIGINS entry: ${value}`); }
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.pathname !== "/" || parsed.search || parsed.hash) {
      throw new Error(`ALLOWED_ORIGINS entries must be origins only (scheme + host): ${value}`);
    }
    return parsed.origin;
  });

if (process.env.NODE_ENV === "production" && ALLOWED_ORIGINS.length === 0) {
  console.warn("ALLOWED_ORIGINS is empty: browser requests from the deployed storefront/admin will be blocked until their exact HTTPS origins are configured.");
}
app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    const err = new Error("Origin not allowed."); err.statusCode = 403; callback(err);
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

function guardLocalAdminWrites(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method) || req.path.startsWith("/auth/")) return next();
  const catalogWritePath = req.path === "/products" || /^\\/products\\/[^/]+$/.test(req.path) ||
    /^\\/products\\/[^/]+\\/units(?:\\/[^/]+)?$/.test(req.path) ||
    ["/categories", "/collections", "/hero-slides", "/site-content", "/media"].some((base) => req.path === base || req.path.startsWith(base + "/"));
  if (catalogWritePath && process.env.ENABLE_CATALOG_WRITES === "true") return next();
  if (/^\\/orders(?:\\/|$)/.test(req.path) && process.env.ENABLE_ORDER_WRITES === "true") return next();
  if (/^\\/reservations(?:\\/|$)/.test(req.path) && process.env.ENABLE_RESERVATION_WRITES === "true") return next();
  if (process.env.ENABLE_ADMIN_WRITES === "true") return next();
  return res.status(503).json({ error: "Writes are disabled for this admin area." });
}
app.use("/admin", guardLocalAdminWrites);
app.use("/api", publicRouter);
app.use("/admin/auth", authRouter);
app.use("/admin/products", productsRouter);
app.use("/admin/products/:productId/units", unitsRouter);
app.use("/admin/orders", ordersRouter);
app.use("/admin/reservations", reservationsRouter);
app.use("/admin/categories", categoriesRouter);
app.use("/admin/collections", collectionsRouter);
app.use("/admin/hero-slides", heroSlidesRouter);
app.use("/admin/site-content", siteContentRouter);
app.use("/admin/settings", settingsRouter);
app.use("/admin/media", mediaRouter);
app.use("/admin/stats", statsRouter);
app.use("/admin", auditRouter);
app.use("/admin/users", adminUsersRouter);
app.use("/admin/customers", customersRouter);
app.use("/uploads", express.static(process.env.LOCAL_UPLOAD_DIR || "./uploads", {
  setHeaders: (res) => res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
}));
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/ready", async (req, res) => {
  try { await pool.query("SELECT 1"); return res.json({ ok: true, database: "connected" }); }
  catch { return res.status(503).json({ ok: false, database: "unavailable" }); }
});
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
if (process.env.NEON_FUNCTION !== "true") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Go iPhone API listening on :${port}`));
}
