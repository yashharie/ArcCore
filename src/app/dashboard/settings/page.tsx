import { requireAuth } from "@/lib/auth/authorization";
import ProfileForm from "@/app/profile/ProfileForm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — ArcCore" };
export const instant = false;

export default async function MemberSettingsPage() {
  const user = await requireAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">Settings</h1>
        <p className="text-xs text-[#94b8d8] mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="arc-card p-6 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold"
            style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)", border: "2px solid rgba(77,184,255,0.4)", boxShadow: "0 0 20px rgba(77,184,255,0.1)" }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-white">{user.name}</p>
            <p className="text-xs text-[#94b8d8] mt-0.5">{user.email}</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: "rgba(77,184,255,0.12)", color: "#4db8ff", border: "1px solid rgba(77,184,255,0.2)" }}>
            Member
          </span>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {/* Profile */}
          <div className="arc-card p-6">
            <h2 className="text-sm font-bold text-white mb-1">Profile</h2>
            <p className="text-xs text-[#94b8d8] mb-4">Update your display name</p>
            <ProfileForm currentName={user.name} />
          </div>

          {/* Security */}
          <div className="arc-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(77,184,255,0.1)", border: "1px solid rgba(77,184,255,0.2)" }}>
                🔒
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white mb-0.5">Security</h2>
                <p className="text-xs text-[#94b8d8] mb-4">Keep your account safe with a strong password.</p>
                <Link href="/change-password" className="arc-btn text-xs">Change Password →</Link>
              </div>
            </div>
          </div>

          {/* Quick nav */}
          <div className="arc-card p-5">
            <h2 className="text-sm font-bold text-white mb-3">Quick Links</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/dashboard",            label: "Dashboard",  icon: "📊" },
                { href: "/dashboard/results",    label: "My Results", icon: "📈" },
                { href: "/dashboard/leaderboard",label: "Leaderboard",icon: "🏆" },
                { href: "/dashboard/quizzes",    label: "Quizzes",    icon: "📝" },
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
