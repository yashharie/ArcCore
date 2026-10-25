// Per-Quiz Leaderboard — ranked by correct answers %, then time taken

import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id }, select: { title: true } });
  return { title: quiz ? `${quiz.title} Leaderboard — ArcCore` : "Quiz Leaderboard" };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default async function QuizLeaderboardPage({ params }: PageProps) {
  const user = await requireAuth();
  const { id: quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, title: true, description: true, status: true },
  });
  if (!quiz) notFound();

  const entries = await prisma.quizLeaderboard.findMany({
    where: { quizId },
    orderBy: [
      { scorePercent: "desc" },
      { timeTaken: "asc" },
    ],
    include: { user: { select: { id: true, name: true } } },
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
    return { ...entry, rank: currentRank };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/quizzes" className="text-indigo-600 hover:underline">Quizzes</Link>
          <span>/</span>
          <span className="truncate">{quiz.title}</span>
          <span>/</span>
          <span>Leaderboard</span>
        </div>

        <div className="text-center mb-8 mt-4">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Quiz Leaderboard — ranked by score %, then fastest completion time.
          </p>
        </div>

        {ranked.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
            No one has completed this quiz yet.{" "}
            {quiz.status === "PUBLISHED" && (
              <Link href={`/quizzes/${quizId}/take`} className="text-indigo-600 hover:underline">
                Be the first →
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {ranked.length >= 1 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {/* 2nd place */}
                {ranked[1] && (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl mb-1">
                      <CrownIcon color="#C0C0C0" size={28} />
                    </div>
                    <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-600">
                      {ranked[1].user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mt-1 truncate max-w-[80px] text-center">
                      {ranked[1].user.name}
                    </p>
                    <p className="text-xs text-gray-500">{ranked[1].scorePercent.toFixed(1)}%</p>
                    <div className="bg-gray-200 w-16 h-16 rounded-t-lg mt-1 flex items-end justify-center pb-1">
                      <span className="text-gray-600 font-bold text-sm">#2</span>
                    </div>
                  </div>
                )}

                {/* 1st place */}
                <div className="flex flex-col items-center">
                  <div className="text-3xl mb-1">
                    <CrownIcon color="#F5D060" size={36} />
                  </div>
                  <div className="w-24 h-24 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center text-2xl font-bold text-yellow-700">
                    {ranked[0].user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1 truncate max-w-[96px] text-center">
                    {ranked[0].user.name}
                    {ranked[0].userId === user.id && (
                      <span className="ml-1 text-xs text-indigo-500 font-normal">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-yellow-700 font-semibold">{ranked[0].scorePercent.toFixed(1)}%</p>
                  <div className="bg-yellow-400 w-16 h-24 rounded-t-lg mt-1 flex items-end justify-center pb-1">
                    <span className="text-white font-bold">#1</span>
                  </div>
                </div>

                {/* 3rd place */}
                {ranked[2] && (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl mb-1">
                      <CrownIcon color="#CD7F32" size={28} />
                    </div>
                    <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-xl font-bold text-amber-700">
                      {ranked[2].user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mt-1 truncate max-w-[80px] text-center">
                      {ranked[2].user.name}
                    </p>
                    <p className="text-xs text-amber-700">{ranked[2].scorePercent.toFixed(1)}%</p>
                    <div className="bg-amber-400 w-16 h-12 rounded-t-lg mt-1 flex items-end justify-center pb-1">
                      <span className="text-white font-bold text-sm">#3</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full table */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-3 text-left">Rank</th>
                    <th className="px-5 py-3 text-left">Member</th>
                    <th className="px-5 py-3 text-right">Correct</th>
                    <th className="px-5 py-3 text-right">Score</th>
                    <th className="px-5 py-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ranked.map((entry) => {
                    const isMe = entry.userId === user.id;
                    return (
                      <tr
                        key={entry.userId}
                        className={isMe ? "bg-indigo-50 font-semibold" : "hover:bg-gray-50"}
                      >
                        <td className="px-5 py-3">
                          <RankBadge rank={entry.rank} />
                        </td>
                        <td className="px-5 py-3 text-gray-900">
                          {entry.user.name}
                          {isMe && (
                            <span className="ml-1.5 text-xs text-indigo-500 font-normal">(you)</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600">
                          {entry.correctAnswers}/{entry.totalQuestions}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={`font-bold ${
                              entry.scorePercent >= 70
                                ? "text-green-600"
                                : entry.scorePercent >= 50
                                ? "text-yellow-600"
                                : "text-red-500"
                            }`}
                          >
                            {entry.scorePercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500 font-mono text-xs">
                          {formatTime(entry.timeTaken)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/quizzes" className="text-sm text-indigo-600 hover:underline">
            ← Quizzes
          </Link>
          <Link href="/leaderboard" className="text-sm text-indigo-600 hover:underline">
            Overall Leaderboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex items-center gap-1"><CrownIcon color="#F5D060" size={16} /><span className="font-bold text-yellow-600">#1</span></span>;
  if (rank === 2) return <span className="inline-flex items-center gap-1"><CrownIcon color="#C0C0C0" size={16} /><span className="font-bold text-gray-500">#2</span></span>;
  if (rank === 3) return <span className="inline-flex items-center gap-1"><CrownIcon color="#CD7F32" size={16} /><span className="font-bold text-amber-700">#3</span></span>;
  return <span className="font-medium text-gray-500">#{rank}</span>;
}

function CrownIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
