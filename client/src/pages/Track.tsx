// Track.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "./trackData";
import {
  getRobloxAvatarThumbnailUrl,
  getRobloxGameIconThumbnailUrl,
  getRobloxUserApiUrl,
  getRobloxUserProfileUrl,
  getRobloxGamePageUrl,
} from "../lib/robloxFetcher";
import "./Track.css";

type HomeView = "clients" | "users";

const DEFAULT_API_BASE = "https://yoursuck.vercel.app";

function resolveApiUrl(path: string) {
  if (typeof window === "undefined") return DEFAULT_API_BASE + path;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
    return path;
  }
  return DEFAULT_API_BASE + path;
}

const homeNav: { id: HomeView; label: string; icon: string }[] = [
  { id: "clients", label: "Clients", icon: "ti-users" },
  { id: "users", label: "Users", icon: "ti-user-circle" },
];

function formatUptime(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function timeAgo(ts: number | string, isOnline: boolean = false) {
  if (isOnline) return <span style={{ color: "#4ade80", fontWeight: "800" }}>Active</span>;
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function normalizeClientName(name: string | undefined, robloxId?: string, cache: Record<string, string> = {}, storedUsers: Record<string, StoredUser> = {}) {
  const raw = (name || "").trim();
  const cleaned = raw.replace(/^#+\s*/, "");
  const previousName = robloxId ? storedUsers[robloxId]?.roblox_name : undefined;
  const cached = robloxId ? cache[robloxId] : undefined;

  if (cleaned && cleaned !== "Player" && !/^Unknown/i.test(cleaned) && !/^[0-9]+$/.test(cleaned)) {
    return cleaned;
  }
  if (previousName && previousName !== "Player" && !/^Unknown/i.test(previousName)) {
    return previousName;
  }
  if (cached && cached.trim() !== "" && cached !== "Player" && !/^Unknown/i.test(cached)) {
    return cached;
  }
  if (raw && raw !== "") return raw;
  if (robloxId) return "Player";
  return "Unknown User";
}

function normalizeClientPlace(place: string | undefined, placeId: string | undefined) {
  const normalized = place?.trim() || "";
  if (normalized && !/unknown/i.test(normalized) && !/^[0-9]+$/.test(normalized) && normalized !== "Roblox") {
    return normalized;
  }
  if (placeId && placeId.trim() !== "") {
    return `Place ${placeId}`;
  }
  return "Unknown Game";
}

function getSessionTotal(sessions: ConnLog[] = [], excludeId?: string) {
  return sessions
    .filter(session => session.id !== excludeId)
    .reduce((sum, session) => sum + (session.uptime || 0), 0);
}

function getActiveUptime(clientId: string, clientUptimes: Record<string, number>, clientUptimeAt: Record<string, number>, now: number) {
  const base = Number(clientUptimes[clientId] || 0);
  const at = Number(clientUptimeAt[clientId] || now);
  const elapsed = Math.max(0, Math.floor((now - at) / 1000));
  return base + elapsed;
}

function getLifetimeTotal(client: Client, storedUser: StoredUser | undefined, activeUptime: number) {
  const dbTotal = Number((client.totalUptime ?? storedUser?.totalUptime) || 0);
  return dbTotal + activeUptime;
}

function RobloxAvatar(props: { robloxId?: string | null; size?: number; useLocalApi?: boolean; href?: string; srcUrl?: string }) {
  const { robloxId, size = 40, useLocalApi = false, href, srcUrl } = props;
  const [url, setUrl] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(href || null);

  useEffect(() => {
    if (!robloxId) return;
    if (!href) setProfileUrl(getRobloxUserProfileUrl(robloxId));
    if (srcUrl && typeof srcUrl === "string" && (srcUrl.startsWith("http://") || srcUrl.startsWith("https://"))) {
      setUrl(srcUrl);
      return;
    }
    let apiUrl = srcUrl || (useLocalApi ? `/api/roblox-avatar?userId=${robloxId}` : resolveApiUrl(`/api/roblox-avatar?userId=${robloxId}`));
    if (srcUrl && !useLocalApi && srcUrl.startsWith("/")) {
      apiUrl = resolveApiUrl(srcUrl);
    }
    let cancelled = false;
    const tryFetchAvatar = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`status:${res.status}`);
        const data = await res.json();
        const u = data?.data?.[0]?.imageUrl;
        if (u && !cancelled) {
          setUrl(u);
          return;
        }
      } catch {
        // fallback to Roblox direct thumbnail if local endpoint fails
      }
      if (!cancelled) {
        setUrl(getRobloxAvatarThumbnailUrl(robloxId));
      }
    };
    tryFetchAvatar();
    return () => { cancelled = true; };
  }, [robloxId, useLocalApi, srcUrl, href]);

  const fallbackLabel = robloxId ? robloxId.toString().slice(0, 2).toUpperCase() : "?";

  return (
    <a href={href || profileUrl || "#"} target="_blank" rel="noreferrer" style={{ display: "inline-block", textDecoration: "none" }}>
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url ? (
          <img src={url} alt="Roblox avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "#8b8b8b", fontSize: size * 0.45, fontWeight: 700 }}>{fallbackLabel}</span>
        )}
      </div>
    </a>
  );
}

