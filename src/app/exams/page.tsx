import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Exams — ArcCore" };
export const instant = false;

export default async function ExamsPage() {
  const user = await requireAuth();

  const where =
    user.role === "ADMIN"
      ? {}
      : { status: { in: ["SCHEDULED", "ONGOING", "COMPLETED"] as ("SCHEDULED" | "ONGOING" | "COMPLETED")[] } };

  const exams = await prisma.exam.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      createdBy: { select: { name: true } },
      examQuizzes: {
        include: { quiz: { select: { id: true, title: true, _count: { select: { questions: true } } } } },
        orderBy: { order: "asc" },
      },
    },
  });

  const statusStyle: Record<string, { bg: string; color: string }> = {
    SCHEDULED:  { bg: "rgba(77,184,255,0.12)",  color: "#4db8ff"  },
    ONGOING:    { bg: "rgba(0,212,170,0.12)",   color: "#00d4aa"  },
    COMPLETED:  { bg: "rgba(148,184,216,0.08)", color: "#94b8d8"  },
    CANCELLED:  { bg: "rgba(255,77,109,0.1)",   color: "#ff4d6d"  },
  };

  const now = new Date();

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-5xl mx-auto px-5 pt-20 pb-12">

        <div className="flex items-center justify-between pt-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6 bg-[#f5c842]" />
              <span className="text-xs font-semibold tracking-widest text-[#f5c842] uppercase">Examinations</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Exams</h1>
            <p className="text-xs text-[#94b8d8] mt-0.5">Group assessments scheduled by admins</p>
          </div>
          {user.role === "ADMIN" && (
            <Link href="/exams/new" className="arc-btn text-xs">+ New Exam</Link>
          )}
        </div>

        {exams.length === 0 ? (
          <div className="arc-card p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-[#94b8d8] text-sm">No exams scheduled yet.</p>
            {user.role === "ADMIN" && (
              <Link href="/exams/new" className="arc-btn mt-4 text-xs inline-flex">Schedule an exam</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const s = statusStyle[exam.status] ?? statusStyle.SCHEDULED;
              const isPast = new Date(exam.scheduledAt) < now;

              return (
                <div key={exam.id} className="arc-card p-6 hover:border-[#4db8ff]/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                          style={{ background: s.bg, color: s.color }}>{exam.status}</span>
                        {isPast && exam.status === "SCHEDULED" && (
                          <span className="text-[10px] text-[#f5c842]">Overdue</span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-white">{exam.title}</h2>
                      {exam.description && (
                        <p className="text-xs text-[#94b8d8] mt-1">{exam.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#4a7098]">
                        <span>📅 {new Date(exam.scheduledAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <span>⏱️ {exam.duration} min</span>
                        <span>📊 {exam.totalMarks} marks</span>
                        <span>By {exam.createdBy.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/exams/${exam.id}`} className="arc-btn-outline text-xs px-3 py-1.5">Details</Link>
                      {user.role === "ADMIN" && (
                        <Link href={`/exams/${exam.id}/edit`} className="arc-btn text-xs px-3 py-1.5">Manage</Link>
                      )}
                    </div>
                  </div>

                  {exam.examQuizzes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-[#4a7098] mb-2">{exam.examQuizzes.length} quiz{exam.examQuizzes.length !== 1 ? "zes" : ""}</p>
                      <div className="flex flex-wrap gap-2">
                        {exam.examQuizzes.map((eq) => (
                          <span key={eq.id} className="text-xs px-2.5 py-1 rounded-full"
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
    </div>
  );
}
