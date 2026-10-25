import { requireAuthForApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { quizSchema } from "@/lib/validation/quiz";

// GET /api/quizzes
// ADMIN: all quizzes. MEMBER: own quizzes + published quizzes assigned to them or to all.
export async function GET() {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  const where =
    user.role === "ADMIN"
      ? {}
      : {
          OR: [
            { createdById: user.id },
            {
              status: "PUBLISHED" as const,
              assignments: {
                some: {
                  OR: [{ assignedToAll: true }, { userId: user.id }],
                },
              },
            },
          ],
        };

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      topicId: true,
      createdById: true,
      timeLimitMinutes: true,
      startsAt: true,
      deadline: true,
      status: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
  });

  return Response.json({ quizzes });
}

// POST /api/quizzes — creates a DRAFT quiz
export async function POST(request: Request) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = quizSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.startsAt && data.deadline && data.deadline <= data.startsAt) {
    return Response.json(
      { error: "Deadline must be after the start time." },
      { status: 400 }
    );
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      topicId: data.topicId,
      timeLimitMinutes: data.timeLimitMinutes,
      startsAt: data.startsAt,
      deadline: data.deadline,
      status: "DRAFT",
      createdById: user.id,
    },
  });

  return Response.json({ quiz }, { status: 201 });
}
