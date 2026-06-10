import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Users, KeyRound, Eye, BookOpen, Fingerprint, Search, RotateCcw, X, Loader2,
  ShieldBan, ShieldCheck, Trash2, Ban, Calendar, Monitor, ChevronLeft, AlertCircle,
  Star
} from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSummary {
  id: string;
  totalVisits: number;
  lastSeen: string;
  firstSeen: string;
  paths: string[];
  keysGenerated: number;
  isBanned: boolean;
}

interface KeyRecord {
  id: string;
  key_value: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  script_id?: string;
}

interface VisitRecord {
  path: string;
  created_at: string;
  user_agent: string;
}

interface UserDetail {
  userId: string;
  visits: VisitRecord[];
  generatedKeys: KeyRecord[];
  // redeemedKeys removed
  isBanned: boolean;
  banRecord: { reason: string; banned_at: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function shortId(id: string): string {
  if (id.length <= 20) return id;
  return id.slice(0, 10) + "…" + id.slice(-6);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, color = "#00ABFF" }: { icon: any; title: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl border" style={{ background: `${color}15`, borderColor: `${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{title}</span>
    </div>
  );
}

function KeyCard({
  keyRecord,
  onDelete,
  onRevoke,
  isDeleting,
  isRevoking,
}: {
  keyRecord: KeyRecord;
  onDelete: (key: string) => void;
  onRevoke: (key: string) => void;
  isDeleting: boolean;
  isRevoking: boolean;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-2">
        <code className="text-[#00ABFF] text-xs font-mono break-all leading-relaxed flex-1">
          {keyRecord.key_value}
        </code>
        <span
          className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
            keyRecord.is_used
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-green-500/10 border-green-500/20 text-green-400"
          }`}
        >
          {keyRecord.is_used ? "Used" : "Active"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-600 font-mono">
          {keyRecord.used_at
            ? `Used ${timeAgo(keyRecord.used_at)}`
            : `Created ${timeAgo(keyRecord.created_at)}`}
        </span>
        <div className="flex items-center gap-2">
          {!keyRecord.is_used && (
            <button
              onClick={() => onRevoke(keyRecord.key_value)}
              disabled={isRevoking}
              title="Revoke key"
              className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-40"
            >
              {isRevoking ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
            </button>
          )}
          <button
            onClick={() => onDelete(keyRecord.key_value)}
            disabled={isDeleting}
            title="Delete key"
            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
          >
            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserDetailPanel({
  userId,
  onClose,
  onBanToggle,
}: {
  userId: string;
  onClose: () => void;
  onBanToggle: (id: string, banned: boolean) => void;
}) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"info" | "keys">("info");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [banReason, setBanReason] = useState("");
  const [showBanInput, setShowBanInput] = useState(false);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/analytics/users/${encodeURIComponent(userId)}`);
      setDetail(res.data);
    } catch {
      toast.error("Failed to load user details");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getScriptName = (scriptId?: string) => {
    if (!scriptId) return "Unknown Script";
    if (scriptId === "push-rock-for-brainrots") return "Push Rock for Brainrots";
    if (scriptId === "bite-by-night") return "Bite By Night";
    if (scriptId === "violence-district") return "Violence District";
    return scriptId;
  };

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const setLoading = (key: string, val: boolean) =>
    setActionLoading(prev => ({ ...prev, [key]: val }));

  const handleDeleteKey = async (keyValue: string) => {
    setLoading(`del-${keyValue}`, true);
    try {
      await axios.delete(`/api/analytics/keys/${encodeURIComponent(keyValue)}`);
      toast.success("Key deleted");
      fetchDetail();
    } catch {
      toast.error("Failed to delete key");
    } finally {
      setLoading(`del-${keyValue}`, false);
    }
  };

  const handleRevokeKey = async (keyValue: string) => {
    setLoading(`rev-${keyValue}`, true);
    try {
      await axios.post(`/api/analytics/keys/${encodeURIComponent(keyValue)}/revoke`);
      toast.success("Key revoked");
      fetchDetail();
    } catch {
      toast.error("Failed to revoke key");
    } finally {
      setLoading(`rev-${keyValue}`, false);
    }
  };

  const handleBan = async () => {
    if (!detail) return;
    setLoading("ban", true);
    try {
      if (detail.isBanned) {
        await axios.delete(`/api/analytics/users/${encodeURIComponent(userId)}/ban`);
        toast.success("User unbanned");
      } else {
        await axios.post(`/api/analytics/users/${encodeURIComponent(userId)}/ban`, {
          reason: banReason || "Banned by admin"
        });
        toast.success("User banned");
        setShowBanInput(false);
        setBanReason("");
      }
      fetchDetail();
      onBanToggle(userId, !detail.isBanned);
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading("ban", false);
    }
  };

  const sections = [
    { id: "info", label: "Info", icon: Eye },
    { id: "keys", label: "Keys", icon: KeyRound },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-[#07090f] border-l border-white/10">
      <div className="p-8 border-b border-white/10 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-[#00ABFF]/10 border border-[#00ABFF]/20 flex items-center justify-center shrink-0">
            <Fingerprint size={28} className="text-[#00ABFF]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">User Identifier</p>
            <p className="text-xl font-mono text-white truncate max-w-[400px]" title={userId}>
              {userId}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all shrink-0">
          <X size={24} className="text-gray-400" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#00ABFF]" size={48} />
        </div>
      ) : !detail ? null : (
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl border ${
                detail.isBanned
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-green-500/10 border-green-500/20 text-green-400"
              }`}>
                {detail.isBanned ? "Banned Account" : "Active Account"}
              </span>
              {detail.isBanned && detail.banRecord && (
                <span className="text-xs text-red-500/60 font-medium">
                  Banned on {new Date(detail.banRecord.banned_at).toLocaleDateString()}
                </span>
              )}
            </div>
            
            <button
              onClick={() => detail.isBanned ? handleBan() : setShowBanInput(v => !v)}
              disabled={actionLoading["ban"]}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all disabled:opacity-40 ${
                detail.isBanned
                  ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                  : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              }`}
            >
              {actionLoading["ban"] ? (
                <Loader2 size={16} className="animate-spin" />
              ) : detail.isBanned ? (
                <><ShieldCheck size={16} /> Restore Access</>
              ) : (
                <><ShieldBan size={16} /> Ban Protocol</>
              )}
            </button>
          </div>

          {showBanInput && !detail.isBanned && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-red-400">Specify Ban Reason</h4>
              <div className="flex gap-3">
                <input
                  autoFocus
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  placeholder="e.g. Terms of Service Violation, Key Abuse..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-all"
                />
                <button
                  onClick={handleBan}
                  disabled={actionLoading["ban"]}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-40"
                >
                  Confirm Ban
                </button>
              </div>
            </div>
          )}

          <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10 gap-2">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeSection === s.id
                    ? "bg-[#00ABFF] text-white"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <s.icon size={18} />
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {activeSection === "info" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Total Views", value: detail.visits.length, icon: Eye, color: "#00ABFF" },
                    { label: "Keys Generated", value: detail.generatedKeys.length, icon: KeyRound, color: "#a855f7" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <stat.icon size={20} style={{ color: stat.color }} />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
                      </div>
                      <p className="text-4xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <SectionHeader icon={Calendar} title="Session Timeline" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Identity Established", value: detail.visits.length > 0 ? new Date(detail.visits[detail.visits.length - 1].created_at).toLocaleString() : "—" },
                      { label: "Last System Sync", value: detail.visits.length > 0 ? new Date(detail.visits[0].created_at).toLocaleString() : "—" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{item.label}</span>
                        <span className="text-xs text-gray-300 font-mono">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <SectionHeader icon={Monitor} title="Navigation History" />
                  <div className="space-y-3">
                    {detail.visits.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-6 py-5 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="bg-[#00ABFF]/10 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#00ABFF] border border-[#00ABFF]/20">
                            {v.path}
                          </span>
                          <span className="text-xs text-gray-500 font-medium truncate max-w-[300px]" title={v.user_agent}>
                            {v.user_agent.split(') ')[0].split(' (')[1] || "Unknown Browser"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{timeAgo(v.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "keys" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader icon={KeyRound} title={`System Keys (${detail.generatedKeys.length})`} color="#a855f7" />
                <div className="grid grid-cols-1 gap-4">
                  {detail.generatedKeys.map(k => (
                    <KeyCard
                      key={k.key_value}
                      keyRecord={k}
                      onDelete={handleDeleteKey}
                      onRevoke={handleRevokeKey}
                      isDeleting={!!actionLoading[`del-${k.key_value}`]}
                      isRevoking={!!actionLoading[`rev-${k.key_value}`]}
                    />
                  ))}
                  {detail.generatedKeys.length === 0 && (
                    <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-[2rem]">
                      <KeyRound size={48} className="mx-auto text-gray-700 mb-4" />
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">No generated keys found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "redeemed" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionHeader icon={BookOpen} title={`Scripts Redeemed (${detail.redeemedKeys.length})`} color="#22c55e" />
                <div className="grid grid-cols-1 gap-4">
                  {detail.redeemedKeys.map(k => (
                    <div key={k.key_value} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-white font-bold text-base">{getScriptName(k.script_id)}</p>
                          <code className="text-green-400/60 text-[10px] font-mono break-all">{k.key_value}</code>
                        </div>
                        <button
                          onClick={() => handleDeleteKey(k.key_value)}
                          disabled={!!actionLoading[`del-${k.key_value}`]}
                          className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                        >
                          {actionLoading[`del-${k.key_value}`] ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                        Redeemed {k.used_at ? timeAgo(k.used_at) : "—"}
                      </div>
                    </div>
                  ))}
                  {detail.redeemedKeys.length === 0 && (
                    <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-[2rem]">
                      <BookOpen size={48} className="mx-auto text-gray-700 mb-4" />
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">No scripts redeemed yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const MY_ID = "g1wsNkhdjeal2PkK5-MlH";
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/analytics/users");
      setUsers(res.data.users || []);
      setError("");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error;
      setError(typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || "Access Denied or Server Error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Auto refresh users list every 1 second to keep "Last Active" updated
    const interval = setInterval(fetchUsers, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u =>
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#00ABFF] mb-6" size={64} />
        <p className="text-gray-400 font-bold animate-pulse tracking-widest text-xs uppercase">Accessing Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white p-8">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 max-w-xl w-full text-center space-y-8 backdrop-blur-xl">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="text-red-500" size={48} />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight uppercase">Access Denied</h1>
            <p className="text-gray-400 text-base font-medium px-8 leading-relaxed">{error}</p>
          </div>
          <button onClick={() => setLocation("/")} className="w-full bg-[#00ABFF] text-white font-bold py-5 rounded-2xl hover:bg-[#0099EE] transition-all uppercase tracking-widest text-sm">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white relative selection:bg-[#00ABFF] selection:text-white">
      <Navbar />

      <main className="flex-1 p-8 pt-32 max-w-[1600px] mx-auto w-full flex gap-8">
        
        {/* User List Section */}
        <div className={`flex-1 flex flex-col space-y-8 transition-all duration-500 ${selectedUserId ? "max-w-[500px]" : "max-w-full"}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setLocation("/analytics")}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white mr-2"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="h-1.5 w-12 bg-[#00ABFF] rounded-full"></div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#00ABFF]">Identity Management</span>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tighter uppercase flex items-center gap-5">
                User <span className="text-[#00ABFF]">Directory</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#00ABFF] transition-all">
                <div className="relative flex-1 min-w-[300px]">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search identities..."
                    className="bg-transparent pl-12 pr-6 py-4 text-sm w-full focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setSearch(MY_ID)}
                  className="px-6 border-l border-white/10 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <Star size={14} fill="currentColor" />
                  Find Me
                </button>
              </div>
              <button 
                onClick={fetchUsers}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
              >
                <RotateCcw size={20} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">
                    <th className="px-8 py-6">User Identity</th>
                    <th className="px-8 py-6">Status</th>
                    {!selectedUserId && (
                      <>
                        <th className="px-8 py-6">Visits</th>
                        <th className="px-8 py-6">Redeemed</th>
                        <th className="px-8 py-6">Last Active</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => setSelectedUserId(user.id)}
                      className={`cursor-pointer transition-all group ${selectedUserId === user.id ? "bg-[#00ABFF]/10" : "hover:bg-white/[0.03]"}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                            user.id === MY_ID
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                              : selectedUserId === user.id 
                                ? "bg-[#00ABFF] border-[#00ABFF] text-white" 
                                : "bg-white/5 border-white/10 text-gray-500 group-hover:text-[#00ABFF] group-hover:border-[#00ABFF]/30"
                          }`}>
                            {user.id === MY_ID ? <Star size={20} fill="currentColor" /> : <Users size={20} />}
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`font-mono text-sm font-medium truncate max-w-[200px] ${user.id === MY_ID ? "text-amber-500" : "text-white"}`}>
                              {user.id}
                            </span>
                            {user.id === MY_ID && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-black text-[8px] font-black uppercase tracking-tighter leading-none shrink-0">
                                ME
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                          user.isBanned 
                            ? "bg-red-500/10 border-red-500/20 text-red-400" 
                            : "bg-green-500/10 border-green-500/20 text-green-400"
                        }`}>
                          {user.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      {!selectedUserId && (
                        <>
                          <td className="px-8 py-6 font-bold text-gray-300">{user.totalVisits}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <KeyRound size={14} className="text-gray-600" />
                              <span className="font-bold text-gray-300">{user.keysRedeemed}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-gray-500 text-sm font-mono">{timeAgo(user.lastSeen)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Section */}
        {selectedUserId && (
          <div className="w-[800px] animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden h-full sticky top-32 max-h-[calc(100vh-160px)]">
              <UserDetailPanel 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)}
                onBanToggle={(id, banned) => {
                  setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: banned } : u));
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
