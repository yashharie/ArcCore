// POST   /api/exams/[id]/quizzes — Add a published quiz to an exam (ADMIN only)
// DELETE /api/exams/[id]/quizzes — Remove a quiz from an exam (ADMIN only)
//   Body for DELETE: { quizId: string }

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

  const { id: examId } = await params;

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }

  let body: { quizId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.quizId) {
    return NextResponse.json({ error: "quizId is required." }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: body.quizId } });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }
  if (quiz.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Only published quizzes can be added to an exam." },
      { status: 400 }
    );
  }

  // Determine the next order value
  const count = await prisma.examQuiz.count({ where: { examId } });

  const examQuiz = await prisma.examQuiz.create({
    data: { examId, quizId: body.quizId, order: count + 1 },
  });

  // Recalculate totalMarks from all quizzes in this exam
  const allExamQuizzes = await prisma.examQuiz.findMany({
    where: { examId },
    include: {
      quiz: {
        include: { questions: { select: { marks: true } } },
      },
    },
  });
  const totalMarks = allExamQuizzes.reduce(
    (sum, eq) =>
      sum + eq.quiz.questions.reduce((s, q) => s + q.marks, 0),
    0
  );
  await prisma.exam.update({ where: { id: examId }, data: { totalMarks } });

  return NextResponse.json({ examQuiz }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  const { id: examId } = await params;

  let body: { quizId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.quizId) {
    return NextResponse.json({ error: "quizId is required." }, { status: 400 });
  }

  const examQuiz = await prisma.examQuiz.findUnique({
    where: { examId_quizId: { examId, quizId: body.quizId } },
  });
  if (!examQuiz) {
    return NextResponse.json(
      { error: "Quiz is not in this exam." },
      { status: 404 }
    );
  }

  await prisma.examQuiz.delete({
    where: { examId_quizId: { examId, quizId: body.quizId } },
  });

  // Recalculate totalMarks
  const allExamQuizzes = await prisma.examQuiz.findMany({
    where: { examId },
    include: {
      quiz: { include: { questions: { select: { marks: true } } } },
    },
  });
  const totalMarks = allExamQuizzes.reduce(
    (sum, eq) =>
      sum + eq.quiz.questions.reduce((s, q) => s + q.marks, 0),
    0
  );
  await prisma.exam.update({ where: { id: examId }, data: { totalMarks } });

  return NextResponse.json({ ok: true });
}
