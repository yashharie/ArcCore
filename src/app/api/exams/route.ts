// GET  /api/exams — List all exams (ADMIN sees all, MEMBER sees SCHEDULED/ONGOING/COMPLETED)
// POST /api/exams — Create a new exam (ADMIN only)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";
import { examSchema } from "@/lib/validation/exam";

export async function GET() {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  const where =
    user.role === "ADMIN"
      ? {}
      : { status: { in: (["SCHEDULED", "ONGOING", "COMPLETED"] as string[]) as ("SCHEDULED" | "ONGOING" | "COMPLETED")[] } };

  const exams = await prisma.exam.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      examQuizzes: {
        include: {
          quiz: { select: { id: true, title: true, status: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json({ exams });
}

export async function POST(request: Request) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  // Only admins can create exams
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = examSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const exam = await prisma.exam.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      scheduledAt: parsed.data.scheduledAt,
      duration: parsed.data.duration,
      createdById: user.id,
      status: "SCHEDULED",
    },
  });

  return NextResponse.json({ exam }, { status: 201 });
}
