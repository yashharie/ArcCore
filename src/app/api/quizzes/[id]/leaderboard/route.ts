// GET /api/quizzes/[id]/leaderboard — Per-quiz leaderboard
// Ranked by score % desc, then time taken asc (faster wins on tie)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const { id: quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, title: true, status: true },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  const entries = await prisma.quizLeaderboard.findMany({
    where: { quizId },
    orderBy: [
      { scorePercent: "desc" },
      { timeTaken: "asc" },
    ],
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  // Assign ranks with ties
  let currentRank = 1;
  const ranked = entries.map((entry, idx) => {
    if (idx > 0) {
      const prev = entries[idx - 1];
      if (
        entry.scorePercent < prev.scorePercent ||
        (entry.scorePercent === prev.scorePercent && entry.timeTaken > prev.timeTaken)
      ) {
        currentRank = idx + 1;
      }
    }
    return {
      rank: entry.rank ?? currentRank,
      userId: entry.userId,
      userName: entry.user.name,
      correctAnswers: entry.correctAnswers,
      totalQuestions: entry.totalQuestions,
      scorePercent: entry.scorePercent,
      timeTaken: entry.timeTaken,
      submittedAt: entry.submittedAt,
    };
  });

  return NextResponse.json({
    quizId,
    quizTitle: quiz.title,
    leaderboard: ranked,
  });
}
