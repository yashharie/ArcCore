import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Courses — ArcCore" };
export const instant = false;

const ICONS = ["🌐", "⚛️", "📐", "🎨", "🐍", "💼", "🔐", "📊", "🔬", "🏗️", "🎯", "🌿"];

export default async function MemberTopicsPage() {
  const user = await requireAuth();

  const topics = await prisma.topic.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { topicProgress: true } },
    },
  });

  const progress = await prisma.topicProgress.findMany({
    where: { userId: user.id },
    select: { topicId: true, completed: true },
  });
  const progressMap = new Map(progress.map((p) => [p.topicId, p.completed]));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Courses</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">{topics.length} published courses</p>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="arc-card p-16 text-center">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-[#94b8d8] text-sm">No courses published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t, i) => {
            const completed = progressMap.get(t.id);
            const viewed    = progressMap.has(t.id);
            return (
              <div key={t.id} className="arc-card overflow-hidden flex flex-col hover:border-[#4db8ff]/30 transition-colors">
                {/* Top image area */}
                <div className="h-28 relative flex items-center justify-center overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#0d1e35,#0a1628)" }}>
                  <div className="absolute inset-0 opacity-20">
                    <img src="/city-hero.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,transparent,#0a1628)" }} />
                  <span className="relative text-5xl z-10">{ICONS[i % ICONS.length]}</span>
                  <div className="absolute top-2 left-2 flex gap-1">
                    {completed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(0,212,170,0.2)", color: "#00d4aa" }}>✓ Done</span>
                    )}
                    {!completed && viewed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(77,184,255,0.15)", color: "#4db8ff" }}>Viewed</span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="font-bold text-white text-sm line-clamp-1">{t.title}</p>
                    {t.description && (
                      <p className="text-xs text-[#94b8d8] mt-0.5 line-clamp-2">{t.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#4a7098]">
                    <span>By {t.author.name}</span>
                    <span>{t._count.topicProgress} views</span>
                  </div>
                  <Link href={`/topics/${t.id}`} className="arc-btn text-xs justify-center py-1.5">
                    {viewed ? "Continue Reading" : "Start Reading"} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
