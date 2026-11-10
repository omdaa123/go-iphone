import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join, basename } from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Production storage: Cloudinary (preferred) or any S3-compatible provider.
// Local disk is only for development; serverless hosts do not provide persistent disk.

const cloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const cloudinaryPartiallyConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_SECRET);
const s3Enabled = () => !!process.env.S3_BUCKET;
const publicBase = () => (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/$/, "");
const keyPrefix = () => (process.env.S3_KEY_PREFIX || "uploads").replace(/^\/|\/$/g, "");

const CLOUDINARY_FOLDER = () => process.env.CLOUDINARY_FOLDER || "go-iphone";

function cloudinarySignature(params) {
  const serialized = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  return crypto.createHash("sha1").update(serialized + process.env.CLOUDINARY_API_SECRET).digest("hex");
}

async function uploadToCloudinary(buffer, extension) {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = crypto.randomUUID();
  const params = { folder: CLOUDINARY_FOLDER(), public_id: publicId, timestamp };
  const form = new FormData();
  form.append("file", new Blob([buffer]), `image.${extension}`);
  form.append("api_key", process.env.CLOUDINARY_API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", CLOUDINARY_FOLDER());
  form.append("public_id", publicId);
  form.append("signature", cloudinarySignature(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME)}/image/upload`, {
    method: "POST",
    body: form,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || "Cloudinary image upload failed.");
  return result.secure_url;
}

function cloudinaryPublicIdFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const marker = "/upload/";
    const index = pathname.indexOf(marker);
    if (index < 0) return null;
    const parts = pathname.slice(index + marker.length).split("/").filter(Boolean);
    while (parts.length && /^v\d+$/.test(parts[0])) parts.shift();
    if (!parts.length) return null;
    parts[parts.length - 1] = parts[parts.length - 1].replace(/\.[^.]+$/, "");
    return parts.join("/");
  } catch {
    return null;
  }
}

async function deleteFromCloudinary(url) {
  const publicId = cloudinaryPublicIdFromUrl(url);
  if (!publicId) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const form = new URLSearchParams({
    api_key: process.env.CLOUDINARY_API_KEY,
    timestamp: String(timestamp),
    public_id: publicId,
    signature: cloudinarySignature(params),
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME)}/image/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const result = await response.json();
  if (!response.ok || (result.result !== "ok" && result.result !== "not found")) {
    throw new Error(result?.error?.message || "Cloudinary image deletion failed.");
  }
}

let client;
function s3() {
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || "", secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "" },
    });
  }
  return client;
}

const CONTENT_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
const LOCAL_DIR = () => process.env.LOCAL_UPLOAD_DIR || "./uploads";
const LOCAL_URL = () => (process.env.LOCAL_UPLOAD_PUBLIC_URL || "http://localhost:4000/uploads").replace(/\/$/, "");

export async function saveFile(buffer, extension) {
  if (cloudinaryConfigured()) return uploadToCloudinary(buffer, extension);
  if (cloudinaryPartiallyConfigured()) {
    throw new Error("Cloudinary storage is partially configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  const name = `${crypto.randomUUID()}.${extension}`;
  if (s3Enabled()) {
    if (!publicBase()) throw new Error("S3_PUBLIC_BASE_URL must be set when S3_BUCKET is set.");
    const key = `${keyPrefix()}/${name}`;
    await s3().send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET, Key: key, Body: buffer,
      ContentType: CONTENT_TYPES[extension] || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return `${publicBase()}/${key}`;
  }
  await mkdir(LOCAL_DIR(), { recursive: true });
  await writeFile(join(LOCAL_DIR(), name), buffer);
  return `${LOCAL_URL()}/${name}`;
}

/** Best-effort removal of the stored file. */
export async function deleteFile(url) {
  try {
    if (cloudinaryConfigured() && url.includes("res.cloudinary.com/")) {
      await deleteFromCloudinary(url);
    } else if (s3Enabled() && url.startsWith(`${publicBase()}/`)) {
      await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: url.slice(publicBase().length + 1) }));
    } else if (url.startsWith(`${LOCAL_URL()}/`)) {
      await unlink(join(LOCAL_DIR(), basename(url)));
    }
  } catch (err) {
    console.warn("Could not remove stored file:", err.message);
  }
}
