import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";

export const siteContentRouter = Router();
siteContentRouter.use(requireAuth);

const KNOWN_SECTIONS = ["comparisonSection", "recommendationSection", "announcement"];

// ---------- GET /admin/site-content ----------
siteContentRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT section_key, data FROM homepage_content`);
    const content = Object.fromEntries(rows.map((r) => [r.section_key, r.data]));
    res.json({ siteContent: content });
  } catch (err) { next(err); }
});

// ---------- PUT /admin/site-content/:section ----------
const sectionBodySchema = z.record(z.any());
siteContentRouter.put("/:section", requirePermission("cms.write"), validateBody(sectionBodySchema), async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!KNOWN_SECTIONS.includes(section)) {
      return res.status(400).json({ error: `Unknown section. Expected one of: ${KNOWN_SECTIONS.join(", ")}` });
    }
    const { rows } = await pool.query(
      `INSERT INTO homepage_content (section_key, data) VALUES ($1, $2)
       ON CONFLICT (section_key) DO UPDATE SET data = EXCLUDED.data
       RETURNING *`,
      [section, req.body]
    );
    await logAudit({ adminUserId: req.admin.id, action: "site_content.update", resourceType: "homepage_content", resourceId: section, after: rows[0].data, ip: req.ip });
    res.json({ section: rows[0].section_key, data: rows[0].data });
  } catch (err) { next(err); }
});

// ---------- GET/PUT /admin/settings ----------
export const settingsRouter = Router();
settingsRouter.use(requireAuth);

settingsRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT key, value FROM site_settings`);
    res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
  } catch (err) { next(err); }
});

settingsRouter.put("/:key", requirePermission("settings.write"), validateBody(z.any()), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value RETURNING *`,
      [req.params.key, req.body]
    );
    await logAudit({ adminUserId: req.admin.id, action: "settings.update", resourceType: "site_settings", resourceId: req.params.key, after: rows[0].value, ip: req.ip });
    res.json({ key: rows[0].key, value: rows[0].value });
  } catch (err) { next(err); }
});
