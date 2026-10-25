/**
 * Current user profile API route.
 *
 * GET  /api/user/profile — returns the authenticated user's profile
 * PATCH /api/user/profile — updates the user's name
 *
 * Security:
 * - Requires authentication (401 if unauthenticated)
 * - Only the authenticated user can modify their own profile
 * - Role cannot be changed via this endpoint
 * - Email cannot be changed via this endpoint (security boundary)
 * - passwordHash is never returned
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/validation/auth";

// GET /api/user/profile — return current user profile
export async function GET() {
  const authResult = await requireAuthForApi();
  if (authResult.error) return authResult.error;

  const user = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // passwordHash intentionally excluded
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// PATCH /api/user/profile — update current user's allowed fields
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuthForApi();
  if (authResult.error) return authResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Only update fields that were actually provided
  const updates = parsed.data;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: authResult.user.id },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // passwordHash intentionally excluded
    },
  });

  return NextResponse.json({ user: updated });
}
