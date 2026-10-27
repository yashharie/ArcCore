import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard — ArcCore" };
export const instant = false;

export default async function LeaderboardPage() {
  const currentUser = await requireAuth();

  const entries = await prisma.leaderboard.findMany({
    orderBy: [{ averageScorePercent: "desc" }, { quizzesTaken: "desc" }],
    include: { user: { select: { id: true, name: true } } },
  });

  let currentRank = 1;
  const ranked = entries.map((entry, index) => {
    if (index > 0) {
      const prev = entries[index - 1];
      if (
        entry.averageScorePercent < prev.averageScorePercent ||
        (entry.averageScorePercent === prev.averageScorePercent && entry.quizzesTaken < prev.quizzesTaken)
      ) currentRank = index + 1;
    }
    return { ...entry, rank: currentRank };
  });

  const medals: Record<number, { icon: string; color: string; glow: string }> = {
    1: { icon: "🥇", color: "#f5c842", glow: "rgba(245,200,66,0.3)" },
    2: { icon: "🥈", color: "#c0c0c0", glow: "rgba(192,192,192,0.2)" },
    3: { icon: "🥉", color: "#cd7f32", glow: "rgba(205,127,50,0.2)" },
  };

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={currentUser} />

      <div className="max-w-4xl mx-auto px-5 pt-20 pb-12">
        {/* Header */}
        <div className="text-center pt-6 mb-10">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full blur-xl" style={{ background: "rgba(245,200,66,0.3)" }} />
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{ background: "linear-gradient(135deg,#1a2a40,#0a1628)", border: "1px solid rgba(245,200,66,0.3)" }}>
                🏆
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Leaderboard</h1>
          <p className="text-sm text-[#94b8d8] mt-1">Top learners · Bigger dreams</p>
          <p className="text-xs text-[#4a7098] mt-1">Ranked by average score — fair for everyone</p>
        </div>

        {/* Top 3 podium */}
        {ranked.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd */}
            {ranked[1] && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-2"
                  style={{ background: "linear-gradient(135deg,#1e3a6e,#2a4a80)", border: "2px solid #c0c0c0" }}>
                  {ranked[1].user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-white max-w-[70px] truncate text-center">{ranked[1].user.name}</p>
                <p className="text-xs text-[#94b8d8]">{ranked[1].averageScorePercent.toFixed(1)}%</p>
                <div className="w-16 h-14 rounded-t-lg mt-2 flex items-center justify-center"
                  style={{ background: "linear-gradient(to top,#1e3a6e,#2a4a80)" }}>
                  <span className="text-[#c0c0c0] font-bold text-sm">#2</span>
                </div>
              </div>
            )}
            {/* 1st */}
            <div className="flex flex-col items-center -mt-4">
              <div className="text-2xl mb-1">👑</div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2"
                style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff30)", border: "2px solid #f5c842", boxShadow: "0 0 20px rgba(245,200,66,0.3)" }}>
                {ranked[0].user.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold text-white max-w-[80px] truncate text-center">{ranked[0].user.name}</p>
              <p className="text-xs text-[#f5c842] font-semibold">{ranked[0].averageScorePercent.toFixed(1)}%</p>
              <div className="w-16 h-20 rounded-t-lg mt-2 flex items-center justify-center"
                style={{ background: "linear-gradient(to top,rgba(245,200,66,0.3),rgba(245,200,66,0.1))", border: "1px solid rgba(245,200,66,0.2)" }}>
                <span className="text-[#f5c842] font-extrabold">#1</span>
              </div>
            </div>
            {/* 3rd */}
            {ranked[2] && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-2"
                  style={{ background: "linear-gradient(135deg,#1e3a6e,#2a4a80)", border: "2px solid #cd7f32" }}>
                  {ranked[2].user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-white max-w-[70px] truncate text-center">{ranked[2].user.name}</p>
                <p className="text-xs text-[#94b8d8]">{ranked[2].averageScorePercent.toFixed(1)}%</p>
                <div className="w-16 h-10 rounded-t-lg mt-2 flex items-center justify-center"
                  style={{ background: "linear-gradient(to top,#1e2a20,#1e3a1e)" }}>
                  <span className="text-[#cd7f32] font-bold text-sm">#3</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="arc-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(30,58,110,0.3)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#4db8ff] uppercase tracking-wide">Rank</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#4db8ff] uppercase tracking-wide">Member</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#4db8ff] uppercase tracking-wide">Quizzes</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#4db8ff] uppercase tracking-wide">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-[#94b8d8] text-sm">
                  No scores yet. <Link href="/quizzes" className="text-[#4db8ff] hover:underline">Take a quiz →</Link>
                </td></tr>
              ) : ranked.map((entry, i) => {
                const isMe = entry.userId === currentUser.id;
                const medal = medals[entry.rank];
                return (
                  <tr key={entry.userId}
                    style={{
                      background: isMe ? "rgba(77,184,255,0.06)" : i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.3)",
                      borderBottom: "1px solid rgba(30,58,110,0.2)"
                    }}>
                    <td className="px-5 py-3.5">
                      {medal ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-base">{medal.icon}</span>
                          <span className="text-xs font-bold" style={{ color: medal.color }}>#{entry.rank}</span>
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-[#94b8d8]">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)" }}>
                          {entry.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {entry.user.name}
                          {isMe && <span className="ml-1.5 text-xs text-[#4db8ff]">(you)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-[#94b8d8]">{entry.quizzesTaken}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-extrabold"
                        style={{ color: entry.averageScorePercent >= 70 ? "#00d4aa" : entry.averageScorePercent >= 50 ? "#f5c842" : "#ff4d6d" }}>
                        {entry.averageScorePercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
