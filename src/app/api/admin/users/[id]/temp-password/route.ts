// POST /api/admin/users/[id]/temp-password
// Admin sets a temporary password for a member.
// The member will be forced to change it on next login.
// Body: { tempPassword: string }  — or omit to auto-generate one.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminForApi } from "@/lib/auth/authorization";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";
import crypto from "crypto";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  tempPassword: z
    .string()
    .min(8, "Temp password must be at least 8 characters.")
    .max(64)
    .optional(),
});

// Temp passwords expire in 24 hours
const EXPIRY_HOURS = 24;

export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdminForApi();
  if (auth.error) return auth.error;

  const { id } = await params;

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (target.role === "ADMIN") {
    return NextResponse.json(
      { error: "Cannot set a temporary password for an admin account." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  // Use provided password or generate a random one
  const plainTemp =
    parsed.data.tempPassword ??
    // Generate: 2 uppercase + 4 digits + 2 lowercase = readable but strong enough
    crypto.randomBytes(4).toString("hex").toUpperCase() +
      Math.floor(1000 + Math.random() * 9000).toString();

  const tempPasswordHash = await hashPassword(plainTemp);
  const tempPasswordExpiresAt = new Date(
    Date.now() + EXPIRY_HOURS * 60 * 60 * 1000
  );

  await prisma.user.update({
    where: { id },
    data: {
      tempPasswordHash,
      tempPasswordExpiresAt,
      mustChangePassword: true,
    },
  });

  // Return the plain temp password to the admin (shown once — never stored plain)
  return NextResponse.json({
    ok: true,
    tempPassword: plainTemp,
    expiresAt: tempPasswordExpiresAt.toISOString(),
    userName: target.name,
    userEmail: target.email,
  });
}
