/**
 * Admin-only API route — lists all users.
 *
 * Enforces ADMIN role server-side. Returns 401 for unauthenticated requests
 * and 403 for authenticated MEMBER requests.
 * Never returns passwordHash.
 */

import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAdminForApi();
  if (authResult.error) return authResult.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // passwordHash intentionally excluded
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
