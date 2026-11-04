import { Router } from "express";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";
import { saveFile, deleteFile } from "../lib/storage.js";

export const mediaRouter = Router();
mediaRouter.use(requireAuth);

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB — the client already compresses images down before this point

const uploadSchema = z.object({
  dataUrl: z.string().startsWith("data:"),
  fileName: z.string().max(200).optional(),
  usageTag: z.string().max(100).optional(),
});

// ---------- POST /admin/media ----------
// Accepts the base64 data URL the frontend's compressImageFile() already
// produced, but — critically — re-validates it server-side rather than
// trusting the client's declared content-type. Never skip this step: a
// malicious client could label an executable as "image/png".
mediaRouter.post("/", requirePermission("media.write"), validateBody(uploadSchema), async (req, res, next) => {
  try {
    const match = req.body.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: "Invalid image data." });

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > MAX_BYTES) {
      return res.status(413).json({ error: "Image too large (max 8MB)." });
    }

    // Sniff the actual file signature — don't trust the data: URL's declared
    // MIME type or the uploaded file's extension/name.
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || !ALLOWED_TYPES.has(detected.mime)) {
      return res.status(415).json({ error: "Unsupported or unrecognized image format." });
    }

    const url = await saveFile(buffer, detected.ext);

    const { rows } = await pool.query(
      `INSERT INTO media (url, file_name, usage_tag, bytes, uploaded_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [url, req.body.fileName ?? null, req.body.usageTag ?? null, buffer.length, req.admin.id]
    );

    await logAudit({ adminUserId: req.admin.id, action: "media.upload", resourceType: "media", resourceId: rows[0].id, after: { url, bytes: buffer.length }, ip: req.ip });
    res.status(201).json({ media: rows[0] });
  } catch (err) { next(err); }
});

// ---------- GET /admin/media ----------
mediaRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM media ORDER BY created_at DESC LIMIT 200`);
    res.json({ media: rows });
  } catch (err) { next(err); }
});

// ---------- DELETE /admin/media/:id ----------
mediaRouter.delete("/:id", requirePermission("media.write"), async (req, res, next) => {
  try {
    const existing = await pool.query(`SELECT * FROM media WHERE id = $1`, [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Media not found." });
    await pool.query(`DELETE FROM media WHERE id = $1`, [req.params.id]);
    await deleteFile(existing.rows[0].url);
    await logAudit({ adminUserId: req.admin.id, action: "media.delete", resourceType: "media", resourceId: req.params.id, before: existing.rows[0], ip: req.ip });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
