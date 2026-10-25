// POST /api/quizzes/[id]/archive — Archive a published quiz (creator or admin)
// An archived quiz is no longer available to take, but results are preserved.

import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) return Response.json({ error: "Quiz not found." }, { status: 404 });

  if (user.role !== "ADMIN" && quiz.createdById !== user.id) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  if (quiz.status === "DRAFT") {
    return Response.json(
      { error: "Draft quizzes cannot be archived. Publish first or delete instead." },
      { status: 400 }
    );
  }

  if (quiz.status === "ARCHIVED") {
    return Response.json({ error: "Quiz is already archived." }, { status: 409 });
  }

  const updated = await prisma.quiz.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return Response.json({ quiz: updated });
}
