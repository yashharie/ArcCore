import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Results — ArcCore" };
export const instant = false;

export default async function ResultsPage() {
  const user = await requireAuth();

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    include: { quiz: { select: { id: true, title: true } } },
    orderBy: { startedAt: "desc" },
  });

  const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    IN_PROGRESS: { bg: "rgba(245,200,66,0.12)", color: "#f5c842",  label: "In Progress" },
    SUBMITTED:   { bg: "rgba(0,212,170,0.12)",  color: "#00d4aa",  label: "Completed"   },
    TIMED_OUT:   { bg: "rgba(255,77,109,0.12)", color: "#ff4d6d",  label: "Timed Out"   },
  };

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-4xl mx-auto px-5 pt-20 pb-12">

        <div className="flex items-center justify-between pt-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6 bg-[#f5c842]" />
              <span className="text-xs font-semibold tracking-widest text-[#f5c842] uppercase">History</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">My Results</h1>
            <p className="text-xs text-[#94b8d8] mt-0.5">{attempts.length} attempt{attempts.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/quizzes" className="arc-btn-outline text-xs">Take a Quiz →</Link>
        </div>

        {attempts.length === 0 ? (
          <div className="arc-card p-16 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-[#94b8d8] text-sm">No quiz attempts yet.</p>
            <Link href="/quizzes" className="arc-btn mt-4 text-xs inline-flex">Take your first quiz</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => {
              const s = statusStyle[attempt.status];
              const pct = attempt.status === "SUBMITTED" && attempt.totalMarks > 0
                ? Math.round((attempt.score / attempt.totalMarks) * 100) : null;

              return (
                <div key={attempt.id} className="arc-card p-5 flex items-center gap-4 hover:border-[#4db8ff]/30 transition-colors">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                    {attempt.status === "SUBMITTED" ? "✓" : attempt.status === "TIMED_OUT" ? "⏱" : "▶"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{attempt.quiz.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      <span className="text-xs text-[#4a7098]">
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {pct !== null && (
                      <div className="text-right">
                        <p className="text-lg font-extrabold" style={{ color: pct >= 50 ? "#00d4aa" : "#ff4d6d" }}>{pct}%</p>
                        <p className="text-xs text-[#4a7098]">{attempt.score}/{attempt.totalMarks}</p>
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
    </div>
  );
}
