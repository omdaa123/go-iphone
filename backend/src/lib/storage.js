import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join, basename } from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Persistent providers are preferred in production. Local disk is development-only.
const imageKitConfigured = () => !!(process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT);
const imageKitPartiallyConfigured = () => !!(
  process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_PUBLIC_KEY
);
const cloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const cloudinaryPartiallyConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_SECRET);
const s3Enabled = () => !!process.env.S3_BUCKET;
const publicBase = () => (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/$/, "");
const keyPrefix = () => (process.env.S3_KEY_PREFIX || "uploads").replace(/^\/|\/$/g, "");
const CLOUDINARY_FOLDER = () => process.env.CLOUDINARY_FOLDER || "go-iphone";
const IMAGEKIT_FOLDER = () => (process.env.IMAGEKIT_FOLDER || "go-iphone").replace(/^\/+|\/+$/g, "");

function imageKitAuthHeaders() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) throw new Error("IMAGEKIT_PRIVATE_KEY is required for ImageKit storage.");
  return { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}` };
}

async function uploadToImageKit(buffer, extension, mimeType = "application/octet-stream") {
  const form = new FormData();
  const fileName = `${crypto.randomUUID()}.${extension}`;
  form.append("file", new Blob([buffer], { type: mimeType }), fileName);
  form.append("fileName", fileName);
  form.append("folder", `/${IMAGEKIT_FOLDER()}`);
  form.append("useUniqueFileName", "true");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: imageKitAuthHeaders(),
    body: form,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.url || !result.fileId) {
    throw new Error(result.message || result.help || "ImageKit image upload failed.");
  }

  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "");
  let uploadedUrl;
  try {
    uploadedUrl = new URL(result.url);
    const configuredEndpoint = new URL(endpoint);
    if (uploadedUrl.host !== configuredEndpoint.host) {
      throw new Error("ImageKit returned a URL outside the configured URL endpoint.");
    }
  } catch (error) {
    if (error.message.includes("outside the configured")) throw error;
    throw new Error("IMAGEKIT_URL_ENDPOINT is invalid. Check the URL endpoint in your ImageKit dashboard.");
  }
  return result.url;
}

async function deleteFromImageKit(url) {
  // ImageKit's delete API requires fileId, while the existing media table stores
  // public URLs. Resolve the exact URL within our dedicated folder before deleting.
  const endpoint = new URL(url);
  const configuredEndpoint = new URL(process.env.IMAGEKIT_URL_ENDPOINT);
  if (endpoint.host !== configuredEndpoint.host) return;

  const headers = imageKitAuthHeaders();
  const folderPath = `/${IMAGEKIT_FOLDER()}`;
  const pageSize = 1000;
  for (let skip = 0; skip < 10000; skip += pageSize) {
    const params = new URLSearchParams({ path: folderPath, limit: String(pageSize), skip: String(skip), type: "file" });
    const response = await fetch(`https://api.imagekit.io/v1/files?${params}`, { headers });
    const files = await response.json().catch(() => []);
    if (!response.ok || !Array.isArray(files)) {
      throw new Error("Could not find the ImageKit file to delete.");
    }
    const match = files.find((file) => file.url === url);
    if (match?.fileId) {
      const deleted = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(match.fileId)}`, {
        method: "DELETE",
        headers,
      });
      if (!deleted.ok && deleted.status !== 204) {
        throw new Error("ImageKit image deletion failed.");
      }
      return;
    }
    if (files.length < pageSize) return;
  }
}

function cloudinarySignature(params) {
  const serialized = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  return crypto.createHash("sha1").update(serialized + process.env.CLOUDINARY_API_SECRET).digest("hex");
}

async function uploadToCloudinary(buffer, extension, mimeType = "image/jpeg") {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = crypto.randomUUID();
  const params = { folder: CLOUDINARY_FOLDER(), public_id: publicId, timestamp };
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType }), `upload.${extension}`);
  form.append("api_key", process.env.CLOUDINARY_API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", CLOUDINARY_FOLDER());
  form.append("public_id", publicId);
  form.append("signature", cloudinarySignature(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME)}/${mimeType.startsWith("video/") ? "video" : "image"}/upload`, {
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

const CONTENT_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime" };
const LOCAL_DIR = () => process.env.LOCAL_UPLOAD_DIR || "./uploads";
const LOCAL_URL = () => (process.env.LOCAL_UPLOAD_PUBLIC_URL || "http://localhost:4000/uploads").replace(/\/$/, "");

export async function saveFile(buffer, extension, mimeType = CONTENT_TYPES[extension] || "application/octet-stream") {
  // Cloudinary is the primary production provider. ImageKit and S3 remain
  // supported fallbacks for deployments that have not configured Cloudinary.
  if (cloudinaryConfigured()) return uploadToCloudinary(buffer, extension, mimeType);
  if (cloudinaryPartiallyConfigured()) {
    throw new Error("Cloudinary storage is partially configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }
  if (imageKitConfigured()) return uploadToImageKit(buffer, extension, mimeType);
  if (imageKitPartiallyConfigured()) {
    throw new Error("ImageKit storage is partially configured. Set IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.");
  }

  if (s3Enabled()) {
    if (!publicBase()) throw new Error("S3_PUBLIC_BASE_URL must be set when S3_BUCKET is set.");
    if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
      throw new Error("S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required when S3_BUCKET is set.");
    }
    const name = `${crypto.randomUUID()}.${extension}`;
    const key = `${keyPrefix()}/${name}`;
    await s3().send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET, Key: key, Body: buffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return `${publicBase()}/${key}`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Persistent image storage is required in production. Configure ImageKit, Cloudinary, or S3-compatible storage before uploading media.");
  }

  const name = `${crypto.randomUUID()}.${extension}`;
  await mkdir(LOCAL_DIR(), { recursive: true });
  await writeFile(join(LOCAL_DIR(), name), buffer);
  return `${LOCAL_URL()}/${name}`;
}

/** Best-effort removal of the stored file. */
export async function deleteFile(url) {
  try {
    if (cloudinaryConfigured() && url.includes("res.cloudinary.com/")) {
      await deleteFromCloudinary(url);
    } else if (imageKitConfigured() && url.startsWith(process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "") + "/")) {
      await deleteFromImageKit(url);
    } else if (s3Enabled() && url.startsWith(`${publicBase()}/`)) {
      await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: url.slice(publicBase().length + 1) }));
    } else if (process.env.NODE_ENV !== "production" && url.startsWith(`${LOCAL_URL()}/`)) {
      await unlink(join(LOCAL_DIR(), basename(url)));
    }
  } catch (err) {
    console.warn("Could not remove stored file:", err.message);
  }
}
