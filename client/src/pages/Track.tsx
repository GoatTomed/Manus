import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "wouter";
import {
  Activity,
  Users,
  Gamepad2,
  Server,
  Search,
  RefreshCw,
  Loader2,
  KeyRound,
  Cpu,
  ArrowLeft,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Session {
  key_value: string;
  roblox_id: string;
  roblox_username: string | null;
  place_id: string | null;
  game_name: string | null;
  executor: string | null;
  last_seen: string;
  online: boolean;
}

interface TrackData {
  sessions: Session[];
  stats: { online: number; total: number; games: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function maskKey(key: string) {
  if (key.length <= 4) return key;
  return key;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: any;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
        style={{
          background: accent ? "rgba(0,171,255,0.12)" : "rgba(255,255,255,0.04)",
          color: accent ? "#00ABFF" : "#9ca3af",
        }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function Track() {
  const [data, setData] = useState<TrackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchSessions = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await axios.get("/api/track/sessions");
      setData(res.data);
      setLastUpdated(new Date());
      setError("");
    } catch {
      setError("Failed to load live sessions.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(true);
    const interval = setInterval(() => fetchSessions(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let list = data?.sessions ?? [];
    if (onlineOnly) list = list.filter((s) => s.online);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.key_value.toLowerCase().includes(q) ||
          (s.roblox_username || "").toLowerCase().includes(q) ||
          (s.game_name || "").toLowerCase().includes(q) ||
          (s.roblox_id || "").toLowerCase().includes(q) ||
          (s.place_id || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, query, onlineOnly]);

  return (
    <div className="min-h-screen text-foreground">
      {/* Topbar */}
      <header className="navbar fixed top-0 left-0 right-0 z-50 h-14">
        <div className="mx-auto flex h-full max-w-6xl items-center gap-3 px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-5 w-px bg-border" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-foreground">You</span>
            <span style={{ color: "#00ABFF" }}>Suck</span>
          </span>
          <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Live Tracker
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
              <RefreshCw className="h-3 w-3" />
              {timeAgo(lastUpdated.toISOString())}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#22c55e" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />
              </span>
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Active Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keys currently online and the Roblox games calling the script in real time.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Online Now" value={data?.stats.online ?? 0} icon={Activity} accent />
          <StatCard label="Total Sessions" value={data?.stats.total ?? 0} icon={Users} />
          <StatCard label="Active Games" value={data?.stats.games ?? 0} icon={Gamepad2} />
          <StatCard
            label="Server"
            value={error ? "Down" : "Healthy"}
            icon={Server}
          />
        </div>

        {/* Toolbar */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by key, username, Roblox ID or game…"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#00ABFF]"
            />
          </div>
          <button
            onClick={() => setOnlineOnly((v) => !v)}
            className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            style={{
              borderColor: onlineOnly ? "#00ABFF" : "var(--border)",
              color: onlineOnly ? "#00ABFF" : "#9ca3af",
              background: onlineOnly ? "rgba(0,171,255,0.08)" : "transparent",
            }}
          >
            Online only
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-border bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Key / User</div>
            <div>Game</div>
            <div className="hidden sm:block">Executor</div>
            <div className="text-right">Status</div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading live sessions…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-muted-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                {query || onlineOnly ? "No sessions match your filter." : "No active sessions yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((s) => (
                <div
                  key={s.key_value}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                >
                  {/* Key / User */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-medium text-foreground">
                      <KeyRound className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#00ABFF" }} />
                      <span className="truncate">{maskKey(s.key_value)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <Users className="h-3 w-3 flex-shrink-0" />
                      {s.roblox_username || "Unknown"}
                      <span className="text-[10px] opacity-60">#{s.roblox_id}</span>
                    </div>
                  </div>

                  {/* Game */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate text-sm text-foreground">
                      <Gamepad2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{s.game_name || "Unknown game"}</span>
                    </div>
                    {s.place_id && (
                      <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                        place: {s.place_id}
                      </div>
                    )}
                  </div>

                  {/* Executor */}
                  <div className="hidden min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground sm:flex">
                    <Cpu className="h-3.5 w-3.5 flex-shrink-0" />
                    {s.executor || "—"}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: s.online ? "#22c55e" : "#6b7280" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: s.online ? "#22c55e" : "#9ca3af" }}
                    >
                      {s.online ? "Online" : timeAgo(s.last_seen)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
