// GET /api/attempts/[attemptId] — Get a single attempt with answers for review

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  const { attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          description: true,
          timeLimitMinutes: true,
        },
      },
      attemptAnswers: {
        include: {
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              options: true,
              correctAnswer: true,
              marks: true,
              explanation: true,
              order: true,
            },
          },
        },
        orderBy: { question: { order: "asc" } },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }

  // Only the owner or an admin can view
  if (attempt.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({ attempt });
}
