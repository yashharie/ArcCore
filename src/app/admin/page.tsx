// Admin Dashboard — User management, platform stats, exam management

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";
import AdminUserTable from "./AdminUserTable";

export const metadata: Metadata = {
  title: "Admin Dashboard — ArcCore",
  description: "ArcCore admin panel for managing users, quizzes, and exams.",
};

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
          id: true,
          name: true,
          email: true,
          role: true,
          mustChangePassword: true,
          createdAt: true,
          _count: {
            select: { attempts: true, topics: true, quizzesCreated: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const stats = [
    { label: "Total Users", value: userCount, color: "indigo", icon: "👥" },
    { label: "Total Quizzes", value: quizCount, color: "green", icon: "📝" },
    { label: "Total Exams", value: examCount, color: "purple", icon: "📋" },
    { label: "Topics Created", value: topicCount, color: "blue", icon: "📚" },
    { label: "Quiz Submissions", value: attemptCount, color: "yellow", icon: "🎯" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage users, quizzes, topics, and exams.
            </p>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            🛡️ Admin
          </span>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl p-5 ${colorBg(s.color)}`}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className={`text-2xl font-bold ${colorText(s.color)}`}>
                {s.value}
              </p>
              <p className={`text-xs mt-0.5 opacity-75 ${colorText(s.color)}`}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <AdminAction href="/quizzes/new" icon="📝" label="New Quiz" />
          <AdminAction href="/exams/new" icon="📋" label="New Exam" />
          <AdminAction href="/topics/new" icon="📚" label="New Topic" />
          <AdminAction href="/exams" icon="🗓️" label="View Exams" />
        </div>

        {/* User Management Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              User Management
            </h2>
            <span className="text-xs text-gray-400">{users.length} total users</span>
          </div>
          <AdminUserTable users={users} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}

function colorBg(color: string) {
  const map: Record<string, string> = {
    indigo: "bg-indigo-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    blue: "bg-blue-50",
    yellow: "bg-yellow-50",
  };
  return map[color] ?? "bg-gray-50";
}

function colorText(color: string) {
  const map: Record<string, string> = {
    indigo: "text-indigo-700",
    green: "text-green-700",
    purple: "text-purple-700",
    blue: "text-blue-700",
    yellow: "text-yellow-700",
  };
  return map[color] ?? "text-gray-700";
}

function AdminAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </Link>
  );
}
