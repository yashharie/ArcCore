import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { quizSchema } from "@/lib/validation/quiz";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/quizzes/[id]
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
  if (!quiz) return Response.json({ error: "Quiz not found." }, { status: 404 });

  // Only creator, admin, or an assigned member can view
  const allowed =
    user.role === "ADMIN" ||
    quiz.createdById === user.id ||
    quiz.assignments.some((a) => a.assignedToAll || a.userId === user.id);
  if (!allowed) return Response.json({ error: "Forbidden." }, { status: 403 });

  return Response.json({ quiz });
}

// DELETE /api/quizzes/[id]
export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) return Response.json({ error: "Quiz not found." }, { status: 404 });
  if (user.role !== "ADMIN" && quiz.createdById !== user.id) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.quiz.delete({ where: { id } });
  return Response.json({ ok: true });
}

// PATCH /api/quizzes/[id] — Update quiz metadata (only DRAFT quizzes)
export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) return Response.json({ error: "Quiz not found." }, { status: 404 });
  if (user.role !== "ADMIN" && quiz.createdById !== user.id) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  if (quiz.status !== "DRAFT") {
    return Response.json(
      { error: "Only DRAFT quizzes can be edited." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = quizSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  if (
    parsed.data.startsAt &&
    parsed.data.deadline &&
    parsed.data.deadline <= parsed.data.startsAt
  ) {
    return Response.json(
      { error: "Deadline must be after the start time." },
      { status: 400 }
    );
  }

  const updated = await prisma.quiz.update({
    where: { id },
    data: parsed.data,
  });

  return Response.json({ quiz: updated });
}
