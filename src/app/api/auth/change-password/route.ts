// POST /api/auth/change-password
// Allows an authenticated user to change their own password.
// Also clears mustChangePassword and any temp password fields.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password too long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  // Fetch full user record (with password hash)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true, tempPasswordHash: true, tempPasswordExpiresAt: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Verify current password — also accept a valid non-expired temp password
  const mainMatch = await verifyPassword(dbUser.passwordHash, currentPassword);
  let tempMatch = false;
  if (!mainMatch && dbUser.tempPasswordHash) {
    const notExpired =
      !dbUser.tempPasswordExpiresAt ||
      dbUser.tempPasswordExpiresAt > new Date();
    if (notExpired) {
      tempMatch = await verifyPassword(dbUser.tempPasswordHash, currentPassword);
    }
  }

  if (!mainMatch && !tempMatch) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  // Prevent reusing the exact same password
  const sameAsMain = await verifyPassword(dbUser.passwordHash, newPassword);
  if (sameAsMain) {
    return NextResponse.json(
      { error: "New password must be different from your current password." },
      { status: 400 }
    );
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
      tempPasswordHash: null,
      tempPasswordExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
