// Prisma 7 config — datasource URL from environment variable
// dotenv/config is only imported when the variable isn't already set (e.g. local dev)

import { defineConfig } from "prisma/config";

// Load .env only in local dev (Vercel sets env vars natively)
if (!process.env.DATABASE_URL) {
  const { config } = await import("dotenv");
  config();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // DATABASE_URL is optional at generate time — only needed for migrate/push
  ...(process.env.DATABASE_URL
    ? { datasource: { url: process.env.DATABASE_URL } }
    : {}),
});
