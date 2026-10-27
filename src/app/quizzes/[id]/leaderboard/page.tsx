import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }
export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id }, select: { title: true } });
  return { title: quiz ? `${quiz.title} Leaderboard — ArcCore` : "Quiz Leaderboard" };
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
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
    orderBy: [{ scorePercent: "desc" }, { timeTaken: "asc" }],
    include: { user: { select: { id: true, name: true } } },
  });

  let currentRank = 1;
  const ranked = entries.map((entry, idx) => {
    if (idx > 0) {
      const prev = entries[idx - 1];
      if (entry.scorePercent < prev.scorePercent ||
        (entry.scorePercent === prev.scorePercent && entry.timeTaken > prev.timeTaken))
        currentRank = idx + 1;
    }
    return { ...entry, rank: currentRank };
  });

  const medals: Record<number, { color: string; icon: string }> = {
    1: { color: "#f5c842", icon: "🥇" },
    2: { color: "#c0c0c0", icon: "🥈" },
    3: { color: "#cd7f32", icon: "🥉" },
  };

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-3xl mx-auto px-5 pt-20 pb-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#4a7098] pt-4 mb-6">
          <Link href="/quizzes" className="text-[#4db8ff] hover:underline">Quizzes</Link>
          <span>/</span>
          <span className="truncate text-[#94b8d8]">{quiz.title}</span>
          <span>/</span>
          <span>Leaderboard</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white">{quiz.title}</h1>
          <p className="text-xs text-[#94b8d8] mt-1">Quiz Leaderboard · Score % then fastest time wins</p>
        </div>

        {/* Top 3 podium */}
        {ranked.length >= 2 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {ranked[1] && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold mb-1.5"
                  style={{ background: "linear-gradient(135deg,#1e3a6e,#2a4a80)", border: "2px solid #c0c0c0" }}>
                  {ranked[1].user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs text-white truncate max-w-[70px] text-center">{ranked[1].user.name}</p>
                <p className="text-[10px] text-[#c0c0c0]">{ranked[1].scorePercent.toFixed(1)}%</p>
                <div className="w-14 h-12 rounded-t-xl mt-1.5 flex items-center justify-center"
                  style={{ background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.2)" }}>
                  <span className="text-[#c0c0c0] font-bold text-xs">#2</span>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center -mt-4">
              <div className="text-xl mb-1">👑</div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-1.5"
                style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff30)", border: "2px solid #f5c842", boxShadow: "0 0 16px rgba(245,200,66,0.3)" }}>
                {ranked[0].user.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold text-white truncate max-w-[80px] text-center">{ranked[0].user.name}</p>
              <p className="text-xs text-[#f5c842] font-semibold">{ranked[0].scorePercent.toFixed(1)}%</p>
              <div className="w-14 h-20 rounded-t-xl mt-1.5 flex items-center justify-center"
                style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.2)" }}>
                <span className="text-[#f5c842] font-extrabold">#1</span>
              </div>
            </div>
            {ranked[2] && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold mb-1.5"
                  style={{ background: "linear-gradient(135deg,#1e3a6e,#2a4a80)", border: "2px solid #cd7f32" }}>
                  {ranked[2].user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs text-white truncate max-w-[70px] text-center">{ranked[2].user.name}</p>
                <p className="text-[10px] text-[#cd7f32]">{ranked[2].scorePercent.toFixed(1)}%</p>
                <div className="w-14 h-8 rounded-t-xl mt-1.5 flex items-center justify-center"
                  style={{ background: "rgba(205,127,50,0.1)", border: "1px solid rgba(205,127,50,0.2)" }}>
                  <span className="text-[#cd7f32] font-bold text-xs">#3</span>
                </div>
              </div>
            )}
          </div>
        )}

        {ranked.length === 0 ? (
          <div className="arc-card p-12 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-[#94b8d8] text-sm">No one has completed this quiz yet.</p>
            {quiz.status === "PUBLISHED" && (
              <Link href={`/quizzes/${quizId}/take`} className="arc-btn mt-4 text-xs inline-flex">Be the first →</Link>
            )}
          </div>
        ) : (
          <div className="arc-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(30,58,110,0.3)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#4db8ff] uppercase">Rank</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#4db8ff] uppercase">Member</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[#4db8ff] uppercase">Correct</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[#4db8ff] uppercase">Score</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[#4db8ff] uppercase">Time</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((entry, i) => {
                  const isMe = entry.userId === user.id;
                  const medal = medals[entry.rank];
                  return (
                    <tr key={entry.userId}
                      style={{
                        background: isMe ? "rgba(77,184,255,0.06)" : i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.3)",
                        borderBottom: "1px solid rgba(30,58,110,0.2)",
                      }}>
                      <td className="px-5 py-3.5">
                        {medal ? (
                          <span className="flex items-center gap-1">
                            <span>{medal.icon}</span>
                            <span className="text-xs font-bold" style={{ color: medal.color }}>#{entry.rank}</span>
                          </span>
                        ) : <span className="text-sm text-[#94b8d8]">#{entry.rank}</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)" }}>
                            {entry.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-white">
                            {entry.user.name}
                            {isMe && <span className="ml-1 text-xs text-[#4db8ff]">(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-[#94b8d8]">
                        {entry.correctAnswers}/{entry.totalQuestions}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-extrabold"
                          style={{ color: entry.scorePercent >= 70 ? "#00d4aa" : entry.scorePercent >= 50 ? "#f5c842" : "#ff4d6d" }}>
                          {entry.scorePercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs font-mono text-[#94b8d8]">
                        {formatTime(entry.timeTaken)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <Link href="/quizzes" className="arc-btn-outline text-xs">← Quizzes</Link>
          <Link href="/leaderboard" className="arc-btn text-xs">Overall Leaderboard →</Link>
        </div>
      </div>
    </div>
  );
}
