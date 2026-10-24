import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/quizzes/[id]/take
// Never sends correctAnswer / explanation (prevents cheating via Network tab)
export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      assignments: true,
    },
  });
  if (!quiz || quiz.status !== "PUBLISHED") {
    return Response.json({ error: "Quiz not found." }, { status: 404 });
  }

  const allowed =
    user.role === "ADMIN" ||
    quiz.createdById === user.id ||
    quiz.assignments.some((a) => a.assignedToAll || a.userId === user.id);
  if (!allowed) return Response.json({ error: "Forbidden." }, { status: 403 });

  const now = new Date();
  if (quiz.startsAt && now < quiz.startsAt) {
    return Response.json({ error: "Quiz has not started yet." }, { status: 403 });
  }
  if (quiz.deadline && now > quiz.deadline) {
    return Response.json({ error: "Quiz deadline has passed." }, { status: 403 });
  }

  return Response.json({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      timeLimitMinutes: quiz.timeLimitMinutes,
      deadline: quiz.deadline,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        options: q.options ?? null,
        marks: q.marks,
        order: q.order,
        // correctAnswer and explanation are intentionally NOT sent
      })),
    },
  });
}