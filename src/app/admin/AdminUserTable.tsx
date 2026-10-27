"use client";
import { useState } from "react";

type User = {
  id: string; name: string; email: string; role: string;
  mustChangePassword: boolean; createdAt: Date;
  _count: { attempts: number; topics: number; quizzesCreated: number };
};

const inp = "arc-input text-xs py-2";

export default function AdminUserTable({ users: initialUsers, currentUserId }: { users: User[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTempPw, setNewTempPw] = useState("");
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{ tempPassword: string; userName: string; userEmail: string } | null>(null);
  const [tempPwModal, setTempPwModal] = useState<{ userId: string; name: string } | null>(null);
  const [customTempPw, setCustomTempPw] = useState("");
  const [settingTempPw, setSettingTempPw] = useState(false);
  const [tempPwResult, setTempPwResult] = useState<{ tempPassword: string; userName: string; userEmail: string; expiresAt: string } | null>(null);

  async function createMember() {
    if (!newName.trim() || !newEmail.trim()) { setError("Name and email are required."); return; }
    setCreating(true); setError("");
    const body: Record<string, string> = { name: newName.trim(), email: newEmail.trim() };
    if (newTempPw.trim()) body.tempPassword = newTempPw.trim();
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setError(data.error || "Failed to create member."); return; }
    setUsers((prev) => [{ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role, mustChangePassword: true, createdAt: new Date(data.user.createdAt), _count: { attempts: 0, topics: 0, quizzesCreated: 0 } }, ...prev]);
    setCreateResult({ tempPassword: data.tempPassword, userName: data.user.name, userEmail: data.user.email });
    setShowCreate(false); setNewName(""); setNewEmail(""); setNewTempPw("");
  }

  async function toggleRole(userId: string, currentRole: string) {
    setLoadingId(userId); setError("");
    const res = await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: currentRole === "ADMIN" ? "MEMBER" : "ADMIN" }) });
    const data = await res.json();
    setLoadingId(null);
    if (!res.ok) { setError(data.error || "Failed."); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: data.user.role } : u));
  }

  async function setTempPassword() {
    if (!tempPwModal) return;
    setSettingTempPw(true); setError("");
    const body: Record<string, string> = {};
    if (customTempPw.trim()) body.tempPassword = customTempPw.trim();
    const res = await fetch(`/api/admin/users/${tempPwModal.userId}/temp-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setSettingTempPw(false);
    if (!res.ok) { setError(data.error || "Failed."); return; }
    setTempPwResult(data); setTempPwModal(null); setCustomTempPw("");
    setUsers((prev) => prev.map((u) => u.id === tempPwModal.userId ? { ...u, mustChangePassword: true } : u));
  }

  return (
    <div>
      {error && <div className="mx-6 mt-4 p-3 rounded-xl text-xs" style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", color: "#ff8099" }}>{error}</div>}

      <div className="px-6 py-4 flex justify-end" style={{ borderBottom: "1px solid rgba(30,58,110,0.3)" }}>
        <button onClick={() => { setShowCreate(true); setError(""); }} className="arc-btn text-xs">+ Add Member</button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <Modal title="Add New Member" onClose={() => setShowCreate(false)}>
          <p className="text-xs text-[#94b8d8] mb-4">Create an account. They must set their own password on first login.</p>
          <div className="space-y-3">
            <div><label className="text-xs text-[#94b8d8] mb-1 block">Full Name *</label><input className={inp} placeholder="Alice Smith" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
            <div><label className="text-xs text-[#94b8d8] mb-1 block">Email *</label><input className={inp} type="email" placeholder="alice@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
            <div><label className="text-xs text-[#94b8d8] mb-1 block">Temp Password <span className="text-[#4a7098]">(optional)</span></label><input className={inp} placeholder="Auto-generate if blank" value={newTempPw} onChange={(e) => setNewTempPw(e.target.value)} /></div>
          </div>
          {error && <p className="text-xs mt-2" style={{ color: "#ff4d6d" }}>{error}</p>}
          <div className="flex gap-2 mt-5">
            <button onClick={() => setShowCreate(false)} className="arc-btn-outline text-xs flex-1">Cancel</button>
            <button onClick={createMember} disabled={creating} className="arc-btn text-xs flex-1">{creating ? "Creating…" : "Create"}</button>
          </div>
        </Modal>
      )}

      {/* Create result */}
      {createResult && (
        <Modal title="Account Created ✓" onClose={() => setCreateResult(null)}>
          <p className="text-xs text-[#94b8d8] mb-4">Share this with <strong className="text-white">{createResult.userName}</strong> ({createResult.userEmail})</p>
          <TempPwDisplay password={createResult.tempPassword} />
          <button onClick={() => setCreateResult(null)} className="arc-btn text-xs w-full mt-4">Done</button>
        </Modal>
      )}

      {/* Reset PW modal */}
      {tempPwModal && (
        <Modal title="Reset Password" onClose={() => { setTempPwModal(null); setCustomTempPw(""); }}>
          <p className="text-xs text-[#94b8d8] mb-4">Set a temp password for <strong className="text-white">{tempPwModal.name}</strong>. Expires in 24h.</p>
          <div><label className="text-xs text-[#94b8d8] mb-1 block">Custom Password <span className="text-[#4a7098]">(optional)</span></label><input className={inp} placeholder="Auto-generate if blank" value={customTempPw} onChange={(e) => setCustomTempPw(e.target.value)} /></div>
          {error && <p className="text-xs mt-2" style={{ color: "#ff4d6d" }}>{error}</p>}
          <div className="flex gap-2 mt-5">
            <button onClick={() => { setTempPwModal(null); setCustomTempPw(""); }} className="arc-btn-outline text-xs flex-1">Cancel</button>
            <button onClick={setTempPassword} disabled={settingTempPw} className="arc-btn text-xs flex-1">{settingTempPw ? "…" : "Set Password"}</button>
          </div>
        </Modal>
      )}

      {/* PW result */}
      {tempPwResult && (
        <Modal title="Password Set ✓" onClose={() => setTempPwResult(null)}>
          <p className="text-xs text-[#94b8d8] mb-4">Share with <strong className="text-white">{tempPwResult.userName}</strong> · Expires {new Date(tempPwResult.expiresAt).toLocaleString()}</p>
          <TempPwDisplay password={tempPwResult.tempPassword} />
          <button onClick={() => setTempPwResult(null)} className="arc-btn text-xs w-full mt-4">Done</button>
        </Modal>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(30,58,110,0.2)", borderBottom: "1px solid rgba(30,58,110,0.4)" }}>
              {["Name", "Email", "Role", "Status", "Attempts", "Topics", "Joined", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#4db8ff] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const isMe = u.id === currentUserId;
              return (
                <tr key={u.id} style={{ background: isMe ? "rgba(77,184,255,0.04)" : i % 2 === 0 ? "transparent" : "rgba(10,22,40,0.2)", borderBottom: "1px solid rgba(30,58,110,0.15)" }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg,#1e3a6e,#4db8ff40)" }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-white">
                        {u.name} {isMe && <span className="text-[#4db8ff]">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={u.role === "ADMIN" ? { background: "rgba(245,200,66,0.12)", color: "#f5c842" } : { background: "rgba(148,184,216,0.08)", color: "#94b8d8" }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.mustChangePassword && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(255,77,109,0.1)", color: "#ff8099" }}>Pending PW</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{u._count.attempts}</td>
                  <td className="px-5 py-3.5 text-xs text-[#94b8d8]">{u._count.topics}</td>
                  <td className="px-5 py-3.5 text-xs text-[#4a7098]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 flex-wrap">
                      {!isMe && u.role !== "ADMIN" && (
                        <button onClick={() => setTempPwModal({ userId: u.id, name: u.name })}
                          className="text-[10px] px-2 py-1 rounded-full font-medium transition-colors"
                          style={{ background: "rgba(245,200,66,0.08)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.15)" }}>
                          Reset PW
                        </button>
                      )}
                      {!isMe && (
                        <button onClick={() => toggleRole(u.id, u.role)} disabled={loadingId === u.id}
                          className="text-[10px] px-2 py-1 rounded-full font-medium transition-colors disabled:opacity-50"
                          style={u.role === "ADMIN"
                            ? { background: "rgba(255,77,109,0.08)", color: "#ff8099", border: "1px solid rgba(255,77,109,0.15)" }
                            : { background: "rgba(77,184,255,0.08)", color: "#4db8ff", border: "1px solid rgba(77,184,255,0.15)" }}>
                          {loadingId === u.id ? "…" : u.role === "ADMIN" ? "Revoke" : "Make Admin"}
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
          <p className="text-center py-10 text-[#94b8d8] text-sm">No members yet.</p>
        )}
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(5,12,26,0.8)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#0a1628", border: "1px solid rgba(30,58,110,0.5)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-[#94b8d8] hover:text-white hover:bg-white/5 transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TempPwDisplay({ password }: { password: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: "rgba(77,184,255,0.06)", border: "1px solid rgba(77,184,255,0.2)" }}>
      <p className="text-[10px] text-[#4db8ff] uppercase tracking-widest mb-1 font-semibold">Temporary Password</p>
      <p className="text-2xl font-mono font-extrabold tracking-widest text-white select-all">{password}</p>
      <button onClick={() => navigator.clipboard.writeText(password)}
        className="text-xs text-[#4db8ff] hover:underline mt-2">Copy to clipboard</button>
    </div>
  );
}
