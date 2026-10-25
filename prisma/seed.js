/**
 * Prisma seed — creates the admin account from environment variables.
 * Run with: node prisma/seed.js
 */
import { readFileSync } from "fs";
import { hash } from "@node-rs/argon2";
import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;

// Manually load .env (no dotenv dependency needed)
function loadEnv() {
  try {
    const lines = readFileSync(".env", "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env not found — rely on actual env vars
  }
}

async function main() {
  loadEnv();

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set in .env");

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() ?? "ArcCore Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });

  try {
    const { rows } = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [email]
    );

    if (rows.length > 0) {
      if (rows[0].role !== "ADMIN") {
        await pool.query('UPDATE users SET role = $1 WHERE email = $2', ["ADMIN", email]);
        console.log(`✓ Upgraded ${email} to ADMIN`);
      } else {
        console.log(`✓ Admin account already exists: ${email}`);
      }
    } else {
      const passwordHash = await hash(password, {
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      // Use a random cuid-compatible id
      const id = "c" + crypto.randomBytes(11).toString("hex");

      await pool.query(
        `INSERT INTO users (id, name, email, "passwordHash", role, "mustChangePassword", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'ADMIN', false, NOW(), NOW())`,
        [id, name, email, passwordHash]
      );
      console.log(`✓ Admin created: ${email}`);
      console.log(`  Password:      ${password}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => { console.error("Seed failed:", e.message); process.exit(1); });
