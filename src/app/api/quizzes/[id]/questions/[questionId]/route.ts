import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validation/quiz";

type Ctx = { params: Promise<{ id: string; questionId: string }> };

async function loadOwned(id: string, questionId: string) {
  const auth = await requireAuthForApi();
  if (auth.error) return { error: auth.error };
  const user = auth.user;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: true },
  });
  if (!question || question.quizId !== id) {
    return {
      error: Response.json({ error: "Question not found." }, { status: 404 }),
    };
  }
  if (user.role !== "ADMIN" && question.quiz.createdById !== user.id) {
    return { error: Response.json({ error: "Forbidden." }, { status: 403 }) };
  }
  if (question.quiz.status !== "DRAFT") {
    return {
      error: Response.json(
        { error: "Only DRAFT quizzes can be edited." },
        { status: 409 }
      ),
    };
  }
  return { question };
}

// PATCH: send the full question (same shape as POST)
export async function PATCH(request: Request, { params }: Ctx) {
  const { id, questionId } = await params;
  const result = await loadOwned(id, questionId);
  if (result.error) return result.error;
  const existing = result.question!;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = questionSchema.safeParse({
    ...(body as object),
    order: existing.order,
  });
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const q = parsed.data;

  const question = await prisma.question.update({
    where: { id: questionId },
    data: {
      type: q.type,
      text: q.text,
      options: q.options ?? undefined,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      explanation: q.explanation,
    },
  });
  return Response.json({ question });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id, questionId } = await params;
  const result = await loadOwned(id, questionId);
  if (result.error) return result.error;

  await prisma.question.delete({ where: { id: questionId } });
  return Response.json({ ok: true });
}