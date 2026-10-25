import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string; questionId: string }> };

// DELETE /api/quizzes/[id]/questions/[questionId]
export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id, questionId } = await params;

  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) return Response.json({ error: "Quiz not found." }, { status: 404 });
  if (user.role !== "ADMIN" && quiz.createdById !== user.id) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  if (quiz.status !== "DRAFT") {
    return Response.json(
      { error: "Cannot delete questions from a published quiz." },
      { status: 409 }
    );
  }

  await prisma.question.delete({ where: { id: questionId } });

  // Re-order remaining questions sequentially
  const remaining = await prisma.question.findMany({
    where: { quizId: id },
    orderBy: { order: "asc" },
  });
  await prisma.$transaction(
    remaining.map((q, i) =>
      prisma.question.update({ where: { id: q.id }, data: { order: i + 1 } })
    )
  );

  return Response.json({ ok: true });
}
