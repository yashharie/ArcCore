import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import MarkCompleteButton from "./MarkCompleteButton";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }
export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const topic = await prisma.topic.findUnique({ where: { id }, select: { title: true } });
  return { title: topic ? `${topic.title} — ArcCore` : "Topic — ArcCore" };
}

export default async function TopicPage({ params }: PageProps) {
  const user = await requireAuth();
  const { id } = await params;

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } }, _count: { select: { topicProgress: true } } },
  });

  if (!topic) notFound();
  if (user.role !== "ADMIN" && !topic.published && topic.authorId !== user.id) notFound();

  const progressEntry = await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId: user.id, topicId: id } },
    create: { userId: user.id, topicId: id, completed: false, viewedAt: new Date() },
    update: { viewedAt: new Date() },
  });

  const isOwner = topic.authorId === user.id || user.role === "ADMIN";
  const lines = topic.content.split("\n");

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-3xl mx-auto px-5 pt-20 pb-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#4a7098] pt-4 mb-6">
          <Link href="/topics" className="text-[#4db8ff] hover:underline">Topics</Link>
          <span>/</span>
          <span className="text-[#94b8d8] truncate">{topic.title}</span>
        </div>

        {/* Header card */}
        <div className="arc-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-32 opacity-20">
            <img src="/city-hero.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-40" style={{ background: "linear-gradient(to right,#0a1628,transparent)" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {!topic.published && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "rgba(245,200,66,0.12)", color: "#f5c842" }}>Draft</span>
              )}
              {progressEntry.completed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "rgba(0,212,170,0.12)", color: "#00d4aa" }}>✓ Completed</span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-white mb-2">{topic.title}</h1>
            {topic.description && <p className="text-sm text-[#94b8d8] mb-4">{topic.description}</p>}
            <div className="flex items-center gap-4 text-xs text-[#4a7098]">
              <span>By {topic.author.name}</span>
              <span>·</span>
              <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
              <span>·</span>
              <span>{topic._count.topicProgress} views</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="arc-card p-8 mb-6">
          <div className="space-y-2">
            {lines.map((line, i) => {
              if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold text-white mt-5 mb-2">{line.slice(4)}</h3>;
              if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-extrabold text-white mt-6 mb-3">{line.slice(3)}</h2>;
              if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-extrabold text-white mt-6 mb-3" style={{ color: "#4db8ff" }}>{line.slice(2)}</h1>;
              if (line.startsWith("- ") || line.startsWith("* ")) return (
                <li key={i} className="ml-4 text-sm text-[#94b8d8] list-disc leading-relaxed">{line.slice(2)}</li>
              );
              if (line.trim() === "") return <div key={i} className="h-2" />;
              return <p key={i} className="text-sm text-[#94b8d8] leading-relaxed">{line}</p>;
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/topics" className="arc-btn-outline text-xs">← Back to Topics</Link>
            {isOwner && (
              <Link href={`/topics/${topic.id}/edit`} className="arc-btn-outline text-xs">Edit</Link>
            )}
          </div>
          <MarkCompleteButton topicId={topic.id} initialCompleted={progressEntry.completed} />
        </div>
      </div>
    </div>
  );
}
