# Security hardening status — GO iPhone

Branch: `security/hardening-audit`

This branch is isolated from Production. No deployment, production database migration, production data mutation, or credential change was performed.

## Changes in this pass

- Normalize admin login email by trimming whitespace and lowercasing before lookup.
- Make failed-password counters increment atomically in PostgreSQL so concurrent attempts cannot overwrite each other's increments or evade the six-attempt lockout.
- Make refresh-token rotation an atomic claim. Concurrent refresh requests presenting the same refresh token now have only one opportunity to rotate it; replayed/expired tokens are rejected and auth cookies are cleared with their original cookie attributes.
- Restrict manual order payment transitions to `paid` or `refunded`: disabled by default, and only an OWNER can use them when `ALLOW_MANUAL_PAYMENT_STATUS=true` is explicitly set. This avoids routine staff accounts falsely marking an order as paid before a verified gateway integration exists.
- Add an end-to-end regression assertion for simultaneous refresh-token replay to `backend/tests/security.e2e.mjs`.

## Existing protections confirmed by source review

- Argon2id password hashing.
- Opaque random session and refresh tokens; only SHA-256 hashes are stored.
- Server-side session lookup and revocation on every authenticated admin request.
- HTTP-only, Secure-in-production, SameSite=Strict cookies.
- Mandatory 2FA for OWNER and FULL_ACCESS_NO_DASHBOARD roles unless explicitly disabled for local testing.
- Parameterized SQL queries, request-body validation, Helmet, explicit CORS origin allowlist, and API-side role/permission checks.
- Production migrations require an explicit opt-in; admin/catalog/commerce writes have separate environment gates.

## Remaining work before calling the system security-ready

1. TOTP encryption is implemented with AES-256-GCM; a unit test verifies round-trip encryption, legacy plaintext detection, and tamper rejection. Production rollout still requires a securely generated and backed-up `TOTP_ENCRYPTION_KEY`.
2. Replace in-memory IP rate-limit stores with a shared persistent store suitable for serverless/multi-instance deployments. The database-backed per-account failed-login lockout remains an additional control.
3. Run automated E2E tests for authorization boundaries, session expiry/revocation, 2FA challenge replay, lockout concurrency, upload validation, and payment/order state transitions on a disposable database only.
4. Verify backup retention and perform a real restore drill; confirm production database point-in-time recovery and object-storage backup/recovery.
5. Review production environment variables, CORS origins, deployment access, secret rotation, and monitoring/alerting. Do not paste secrets into chat or Git.
6. Reconcile stock reservation/expiry and payment callbacks before enabling online checkout. A browser redirect must never mark an order paid.

## Verification status

The source changes are committed to this branch. GitHub Actions passed the backend syntax checks, TOTP crypto unit test, local write-protection check, dependency audit gates, and storefront/admin production builds. The destructive E2E suite has **not** been run because no disposable test database/server was provisioned. These changes are not production-deployed.


## TOTP secret encryption
- New 2FA secrets are encrypted at rest with AES-256-GCM (`enc:v1:` format); authentication decrypts only in memory.
- Existing plaintext secrets are migrated lazily after a successful 2FA verification, avoiding a forced reset for enrolled admins.
- Before deploying this code, configure `TOTP_ENCRYPTION_KEY` as a base64-encoded 32-byte random key in the backend environment. Keep it outside the database and source control; losing it makes encrypted 2FA secrets unreadable. Generate with `openssl rand -base64 32` in a trusted local environment. Do not paste the key into chat.
- The code intentionally does not change production environment variables or deploy. Verify the key is backed up securely before rollout.
