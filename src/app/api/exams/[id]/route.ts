// GET    /api/exams/[id] — Get exam detail
// PATCH  /api/exams/[id] — Update exam (ADMIN only)
// DELETE /api/exams/[id] — Delete exam (ADMIN only)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";
import { updateExamSchema } from "@/lib/validation/exam";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      examQuizzes: {
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              status: true,
              timeLimitMinutes: true,
              _count: { select: { questions: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }

  // Members cannot see cancelled exams
  if (user.role !== "ADMIN" && exam.status === "CANCELLED") {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }

  return NextResponse.json({ exam });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateExamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await prisma.exam.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ exam: updated });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }

  await prisma.exam.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
