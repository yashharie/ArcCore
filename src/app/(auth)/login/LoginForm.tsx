"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import type { ActionState } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state?.message && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(255,77,109,0.12)", border: "1px solid rgba(255,77,109,0.3)", color: "#ff8099" }}>
          {state.message}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#94b8d8] mb-1.5">Email Address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="arc-input"
          placeholder="you@example.com"
        />
        {state?.errors?.email && <p className="text-xs mt-1" style={{ color: "#ff4d6d" }}>{state.errors.email[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#94b8d8] mb-1.5">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="arc-input"
          placeholder="Your password"
        />
        {state?.errors?.password && <p className="text-xs mt-1" style={{ color: "#ff4d6d" }}>{state.errors.password[0]}</p>}
      </div>

      <button
        id="login-submit"
        type="submit"
        disabled={pending}
        className="arc-btn justify-center w-full mt-1 py-2.5"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Signing in…
          </span>
        ) : "Sign In →"}
      </button>
    </form>
  );
}
