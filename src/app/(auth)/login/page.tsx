import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In — ArcCore",
  description: "Sign in to ArcCore to access your dashboard, quizzes, and learning progress.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.svg" alt="ArcCore" width={72} height={72} priority className="mb-3" />
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-blue-300/70">Sign in to your ArcCore account</p>
        </div>

        <div className="rounded-2xl border border-blue-400/20 bg-white/5 backdrop-blur p-8 shadow-xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
