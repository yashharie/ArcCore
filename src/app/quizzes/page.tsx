import Link from "next/link";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import QuizArchiveButton from "./QuizArchiveButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quizzes — ArcCore" };
export const instant = false;

export default async function QuizzesPage() {
  const user = await requireAuth();

  const where =
    user.role === "ADMIN"
      ? {}
      : {
          OR: [
            { createdById: user.id },
            {
              status: "PUBLISHED" as const,
              assignments: { some: { OR: [{ assignedToAll: true }, { userId: user.id }] } },
            },
          ],
        };

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT:     { bg: "rgba(245,200,66,0.12)",  color: "#f5c842",  label: "Draft" },
    PUBLISHED: { bg: "rgba(0,212,170,0.12)",   color: "#00d4aa",  label: "Live" },
    ARCHIVED:  { bg: "rgba(148,184,216,0.08)", color: "#94b8d8",  label: "Archived" },
  };

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-5xl mx-auto px-5 pt-20 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6 bg-[#f5c842]" />
              <span className="text-xs font-semibold tracking-widest text-[#f5c842] uppercase">Quiz Library</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Quizzes</h1>
            <p className="text-xs text-[#94b8d8] mt-0.5">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} available</p>
          </div>
          <Link href="/quizzes/new" className="arc-btn text-xs">
            <span>+</span> New Quiz
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="arc-card p-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-[#94b8d8] text-sm">No quizzes yet.</p>
            <Link href="/quizzes/new" className="arc-btn mt-4 text-xs inline-flex">Create your first quiz</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => {
              const s = statusStyle[q.status] ?? statusStyle.DRAFT;
              const canEdit = (q.createdById === user.id || user.role === "ADMIN") && q.status === "DRAFT";
              return (
                <div key={q.id} className="arc-card p-5 flex items-center gap-4 hover:border-[#4db8ff]/30 transition-colors">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                    style={{ background: "rgba(77,184,255,0.1)", border: "1px solid rgba(77,184,255,0.2)" }}>
                    📝
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white text-sm truncate">{q.title}</p>
                      <span className="arc-badge text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#94b8d8] mt-0.5">
                      {q._count.questions} question{q._count.questions !== 1 ? "s" : ""}
                      {q.timeLimitMinutes ? ` · ${q.timeLimitMinutes} min` : ""}
                      {q.deadline ? ` · Due ${new Date(q.deadline).toLocaleDateString()}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canEdit && (
                      <Link href={`/quizzes/${q.id}/edit`} className="arc-btn-outline text-xs px-3 py-1.5">Edit</Link>
                    )}
                    {q.status === "PUBLISHED" && (
                      <>
                        <Link href={`/quizzes/${q.id}/take`} className="arc-btn text-xs px-3 py-1.5">Take</Link>
                        <Link href={`/quizzes/${q.id}/leaderboard`}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-[#f5c842]"
                          title="Leaderboard">🏆</Link>
                      </>
                    )}
                    {q.status === "PUBLISHED" && (q.createdById === user.id || user.role === "ADMIN") && (
                      <QuizArchiveButton quizId={q.id} />
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
