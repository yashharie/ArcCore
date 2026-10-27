// Admin > Settings — admin profile & security settings

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/app/profile/ProfileForm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — ArcCore Admin" };
export const instant = false;

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

  const stats = await prisma.user.findUnique({
    where: { id: user.id },
    select: { createdAt: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">Settings</h1>
        <p className="text-xs text-[#94b8d8] mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile card */}
        <div className="arc-card p-6 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold"
              style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)", border: "2px solid rgba(245,200,66,0.5)", boxShadow: "0 0 20px rgba(245,200,66,0.15)" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#f5c842", color: "#050c1a" }}>A</div>
          </div>
          <div>
            <p className="font-bold text-white">{user.name}</p>
            <p className="text-xs text-[#94b8d8] mt-0.5">{user.email}</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: "rgba(245,200,66,0.12)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.2)" }}>
            🛡️ Administrator
          </span>
          {stats?.createdAt && (
            <p className="text-xs text-[#4a7098]">
              Admin since {new Date(stats.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Settings panels */}
        <div className="lg:col-span-2 space-y-5">

          {/* Profile */}
          <div className="arc-card p-6">
            <h2 className="text-sm font-bold text-white mb-1">Profile</h2>
            <p className="text-xs text-[#94b8d8] mb-4">Update your display name</p>
            <ProfileForm currentName={user.name} />
          </div>

          {/* Security */}
          <div className="arc-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white mb-1">Security Settings</h2>
                <p className="text-xs text-[#94b8d8] mb-4">
                  Change your password, manage your account security and keep your data safe.
                </p>
                <Link href="/change-password" className="arc-btn text-xs">Change Password →</Link>
              </div>
              <div className="arc-card p-4 text-center shrink-0" style={{ border: "1px solid rgba(77,184,255,0.2)" }}>
                <div className="text-2xl mb-1">🔒</div>
                <p className="text-[10px] text-[#94b8d8] font-medium">Your security<br/>matters</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-[#4a7098]">🛡️ Industry-standard encryption protects your account.</p>
            </div>
          </div>

          {/* Platform settings */}
          <div className="arc-card p-6">
            <h2 className="text-sm font-bold text-white mb-4">Platform Quick Links</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/admin",              label: "Dashboard",   icon: "📊" },
                { href: "/admin/users",         label: "Manage Users",icon: "👥" },
                { href: "/admin/reports",       label: "Reports",     icon: "📈" },
                { href: "/admin/leaderboard",   label: "Leaderboard", icon: "🏆" },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-2.5 p-3 rounded-xl hover:border-[#4db8ff]/30 transition-colors"
                  style={{ background: "rgba(10,22,40,0.5)", border: "1px solid rgba(30,58,110,0.3)" }}>
                  <span>{l.icon}</span>
                  <span className="text-xs font-medium text-white">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
