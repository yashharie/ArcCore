// POST /api/attempts — Start a new quiz attempt
// GET  /api/attempts — Get all attempts for the current user

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";

// GET — fetch all attempts for the current authenticated user
export async function GET() {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          description: true,
          timeLimitMinutes: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json({ attempts });
}

// POST — start a new attempt
// Body: { quizId: string }
export async function POST(request: NextRequest) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  let body: { quizId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { quizId } = body;
  if (!quizId) {
    return NextResponse.json({ error: "quizId is required." }, { status: 400 });
  }

  // Check quiz exists and is published
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      assignments: true,
      questions: { select: { marks: true } },
    },
  });

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }
  if (quiz.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Quiz is not available." }, { status: 403 });
  }

  // Check access
  const allowed =
    user.role === "ADMIN" ||
    quiz.assignments.some((a) => a.assignedToAll || a.userId === user.id);
  if (!allowed) {
    return NextResponse.json({ error: "You are not assigned to this quiz." }, { status: 403 });
  }

  const now = new Date();
  if (quiz.startsAt && now < quiz.startsAt) {
    return NextResponse.json({ error: "Quiz has not started yet." }, { status: 403 });
  }
  if (quiz.deadline && now > quiz.deadline) {
    return NextResponse.json({ error: "Quiz deadline has passed." }, { status: 403 });
  }

  // Check if attempt already exists
  const existing = await prisma.attempt.findUnique({
    where: { userId_quizId: { userId: user.id, quizId } },
  });
  if (existing) {
    // If still in progress, return the attempt so the client can resume
    if (existing.status === "IN_PROGRESS") {
      return NextResponse.json(
        { attempt: existing, resumed: true },
        { status: 200 }
      );
    }
    // Already submitted or timed out
    return NextResponse.json(
      { error: "You have already attempted this quiz.", attemptId: existing.id },
      { status: 409 }
    );
  }

  const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      quizId,
      totalMarks,
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json({ attempt }, { status: 201 });
}
