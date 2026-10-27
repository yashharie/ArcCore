import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Results — ArcCore" };
export const instant = false;

export default async function MemberResultsPage() {
  const user = await requireAuth();

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    include: { quiz: { select: { id: true, title: true } } },
    orderBy: { startedAt: "desc" },
  });

  const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    IN_PROGRESS: { bg: "rgba(245,200,66,0.12)",  color: "#f5c842", label: "In Progress" },
    SUBMITTED:   { bg: "rgba(0,212,170,0.12)",   color: "#00d4aa", label: "Completed"   },
    TIMED_OUT:   { bg: "rgba(255,77,109,0.12)",  color: "#ff4d6d", label: "Timed Out"   },
  };

  const submitted = attempts.filter((a) => a.status === "SUBMITTED");
  const totalScore = submitted.reduce((s, a) => s + a.score, 0);
  const totalMax   = submitted.reduce((s, a) => s + a.totalMarks, 0);
  const avgScore   = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">My Results</h1>
        <p className="text-xs text-[#94b8d8] mt-0.5">{attempts.length} total attempts · {avgScore}% average score</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Completed",   value: submitted.length,           color: "#00d4aa" },
          { label: "Avg Score",   value: `${avgScore}%`,             color: "#4db8ff" },
          { label: "Total Points",value: totalScore,                 color: "#f5c842" },
        ].map((s) => (
          <div key={s.label} className="arc-card p-4 text-center">
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#94b8d8] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {attempts.length === 0 ? (
        <div className="arc-card p-16 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-[#94b8d8] text-sm mb-4">No quiz attempts yet.</p>
          <Link href="/dashboard/quizzes" className="arc-btn text-xs inline-flex">Take your first quiz</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt) => {
            const s   = statusStyle[attempt.status];
            const pct = attempt.status === "SUBMITTED" && attempt.totalMarks > 0
              ? Math.round((attempt.score / attempt.totalMarks) * 100) : null;
            return (
              <div key={attempt.id} className="arc-card p-5 flex items-center gap-4 hover:border-[#4db8ff]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                  {attempt.status === "SUBMITTED" ? "✓" : attempt.status === "TIMED_OUT" ? "⏱" : "▶"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{attempt.quiz.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    <span className="text-[10px] text-[#4a7098]">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {pct !== null && (
                    <div className="text-right">
                      <p className="text-lg font-extrabold"
                        style={{ color: pct >= 70 ? "#00d4aa" : pct >= 50 ? "#f5c842" : "#ff4d6d" }}>{pct}%</p>
                      <p className="text-[10px] text-[#4a7098]">{attempt.score}/{attempt.totalMarks}</p>
                    </div>
                  )}
                  {attempt.status === "SUBMITTED" && (
                    <Link href={`/results/${attempt.id}`} className="arc-btn text-xs px-3 py-1.5">Review</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
