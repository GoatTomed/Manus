import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, Key, MousePointer2, AlertCircle, Loader2, Globe, Clock, Activity,
  Plus, Minus, X, ChevronLeft, ChevronRight, Hash, UserCog, Search,
  ShieldBan, ShieldCheck, Trash2, Ban, RotateCcw, ChevronDown, ChevronUp,
  Eye, Calendar, Monitor, MapPin, Fingerprint, KeyRound, BookOpen
} from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  totalKeys: number;
  usedKeys: number;
  dailyStats: { date: string; views: number }[];
  recentVisits: { ip_hash: string; path: string; created_at: string }[];
  pagination: { currentPage: number; totalPages: number; totalItems: number };
}

interface UserSummary {
  id: string;
  totalVisits: number;
  lastSeen: string;
  firstSeen: string;
  paths: string[];
  keysRedeemed: number;
  isBanned: boolean;
}

interface KeyRecord {
  id: string;
  key_value: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
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
  redeemedKeys: KeyRecord[];
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
  const [activeSection, setActiveSection] = useState<"info" | "keys" | "redeemed">("info");
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
    { id: "redeemed", label: "Redeemed", icon: BookOpen },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#00ABFF]/10 border border-[#00ABFF]/20 flex items-center justify-center shrink-0">
            <Fingerprint size={20} className="text-[#00ABFF]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-0.5">User ID</p>
            <p className="text-xs font-mono text-white truncate max-w-[160px]" title={userId}>
              {shortId(userId)}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all shrink-0">
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#00ABFF]" size={32} />
        </div>
      ) : !detail ? null : (
        <>
          {/* Status badge + Ban button */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3 shrink-0">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
              detail.isBanned
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-green-500/10 border-green-500/20 text-green-400"
            }`}>
              {detail.isBanned ? "Banned" : "Active"}
            </span>
            <button
              onClick={() => detail.isBanned ? handleBan() : setShowBanInput(v => !v)}
              disabled={actionLoading["ban"]}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all disabled:opacity-40 ${
                detail.isBanned
                  ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                  : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              }`}
            >
              {actionLoading["ban"] ? (
                <Loader2 size={13} className="animate-spin" />
              ) : detail.isBanned ? (
                <><ShieldCheck size={13} /> Unban</>
              ) : (
                <><ShieldBan size={13} /> Ban</>
              )}
            </button>
          </div>

          {/* Ban reason input */}
          {showBanInput && !detail.isBanned && (
            <div className="px-5 pb-3 flex gap-2 shrink-0">
              <input
                autoFocus
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="Reason (optional)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500/50 transition-all"
              />
              <button
                onClick={handleBan}
                disabled={actionLoading["ban"]}
                className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                Confirm
              </button>
            </div>
          )}

          {/* Ban info */}
          {detail.isBanned && detail.banRecord && (
            <div className="mx-5 mb-3 p-3 bg-red-500/5 border border-red-500/15 rounded-xl shrink-0">
              <p className="text-[11px] text-red-400 font-medium">
                <span className="font-bold">Reason:</span> {detail.banRecord.reason}
              </p>
              <p className="text-[10px] text-red-500/60 mt-1">
                {new Date(detail.banRecord.banned_at).toLocaleString()}
              </p>
            </div>
          )}

          {/* Section tabs */}
          <div className="px-5 pb-3 shrink-0">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 gap-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                    activeSection === s.id
                      ? "bg-[#00ABFF] text-white shadow-lg shadow-[#00ABFF]/20"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  <s.icon size={12} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section content */}
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

            {/* INFO SECTION */}
            {activeSection === "info" && (
              <div className="space-y-4">
                <SectionHeader icon={Eye} title="Visit Statistics" />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Visits", value: detail.visits.length, icon: Eye, color: "#00ABFF" },
                    { label: "Keys Redeemed", value: detail.redeemedKeys.length, icon: KeyRound, color: "#a855f7" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <stat.icon size={14} style={{ color: stat.color }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <SectionHeader icon={Calendar} title="Timeline" />
                <div className="space-y-2">
                  {[
                    { label: "First Seen", value: detail.visits.length > 0 ? new Date(detail.visits[detail.visits.length - 1].created_at).toLocaleString() : "—" },
                    { label: "Last Seen", value: detail.visits.length > 0 ? new Date(detail.visits[0].created_at).toLocaleString() : "—" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{item.label}</span>
                      <span className="text-[11px] text-gray-300 font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>

                <SectionHeader icon={Monitor} title="Recent Activity" />
                <div className="space-y-2">
                  {detail.visits.slice(0, 8).map((v, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 gap-3">
                      <span className="bg-[#00ABFF]/10 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#00ABFF] border border-[#00ABFF]/20 truncate max-w-[100px]">
                        {v.path}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">{timeAgo(v.created_at)}</span>
                    </div>
                  ))}
                  {detail.visits.length === 0 && (
                    <p className="text-center text-gray-600 text-xs py-6 uppercase tracking-widest">No visits recorded</p>
                  )}
                </div>
              </div>
            )}

            {/* KEYS SECTION */}
            {activeSection === "keys" && (
              <div className="space-y-4">
                <SectionHeader icon={KeyRound} title={`All Keys (${detail.generatedKeys.length})`} color="#a855f7" />
                {detail.generatedKeys.length === 0 ? (
                  <p className="text-center text-gray-600 text-xs py-10 uppercase tracking-widest">No keys found</p>
                ) : (
                  <div className="space-y-3">
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
                  </div>
                )}
              </div>
            )}

            {/* REDEEMED SECTION */}
            {activeSection === "redeemed" && (
              <div className="space-y-4">
                <SectionHeader icon={BookOpen} title={`Scripts Redeemed (${detail.redeemedKeys.length})`} color="#22c55e" />
                {detail.redeemedKeys.length === 0 ? (
                  <p className="text-center text-gray-600 text-xs py-10 uppercase tracking-widest">No scripts redeemed</p>
                ) : (
                  <div className="space-y-3">
                    {detail.redeemedKeys.map(k => (
                      <div key={k.key_value} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 hover:border-white/20 transition-all">
                        <code className="text-green-400 text-xs font-mono break-all">{k.key_value}</code>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-600 font-mono">
                            Redeemed {k.used_at ? timeAgo(k.used_at) : "—"}
                          </span>
                          <button
                            onClick={() => handleDeleteKey(k.key_value)}
                            disabled={!!actionLoading[`del-${k.key_value}`]}
                            title="Delete key"
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                          >
                            {actionLoading[`del-${k.key_value}`] ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");
  const [overlay, setOverlay] = useState<{ type: 'add' | 'remove' | null; amount: string }>({ type: null, amount: "100" });
  const [isModifying, setIsModifying] = useState(false);

  // Users sidebar state
  const [showUsersSidebar, setShowUsersSidebar] = useState(false);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchStats = async (showLoading = false, page = currentPage) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await axios.get(`/api/analytics?page=${page}`);
      setData(response.data);
      setLastUpdated(new Date());
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Access Denied or Server Error");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get("/api/analytics/users");
      setUsers(res.data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true, currentPage);
    const interval = setInterval(() => fetchStats(false, currentPage), 10000);
    return () => clearInterval(interval);
  }, [currentPage]);

  useEffect(() => {
    if (showUsersSidebar) fetchUsers();
  }, [showUsersSidebar]);

  const handleModify = async () => {
    if (!overlay.type) return;
    const amount = parseInt(overlay.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsModifying(true);
    try {
      await axios.post("/api/analytics/modify", { type: overlay.type, amount: overlay.amount });
      toast.success(`${overlay.type === 'add' ? 'Injected' : 'Purged'} ${overlay.amount} visits successfully`);
      setOverlay({ type: null, amount: "100" });
      fetchStats(false);
    } catch {
      toast.error("Operation failed");
    } finally {
      setIsModifying(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#00ABFF] mb-6" size={64} />
        <p className="text-gray-400 font-bold animate-pulse tracking-widest text-xs uppercase">Initializing System...</p>
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
          <button onClick={() => window.location.href = "/"} className="w-full bg-[#00ABFF] text-white font-bold py-5 rounded-2xl hover:bg-[#0099EE] transition-all uppercase tracking-widest text-sm shadow-2xl shadow-[#00ABFF]/30">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex font-sans text-white relative selection:bg-[#00ABFF] selection:text-white">
      <Navbar />

      {/* ── Users Sidebar ── */}
      <aside
        className={`fixed top-0 right-0 h-full z-40 flex transition-all duration-300 ease-in-out ${
          showUsersSidebar ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: selectedUserId ? "680px" : "340px" }}
      >
        {/* Detail panel (left side of sidebar) */}
        {selectedUserId && (
          <div className="w-[340px] h-full bg-[#07090f] border-l border-white/10 flex flex-col overflow-hidden">
            <UserDetailPanel
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
              onBanToggle={(id, banned) => {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: banned } : u));
              }}
            />
          </div>
        )}

        {/* User list panel */}
        <div className="w-[340px] h-full bg-[#07090f] border-l border-white/10 flex flex-col overflow-hidden">
          {/* Sidebar header */}
          <div className="p-5 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00ABFF]/10 rounded-xl border border-[#00ABFF]/20">
                  <UserCog size={20} className="text-[#00ABFF]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest">Users</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {users.length} total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUsers}
                  disabled={usersLoading}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all disabled:opacity-40"
                  title="Refresh"
                >
                  <RotateCcw size={16} className={`text-gray-400 ${usersLoading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => { setShowUsersSidebar(false); setSelectedUserId(null); }}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by ID..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#00ABFF]/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {usersLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin text-[#00ABFF]" size={28} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-3">
                <Users size={28} className="text-gray-700" />
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                    className={`w-full text-left px-5 py-4 hover:bg-white/[0.04] transition-all group ${
                      selectedUserId === user.id ? "bg-[#00ABFF]/5 border-r-2 border-[#00ABFF]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${user.isBanned ? "bg-red-500" : "bg-green-500"}`} />
                        <span className="text-xs font-mono text-[#00ABFF] truncate group-hover:text-white transition-colors">
                          {shortId(user.id)}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono shrink-0">{timeAgo(user.lastSeen)}</span>
                    </div>
                    <div className="flex items-center gap-4 pl-4">
                      <div className="flex items-center gap-1.5">
                        <Eye size={11} className="text-gray-600" />
                        <span className="text-[11px] text-gray-500 font-bold">{user.totalVisits}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <KeyRound size={11} className="text-gray-600" />
                        <span className="text-[11px] text-gray-500 font-bold">{user.keysRedeemed}</span>
                      </div>
                      {user.isBanned && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                          Banned
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="p-4 border-t border-white/10 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Total", value: users.length, color: "#00ABFF" },
                { label: "Active", value: users.filter(u => !u.isBanned).length, color: "#22c55e" },
                { label: "Banned", value: users.filter(u => u.isBanned).length, color: "#ef4444" },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar backdrop */}
      {showUsersSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => { setShowUsersSidebar(false); setSelectedUserId(null); }}
        />
      )}

      {/* ── Manipulation Overlay ── */}
      {overlay.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-lg p-6 transition-all">
          <div className="bg-[#0a0d14] border border-white/10 rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl space-y-8 relative overflow-hidden">
            <button onClick={() => setOverlay({ type: null, amount: "100" })} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all">
              <X size={28} />
            </button>
            <div className="text-center space-y-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 ${overlay.type === 'add' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                {overlay.type === 'add' ? <Plus size={32} /> : <Minus size={32} />}
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">
                {overlay.type === 'add' ? 'Inject Traffic' : 'Purge Traffic'}
              </h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Database Protocol</p>
            </div>
            <div className="space-y-6">
              <input
                type="number"
                autoFocus
                value={overlay.amount}
                onChange={e => setOverlay({ ...overlay, amount: e.target.value })}
                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-6 text-center text-5xl font-bold focus:outline-none focus:border-[#00ABFF] transition-all"
                placeholder="0"
              />
              <div className="grid grid-cols-3 gap-4">
                {["100", "500", "1000"].map(val => (
                  <button key={val} onClick={() => setOverlay({ ...overlay, amount: val })} className="bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl text-sm font-bold transition-all">
                    +{val}
                  </button>
                ))}
              </div>
            </div>
            <button
              disabled={isModifying}
              onClick={handleModify}
              className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4 ${
                overlay.type === 'add'
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-2xl shadow-green-600/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-600/30'
              } disabled:opacity-50`}
            >
              {isModifying ? <Loader2 className="animate-spin" size={24} /> : 'Execute Protocol'}
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 p-8 pt-32 max-w-[1400px] mx-auto w-full space-y-12 pb-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-12 bg-[#00ABFF] rounded-full"></div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#00ABFF]">System Analytics</span>
            </div>
            <h1 className="text-6xl font-extrabold tracking-tighter uppercase flex items-center gap-5">
              Live <span className="text-[#00ABFF]">Board</span>
              <span className="flex h-5 w-5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Users sidebar toggle */}
            <button
              onClick={() => setShowUsersSidebar(v => !v)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border font-bold uppercase tracking-widest text-sm transition-all shadow-lg ${
                showUsersSidebar
                  ? "bg-[#00ABFF] border-[#00ABFF] text-white shadow-[#00ABFF]/30"
                  : "bg-white/5 border-white/10 text-gray-300 hover:border-[#00ABFF]/40 hover:text-white"
              }`}
            >
              <Users size={20} />
              Users
              <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                showUsersSidebar ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"
              }`}>
                {data?.uniqueVisitors || 0}
              </span>
            </button>

            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-2xl">
              <button onClick={() => setOverlay({ type: 'add', amount: "100" })} className="p-3 text-green-500 hover:bg-green-500/10 rounded-xl transition-all"><Plus size={32} /></button>
              <div className="w-px h-8 bg-white/10 my-auto mx-2"></div>
              <button onClick={() => setOverlay({ type: 'remove', amount: "100" })} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Minus size={32} /></button>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-[#00ABFF] font-bold uppercase tracking-widest mb-1">Live Sync</div>
              <div className="text-sm text-gray-400 font-mono bg-white/5 px-5 py-2 rounded-2xl border border-white/10">{lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Unique Visitors", value: data?.uniqueVisitors, icon: Globe, color: "#00ABFF" },
            { label: "Total Views", value: data?.totalViews, icon: Users, color: "#3b82f6" },
            { label: "Keys Generated", value: data?.totalKeys, icon: Key, color: "#a855f7" },
            { label: "Keys Redeemed", value: data?.usedKeys, icon: MousePointer2, color: "#22c55e" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-5 hover:border-[#00ABFF]/30 transition-all group shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <stat.icon size={28} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-5xl font-bold tracking-tight">{stat.value?.toLocaleString() || 0}</div>
            </div>
          ))}
        </div>

        {/* Graph Section */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-[#00ABFF]/10 rounded-2xl border border-[#00ABFF]/20">
                <Activity size={32} className="text-[#00ABFF]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Visitor <span className="text-[#00ABFF]">Trend</span></h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">7-day rolling unique visitor log</p>
              </div>
            </div>
          </div>
          <div className="h-[450px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ABFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00ABFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} />
                <YAxis stroke="#666" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => val.toLocaleString()} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0d14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', padding: '14px' }} itemStyle={{ color: '#00ABFF' }} cursor={{ stroke: '#00ABFF', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="views" stroke="#00ABFF" strokeWidth={5} fillOpacity={1} fill="url(#colorViews)" animationDuration={1800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Board Table */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Clock size={32} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Recent <span className="text-[#00ABFF]">Visits</span></h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Real-time unique visitor log</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2.5 hover:bg-white/10 disabled:opacity-20 rounded-xl transition-all">
                <ChevronLeft size={28} />
              </button>
              <div className="flex items-center gap-2 px-5 text-xs font-bold border-x border-white/10">
                <span className="text-gray-500">PAGE</span>
                <span className="text-[#00ABFF] text-xl">{currentPage}</span>
                <span className="text-gray-500">/</span>
                <span className="text-xl">{data?.pagination.totalPages || 1}</span>
              </div>
              <button disabled={currentPage === data?.pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 hover:bg-white/10 disabled:opacity-20 rounded-xl transition-all">
                <ChevronRight size={28} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">
                  <th className="px-10 py-7">Visitor Identifier</th>
                  <th className="px-10 py-7">Resource Path</th>
                  <th className="px-10 py-7">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentVisits.map((visit, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-9 font-mono text-[#00ABFF] text-base group-hover:translate-x-2 transition-transform">
                      {visit.ip_hash}
                    </td>
                    <td className="px-10 py-9">
                      <span className="bg-[#00ABFF]/10 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#00ABFF] border border-[#00ABFF]/20">
                        {visit.path}
                      </span>
                    </td>
                    <td className="px-10 py-9 text-gray-400 text-sm font-medium">
                      {new Date(visit.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!data?.recentVisits || data.recentVisits.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-10 py-24 text-center text-gray-600 font-bold uppercase tracking-[0.35em] text-base">
                      Awaiting Incoming Traffic...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Hash size={18} className="text-gray-600" />
              <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                Total Log Entries: <span className="text-gray-400 ml-3 text-base">{data?.pagination.totalItems.toLocaleString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Jump to page</span>
              <input
                type="number"
                min="1"
                max={data?.pagination.totalPages}
                value={goToPage}
                onChange={e => setGoToPage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = parseInt(goToPage);
                    if (val >= 1 && val <= (data?.pagination.totalPages || 1)) {
                      setCurrentPage(val);
                      setGoToPage("");
                    }
                  }
                }}
                className="bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-3 text-sm font-bold w-28 text-center focus:outline-none focus:border-[#00ABFF] transition-all"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
