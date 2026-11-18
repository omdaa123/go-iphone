import assert from "node:assert/strict";
import { encryptTotpSecret, decryptTotpSecret } from "../src/lib/totp.js";

process.env.TOTP_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
const original = "JBSWY3DPEHPK3PXP";
const encrypted = encryptTotpSecret(original);
assert.match(encrypted, /^enc:v1:/);
assert.notEqual(encrypted, original);
assert.deepEqual(decryptTotpSecret(encrypted), { secret: original, needsEncryption: false });
assert.deepEqual(decryptTotpSecret(original), { secret: original, needsEncryption: true });

const tampered = encrypted.slice(0, -1) + (encrypted.endsWith("A") ? "B" : "A");
assert.throws(() => decryptTotpSecret(tampered), /Unsupported state|unable to authenticate|Invalid encrypted/);

console.log("TOTP encryption tests passed.");
