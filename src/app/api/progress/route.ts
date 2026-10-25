// GET /api/progress?userId=<id> — Get a member's learning progress and stats

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all submitted attempts with quiz info
    const attempts = await prisma.attempt.findMany({
      where: { userId, status: "SUBMITTED" },
      include: {
        quiz: { select: { title: true, totalMarks: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    const topicsViewed = await prisma.topicProgress.count({
      where: { userId },
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
      userId,
      userName: user.name,
      totalAttempts: attempts.length,
      totalScore,
      averageScore,
      quizzesCompleted: attempts.length,
      topicsViewed,
      recentAttempts,
    });
  } catch (error) {
    console.error("[GET /api/progress]", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
