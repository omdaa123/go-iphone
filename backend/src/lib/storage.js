import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join, basename } from "node:path";
import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
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

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const CONTENT_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
const LOCAL_DIR = () => process.env.LOCAL_UPLOAD_DIR || "./uploads";
const LOCAL_URL = () => (process.env.LOCAL_UPLOAD_PUBLIC_URL || "http://localhost:4000/uploads").replace(/\/$/, "");

function uploadToCloudinary(buffer, extension) {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      resource_type: "image",
      folder: process.env.CLOUDINARY_FOLDER || "go-iphone",
      public_id: crypto.randomUUID(),
      format: extension,
      overwrite: false,
      invalidate: true,
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

function cloudinaryPublicIdFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const marker = "/upload/";
    const index = pathname.indexOf(marker);
    if (index < 0) return null;
    const parts = pathname.slice(index + marker.length).split("/").filter(Boolean);
    while (parts.length && (/^v\d+$/.test(parts[0]) || parts[0].includes(","))) parts.shift();
    if (!parts.length) return null;
    parts[parts.length - 1] = parts[parts.length - 1].replace(/\.[^.]+$/, "");
    return parts.join("/");
  } catch {
    return null;
  }
}

export async function saveFile(buffer, extension) {
  if (cloudinaryConfigured()) {
    const result = await uploadToCloudinary(buffer, extension);
    return result.secure_url;
  }
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
      configureCloudinary();
      const publicId = cloudinaryPublicIdFromUrl(url);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    } else if (s3Enabled() && url.startsWith(`${publicBase()}/`)) {
      await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: url.slice(publicBase().length + 1) }));
    } else if (url.startsWith(`${LOCAL_URL()}/`)) {
      await unlink(join(LOCAL_DIR(), basename(url)));
    }
  } catch (err) {
    console.warn("Could not remove stored file:", err.message);
  }
}
