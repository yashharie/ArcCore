import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community — ArcCore" };
export const instant = false;

export default async function MemberExamsPage() {
  const user = await requireAuth();

  const exams = await prisma.exam.findMany({
    where: { status: { in: ["SCHEDULED", "ONGOING", "COMPLETED"] } },
    orderBy: { scheduledAt: "asc" },
    include: {
      createdBy: { select: { name: true } },
      examQuizzes: { include: { quiz: { select: { id: true, title: true, _count: { select: { questions: true } } } } }, orderBy: { order: "asc" } },
    },
  });

  const statusStyle: Record<string, { bg: string; color: string }> = {
    SCHEDULED: { bg: "rgba(77,184,255,0.12)",  color: "#4db8ff" },
    ONGOING:   { bg: "rgba(0,212,170,0.12)",   color: "#00d4aa" },
    COMPLETED: { bg: "rgba(148,184,216,0.08)", color: "#94b8d8" },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">Community</h1>
        <p className="text-xs text-[#94b8d8] mt-0.5">Group exams and scheduled assessments</p>
      </div>

      {exams.length === 0 ? (
        <div className="arc-card p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#94b8d8] text-sm">No exams scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const s = statusStyle[exam.status] ?? statusStyle.SCHEDULED;
            return (
              <div key={exam.id} className="arc-card p-6 hover:border-[#4db8ff]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                        style={{ background: s.bg, color: s.color }}>{exam.status}</span>
                    </div>
                    <h2 className="text-base font-bold text-white">{exam.title}</h2>
                    {exam.description && <p className="text-xs text-[#94b8d8] mt-1">{exam.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#4a7098]">
                      <span>📅 {new Date(exam.scheduledAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>⏱️ {exam.duration} min</span>
                      <span>📊 {exam.totalMarks} marks</span>
                    </div>
                  </div>
                  <Link href={`/exams/${exam.id}`} className="arc-btn-outline text-xs px-3 py-1.5 shrink-0">Details</Link>
                </div>
                {exam.examQuizzes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-[#4a7098] mb-2">{exam.examQuizzes.length} quiz{exam.examQuizzes.length !== 1 ? "zes" : ""}</p>
                    <div className="flex flex-wrap gap-2">
                      {exam.examQuizzes.map((eq) => (
                        <span key={eq.id} className="text-[10px] px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(77,184,255,0.08)", border: "1px solid rgba(77,184,255,0.15)", color: "#94b8d8" }}>
                          {eq.quiz.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
