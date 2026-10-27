import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import ChangePasswordForm from "./ChangePasswordForm";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Change Password — ArcCore" };
export const instant = false;

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.mustChangePassword) redirect("/dashboard");

  return (
    <div className="min-h-screen flex" style={{ background: "#050c1a" }}>
      {/* Left — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(77,184,255,0.05)" }} />

        <div className="w-full max-w-sm relative">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.svg" alt="ArcCore" width={56} height={56} priority className="mb-3" />
            <h1 className="text-xl font-extrabold text-white">
              <span style={{ color: "#f5c842" }}>Arc</span>
              <span style={{ color: "#4db8ff" }}>Core</span>
            </h1>
          </div>

          <div className="arc-card p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.2)" }}>
                🔑
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Set Your Password</h2>
                <p className="text-xs text-[#94b8d8]">Hi {user.name.split(" ")[0]}, please set a personal password</p>
              </div>
            </div>
            <ChangePasswordForm isFirstTime />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <Image
          src="/Cinematic Floating Arc Reactor.png"
          alt="ArcCore"
          fill
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right,#050c1a 0%,transparent 30%)" }} />
        <div className="relative z-10 text-center px-8">
          <p className="text-2xl font-extrabold text-white leading-tight">
            Your journey<br />
            <span style={{ color: "#f5c842" }}>starts here.</span>
          </p>
          <p className="text-sm text-[#94b8d8] mt-2">Set a strong password to secure your account</p>
        </div>
      </div>
    </div>
  );
}
