import Link from "next/link";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Topics — ArcCore" };
export const instant = false;

export default async function TopicsPage() {
  const user = await requireAuth();

  const where =
    user.role === "ADMIN"
      ? {}
      : { OR: [{ published: true }, { authorId: user.id }] };

  const topics = await prisma.topic.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { topicProgress: true } },
    },
  });

  const progress = await prisma.topicProgress.findMany({
    where: { userId: user.id },
    select: { topicId: true, completed: true },
  });
  const progressMap = new Map(progress.map((p) => [p.topicId, p.completed]));

  const categoryIcons = ["🌐", "🎨", "💼", "🐍", "📐", "🤝", "⚛️", "🔐", "📊", "🎯"];

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-6xl mx-auto px-5 pt-20 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between pt-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6 bg-[#f5c842]" />
              <span className="text-xs font-semibold tracking-widest text-[#f5c842] uppercase">Learning Library</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Explore Topics</h1>
            <p className="text-xs text-[#94b8d8] mt-0.5">
              Build your skills with structured learning paths
            </p>
          </div>
          <Link href="/topics/new" className="arc-btn text-xs">+ New Topic</Link>
        </div>

        {topics.length === 0 ? (
          <div className="arc-card p-16 text-center">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-[#94b8d8] text-sm">No topics yet.</p>
            <Link href="/topics/new" className="arc-btn mt-4 text-xs inline-flex">Create your first topic</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, idx) => {
              const isComplete = progressMap.get(topic.id);
              const hasViewed = progressMap.has(topic.id);
              const isOwner = topic.authorId === user.id || user.role === "ADMIN";
              const icon = categoryIcons[idx % categoryIcons.length];

              return (
                <div key={topic.id} className="arc-card p-0 overflow-hidden flex flex-col group hover:border-[#4db8ff]/40 transition-all">
                  {/* Card image area */}
                  <div className="h-32 relative flex items-center justify-center overflow-hidden"
                    style={{ background: "linear-gradient(135deg,#0d1e35,#0a1628)" }}>
                    <div className="absolute inset-0 opacity-20">
                      <img src="/city-hero.png" alt="" className="w-full h-full object-cover object-center" />
                    </div>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,transparent,#0a1628)" }} />
                    <span className="relative text-5xl z-10 group-hover:scale-110 transition-transform">{icon}</span>

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {!topic.published && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(245,200,66,0.2)", color: "#f5c842" }}>Draft</span>
                      )}
                      {isComplete && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(0,212,170,0.2)", color: "#00d4aa" }}>✓ Completed</span>
                      )}
                      {!isComplete && hasViewed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(77,184,255,0.15)", color: "#4db8ff" }}>Viewed</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="font-semibold text-white text-sm line-clamp-1">{topic.title}</h3>
                      {topic.description && (
                        <p className="text-xs text-[#94b8d8] mt-0.5 line-clamp-2">{topic.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#4a7098] mt-auto">
                      <span>By {topic.author.name}</span>
                      <span>{topic._count.topicProgress} views</span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/topics/${topic.id}`} className="arc-btn text-xs flex-1 justify-center py-1.5">
                        Read
                      </Link>
                      {isOwner && (
                        <Link href={`/topics/${topic.id}/edit`} className="arc-btn-outline text-xs px-3 py-1.5">
                          Edit
                        </Link>
                      )}
                    </div>
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
