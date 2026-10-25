/**
 * seedAdmin — ensures the default admin account exists on startup.
 *
 * Reads ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME from environment.
 * If a user with that email already exists, it upgrades their role to ADMIN
 * (but never changes their password, so they keep whatever they set).
 * If no user exists, creates one with the env password.
 *
 * Call this from instrumentation.ts so it runs once per server cold start.
 */

import "server-only";
import { prisma } from "./prisma";
import { hashPassword } from "./auth/password";

export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() ?? "ArcCore Admin";

  if (!email || !password) {
    console.warn(
      "[seedAdmin] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed."
    );
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Ensure they are admin
      if (existing.role !== "ADMIN") {
        await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" },
        });
        console.log(`[seedAdmin] Upgraded ${email} to ADMIN.`);
      }
      return;
    }

    // Create fresh admin account
    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        mustChangePassword: false,
      },
    });
    console.log(`[seedAdmin] Created admin account: ${email}`);
  } catch (err) {
    // Non-fatal — log and continue (DB might not be migrated yet in CI)
    console.error("[seedAdmin] Failed:", err);
  }
}
