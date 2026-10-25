/**
 * One-time seed script — creates the admin account from .env
 * Run with: npx tsx scripts/seed-admin.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import pg from "pg";
import crypto from "crypto";
import { promisify } from "util";

const { Pool } = pg;

async function hashPassword(password: string): Promise<string> {
  // Inline Argon2id via @node-rs/argon2 — same settings as the app
  const { hash } = await import("@node-rs/argon2");
  return hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as never);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() ?? "ArcCore Admin";

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const existing = await (prisma as unknown as { user: { findUnique: (args: unknown) => Promise<{ role: string } | null> } }).user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "ADMIN") {
      await (prisma as unknown as { user: { update: (args: unknown) => Promise<unknown> } }).user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`✓ Upgraded ${email} to ADMIN`);
    } else {
      console.log(`✓ Admin account already exists: ${email}`);
    }
  } else {
    const passwordHash = await hashPassword(password);
    await (prisma as unknown as { user: { create: (args: unknown) => Promise<unknown> } }).user.create({
      data: { name, email, passwordHash, role: "ADMIN", mustChangePassword: false },
    });
    console.log(`✓ Created admin account: ${email}`);
  }

  await (prisma as unknown as { $disconnect: () => Promise<void> }).$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
