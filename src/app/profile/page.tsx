import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/authorization";
import ProfileForm from "./ProfileForm";
import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata: Metadata = { title: "Profile — ArcCore" };
export const instant = false;

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen" style={{ background: "#050c1a" }}>
      <Nav user={user} />
      <div className="max-w-3xl mx-auto px-5 pt-20 pb-12">

        <div className="pt-4 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-6 bg-[#f5c842]" />
            <span className="text-xs font-semibold tracking-widest text-[#f5c842] uppercase">Account</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Profile Settings</h1>
          <p className="text-xs text-[#94b8d8] mt-0.5">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Avatar card */}
          <div className="arc-card p-6 flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold"
                style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)", border: "2px solid rgba(77,184,255,0.4)", boxShadow: "0 0 20px rgba(77,184,255,0.15)" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                style={{ background: user.role === "ADMIN" ? "#f5c842" : "#4db8ff", color: "#050c1a" }}>
                {user.role === "ADMIN" ? "A" : "M"}
              </div>
            </div>
            <div>
              <p className="font-bold text-white text-sm">{user.name}</p>
              <p className="text-xs text-[#94b8d8] mt-0.5">{user.email}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{
                background: user.role === "ADMIN" ? "rgba(245,200,66,0.12)" : "rgba(77,184,255,0.12)",
                color: user.role === "ADMIN" ? "#f5c842" : "#4db8ff",
                border: `1px solid ${user.role === "ADMIN" ? "rgba(245,200,66,0.2)" : "rgba(77,184,255,0.2)"}`,
              }}>
              {user.role}
            </span>
            <p className="text-xs text-[#4a7098]">
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </p>
          </div>

          {/* Settings cards */}
          <div className="md:col-span-2 space-y-5">

            {/* Update name */}
            <div className="arc-card p-6">
              <h2 className="text-sm font-bold text-white mb-1">Display Name</h2>
              <p className="text-xs text-[#94b8d8] mb-4">Update how your name appears across ArcCore</p>
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
                  <h2 className="text-sm font-bold text-white mb-0.5">Security Settings</h2>
                  <p className="text-xs text-[#94b8d8] mb-4">
                    Change your password, manage your account security and keep your data safe.
                  </p>
                  <Link href="/change-password" className="arc-btn text-xs">
                    Change Password →
                  </Link>
                </div>
                {/* Mini city image accent */}
                <div className="hidden sm:block w-20 h-16 rounded-lg overflow-hidden opacity-50 shrink-0">
                  <img src="/city-hero.png" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-[#4a7098] flex items-center gap-1.5">
                  <span>🛡️</span>
                  We use industry-standard encryption to keep your account safe.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
