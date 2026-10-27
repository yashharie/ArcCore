// Admin > Exams — manage all exams

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Exams — ArcCore Admin" };
export const instant = false;

export default async function AdminExamsPage() {
  await requireAdmin();

  const exams = await prisma.exam.findMany({
    orderBy: { scheduledAt: "asc" },
    include: {
      createdBy: { select: { name: true } },
      examQuizzes: { select: { id: true } },
    },
  });

  const statusStyle: Record<string, { bg: string; color: string }> = {
    SCHEDULED:  { bg: "rgba(77,184,255,0.12)",  color: "#4db8ff" },
    ONGOING:    { bg: "rgba(0,212,170,0.12)",   color: "#00d4aa" },
    COMPLETED:  { bg: "rgba(148,184,216,0.08)", color: "#94b8d8" },
    CANCELLED:  { bg: "rgba(255,77,109,0.1)",   color: "#ff4d6d" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Exams</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">{exams.length} total exams</p>
        </div>
        <Link href="/exams/new" className="arc-btn text-xs">+ New Exam</Link>
      </div>

      {exams.length === 0 ? (
        <div className="arc-card p-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-[#94b8d8] text-sm">No exams scheduled yet.</p>
          <Link href="/exams/new" className="arc-btn mt-4 text-xs inline-flex">Schedule first exam</Link>
        </div>
      ) : (
        <div className="arc-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(30,58,110,0.25)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
                {["Title", "Status", "Scheduled", "Duration", "Quizzes", "Marks", "Created By", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#4db8ff] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, i) => {
                const s = statusStyle[exam.status] ?? statusStyle.SCHEDULED;
                return (
                  <tr key={exam.id} style={{
                    borderBottom: "1px solid rgba(30,58,110,0.15)",
                    background: i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.2)"
                  }}>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-white truncate max-w-[180px]">{exam.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#94b8d8]">
                      {new Date(exam.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{exam.duration} min</td>
                    <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{exam.examQuizzes.length}</td>
                    <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{exam.totalMarks}</td>
                    <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{exam.createdBy.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <Link href={`/exams/${exam.id}`} className="text-[10px] px-2 py-1 rounded-full"
                          style={{ background: "rgba(77,184,255,0.08)", color: "#4db8ff", border: "1px solid rgba(77,184,255,0.15)" }}>
                          View
                        </Link>
                        <Link href={`/exams/${exam.id}/edit`} className="text-[10px] px-2 py-1 rounded-full"
                          style={{ background: "rgba(245,200,66,0.08)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.15)" }}>
                          Edit
                        </Link>
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
