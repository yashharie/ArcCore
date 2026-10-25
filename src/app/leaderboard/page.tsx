// Leaderboard Page — overall rankings by average score %

import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard — ArcCore",
  description: "Top learners ranked by average quiz score.",
};

export const instant = false;

export default async function LeaderboardPage() {
  const currentUser = await requireAuth();

  const entries = await prisma.leaderboard.findMany({
    orderBy: [
      { averageScorePercent: "desc" },
      { quizzesTaken: "desc" },
    ],
    include: { user: { select: { id: true, name: true } } },
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
    return { ...entry, rank: currentRank };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={currentUser} />
      <div className="py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Overall Leaderboard</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Ranked by average score % — every member is treated fairly regardless of how many quizzes they&apos;ve taken.
            </p>
          </div>

          {ranked.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
              No scores yet.{" "}
              <Link href="/quizzes" className="text-indigo-600 hover:underline">
                Take a quiz →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-4 text-left">Rank</th>
                    <th className="px-5 py-4 text-left">Member</th>
                    <th className="px-5 py-4 text-right">Quizzes</th>
                    <th className="px-5 py-4 text-right">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ranked.map((entry) => {
                    const isMe = entry.userId === currentUser.id;
                    return (
                      <tr
                        key={entry.userId}
                        className={`transition-colors ${
                          isMe ? "bg-indigo-50 font-semibold" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <RankBadge rank={entry.rank} />
                        </td>
                        <td className="px-5 py-4 text-gray-900">
                          {entry.user.name}
                          {isMe && (
                            <span className="ml-2 text-xs text-indigo-500 font-normal">
                              (you)
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-500">
                          {entry.quizzesTaken}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`font-bold ${
                              entry.averageScorePercent >= 70
                                ? "text-green-600"
                                : entry.averageScorePercent >= 50
                                ? "text-yellow-600"
                                : "text-red-500"
                            }`}
                          >
                            {entry.averageScorePercent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
            Ranking is based on average score percentage. Participating in more quizzes only helps if your score is high.
          </div>
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <CrownIcon color="#F5D060" />
        <span className="font-bold text-yellow-600">#1</span>
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <CrownIcon color="#C0C0C0" />
        <span className="font-bold text-gray-500">#2</span>
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <CrownIcon color="#CD7F32" />
        <span className="font-bold text-amber-700">#3</span>
      </span>
    );
  }
  return <span className="font-medium text-gray-500">#{rank}</span>;
}

function CrownIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 14h16M2 14L0 4l5 4 5-6 5 6 5-4-2 10H2z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.25"
      />
      <circle cx="10" cy="2" r="1.5" fill={color} />
      <circle cx="0.5" cy="4" r="1" fill={color} />
      <circle cx="19.5" cy="4" r="1" fill={color} />
    </svg>
  );
}
