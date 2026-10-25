// PATCH /api/admin/users/[id] — Update a user's role (ADMIN only)
// Body: { role: "ADMIN" | "MEMBER" }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminForApi } from "@/lib/auth/authorization";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdminForApi();
  if (auth.error) return auth.error;
  const admin = auth.user;

  const { id } = await params;

  // Prevent admins from demoting themselves
  if (id === admin.id) {
    return NextResponse.json(
      { error: "You cannot change your own role." },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user: updated });
}
