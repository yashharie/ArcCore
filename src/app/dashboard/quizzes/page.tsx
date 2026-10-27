import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quizzes — ArcCore" };
export const instant = false;

export default async function MemberQuizzesPage() {
  const user = await requireAuth();

  const quizzes = await prisma.quiz.findMany({
    where: {
      status: "PUBLISHED",
      assignments: { some: { OR: [{ assignedToAll: true }, { userId: user.id }] } },
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, attempts: true } } },
  });

  // Get user's existing attempts
  const myAttempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    select: { quizId: true, status: true, score: true, totalMarks: true },
  });
  const attemptMap = new Map(myAttempts.map((a) => [a.quizId, a]));

  const ICONS = ["🌐", "⚛️", "📐", "🎨", "🐍", "💼", "🔐", "📊"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Quizzes</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">{quizzes.length} available quizzes</p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="arc-card p-16 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-[#94b8d8] text-sm">No quizzes available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((q, i) => {
            const attempt = attemptMap.get(q.id);
            const done    = attempt?.status === "SUBMITTED";
            const pct     = done && attempt.totalMarks > 0
              ? Math.round((attempt.score / attempt.totalMarks) * 100) : null;

            return (
              <div key={q.id} className="arc-card p-5 flex flex-col gap-4 hover:border-[#4db8ff]/30 transition-colors">
                {/* Icon + title */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: "rgba(77,184,255,0.1)", border: "1px solid rgba(77,184,255,0.15)" }}>
                    {ICONS[i % ICONS.length]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{q.title}</p>
                    <p className="text-xs text-[#94b8d8] mt-0.5">
                      {q._count.questions} questions
                      {q.timeLimitMinutes ? ` · ${q.timeLimitMinutes} min` : ""}
                    </p>
                  </div>
                  {done && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                      style={{ background: "rgba(0,212,170,0.12)", color: "#00d4aa" }}>Done</span>
                  )}
                </div>

                {/* Score if done */}
                {pct !== null && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#94b8d8]">Your score</span>
                      <span className="font-bold" style={{ color: pct >= 70 ? "#00d4aa" : pct >= 50 ? "#f5c842" : "#ff4d6d" }}>{pct}%</span>
                    </div>
                    <div className="arc-progress">
                      <div className="arc-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  {!done ? (
                    <Link href={`/quizzes/${q.id}/take`} className="arc-btn text-xs flex-1 justify-center py-2">
                      Start Quiz →
                    </Link>
                  ) : (
                    <>
                      <Link href={`/quizzes/${q.id}/leaderboard`} className="arc-btn-outline text-xs flex-1 justify-center py-2">
                        🏆 Leaderboard
                      </Link>
                      <span className="arc-btn text-xs flex-1 justify-center py-2 opacity-40 cursor-not-allowed"
                        style={{ pointerEvents: "none" }}>Completed</span>
                    </>
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
