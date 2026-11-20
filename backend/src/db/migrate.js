import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool } from "../db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  // Production schema changes must be an explicit, one-off operator action.
  // Render build/start never invokes this script.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PRODUCTION_MIGRATIONS !== "true"
  ) {
    throw new Error(
      "Production migration blocked. Back up and verify the target database, then run this command manually with ALLOW_PRODUCTION_MIGRATIONS=true."
    );
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT current_database() AS database, inet_server_addr()::text AS server_address"
    );
    console.log(
      `Migration target: database=${rows[0]?.database || "unknown"}, server=${rows[0]?.server_address || "managed/pooler"}`
    );

    const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
    console.log("Applying schema.sql in a single transaction...");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("✔ Schema applied successfully.");
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original migration error.
    }
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("✘ Migration failed:", err.message);
  process.exit(1);
});
