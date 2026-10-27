import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign In — ArcCore" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "#050c1a" }}>
      {/* Left — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] pointer-events-none"
          style={{ background: "rgba(77,184,255,0.06)" }} />

        <div className="w-full max-w-sm relative">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <Image src="/logo.svg" alt="ArcCore" width={64} height={64} priority />
              <div className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ background: "radial-gradient(circle,#4db8ff,transparent)" }} />
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              <span style={{ color: "#f5c842" }}>Arc</span>
              <span style={{ color: "#4db8ff" }}>Core</span>
            </h1>
            <p className="text-xs text-[#94b8d8] mt-1 tracking-widest uppercase">Learn · Grow · Achieve</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-7" style={{ background: "#0a1628", border: "1px solid rgba(30,58,110,0.5)" }}>
            <h2 className="text-lg font-bold text-white mb-1">Welcome back</h2>
            <p className="text-xs text-[#94b8d8] mb-6">Sign in to continue your learning journey</p>
            <LoginForm />
          </div>

          <p className="text-center text-xs text-[#4a7098] mt-5">
            Access is by invitation only · Contact your admin
          </p>
        </div>
      </div>

      {/* Right — hero image (hidden on mobile) */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <Image
          src="/Cinematic Floating Arc Reactor.png"
          alt="ArcCore"
          fill
          className="object-cover object-center opacity-70"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right,#050c1a 0%,transparent 30%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#050c1a 0%,transparent 30%)" }} />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="text-2xl font-extrabold text-white leading-tight">
            Learn Today.<br/>
            <span style={{ color: "#f5c842" }}>Build </span>
            <span style={{ color: "#4db8ff" }}>Tomorrow.</span>
          </p>
          <p className="text-sm text-[#94b8d8] mt-2">Your AI-powered learning platform</p>
        </div>
      </div>
    </div>
  );
}
