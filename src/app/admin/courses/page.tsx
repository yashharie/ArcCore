// Admin > Courses — shows all topics with admin controls

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Courses — ArcCore Admin" };
export const instant = false;

export default async function AdminCoursesPage() {
  await requireAdmin();

  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { topicProgress: true, quizzes: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Courses</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">{topics.length} total topics</p>
        </div>
        <Link href="/topics/new" className="arc-btn text-xs">+ New Course</Link>
      </div>

      {topics.length === 0 ? (
        <div className="arc-card p-16 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-[#94b8d8] text-sm">No topics yet.</p>
          <Link href="/topics/new" className="arc-btn mt-4 text-xs inline-flex">Create first topic</Link>
        </div>
      ) : (
        <div className="arc-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(30,58,110,0.25)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
                {["Title", "Author", "Status", "Views", "Quizzes", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#4db8ff] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map((t, i) => (
                <tr key={t.id} style={{
                  borderBottom: "1px solid rgba(30,58,110,0.15)",
                  background: i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.2)"
                }}>
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-white truncate max-w-[200px]">{t.title}</p>
                    {t.description && <p className="text-[10px] text-[#4a7098] mt-0.5 truncate max-w-[200px]">{t.description}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{t.author.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={t.published
                        ? { background: "rgba(0,212,170,0.12)", color: "#00d4aa" }
                        : { background: "rgba(245,200,66,0.12)", color: "#f5c842" }}>
                      {t.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{t._count.topicProgress}</td>
                  <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{t._count.quizzes}</td>
                  <td className="px-5 py-3.5 text-xs text-[#4a7098]">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <Link href={`/topics/${t.id}`} className="text-[10px] px-2 py-1 rounded-full"
                        style={{ background: "rgba(77,184,255,0.08)", color: "#4db8ff", border: "1px solid rgba(77,184,255,0.15)" }}>
                        View
                      </Link>
                      <Link href={`/topics/${t.id}/edit`} className="text-[10px] px-2 py-1 rounded-full"
                        style={{ background: "rgba(245,200,66,0.08)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.15)" }}>
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
