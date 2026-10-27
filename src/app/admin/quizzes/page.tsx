// Admin > Quizzes — manage all quizzes

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quizzes — ArcCore Admin" };
export const instant = false;

export default async function AdminQuizzesPage() {
  await requireAdmin();

  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { questions: true, attempts: true } },
    },
  });

  const statusStyle: Record<string, { bg: string; color: string }> = {
    DRAFT:     { bg: "rgba(245,200,66,0.12)",  color: "#f5c842"  },
    PUBLISHED: { bg: "rgba(0,212,170,0.12)",   color: "#00d4aa"  },
    ARCHIVED:  { bg: "rgba(148,184,216,0.08)", color: "#94b8d8"  },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Quizzes</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">{quizzes.length} total quizzes</p>
        </div>
        <Link href="/quizzes/new" className="arc-btn text-xs">+ New Quiz</Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="arc-card p-16 text-center">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-[#94b8d8] text-sm">No quizzes yet.</p>
          <Link href="/quizzes/new" className="arc-btn mt-4 text-xs inline-flex">Create first quiz</Link>
        </div>
      ) : (
        <div className="arc-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(30,58,110,0.25)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
                {["Title", "Created By", "Status", "Questions", "Attempts", "Deadline", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#4db8ff] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q, i) => {
                const s = statusStyle[q.status] ?? statusStyle.DRAFT;
                return (
                  <tr key={q.id} style={{
                    borderBottom: "1px solid rgba(30,58,110,0.15)",
                    background: i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.2)"
                  }}>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-white truncate max-w-[200px]">{q.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{q.createdBy.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{q._count.questions}</td>
                    <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{q._count.attempts}</td>
                    <td className="px-5 py-3.5 text-xs text-[#4a7098]">
                      {q.deadline ? new Date(q.deadline).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        {q.status === "DRAFT" && (
                          <Link href={`/quizzes/${q.id}/edit`} className="text-[10px] px-2 py-1 rounded-full"
                            style={{ background: "rgba(245,200,66,0.08)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.15)" }}>
                            Edit
                          </Link>
                        )}
                        {q.status === "PUBLISHED" && (
                          <Link href={`/quizzes/${q.id}/leaderboard`} className="text-[10px] px-2 py-1 rounded-full"
                            style={{ background: "rgba(77,184,255,0.08)", color: "#4db8ff", border: "1px solid rgba(77,184,255,0.15)" }}>
                            Leaderboard
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
