import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validation/quiz";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/quizzes/[id]/questions
export async function POST(request: Request, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { _count: { select: { questions: true } } },
  });
  if (!quiz) return Response.json({ error: "Quiz not found." }, { status: 404 });
  if (user.role !== "ADMIN" && quiz.createdById !== user.id) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  if (quiz.status !== "DRAFT") {
    return Response.json(
      { error: "Questions can only be added to DRAFT quizzes." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // order is assigned by the server
  const withOrder = {
    ...(body as object),
    order: quiz._count.questions + 1,
  };
  const parsed = questionSchema.safeParse(withOrder);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const q = parsed.data;

  const question = await prisma.question.create({
    data: {
      quizId: id,
      type: q.type,
      text: q.text,
      options: q.options ?? undefined,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      explanation: q.explanation,
      order: q.order,
    },
  });
  return Response.json({ question }, { status: 201 });
}
