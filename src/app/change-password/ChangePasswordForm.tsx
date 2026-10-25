"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  isFirstTime?: boolean;
}

export default function ChangePasswordForm({ isFirstTime = false }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength indicators
  const checks = {
    length: newPw.length >= 8,
    letter: /[a-zA-Z]/.test(newPw),
    number: /[0-9]/.test(newPw),
    match: newPw === confirm && newPw.length > 0,
  };
  const strength = Object.values(checks).filter(Boolean).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!checks.length || !checks.letter || !checks.number) {
      setError("New password does not meet the requirements.");
      return;
    }
    if (!checks.match) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-green-700">Password changed successfully!</p>
        <p className="text-sm text-gray-500 mt-1">Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {isFirstTime ? "Temporary / Initial Password" : "Current Password"}
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          placeholder={isFirstTime ? "Enter the password you received" : "Your current password"}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          New Password
        </label>
        <input
          type="password"
          required
          autoComplete="new-password"
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          placeholder="Create a strong password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />

        {/* Strength meter */}
        {newPw.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    strength >= i
                      ? strength <= 1
                        ? "bg-red-400"
                        : strength <= 2
                        ? "bg-yellow-400"
                        : strength <= 3
                        ? "bg-blue-400"
                        : "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <ul className="text-xs space-y-0.5 text-gray-500">
              <CheckItem ok={checks.length} label="At least 8 characters" />
              <CheckItem ok={checks.letter} label="At least one letter" />
              <CheckItem ok={checks.number} label="At least one number" />
            </ul>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm New Password
        </label>
        <input
          type="password"
          required
          autoComplete="new-password"
          disabled={loading}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${
            confirm.length > 0 && !checks.match
              ? "border-red-400"
              : "border-gray-300"
          }`}
          placeholder="Re-enter new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {confirm.length > 0 && !checks.match && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !checks.length || !checks.letter || !checks.number || !checks.match}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1 ${ok ? "text-green-600" : "text-gray-400"}`}>
      <span>{ok ? "✓" : "○"}</span>
      <span>{label}</span>
    </li>
  );
}
