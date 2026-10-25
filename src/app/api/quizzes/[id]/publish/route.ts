import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { publishCheckSchema } from "@/lib/validation/quiz";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/quizzes/[id]/publish
export async function POST(_req: Request, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return Response.json({ error: "Quiz not found." }, { status: 404 });
  if (user.role !== "ADMIN" && quiz.createdById !== user.id) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  if (quiz.status !== "DRAFT") {
    return Response.json({ error: "Quiz is already published." }, { status: 409 });
  }

  const check = publishCheckSchema.safeParse({
    questions: quiz.questions.map((q) => ({
      type: q.type,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      explanation: q.explanation ?? undefined,
      order: q.order,
    })),
  });
  if (!check.success) {
    return Response.json(
      { error: "Quiz is not ready to publish.", issues: check.error.issues },
      { status: 400 }
    );
  }

  // Published quizzes are visible to everyone (assigned to all)
  const published = await prisma.$transaction(async (tx) => {
    const updated = await tx.quiz.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    const existing = await tx.quizAssignment.findFirst({
      where: { quizId: id, assignedToAll: true },
    });
    if (!existing) {
      await tx.quizAssignment.create({
        data: { quizId: id, assignedToAll: true },
      });
    }
    return updated;
  });

  return Response.json({ quiz: published });
}