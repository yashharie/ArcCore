"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "#050c1a" }}>
      <div className="arc-card p-10 max-w-sm w-full">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-extrabold text-white mb-2">Something went wrong</h1>
        <p className="text-sm text-[#94b8d8] mb-6">An unexpected error occurred. Please try again or return to your dashboard.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="arc-btn text-xs px-5">Try Again</button>
          <Link href="/dashboard" className="arc-btn-outline text-xs px-5">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
