import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard — ArcCore" };
export const instant = false;

export default async function MemberLeaderboardPage() {
  const currentUser = await requireAuth();

  const entries = await prisma.leaderboard.findMany({
    orderBy: [{ averageScorePercent: "desc" }, { quizzesTaken: "desc" }],
    include: { user: { select: { id: true, name: true } } },
  });

  let rank = 1;
  const ranked = entries.map((e, i) => {
    if (i > 0 && (e.averageScorePercent < entries[i - 1].averageScorePercent ||
      (e.averageScorePercent === entries[i - 1].averageScorePercent && e.quizzesTaken < entries[i - 1].quizzesTaken)))
      rank = i + 1;
    return { ...e, rank };
  });

  const medals: Record<number, { icon: string; color: string }> = {
    1: { icon: "🥇", color: "#f5c842" },
    2: { icon: "🥈", color: "#c0c0c0" },
    3: { icon: "🥉", color: "#cd7f32" },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">Leaderboard</h1>
        <p className="text-xs text-[#94b8d8] mt-0.5">Top learners · Ranked by average score</p>
      </div>

      {/* Top 3 podium */}
      {ranked.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[ranked[1], ranked[0], ranked[2]].map((e, i) => {
            if (!e) return null;
            const isFirst = e.rank === 1;
            const medal   = medals[e.rank];
            return (
              <div key={e.userId} className={`flex flex-col items-center ${isFirst ? "-mt-4" : ""}`}>
                {isFirst && <div className="text-2xl mb-1">👑</div>}
                <div className={`rounded-full flex items-center justify-center font-extrabold`}
                  style={{
                    width: isFirst ? 64 : 52, height: isFirst ? 64 : 52,
                    background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)",
                    border: `2px solid ${medal?.color ?? "#4a7098"}`,
                    fontSize: isFirst ? 22 : 18,
                    boxShadow: isFirst ? `0 0 20px ${medal?.color}40` : "none",
                  }}>
                  {e.user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-bold text-white mt-1.5 max-w-[72px] truncate text-center">{e.user.name}</p>
                <p className="text-[10px] font-bold" style={{ color: medal?.color }}>{e.averageScorePercent.toFixed(1)}%</p>
                <div className="w-14 rounded-t-xl mt-1 flex items-center justify-center"
                  style={{ height: isFirst ? 72 : i === 0 ? 52 : 36, background: `${medal?.color ?? "#4a7098"}18`, border: `1px solid ${medal?.color ?? "#4a7098"}30` }}>
                  <span className="font-extrabold text-sm" style={{ color: medal?.color ?? "#4a7098" }}>#{e.rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="arc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(30,58,110,0.25)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
              {["Rank", "Member", "Quizzes", "Avg Score", "Progress"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#4db8ff] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-[#4a7098] text-sm">No scores yet.</td></tr>
            ) : ranked.map((e, i) => {
              const isMe   = e.userId === currentUser.id;
              const medal  = medals[e.rank];
              return (
                <tr key={e.userId} style={{
                  background: isMe ? "rgba(77,184,255,0.06)" : i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.2)",
                  borderBottom: "1px solid rgba(30,58,110,0.15)",
                }}>
                  <td className="px-5 py-3.5">
                    {medal
                      ? <span className="flex items-center gap-1">{medal.icon} <span className="text-xs font-bold" style={{ color: medal.color }}>#{e.rank}</span></span>
                      : <span className="text-sm text-[#94b8d8]">#{e.rank}</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)" }}>
                        {e.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-white">
                        {e.user.name}
                        {isMe && <span className="ml-1 text-[#4db8ff]">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{e.quizzesTaken}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-extrabold"
                      style={{ color: e.averageScorePercent >= 70 ? "#00d4aa" : e.averageScorePercent >= 50 ? "#f5c842" : "#ff4d6d" }}>
                      {e.averageScorePercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 w-28">
                    <div className="arc-progress">
                      <div className="arc-progress-fill" style={{ width: `${e.averageScorePercent.toFixed(0)}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
