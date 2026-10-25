"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import type { ProfileActionState } from "@/app/actions/profile";

interface ProfileFormProps {
  currentName: string;
}

export default function ProfileForm({ currentName }: ProfileFormProps) {
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Success */}
      {state?.success && (
        <p
          role="status"
          className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400"
        >
          Profile updated successfully.
        </p>
      )}

      {/* Generic message */}
      {state?.message && !state.success && (
        <p
          role="alert"
          className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        >
          {state.message}
        </p>
      )}

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="profile-name"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Full Name
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={currentName}
          required
          disabled={pending}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
        />
        {state?.errors?.name && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <button
        id="profile-save"
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent"
              aria-hidden="true"
            />
            Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
