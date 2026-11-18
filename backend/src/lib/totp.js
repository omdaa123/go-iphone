import { authenticator } from "otplib";
import QRCode from "qrcode";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ENCRYPTED_PREFIX = "enc:v1:";

function getTotpEncryptionKey() {
  const encoded = process.env.TOTP_ENCRYPTION_KEY;
  if (!encoded) throw new Error("TOTP_ENCRYPTION_KEY is required to store or read encrypted 2FA secrets.");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("TOTP_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}

export function encryptTotpSecret(secret) {
  const key = getTotpEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ENCRYPTED_PREFIX + [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(":");
}

export function decryptTotpSecret(stored) {
  if (typeof stored !== "string" || !stored) throw new Error("Missing 2FA secret.");
  if (!stored.startsWith(ENCRYPTED_PREFIX)) return { secret: stored, needsEncryption: true };
  const key = getTotpEncryptionKey();
  const parts = stored.slice(ENCRYPTED_PREFIX.length).split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted 2FA secret format.");
  const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, "base64url"));
  if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) throw new Error("Invalid encrypted 2FA secret payload.");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const secret = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  return { secret, needsEncryption: false };
}


// RFC 6238 TOTP — the same algorithm Google Authenticator / Authy use.
// authenticator.options.window gives ±1 time-step tolerance for clock drift.
authenticator.options = { window: 1 };

export function generateTotpSecret() {
  return authenticator.generateSecret();
}

export async function totpQrDataUrl(email, secret, issuer = "Go iPhone Admin") {
  const otpauth = authenticator.keyuri(email, issuer, secret);
  return QRCode.toDataURL(otpauth);
}

export function verifyTotpCode(secret, code) {
  try {
    return authenticator.check(code, secret);
  } catch {
    return false;
  }
}
