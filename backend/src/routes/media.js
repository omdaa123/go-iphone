import { Router, raw as expressRaw } from "express";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validateBody } from "../middleware/validate.js";
import { logAudit } from "../lib/audit.js";
import { saveFile, deleteFile } from "../lib/storage.js";

export const mediaRouter = Router();
mediaRouter.use(requireAuth, requirePermission("media.write"));

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const expressRawVideo = expressRaw({ type: ["video/mp4", "video/webm", "video/quicktime", "application/octet-stream"], limit: "50mb" });

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

// ---------- POST /admin/media/video ----------
// Raw video upload avoids base64 expansion and the JSON body size limit.
mediaRouter.post("/video", expressRawVideo, async (req, res, next) => {
  try {
    const buffer = req.body;
    if (!Buffer.isBuffer(buffer) || !buffer.length) return res.status(400).json({ error: "Choose a video file to upload." });
    if (buffer.length > MAX_VIDEO_BYTES) return res.status(413).json({ error: "Video too large (max 50MB)." });
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || !ALLOWED_VIDEO_TYPES.has(detected.mime)) return res.status(415).json({ error: "Unsupported video. Use MP4, WebM, or MOV." });
    const url = await saveFile(buffer, detected.ext, detected.mime);
    const encodedName = String(req.headers["x-file-name"] || `video.${detected.ext}`);
    let fileName = encodedName;
    try { fileName = decodeURIComponent(encodedName); } catch { /* Keep the safe encoded fallback. */ }
    fileName = fileName.slice(0, 200);
    const { rows } = await pool.query(
      `INSERT INTO media (url, file_name, usage_tag, bytes, uploaded_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [url, fileName, "video", buffer.length, req.admin.id]
    );
    await logAudit({ adminUserId: req.admin.id, action: "media.upload", resourceType: "media", resourceId: rows[0].id, after: { url, bytes: buffer.length, type: detected.mime }, ip: req.ip });
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
