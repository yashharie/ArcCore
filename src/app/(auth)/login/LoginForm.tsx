"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import type { ActionState } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    login,
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {/* Global error */}
      {state?.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-500/20 border border-red-400/30 px-4 py-3 text-sm text-red-300"
        >
          {state.message}
        </p>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-email"
          className="text-sm font-medium text-gray-200"
        >
          Email Address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="rounded-lg border border-blue-400/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-blue-300/50 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50"
          placeholder="alice@example.com"
        />
        {state?.errors?.email && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-password"
          className="text-sm font-medium text-gray-200"
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="rounded-lg border border-blue-400/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-blue-300/50 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50"
          placeholder="Your password"
        />
        {state?.errors?.password && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        id="login-submit"
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent"
              aria-hidden="true"
            />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <p className="text-center text-xs text-blue-300/50">
        Access is by invitation only. Contact your admin if you need an account.
      </p>
    </form>
  );
}
