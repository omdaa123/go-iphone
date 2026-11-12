import argon2 from "argon2";
import "dotenv/config";
import { pool } from "../db.js";

// Seeds the minimum needed to log in and start using the Admin app:
// the storefront's 7 categories, the 5 default collections, and your
// first OWNER account. Credentials come from environment variables —
// never hardcode a real password into a file that might get committed.

const CATEGORIES = [
  { key: "iphone", label: "iPhone" },
  { key: "ipad", label: "iPad" },
  { key: "mac", label: "Mac" },
  { key: "watch", label: "Apple Watch" },
  { key: "airpods", label: "AirPods" },
  { key: "apple-accessory", label: "Apple Accessories" },
  { key: "other-accessory", label: "Other Accessories" },
  { key: "other-devices", label: "Other Devices" },
];

const COLLECTIONS = [
  { id: "featured", name: "Featured", is_system: true, sort_order: 0 },
  { id: "best-sellers", name: "Best Sellers", is_system: true, sort_order: 1 },
  { id: "new-arrivals", name: "New Arrivals", is_system: true, sort_order: 2 },
  { id: "deal-of-the-week", name: "Premium Deal of the Week", is_system: false, sort_order: 3 },
  { id: "certified-refurbished", name: "Certified Refurbished", is_system: true, sort_order: 4 },
];

async function seed() {
  for (const [i, c] of CATEGORIES.entries()) {
    await pool.query(
      `INSERT INTO categories (key, label, sort_order) VALUES ($1,$2,$3)
       ON CONFLICT (key) DO NOTHING`,
      [c.key, c.label, i]
    );
  }
  for (const c of COLLECTIONS) {
    await pool.query(
      `INSERT INTO collections (id, name, is_system, sort_order) VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO NOTHING`,
      [c.id, c.name, c.is_system, c.sort_order]
    );
  }
  console.log("✔ Categories and collections seeded.");

  const email = process.env.SEED_OWNER_EMAIL;
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!email || !password) {
    console.log(
      "ℹ No SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD set — skipping owner account creation.\n" +
      "  Set them in .env and re-run `npm run seed` to create your first login."
    );
  } else {
    if (password.length < 12) {
      throw new Error("SEED_OWNER_PASSWORD must be at least 12 characters.");
    }
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    await pool.query(
      `INSERT INTO admin_users (email, password_hash, role)
       VALUES ($1, $2, 'OWNER')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email, hash]
    );
    console.log(`✔ OWNER account ready for ${email}.`);
    console.log("  Log in once, then enable 2FA immediately from the Admin app.");
  }

  await pool.end();
}

seed().catch((err) => {
  console.error("✘ Seed failed:", err.message);
  process.exit(1);
});
