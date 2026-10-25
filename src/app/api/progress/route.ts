// GET /api/progress — Get the current user's learning progress and stats

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";

export async function GET() {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;
  const user = auth.user;

  // Fetch all submitted attempts with quiz info
  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id, status: "SUBMITTED" },
    include: {
      quiz: { select: { title: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const topicsViewed = await prisma.topicProgress.count({
    where: { userId: user.id },
  });

  const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalMaxMarks = attempts.reduce((sum, a) => sum + a.totalMarks, 0);
  const averageScore =
    totalMaxMarks > 0
      ? Math.round((totalScore / totalMaxMarks) * 100)
      : 0;

  const recentAttempts = attempts.slice(0, 5).map((a) => ({
    id: a.id,
    quizTitle: a.quiz.title,
    score: a.score,
    totalMarks: a.totalMarks,
    percentage:
      a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0,
    submittedAt: a.submittedAt,
  }));

  return NextResponse.json({
    userId: user.id,
    userName: user.name,
    totalAttempts: attempts.length,
    totalScore,
    averageScore,
    quizzesCompleted: attempts.length,
    topicsViewed,
    recentAttempts,
  });
}
