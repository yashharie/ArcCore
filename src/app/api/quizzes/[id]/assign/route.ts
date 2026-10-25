// POST /api/quizzes/[id]/assign — Assign a published quiz to specific users (ADMIN only)
// Body: { userIds: string[] }  — or { assignToAll: true }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  const { id: quizId } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }
  if (quiz.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Only published quizzes can be assigned." },
      { status: 400 }
    );
  }

  let body: { userIds?: string[]; assignToAll?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.assignToAll) {
    // Upsert a global assignment record
    await prisma.quizAssignment.upsert({
      where: { quizId_userId: { quizId, userId: "" } },
      create: { quizId, assignedToAll: true, userId: null },
      update: { assignedToAll: true },
    }).catch(async () => {
      // If upsert fails due to null userId constraint variant, create directly
      await prisma.quizAssignment.create({
        data: { quizId, assignedToAll: true },
      });
    });
    return NextResponse.json({ ok: true, assignedToAll: true });
  }

  if (!Array.isArray(body.userIds) || body.userIds.length === 0) {
    return NextResponse.json(
      { error: "userIds array is required (or set assignToAll: true)." },
      { status: 400 }
    );
  }

  // Validate users exist
  const users = await prisma.user.findMany({
    where: { id: { in: body.userIds } },
    select: { id: true },
  });
  if (users.length !== body.userIds.length) {
    return NextResponse.json(
      { error: "One or more user IDs are invalid." },
      { status: 400 }
    );
  }

  // Create assignments for each user (skip existing)
  const results = await Promise.allSettled(
    body.userIds.map((userId) =>
      prisma.quizAssignment.upsert({
        where: { quizId_userId: { quizId, userId } },
        create: { quizId, userId, assignedToAll: false },
        update: {},
      })
    )
  );

  const assigned = results.filter((r) => r.status === "fulfilled").length;

  return NextResponse.json({ ok: true, assigned }, { status: 201 });
}
