# Go iPhone — Storefront (customer website)

The public website for goiphone.com. It contains **no product data of its own** —
everything (products, prices, used devices, hero banners, homepage text) is loaded
from the Go iPhone API (`/api/catalog`), which reads the same database the Admin
app edits. Change something in Admin → it shows here within ~30 seconds (or instantly
when the visitor refocuses the tab).

Cart and compare list are kept in the shopper's own browser (localStorage).
Orders and reservations are sent to the API; **prices are always decided by the server.**

## Run locally
```bash
cp .env.example .env     # set VITE_API_URL (e.g. http://localhost:4000)
npm install
npm run dev              # http://localhost:5173
```
The API must be running and its `ALLOWED_ORIGINS` must include `http://localhost:5173`.

## Deploy (Vercel / Netlify)
Build command `npm run build` · Output directory `dist` · Environment variable
`VITE_API_URL=https://api.goiphone.com` · Domains: goiphone.com and www.goiphone.com.
Add `https://goiphone.com` and `https://www.goiphone.com` to the API's `ALLOWED_ORIGINS`.

## Tests
`tests/storefront.e2e.test.jsx` renders the real UI against a live API + Postgres and
clicks through: browsing, buying a product, reserving a pre-order, buying a used phone,
and the "someone else just bought it" collision. See that file's header for how to run.
