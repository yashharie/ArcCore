import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";
import AdminUserTable from "./AdminUserTable";

export const metadata: Metadata = { title: "Admin — ArcCore" };
export const instant = false;

export default async function AdminPage() {
  const user = await requireAdmin();

  const [userCount, quizCount, examCount, topicCount, attemptCount, users] =
    await Promise.all([
      prisma.user.count(),
      prisma.quiz.count(),
      prisma.exam.count(),
      prisma.topic.count(),
      prisma.attempt.count({ where: { status: "SUBMITTED" } }),
      prisma.user.findMany({
        select: {
          id: true, name: true, email: true, role: true,
          mustChangePassword: true, createdAt: true,
          _count: { select: { attempts: true, topics: true, quizzesCreated: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const stats = [
    { label: "Total Members", value: userCount, icon: "👥", color: "#4db8ff" },
    { label: "Total Quizzes",  value: quizCount, icon: "📝", color: "#f5c842" },
    { label: "Total Exams",    value: examCount,  icon: "📋", color: "#00d4aa" },
    { label: "Topics Created", value: topicCount, icon: "📚", color: "#4db8ff" },
    { label: "Submissions",    value: attemptCount, icon: "🎯", color: "#f5c842" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-7xl mx-auto px-5 pt-20 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between pt-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6 bg-[#f5c842]" />
              <span className="text-xs font-semibold tracking-widest text-[#f5c842] uppercase">Admin Panel</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
            <p className="text-xs text-[#94b8d8] mt-0.5">Manage your platform</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: "rgba(77,184,255,0.12)", color: "#4db8ff", border: "1px solid rgba(77,184,255,0.2)" }}>
            🛡️ Admin
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="arc-card p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[#94b8d8] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { href: "/quizzes/new", icon: "📝", label: "New Quiz" },
            { href: "/exams/new",   icon: "📋", label: "New Exam" },
            { href: "/topics/new",  icon: "📚", label: "New Topic" },
            { href: "/exams",       icon: "🗓️", label: "View Exams" },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="arc-card p-4 flex items-center gap-3 hover:border-[#4db8ff]/40 transition-colors">
              <span className="text-xl">{a.icon}</span>
              <span className="text-sm font-semibold text-white">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* User table */}
        <div className="arc-card overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
            <div>
              <h2 className="text-sm font-bold text-white">Member Management</h2>
              <p className="text-xs text-[#94b8d8]">{users.length} total members</p>
            </div>
          </div>
          <AdminUserTable users={users} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}
