import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool, withTransaction } from "../db.js";

// Imports the original Go iPhone catalog (22 products, used units, hero slides)
// from catalog-seed.json into the database so the new storefront opens with
// real content instead of empty. Safe to re-run: existing slugs are skipped.
// Prices in the JSON are whole EGP; the database stores piastres (EGP x 100).

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, "catalog-seed.json"), "utf8"));

function typeFor(p) {
  const n = p.name.toLowerCase();
  if (p.category === "mac") {
    if (n.includes("macbook air")) return "macbook-air";
    if (n.includes("macbook pro")) return "macbook-pro";
    if (n.includes("mac mini")) return "mac-mini";
    if (n.includes("imac")) return "imac";
    if (n.includes("studio")) return "mac-studio";
    return "mac-pro";
  }
  if (["iphone", "ipad", "watch", "airpods"].includes(p.category)) return p.category;
  return "other";
}

async function run() {
  const idBySlug = {};
  let created = 0, skipped = 0;

  await withTransaction(async (client) => {
    for (const p of data.products) {
      const existing = await client.query(`SELECT id FROM products WHERE slug = $1`, [p.id]);
      if (existing.rows[0]) { idBySlug[p.id] = existing.rows[0].id; skipped++; continue; }

      const reservation = p.status === "preorder";
      const meta = {};
      if (p.screenSize) meta.screenSize = p.screenSize;
      if (p.rec) meta.rec = p.rec;
      if (p.launchDate) meta.launchDate = p.launchDate;

      const { rows } = await client.query(
        `INSERT INTO products (slug, meta, category_key, product_type, name, tagline, specs, storage_options, colors,
            sales_mode, availability, reservation_cfg, has_units, visibility)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'published') RETURNING id`,
        [p.id, meta, p.category, typeFor(p), p.name, p.tagline ?? null, p.specs || {}, p.storageOptions || [], p.colors || [],
         reservation ? "reservation" : "for_sale", reservation ? "coming_soon" : "in_stock",
         reservation ? { ctaText: "Reserve now", message: "", expectedDate: p.launchDate || "", depositRequired: false, isRequestOnly: true } : null,
         !!p.hasUnits]
      );
      const id = rows[0].id;
      idBySlug[p.id] = id;

      for (const [storage, price] of Object.entries(p.variantPricing || {})) {
        await client.query(
          `INSERT INTO product_variants (product_id, storage, color, price_cents) VALUES ($1,$2,NULL,$3)`,
          [id, storage === "Standard" ? null : storage, Math.round(price * 100)]
        );
      }
      const cols = [];
      if (p.featured) cols.push("featured");
      if (p.bestSeller) cols.push("best-sellers");
      if (p.newArrival) cols.push("new-arrivals");
      for (const c of cols) {
        await client.query(`INSERT INTO product_collections (product_id, collection_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [id, c]);
      }
      created++;
    }

    for (const u of data.units) {
      const pid = idBySlug[u.productId];
      if (!pid) continue;
      const dup = await client.query(`SELECT 1 FROM inventory_units WHERE sku = $1`, [u.sku]);
      if (dup.rows[0]) continue;
      await client.query(
        `INSERT INTO inventory_units (product_id, storage, color, battery_pct, condition, sku, price_cents, warranty, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [pid, u.storage, u.color, u.battery, u.condition, u.sku, Math.round(u.price * 100), u.warranty, u.availability === "available" ? "available" : u.availability]
      );
    }

    const heroCount = await client.query(`SELECT count(*)::int AS n FROM hero_slides`);
    if (heroCount.rows[0].n === 0) {
      for (const [i, s] of data.hero.entries()) {
        const isProduct = s.target?.view === "product";
        await client.query(
          `INSERT INTO hero_slides (eyebrow, title, subtitle, cta_text, link_category_key, link_product_id, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [s.eyebrow, s.title, s.sub, s.cta, isProduct ? null : s.target?.params?.category || "iphone",
           isProduct ? idBySlug[s.target.params.id] || null : null, i]
        );
      }
    }
  });

  console.log(`✔ Catalog imported: ${created} new products, ${skipped} already existed, ${data.units.length} units checked, hero slides ensured.`);
  await pool.end();
}

run().catch((e) => { console.error("✘ Catalog import failed:", e.message); process.exit(1); });
