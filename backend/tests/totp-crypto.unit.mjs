import assert from "node:assert/strict";
import { encryptTotpSecret, decryptTotpSecret } from "../src/lib/totp.js";

process.env.TOTP_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
const original = "JBSWY3DPEHPK3PXP";
const encrypted = encryptTotpSecret(original);
assert.match(encrypted, /^enc:v1:/);
assert.notEqual(encrypted, original);
assert.deepEqual(decryptTotpSecret(encrypted), { secret: original, needsEncryption: false });
assert.deepEqual(decryptTotpSecret(original), { secret: original, needsEncryption: true });

const parts = encrypted.split(":");
parts[3] = (parts[3][0] === "A" ? "B" : "A") + parts[3].slice(1);
assert.throws(() => decryptTotpSecret(parts.join(":")));

console.log("TOTP encryption tests passed.");
