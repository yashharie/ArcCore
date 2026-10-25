// GET /api/leaderboard — Overall leaderboard ranked by average score % (fair across different quiz counts)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth/authorization";

export async function GET() {
  const auth = await requireAuthForApi();
  if (auth.error) return auth.error;

  const entries = await prisma.leaderboard.findMany({
    orderBy: [
      { averageScorePercent: "desc" },
      { quizzesTaken: "desc" }, // tie-break: more quizzes taken = higher
    ],
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  // Assign ranks (ties share rank)
  let currentRank = 1;
  const ranked = entries.map((entry, index) => {
    if (index > 0) {
      const prev = entries[index - 1];
      if (
        entry.averageScorePercent < prev.averageScorePercent ||
        (entry.averageScorePercent === prev.averageScorePercent &&
          entry.quizzesTaken < prev.quizzesTaken)
      ) {
        currentRank = index + 1;
      }
    }
    return {
      rank: currentRank,
      userId: entry.userId,
      userName: entry.user.name,
      totalScore: entry.totalScore,
      quizzesTaken: entry.quizzesTaken,
      averageScorePercent: entry.averageScorePercent,
    };
  });

  // Persist ranks back to DB (best-effort)
  await Promise.allSettled(
    ranked.map((r) =>
      prisma.leaderboard.update({
        where: { userId: r.userId },
        data: { rank: r.rank },
      })
    )
  );

  return NextResponse.json({ leaderboard: ranked });
}
