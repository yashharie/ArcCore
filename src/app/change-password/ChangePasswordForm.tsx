"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordForm({ isFirstTime = false }: { isFirstTime?: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = {
    length: newPw.length >= 8,
    letter: /[a-zA-Z]/.test(newPw),
    number: /[0-9]/.test(newPw),
    match: newPw === confirm && newPw.length > 0,
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthColors = ["", "#ff4d6d", "#f5c842", "#4db8ff", "#00d4aa"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!checks.length || !checks.letter || !checks.number) { setError("Password doesn't meet requirements."); return; }
    if (!checks.match) { setError("Passwords do not match."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    setSuccess(true);
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1200);
  }

  if (success) return (
    <div className="text-center py-4">
      <div className="text-4xl mb-3">✅</div>
      <p className="font-semibold text-[#00d4aa]">Password changed!</p>
      <p className="text-xs text-[#94b8d8] mt-1">Redirecting…</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#94b8d8] mb-1.5">
          {isFirstTime ? "Temporary / Initial Password" : "Current Password"}
        </label>
        <input type="password" required autoComplete="current-password" disabled={loading}
          className="arc-input" placeholder="Enter current password"
          value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#94b8d8] mb-1.5">New Password</label>
        <input type="password" required autoComplete="new-password" disabled={loading}
          className="arc-input" placeholder="Create a strong password"
          value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        {newPw.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1.5">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-colors"
                  style={{ background: strength >= i ? strengthColors[strength] : "rgba(30,58,110,0.4)" }} />
              ))}
            </div>
            <div className="space-y-0.5">
              {[
                { ok: checks.length, label: "8+ characters" },
                { ok: checks.letter, label: "One letter" },
                { ok: checks.number, label: "One number" },
              ].map((c) => (
                <p key={c.label} className="text-[10px] flex items-center gap-1"
                  style={{ color: c.ok ? "#00d4aa" : "#4a7098" }}>
                  <span>{c.ok ? "✓" : "○"}</span>{c.label}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#94b8d8] mb-1.5">Confirm New Password</label>
        <input type="password" required autoComplete="new-password" disabled={loading}
          className="arc-input" placeholder="Re-enter new password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          style={confirm.length > 0 && !checks.match ? { borderColor: "#ff4d6d" } : {}} />
        {confirm.length > 0 && !checks.match && (
          <p className="text-[10px] mt-1" style={{ color: "#ff4d6d" }}>Passwords do not match</p>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", color: "#ff8099" }}>
          {error}
        </div>
      )}

      <button type="submit"
        disabled={loading || !checks.length || !checks.letter || !checks.number || !checks.match}
        className="arc-btn text-xs w-full justify-center py-2.5">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Saving…
          </span>
        ) : "Set New Password"}
      </button>
    </form>
  );
}
