import pg from "pg";
import "dotenv/config";

// A single shared connection pool. Every query in this codebase goes
// through pool.query() with parameterized ($1, $2, ...) placeholders —
// never string-concatenated SQL — which is what actually prevents SQL
// injection (not escaping, not validation alone).
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  max: 10,
});

pool.on("error", (err) => {
  // A background/idle client error should never crash the whole process.
  console.error("Unexpected database pool error:", err.message);
});

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
