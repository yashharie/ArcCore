// GET /api/leaderboard — Get the full leaderboard ranked by total score

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const entries = await prisma.leaderboard.findMany({
      orderBy: { totalScore: "desc" },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Assign ranks (ties get the same rank)
    let currentRank = 1;
    const ranked = entries.map((entry, index) => {
      if (index > 0 && entry.totalScore < entries[index - 1].totalScore) {
        currentRank = index + 1;
      }
      return {
        rank: currentRank,
        userId: entry.userId,
        userName: entry.user.name,
        totalScore: entry.totalScore,
        quizzesTaken: entry.quizzesTaken,
      };
    });

    return NextResponse.json({ leaderboard: ranked });
  } catch (error) {
    console.error("[GET /api/leaderboard]", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
