import { authenticator } from "otplib";
import QRCode from "qrcode";

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
