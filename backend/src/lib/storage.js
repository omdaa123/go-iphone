import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join, basename } from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Where uploaded images live.
//
//  PRODUCTION: set the S3_* variables and images go to object storage (Cloudflare R2, Supabase
//  Storage, AWS S3, MinIO… anything S3-compatible). The database stores only the image URL.
//  LOCAL DEV:  leave S3_BUCKET unset and files are written to ./uploads (served at /uploads).
//              Don't use this in production — most hosts erase local files on every redeploy.

const s3Enabled = () => !!process.env.S3_BUCKET;
const publicBase = () => (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/$/, "");
const keyPrefix = () => (process.env.S3_KEY_PREFIX || "uploads").replace(/^\/|\/$/g, "");

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
  const name = `${crypto.randomUUID()}.${extension}`;
  if (s3Enabled()) {
    if (!publicBase()) throw new Error("S3_PUBLIC_BASE_URL must be set when S3_BUCKET is set.");
    const key = `${keyPrefix()}/${name}`;
    await s3().send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET, Key: key, Body: buffer,
      ContentType: CONTENT_TYPES[extension] || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable", // file names are unique, so browsers/CDNs can cache forever
    }));
    return `${publicBase()}/${key}`;
  }
  await mkdir(LOCAL_DIR(), { recursive: true });
  await writeFile(join(LOCAL_DIR(), name), buffer);
  return `${LOCAL_URL()}/${name}`;
}

/** Best-effort removal of the stored file. A failure here never blocks the admin's delete. */
export async function deleteFile(url) {
  try {
    if (s3Enabled() && url.startsWith(`${publicBase()}/`)) {
      await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: url.slice(publicBase().length + 1) }));
    } else if (url.startsWith(`${LOCAL_URL()}/`)) {
      await unlink(join(LOCAL_DIR(), basename(url)));
    }
  } catch (err) {
    console.warn("Could not remove stored file:", err.message);
  }
}
