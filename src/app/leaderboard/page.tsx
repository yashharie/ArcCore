// Leaderboard Page — shows all members ranked by total score

import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic"; // always fetch fresh data

export default async function LeaderboardPage() {
  const entries = await prisma.leaderboard.findMany({
    orderBy: { totalScore: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  // Assign ranks (ties share rank)
  let currentRank = 1;
  const ranked = entries.map((entry, index) => {
    if (index > 0 && entry.totalScore < entries[index - 1].totalScore) {
      currentRank = index + 1;
    }
    return { ...entry, rank: currentRank };
  });

  const medalColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-amber-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">🏆 Leaderboard</h1>
          <p className="text-gray-500 mt-2">
            Top learners ranked by total score across all quizzes.
          </p>
        </div>

        {/* Table */}
        {ranked.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
            No scores yet. Take a quiz to appear here!
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Member</th>
                  <th className="px-6 py-4 text-right">Quizzes</th>
                  <th className="px-6 py-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ranked.map((entry) => (
                  <tr
                    key={entry.userId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`text-lg font-bold ${
                          medalColors[entry.rank] ?? "text-gray-600"
                        }`}
                      >
                        {entry.rank === 1
                          ? "🥇"
                          : entry.rank === 2
                          ? "🥈"
                          : entry.rank === 3
                          ? "🥉"
                          : `#${entry.rank}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {entry.user.name}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {entry.quizzesTaken}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">
                      {entry.totalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
