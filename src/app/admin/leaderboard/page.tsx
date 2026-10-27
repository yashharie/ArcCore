// Admin > Communities — overall leaderboard view

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Communities — ArcCore Admin" };
export const instant = false;

export default async function AdminLeaderboardPage() {
  await requireAdmin();

  const entries = await prisma.leaderboard.findMany({
    orderBy: [{ averageScorePercent: "desc" }, { quizzesTaken: "desc" }],
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  let rank = 1;
  const ranked = entries.map((e, i) => {
    if (i > 0 && (e.averageScorePercent < entries[i-1].averageScorePercent ||
      (e.averageScorePercent === entries[i-1].averageScorePercent && e.quizzesTaken < entries[i-1].quizzesTaken)))
      rank = i + 1;
    return { ...e, rank };
  });

  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Communities</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">Overall leaderboard · {entries.length} members ranked</p>
        </div>
      </div>

      {/* Top 3 highlight */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {ranked.slice(0, 3).map((e, i) => (
            <div key={e.userId} className="arc-card p-5 text-center"
              style={{ border: i === 0 ? "1px solid rgba(245,200,66,0.3)" : "1px solid rgba(30,58,110,0.4)" }}>
              <div className="text-3xl mb-2">{medals[e.rank]}</div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2"
                style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)" }}>
                {e.user.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold text-white">{e.user.name}</p>
              <p className="text-xs text-[#4a7098] mt-0.5">{e.user.email}</p>
              <p className="text-lg font-extrabold mt-2" style={{ color: "#4db8ff" }}>
                {e.averageScorePercent.toFixed(1)}%
              </p>
              <p className="text-xs text-[#94b8d8]">{e.quizzesTaken} quizzes</p>
            </div>
          ))}
        </div>
      )}

      <div className="arc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(30,58,110,0.25)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
              {["Rank", "Member", "Email", "Quizzes Taken", "Avg Score", "Progress"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#4db8ff] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-[#4a7098] text-sm">No scores yet.</td></tr>
            ) : ranked.map((e, i) => (
              <tr key={e.userId} style={{
                borderBottom: "1px solid rgba(30,58,110,0.15)",
                background: i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.2)"
              }}>
                <td className="px-5 py-3.5">
                  <span className="text-sm font-bold"
                    style={{ color: e.rank === 1 ? "#f5c842" : e.rank === 2 ? "#c0c0c0" : e.rank === 3 ? "#cd7f32" : "#94b8d8" }}>
                    {medals[e.rank] ?? `#${e.rank}`}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)" }}>
                      {e.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-white">{e.user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-[#4a7098]">{e.user.email}</td>
                <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{e.quizzesTaken}</td>
                <td className="px-5 py-3.5">
                  <span className="text-sm font-extrabold"
                    style={{ color: e.averageScorePercent >= 70 ? "#00d4aa" : e.averageScorePercent >= 50 ? "#f5c842" : "#ff4d6d" }}>
                    {e.averageScorePercent.toFixed(1)}%
                  </span>
                </td>
                <td className="px-5 py-3.5 w-32">
                  <div className="arc-progress">
                    <div className="arc-progress-fill" style={{ width: `${e.averageScorePercent.toFixed(0)}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
