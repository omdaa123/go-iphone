import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

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
import { statsRouter } from "./routes/stats.js";
import { auditRouter } from "./routes/audit.js";
import { publicRouter } from "./routes/publicApi.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// Trust the first proxy hop (needed on Render/Railway/Fly/etc. so req.ip and
// the `secure` cookie flag behave correctly behind their load balancer).
app.set("trust proxy", 1);

app.use(helmet());

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server/tooling requests with no Origin header, but
    // only allow browser origins that are explicitly on the allow-list —
    // never reflect an arbitrary Origin back.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    const err = new Error("Origin not allowed.");
    err.statusCode = 403;
    callback(err);
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" })); // generous enough for a compressed image data URL
app.use(cookieParser());

// ----- Public, unauthenticated API (storefront) -----
app.use("/api", publicRouter);

// ----- Admin API (every route below requires a valid session; most also
// require a specific permission — see each router) -----
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
app.use("/admin", auditRouter); // /admin/audit-logs, /admin/login-events (OWNER only)
app.use("/admin/users", adminUsersRouter); // OWNER only, enforced inside the router itself

// Local-dev only: serve files saved by the local-disk storage adapter.
// In production, media lives in object storage/CDN and this is unused.
app.use("/uploads", express.static(process.env.LOCAL_UPLOAD_DIR || "./uploads", {
  setHeaders: (res) => res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
}));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Go iPhone API listening on :${port}`);
});
