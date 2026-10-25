/**
 * Admin-only user management API.
 *
 * GET  /api/admin/users  — list all users
 * POST /api/admin/users  — create a new member account (admin only)
 *
 * Members are never self-registered. The admin creates every account
 * and shares a temporary password that the member must change on first login.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// GET — list all users
// ---------------------------------------------------------------------------

export async function GET() {
  const auth = await requireAdminForApi();
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
      _count: {
        select: { attempts: true, topics: true, quizzesCreated: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// ---------------------------------------------------------------------------
// POST — create a new member account
// ---------------------------------------------------------------------------

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Please enter a valid email address.")),
  tempPassword: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(64)
    .optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi();
  if (auth.error) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  const { name, email } = parsed.data;

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  // Generate or use provided temp password
  const plainTemp =
    parsed.data.tempPassword ??
    // Readable random: 4 uppercase hex + 4 digits
    crypto.randomBytes(2).toString("hex").toUpperCase() +
      Math.floor(1000 + Math.random() * 9000).toString();

  const passwordHash = await hashPassword(plainTemp);
  const tempPasswordExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "MEMBER",
      mustChangePassword: true,     // must change on first login
      tempPasswordHash: passwordHash,
      tempPasswordExpiresAt,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(
    {
      user,
      tempPassword: plainTemp,
      message: `Account created. Share the temporary password with ${name}.`,
    },
    { status: 201 }
  );
}