function GameIcon(props: { placeId: string; size?: number; useLocalApi?: boolean; href?: string; srcUrl?: string }) {
  const { placeId, size = 72, useLocalApi = false, href, srcUrl } = props;
  const [url, setUrl] = useState<string | null>(null);
  const [gameUrl, setGameUrl] = useState<string | null>(href || null);

  useEffect(() => {
    if (!placeId) return;
    if (!href) setGameUrl(getRobloxGamePageUrl(placeId));
    if (srcUrl && typeof srcUrl === "string" && (srcUrl.startsWith("http://") || srcUrl.startsWith("https://"))) {
      setUrl(srcUrl);
      return;
    }
    let apiUrl = srcUrl || (useLocalApi ? `/api/roblox-gameicon?placeId=${placeId}` : resolveApiUrl(`/api/roblox-gameicon?placeId=${placeId}`));
    if (srcUrl && !useLocalApi && srcUrl.startsWith("/")) {
      apiUrl = resolveApiUrl(srcUrl);
    }
    let cancelled = false;
    const tryFetchGameIcon = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`status:${res.status}`);
        const data = await res.json();
        const u = data?.data?.[0]?.imageUrl;
        if (u && !cancelled) {
          setUrl(u);
          return;
        }
      } catch {
        // fallback to Roblox direct thumbnail if local endpoint fails
      }
      if (!cancelled) {
        setUrl(getRobloxGameIconThumbnailUrl(placeId));
      }
    };
    tryFetchGameIcon();
    return () => { cancelled = true; };
  }, [placeId, useLocalApi, srcUrl, href]);

  return (
    <a href={href || gameUrl || "#"} target="_blank" rel="noreferrer" style={{ display: "inline-block", textDecoration: "none" }}>
      <div style={{ width: size, height: size, borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url ? <img src={url} alt="Roblox game icon" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-device-gamepad" style={{ fontSize: size * 0.35, color: "#52525b" }}></i>}
      </div>
    </a>
  );
}

type ConnLog = { id: string; roblox_id: string; roblox_name: string; place_id: string; place_name: string; place_url?: string; executor: string; connected_at: string; uptime: number; };
type StoredUser = {
  roblox_id: string;
  roblox_name: string;
  last_seen: string;
  totalUptime: number;
  currentSessionId?: string;
  lastObservedUptime?: number;
  sessions: ConnLog[];
};

function loadStoredUsers(): Record<string, StoredUser> {
  try {
    const parsed = JSON.parse(localStorage.getItem("ys_users") || "{}");
    if (!parsed || typeof parsed !== "object") return {};
    return Object.keys(parsed).reduce((acc, key) => {
      const entry = parsed[key];
      if (!entry || typeof entry !== "object") return acc;
      acc[key] = {
        roblox_id: String(entry.roblox_id || key),
        roblox_name: String(entry.roblox_name || "Player"),
        last_seen: String(entry.last_seen || new Date().toISOString()),
        totalUptime: Number(entry.totalUptime || 0),
        currentSessionId: typeof entry.currentSessionId === "string" ? entry.currentSessionId : undefined,
        lastObservedUptime: Number(entry.lastObservedUptime || 0) || undefined,
        sessions: Array.isArray(entry.sessions) ? entry.sessions : [],
      };
      return acc;
    }, {} as Record<string, StoredUser>);
  } catch {
    return {};
  }
}
function saveStoredUsers(map: Record<string, StoredUser>) {
  try { localStorage.setItem("ys_users", JSON.stringify(map)); } catch {}
}

const labelStyle = { color: "#71717a", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", fontWeight: "700", marginBottom: "8px" };

export default function Track() {
  const CLIENT_STALE_MS = 15 * 1000; // consider clients stale after 15s of no heartbeat (UI-only)
  const [inClientMode, setInClientMode] = useState(false);
  const [homeView, setHomeView] = useState<HomeView>("clients");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientUptimes, setClientUptimes] = useState<Record<string, number>>({});
  const [clientUptimeAt, setClientUptimeAt] = useState<Record<string, number>>({});
  const [now, setNow] = useState<number>(Date.now());
  const [clientQuery, setClientQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
    const [accessDenied, setAccessDenied] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [scriptInput, setScriptInput] = useState("");

  const pushTrackUrl = (robloxId?: string) => {
    if (typeof window === "undefined") return;
    const url = robloxId ? `/track?u=${encodeURIComponent(robloxId)}` : "/track";
    window.history.replaceState({}, "", url);
  };
  const [useLocalApi, setUseLocalApi] = useState(() => {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.");
  });
  const getApiUrl = (path: string) => useLocalApi ? path : resolveApiUrl(path);
  const getApiUrls = (path: string) => useLocalApi ? [path, resolveApiUrl(path)] : [resolveApiUrl(path)];
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [storedUsers, setStoredUsers] = useState<Record<string, StoredUser>>(loadStoredUsers);
  const [robloxNameCache, setRobloxNameCache] = useState<Record<string, string>>({});
  const robloxNameCacheRef = useRef<Record<string, string>>(robloxNameCache);
  useEffect(() => { robloxNameCacheRef.current = robloxNameCache; }, [robloxNameCache]);

  // Previously the UI was gated by a fixed IP check which could prevent the
  // page from rendering in many environments (blocked requests, CORS, etc.).
  // Remove the gating and allow the app to show the Track UI by default.
  useEffect(() => {
    setAccessChecked(true);
  }, []);


  useEffect(() => {
    if (homeView === "users") {
      // the users view remains available as the second tab
    }
  }, [homeView]);

  const fetchRobloxName = async (userId: string) => {
    if (!userId || robloxNameCache[userId]) return;
    const endpoints = getApiUrls(`/api/roblox-user?userId=${encodeURIComponent(userId)}`);
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data && typeof data.name === "string" && data.name.trim() !== "") {
          setRobloxNameCache(prev => ({ ...prev, [userId]: data.name }));
          return;
        }
      } catch (error) {
        // try next endpoint
      }
    }
    console.warn("Failed to fetch Roblox name for", userId);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const urls = useLocalApi
          ? [
              `/api/client-lookup`,
              `/api/clients`,
              resolveApiUrl(`/api/client-lookup`),
              resolveApiUrl(`/api/clients`),
            ]
          : [resolveApiUrl(`/api/client-lookup`), resolveApiUrl(`/api/clients`)];
        let res: Response | null = null;
        for (const url of urls) {
          try {
            const candidate = await fetch(url);
            if (candidate.ok) {
              res = candidate;
              break;
            }
          } catch (err) {
            // try next endpoint
          }
        }
        if (res && res.ok) {
          const data: Client[] = await res.json();
          setClients(data);
          const namesToFetch: string[] = [];
          const ts = Date.now();
          const cache = robloxNameCacheRef.current;
          setClientUptimes(prevUT => {
            const nextUT: Record<string, number> = {};
            setClientUptimeAt(prevAt => {
              const nextAt: Record<string, number> = { ...prevAt };
              data.forEach(c => {
                const serverUptime = Number(c.uptime || 0);
                const heartbeat = Number(c.lastHeartbeat || ts);
                const prevUptime = Number(prevUT[c.id] ?? -1);
                nextUT[c.id] = serverUptime;
                if (prevUptime !== serverUptime || typeof nextAt[c.id] === "undefined") {
                  nextAt[c.id] = heartbeat;
                }
              });
              return nextAt;
            });
            return nextUT;
          });
          setStoredUsers(prev => {
            const activeIds = new Set<string>();
            const updated = { ...prev };

            data.forEach(c => {
              if (!c.robloxId) return;
              activeIds.add(c.robloxId);
              if ((!c.name || c.name === "Player" || c.name.trim() === "" || /^#+|^[0-9]+$/.test(c.name)) && !cache[c.robloxId]) {
                namesToFetch.push(c.robloxId);
              }
              const existing = updated[c.robloxId];
              const displayName = normalizeClientName(c.name, c.robloxId, cache, updated);
              // prefer server-provided totalUptime when available (persisted via Supabase)
              let totalUptime = Number(c.totalUptime || existing?.totalUptime || 0) || 0;
              if (existing?.currentSessionId && existing.currentSessionId !== c.id) {
                totalUptime += existing.lastObservedUptime || 0;
              }
              const currentUptime = Number(c.uptime || 0);
              const sessionEntry: ConnLog = {
                id: c.id,
                roblox_id: c.robloxId,
                roblox_name: displayName,
                place_id: c.placeId,
                place_name: normalizeClientPlace(c.place, c.placeId),
                place_url: c.placeId ? getRobloxGamePageUrl(c.placeId) : undefined,
                executor: c.executor || "Unknown",
                connected_at: new Date(c.lastHeartbeat || ts).toISOString(),
                uptime: currentUptime,
              };
              updated[c.robloxId] = {
                roblox_id: c.robloxId,
                roblox_name: displayName,
                last_seen: new Date().toISOString(),
                totalUptime,
                currentSessionId: c.id,
                lastObservedUptime: currentUptime,
                sessions: existing
                  ? [sessionEntry, ...existing.sessions.filter(s => s.place_id !== c.placeId)].slice(0, 20)
                  : [sessionEntry],
              };
            });

            Object.keys(updated).forEach(userId => {
              if (activeIds.has(userId)) return;
              const entry = updated[userId];
              if (entry.currentSessionId) {
                entry.totalUptime = (entry.totalUptime || 0) + (entry.lastObservedUptime || 0);
                entry.currentSessionId = undefined;
                entry.lastObservedUptime = undefined;
              }
            });

            saveStoredUsers(updated);
            return updated;
          });
          // prune client uptime trackers for clients that are no longer active
          setClientUptimes(prev => {
            const next: Record<string, number> = {};
            data.forEach(c => { if (c && c.id) next[c.id] = prev[c.id] ?? 0; });
            return next;
          });
          setClientUptimeAt(prev => {
            const next: Record<string, number> = {};
            data.forEach(c => { if (c && c.id) next[c.id] = prev[c.id] ?? Date.now(); });
            return next;
          });
          // if the selected client disappears, clear selection and exit client mode
          setSelectedClient(prevSel => {
            if (!prevSel) return prevSel;
            const still = data.find(d => String(d.robloxId) === String(prevSel.robloxId) && d.id === prevSel.id);
            if (still) return prevSel;
            setInClientMode(false);
            pushTrackUrl();
            return null;
          });
          namesToFetch.forEach(id => void fetchRobloxName(id));
        }
      } catch (e: any) { console.error("Error fetching clients:", e.message); } finally { setLoading(false); }
    };
    fetchClients();
    const interval = setInterval(fetchClients, 1000);
    return () => clearInterval(interval);
  }, []);
    // If URL contains ?u=xxx, auto-select that client when clients list is available
    useEffect(() => {
      if (selectedClient || !clients.length) return;
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const u = params.get("u");
      if (!u) return;
      const match = clients.find(c => String(c.robloxId) === u);
      if (match) {
        setSelectedClient(match);
        setInClientMode(true);
      }
    }, [clients, selectedClient]);

    // Keep selected client object synced with updated client entries
    useEffect(() => {
      if (!selectedClient) return;
      const updated = clients.find(c => String(c.robloxId) === String(selectedClient.robloxId));
      if (updated && (updated.place !== selectedClient.place || updated.name !== selectedClient.name || updated.executor !== selectedClient.executor || updated.placeId !== selectedClient.placeId)) {
        setSelectedClient(updated);
      }
    }, [clients, selectedClient]);

    // Tick to force re-render every second so displayed uptime updates smoothly
    useEffect(() => {
      const t = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(t);
    }, []);

  const filteredClients = useMemo(() => clients.filter(c => {
    const last = Number(c.lastHeartbeat || 0);
    const alive = (Date.now() - last) < CLIENT_STALE_MS;
    if (!alive) return false;
    return c.name.toLowerCase().includes(clientQuery.toLowerCase()) ||
      c.place?.toLowerCase().includes(clientQuery.toLowerCase());
  }), [clients, clientQuery, now]);

  const activeGameCount = useMemo(() => {
    const alive = clients.filter(c => (Date.now() - Number(c.lastHeartbeat || 0)) < CLIENT_STALE_MS);
    return new Set(alive.map(c => c.place || "")).size;
  }, [clients, now]);
  const uniqueExecutorCount = useMemo(() => {
    const alive = clients.filter(c => (Date.now() - Number(c.lastHeartbeat || 0)) < CLIENT_STALE_MS);
    return new Set(alive.map(c => c.executor || "Unknown")).size;
  }, [clients, now]);

  const filteredUsers = useMemo(() => {
    const list = Object.values(storedUsers);
    return list.filter(u => 
      u.roblox_name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.roblox_id.toLowerCase().includes(userQuery.toLowerCase())
    ).sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
  }, [storedUsers, userQuery]);

  const onlineNow = (robloxId: string) => clients.find(c => String(c.robloxId) === String(robloxId));
  const selectedUserData = selectedUser ? storedUsers[selectedUser] : null;

  // Command delivery and announcement features removed per request.

  if (!accessChecked) return null;
  if (accessDenied) return (
    <div style={{ height: "100vh", background: "#080808", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk" }}>
      <div style={{ width: "80px", height: "80px", background: "rgba(255,255,255,0.05)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        <i className="ti ti-lock" style={{ fontSize: "32px", color: "#f87171" }}></i>
      </div>
      <h1 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "8px" }}>Access Denied</h1>
      <p style={{ color: "#71717a", fontSize: "14px" }}>Your IP is not authorized to access this panel.</p>
    </div>
  );

  return (
    <div className="track-page">
      <aside className="fixed-sidebar">
        <nav className="sidebar-nav">
          {homeNav.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${homeView === item.id && !inClientMode ? "active" : ""}`}
              onClick={() => { setHomeView(item.id); setInClientMode(false); setSelectedUser(null); setSelectedClient(null); pushTrackUrl(); }}
            >
              <i className={`ti ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content has-fixed-sidebar">
        <div className="view-container">
          {homeView === "clients" && !inClientMode && (
            <div className="view active animate-slide-in">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: "900" }}>Clients</h1>
                <div className="search-container">
                  <i className="ti ti-search" style={{ color: "#52525b" }}></i>
                  <input placeholder="Search clients..." value={clientQuery} onChange={e => setClientQuery((e.target as HTMLInputElement).value)} />
                </div>
              </div>
              <div className="dashboard-summary">
                <div className="summary-card">
                  <div className="summary-label">Active clients</div>
                  <div className="summary-value">{filteredClients.length}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Active games</div>
                  <div className="summary-value">{activeGameCount}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Executors</div>
                  <div className="summary-value">{uniqueExecutorCount}</div>
                </div>
              </div>
              <div className="client-grid">
                {filteredClients.map(c => (
                  <div key={c.id} className="glass-card" onClick={() => { setSelectedClient(c); setInClientMode(true); pushTrackUrl(c.robloxId); }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <RobloxAvatar robloxId={c.robloxId ?? ""} size={48} useLocalApi={useLocalApi} href={c.profileUrl} srcUrl={c.avatarUrl} />
                      <div>
                          <div style={{ fontSize: "16px", fontWeight: "800" }}>{normalizeClientName(c.name, c.robloxId, robloxNameCache, storedUsers)}</div>
                      </div>
                    </div>
                    <div className="card-info-row">
                      <div>
                        <div style={labelStyle}>Current Game</div>
                        <div style={{ fontSize: "13px", fontWeight: "700" }}>{normalizeClientPlace(c.place, c.placeId)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={labelStyle}>Uptime</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#00ABFF" }}>{
                          (() => {
                            const base = Number(clientUptimes[c.id] || 0);
                            const at = Number(clientUptimeAt[c.id] || now);
                            const elapsed = Math.max(0, Math.floor((now - at) / 1000));
                            return formatUptime(base + elapsed);
                          })()
                        }</div>
                        {/* total lifetime removed; only show current session uptime */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inClientMode && selectedClient && (
            <div className="view active animate-slide-in">
              <button className="btn-secondary" style={{ marginBottom: "32px" }} onClick={() => { setInClientMode(false); setSelectedClient(null); pushTrackUrl(); }}>
                <i className="ti ti-arrow-left"></i> Back to Clients
              </button>
              <div className="glass-card" style={{ padding: "40px", marginBottom: "40px" }}>
                <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                  <RobloxAvatar robloxId={selectedClient.robloxId ?? ""} size={120} useLocalApi={useLocalApi} href={selectedClient.profileUrl} srcUrl={selectedClient.avatarUrl} />
                  <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "4px" }}>{normalizeClientName(selectedClient.name, selectedClient.robloxId, robloxNameCache, storedUsers)}</h1>
                    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                      <span className="status-badge active">Online</span>
                      <span className="executor-badge">{selectedClient.executor}</span>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ fontSize: "14px", color: "#a5b4fc" }}>
                        <strong>Current Uptime:</strong> {formatUptime(getActiveUptime(selectedClient.id, clientUptimes, clientUptimeAt, now))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
                    <GameIcon placeId={selectedClient.placeId} size={96} useLocalApi={useLocalApi} href={selectedClient.gameUrl} srcUrl={selectedClient.gameIconUrl} />
                    <div style={{ fontSize: "20px", fontWeight: "800" }}>{normalizeClientPlace(selectedClient.place, selectedClient.placeId)}</div>
                    {selectedClient.placeId ? <div style={{ fontSize: "14px", color: "#52525b" }}>{selectedClient.placeId}</div> : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {homeView === "users" && (
            <div className="view active animate-slide-in">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: "900" }}>Users</h1>
                <div className="search-container">
                  <i className="ti ti-search" style={{ color: "#52525b" }}></i>
                  <input placeholder="Search users..." value={userQuery} onChange={e => setUserQuery((e.target as HTMLInputElement).value)} />
                </div>
              </div>
              <div className="user-list">
                {filteredUsers.map(u => (
                  <div key={u.roblox_id} className={`user-row ${selectedUser === u.roblox_id ? "active" : ""}`} onClick={() => setSelectedUser(u.roblox_id)}>
                    <RobloxAvatar robloxId={u.roblox_id} size={48} useLocalApi={useLocalApi} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: "16px", fontWeight: "800" }}>{u.roblox_name}</div>
                        {u.sessions && u.sessions[0] && u.sessions[0].place_id ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <GameIcon
                              placeId={u.sessions[0].place_id}
                              size={36}
                              useLocalApi={useLocalApi}
                              href={u.sessions[0].place_url}
                              srcUrl={u.sessions[0].place_id ? `/api/roblox-gameicon?placeId=${u.sessions[0].place_id}` : undefined}
                            />
                            <div style={{ fontSize: "12px", color: "#71717a", fontWeight: 700 }}>{normalizeClientPlace(u.sessions[0].place_name, u.sessions[0].place_id)}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {timeAgo(u.last_seen, !!onlineNow(u.roblox_id))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>
      </main>

      {/* ── SIDEBARS DE DÉTAILS ── */}
      {selectedUserData && (
        <div className="profile-sidebar animate-slide-in">
          <button className="btn-secondary" style={{ marginBottom: "32px" }} onClick={() => setSelectedUser(null)}>Close</button>
          <div className="profile-card" style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <RobloxAvatar robloxId={selectedUserData.roblox_id} size={100} useLocalApi={useLocalApi} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "900", marginTop: "16px" }}>{selectedUserData.roblox_name}</h2>
            <div style={{ marginTop: "16px" }}>{timeAgo(selectedUserData.last_seen, !!onlineNow(selectedUserData.roblox_id))}</div>
          </div>
          <div style={labelStyle}>Game History</div>
          <div className="user-list">
            {selectedUserData.sessions.map((s, i) => {
              const currentClient = onlineNow(selectedUserData.roblox_id);
              const isCurrent = currentClient?.id === s.id;
              return (
                <div key={i} className="user-row" style={{ background: isCurrent ? "rgba(0,171,255,0.05)" : "rgba(255,255,255,0.01)" }}>
                  <GameIcon placeId={s.place_id} size={40} useLocalApi={useLocalApi} href={s.place_url} srcUrl={s.place_id ? `/api/roblox-gameicon?placeId=${s.place_id}` : undefined} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "800" }}>{normalizeClientPlace(s.place_name, s.place_id)}</div>
                    <div style={{ fontSize: "11px", color: "#71717a" }}>{timeAgo(s.connected_at, isCurrent)}</div>
                  </div>
                  {isCurrent && <span className="status-badge active">Current</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
