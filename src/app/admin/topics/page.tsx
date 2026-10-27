// Admin > Content — published topics content management

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Content — ArcCore Admin" };
export const instant = false;

export default async function AdminTopicsPage() {
  await requireAdmin();

  const topics = await prisma.topic.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { topicProgress: true } },
    },
  });

  const published = topics.filter((t) => t.published);
  const drafts = topics.filter((t) => !t.published);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Content</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">{published.length} published · {drafts.length} drafts</p>
        </div>
        <Link href="/topics/new" className="arc-btn text-xs">+ New Content</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Content", value: topics.length, color: "#4db8ff" },
          { label: "Published",     value: published.length, color: "#00d4aa" },
          { label: "Drafts",        value: drafts.length, color: "#f5c842" },
        ].map((s) => (
          <div key={s.label} className="arc-card p-4">
            <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#94b8d8] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="arc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(30,58,110,0.25)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
              {["Title", "Author", "Status", "Views", "Updated", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#4db8ff] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-[#4a7098] text-sm">No content yet.</td></tr>
            ) : topics.map((t, i) => (
              <tr key={t.id} style={{
                borderBottom: "1px solid rgba(30,58,110,0.15)",
                background: i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.2)"
              }}>
                <td className="px-5 py-3.5">
                  <p className="text-xs font-semibold text-white truncate max-w-[220px]">{t.title}</p>
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
                <td className="px-5 py-3.5 text-xs text-[#4a7098]">{new Date(t.updatedAt).toLocaleDateString()}</td>
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
    </div>
  );
}
