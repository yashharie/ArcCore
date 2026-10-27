import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports — ArcCore Admin" };
export const instant = false;

export default async function AdminReportsPage() {
  await requireAdmin();

  const [totalUsers, totalAttempts, totalQuizzes, totalTopics, topScorers] = await Promise.all([
    prisma.user.count(),
    prisma.attempt.count({ where: { status: "SUBMITTED" } }),
    prisma.quiz.count(),
    prisma.topic.count(),
    prisma.leaderboard.findMany({
      orderBy: { averageScorePercent: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">Reports</h1>
        <p className="text-xs text-[#94b8d8] mt-0.5">Platform performance overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users",    value: totalUsers,    color: "#4db8ff" },
          { label: "Quiz Attempts",  value: totalAttempts, color: "#f5c842" },
          { label: "Total Quizzes",  value: totalQuizzes,  color: "#00d4aa" },
          { label: "Published Topics", value: totalTopics, color: "#4db8ff" },
        ].map((s) => (
          <div key={s.label} className="arc-card p-5">
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#94b8d8] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="arc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Leaderboard Report</h2>
            <Link href="/leaderboard" className="text-xs text-[#4db8ff] hover:underline">Full Leaderboard →</Link>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(30,58,110,0.2)" }}>
              {["Rank","Member","Email","Quizzes","Avg Score"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#4db8ff] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topScorers.map((e, i) => (
              <tr key={e.userId} style={{ borderBottom: "1px solid rgba(30,58,110,0.15)" }}>
                <td className="px-5 py-3 text-xs font-bold" style={{ color: i < 3 ? ["#f5c842","#c0c0c0","#cd7f32"][i] : "#94b8d8" }}>#{i+1}</td>
                <td className="px-5 py-3 text-xs text-white">{e.user.name}</td>
                <td className="px-5 py-3 text-xs text-[#94b8d8]">{e.user.email}</td>
                <td className="px-5 py-3 text-xs text-[#94b8d8]">{e.quizzesTaken}</td>
                <td className="px-5 py-3 text-xs font-bold" style={{ color: e.averageScorePercent >= 70 ? "#00d4aa" : "#f5c842" }}>{e.averageScorePercent.toFixed(1)}%</td>
              </tr>
            ))}
            {topScorers.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-[#4a7098] text-sm">No data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
