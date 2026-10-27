"use client";
import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import type { ProfileActionState } from "@/app/actions/profile";

export default function ProfileForm({ currentName }: { currentName: string }) {
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(updateProfile, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.success && (
        <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", color: "#00d4aa" }}>
          ✓ Profile updated successfully.
        </div>
      )}
      {state?.message && !state.success && (
        <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.15)", color: "#f5c842" }}>
          {state.message}
        </div>
      )}
      <div>
        <label htmlFor="profile-name" className="block text-xs font-semibold text-[#94b8d8] mb-1.5">Display Name</label>
        <input
          id="profile-name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={currentName}
          required
          disabled={pending}
          className="arc-input"
        />
        {state?.errors?.name && <p className="text-xs mt-1" style={{ color: "#ff4d6d" }}>{state.errors.name[0]}</p>}
      </div>
      <button id="profile-save" type="submit" disabled={pending} className="arc-btn text-xs justify-center w-full py-2.5">
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Saving…
          </span>
        ) : "Save Changes"}
      </button>
    </form>
  );
}
