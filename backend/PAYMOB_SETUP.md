# Paymob onboarding — GO iPhone

Status: preparation only. No merchant credentials are present and no payment route is enabled in Production.

## Intended integration

- Provider: Paymob Accept, Egypt.
- Checkout: Unified Checkout (Paymob-hosted redirect).
- API: Intention API only: POST https://accept.paymob.com/v1/intention/
- Currency: EGP; amounts are integer piastres (EGP × 100).
- The backend creates each intention using the merchant Secret Key. Only the Public Key and one-time client_secret may reach the browser.
- The customer completes card / enabled payment methods on Paymob-hosted checkout. GO iPhone never collects or stores card number, expiry, or CVV.
- Payment is considered paid only after a valid Paymob server-to-server webhook. Browser redirects are display-only and must never mark an order paid.

## Merchant items needed at handoff

Obtain these directly from the buyer's Paymob merchant dashboard; never ask them to paste secrets into chat or commit them to Git:

- Secret Key (server-side)
- Public Key
- HMAC Secret
- Card Integration ID
- Additional Integration IDs only for payment methods approved and enabled on the buyer's account
- Confirmation that the merchant account is approved for live transactions
- Confirmation of per-transaction limits and installment / BNPL eligibility for high-value phones (including the expected EGP 150,000 basket)

Set credentials as encrypted Production environment variables on the buyer's backend deployment:
- PAYMOB_BASE_URL=https://accept.paymob.com
- PAYMOB_SECRET_KEY
- PAYMOB_PUBLIC_KEY
- PAYMOB_HMAC_SECRET
- PAYMOB_INTEGRATION_IDS (comma-separated numeric IDs, server-side)
- PAYMOB_MODE=test initially; switch to live only after approved sandbox/UAT sign-off

Never enable live payments by setting a flag alone. Require all credentials, a valid HTTPS webhook URL, and an explicit payment enable flag.

## Required implementation and acceptance checks before live activation

1. Refactor order creation so stock is held while payment is pending, not permanently deducted as if payment succeeded. Add an expiry/release mechanism for abandoned attempts; release variant quantities and individually tracked units exactly once.
2. Create a unique payment attempt per order/attempt. Store Paymob intention/transaction references and idempotency/deduplication keys; never trust client-supplied amount, currency, product price, or payment state.
3. Build the intention on the backend from the order rows and database-calculated total. Require complete billing_data fields, valid customer phone, EGP currency, and approved integration IDs.
4. Validate transaction POST callbacks using Paymob's documented HMAC-SHA512 field order with timing-safe comparison. Validate amount, currency, merchant integration ID, order reference, and success/pending flags against the stored attempt.
5. Deduplicate callbacks by Paymob transaction ID and update payment/order state atomically in one DB transaction. A replay or duplicate callback must not double-process stock or fulfillment.
6. Keep redirect handling informational. The UI must fetch order payment state from GO iPhone backend after redirect.
7. Add reconciliation for delayed/missed callbacks and a controlled refund workflow. Do not expose a manual admin action that can falsely mark a payment paid.
8. Test success, decline/failure, cancellation, expired checkout, duplicate callback, invalid HMAC, amount mismatch, currency mismatch, integration mismatch, two buyers competing for one used unit, and callback arriving after expiry.
9. Test only with Paymob sandbox credentials and a disposable test database. Do not use Production DB or real cards for tests.
10. Confirm the buyer's Paymob account supports the intended EGP 150,000 transaction and any requested installments/BNPL. Availability and limits are merchant/account-specific.

## Current codebase constraints discovered during preparation

- Public order creation is currently guarded by ENABLE_COMMERCE_WRITES; Production does not have that flag enabled.
- Current public order creation deducts variant stock and reserves individual used units immediately, while creating a pending-payment order. It does not implement Paymob.
- Admin payment-status endpoint currently permits a staff user with orders.write to set payment status manually. This must be restricted/removed or made audit-safe before live gateway launch.
- Existing orders schema has payment_status and payment_method, but no Paymob intention/transaction table or callback idempotency store.
- Therefore online payments are NOT ready to activate yet. Keep Production commerce writes disabled until the full implementation and sandbox tests pass.

## Official references

- https://developers.paymob.com/paymob-docs/developers/intention-apis/create-intention
- https://developers.paymob.com/paymob-docs/integration-paths/apis
- https://wizard.paymob.com/
