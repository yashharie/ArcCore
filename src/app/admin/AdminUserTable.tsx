"use client";

import { useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  createdAt: Date;
  _count: { attempts: number; topics: number; quizzesCreated: number };
};

interface Props {
  users: User[];
  currentUserId: string;
}

// ─── Shared input style ──────────────────────────────────────────────────────
const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function AdminUserTable({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ── Create member modal ──────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTempPw, setNewTempPw] = useState("");
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{
    tempPassword: string;
    userName: string;
    userEmail: string;
  } | null>(null);

  // ── Temp password modal ──────────────────────────────────────────────────
  const [tempPwModal, setTempPwModal] = useState<{ userId: string; name: string } | null>(null);
  const [customTempPw, setCustomTempPw] = useState("");
  const [settingTempPw, setSettingTempPw] = useState(false);
  const [tempPwResult, setTempPwResult] = useState<{
    tempPassword: string;
    userName: string;
    userEmail: string;
    expiresAt: string;
  } | null>(null);

  // ────────────────────────────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────────────────────────────

  async function createMember() {
    if (!newName.trim() || !newEmail.trim()) {
      setError("Name and email are required.");
      return;
    }
    setCreating(true);
    setError("");
    const body: Record<string, string> = { name: newName.trim(), email: newEmail.trim() };
    if (newTempPw.trim()) body.tempPassword = newTempPw.trim();

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(data.error || "Failed to create member.");
      return;
    }

    // Add to local list
    setUsers((prev) => [
      {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        mustChangePassword: true,
        createdAt: new Date(data.user.createdAt),
        _count: { attempts: 0, topics: 0, quizzesCreated: 0 },
      },
      ...prev,
    ]);

    setCreateResult({
      tempPassword: data.tempPassword,
      userName: data.user.name,
      userEmail: data.user.email,
    });
    setShowCreate(false);
    setNewName("");
    setNewEmail("");
    setNewTempPw("");
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    setLoadingId(userId + "-role");
    setError("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    setLoadingId(null);
    if (!res.ok) { setError(data.error || "Failed to update role."); return; }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  }

  async function setTempPassword() {
    if (!tempPwModal) return;
    setSettingTempPw(true);
    setError("");
    const body: Record<string, string> = {};
    if (customTempPw.trim()) body.tempPassword = customTempPw.trim();

    const res = await fetch(`/api/admin/users/${tempPwModal.userId}/temp-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSettingTempPw(false);
    if (!res.ok) { setError(data.error || "Failed to set temp password."); return; }

    setTempPwResult(data);
    setTempPwModal(null);
    setCustomTempPw("");
    setUsers((prev) =>
      prev.map((u) => (u.id === tempPwModal.userId ? { ...u, mustChangePassword: true } : u))
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Modals
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Global error banner */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Add Member button ── */}
      <div className="px-6 py-4 flex justify-end border-b border-gray-100">
        <button
          onClick={() => { setShowCreate(true); setError(""); }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          + Add Member
        </button>
      </div>

      {/* ── Create member modal ── */}
      {showCreate && (
        <Modal title="Add New Member" onClose={() => setShowCreate(false)}>
          <p className="text-sm text-gray-500 mb-4">
            Create an account for a new member. They will be required to set
            their own password on first login.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input className={inp} placeholder="Alice Smith" value={newName}
                onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
              <input className={inp} type="email" placeholder="alice@example.com"
                value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Temporary Password <span className="text-gray-400">(optional — auto-generated if blank)</span>
              </label>
              <input className={inp} type="text" placeholder="Leave blank to auto-generate"
                value={newTempPw} onChange={(e) => setNewTempPw(e.target.value)} />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 mt-5">
            <button onClick={() => setShowCreate(false)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={createMember} disabled={creating}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating ? "Creating…" : "Create Account"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Create result modal (show temp password) ── */}
      {createResult && (
        <Modal title="Account Created ✓" onClose={() => setCreateResult(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Share this temporary password with{" "}
            <strong>{createResult.userName}</strong> ({createResult.userEmail}).
            They must change it on first login.
          </p>
          <TempPasswordDisplay password={createResult.tempPassword} />
          <button onClick={() => setCreateResult(null)}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            Done
          </button>
        </Modal>
      )}

      {/* ── Set temp password modal ── */}
      {tempPwModal && (
        <Modal title="Reset Password" onClose={() => { setTempPwModal(null); setCustomTempPw(""); }}>
          <p className="text-sm text-gray-600 mb-4">
            Set a temporary password for <strong>{tempPwModal.name}</strong>.
            They must change it on next login. Expires in 24 hours.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Custom Password <span className="text-gray-400">(optional)</span>
            </label>
            <input className={inp} type="text" placeholder="Leave blank to auto-generate"
              value={customTempPw} onChange={(e) => setCustomTempPw(e.target.value)} />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 mt-5">
            <button onClick={() => { setTempPwModal(null); setCustomTempPw(""); }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={setTempPassword} disabled={settingTempPw}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {settingTempPw ? "Setting…" : "Set Password"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Temp password result modal ── */}
      {tempPwResult && (
        <Modal title="Temporary Password Set ✓" onClose={() => setTempPwResult(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Share this with <strong>{tempPwResult.userName}</strong> ({tempPwResult.userEmail}).
            Expires: {new Date(tempPwResult.expiresAt).toLocaleString()}
          </p>
          <TempPasswordDisplay password={tempPwResult.tempPassword} />
          <button onClick={() => setTempPwResult(null)}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            Done
          </button>
        </Modal>
      )}

      {/* ── User table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Attempts</th>
              <th className="px-5 py-3 text-right">Topics</th>
              <th className="px-5 py-3 text-left">Joined</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const isMe = u.id === currentUserId;
              return (
                <tr key={u.id} className={isMe ? "bg-indigo-50" : "hover:bg-gray-50"}>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {u.name}
                    {isMe && <span className="ml-1.5 text-xs text-indigo-500">(you)</span>}
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.role === "ADMIN"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.mustChangePassword && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                        Pending PW change
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-gray-500">{u._count.attempts}</td>
                  <td className="px-5 py-4 text-right text-gray-500">{u._count.topics}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {!isMe && u.role !== "ADMIN" && (
                        <button
                          onClick={() => setTempPwModal({ userId: u.id, name: u.name })}
                          className="rounded-lg border border-yellow-200 px-2.5 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-50 transition-colors"
                        >
                          Reset PW
                        </button>
                      )}
                      {!isMe && (
                        <button
                          onClick={() => toggleRole(u.id, u.role)}
                          disabled={loadingId === u.id + "-role"}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                            u.role === "ADMIN"
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                          }`}
                        >
                          {loadingId === u.id + "-role"
                            ? "…"
                            : u.role === "ADMIN"
                            ? "Revoke Admin"
                            : "Make Admin"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            No members yet. Click &ldquo;Add Member&rdquo; to create the first account.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Reusable sub-components ─────────────────────────────────────────────────

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TempPasswordDisplay({ password }: { password: string }) {
  function copy() {
    navigator.clipboard.writeText(password);
  }
  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 text-center">
      <p className="text-xs text-indigo-500 mb-1 font-medium uppercase tracking-wide">
        Temporary Password
      </p>
      <p className="text-2xl font-mono font-bold tracking-widest text-indigo-700 select-all">
        {password}
      </p>
      <button
        onClick={copy}
        className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 underline"
      >
        Copy to clipboard
      </button>
    </div>
  );
}
