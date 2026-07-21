// Track.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "./trackData";
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

function normalizeClientName(name: string | undefined, robloxId?: string, cache: Record<string, string> = {}) {
  const raw = name && name !== "Player" && name.trim() !== "" ? name : cache[robloxId || ""];
  let result = raw ? raw.toString().replace(/^#+\s*/, "") : "";
  if (!result || /^[0-9]+$/.test(result)) {
    if (cache[robloxId || ""]) return cache[robloxId || ""];
    if (robloxId) return `#${robloxId}`;
    return "Unknown User";
  }
  return result;
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

function RobloxAvatar(props: { robloxId?: string | null; size?: number; useLocalApi?: boolean }) {
  const { robloxId, size = 40, useLocalApi = false } = props;
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!robloxId) return;
    const apiUrl = useLocalApi ? `/api/roblox-avatar?userId=${robloxId}` : resolveApiUrl(`/api/roblox-avatar?userId=${robloxId}`);
    fetch(apiUrl)
      .then(r => r.json())
      .then(data => { const u = data?.data?.[0]?.imageUrl; if (u) setUrl(u); })
      .catch(() => {});
  }, [robloxId, useLocalApi]);
  const fallbackLabel = robloxId ? robloxId.toString().slice(0, 2).toUpperCase() : "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {url ? (
        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ color: "#8b8b8b", fontSize: size * 0.45, fontWeight: 700 }}>{fallbackLabel}</span>
      )}
    </div>
  );
}

function GameIcon(props: { placeId: string; size?: number; useLocalApi?: boolean }) {
  const { placeId, size = 72, useLocalApi = false } = props;
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!placeId) return;
    const apiUrl = useLocalApi ? `/api/roblox-gameicon?placeId=${placeId}` : resolveApiUrl(`/api/roblox-gameicon?placeId=${placeId}`);
    fetch(apiUrl)
      .then(r => r.json())
      .then(data => { const u = data?.data?.[0]?.imageUrl; if (u) setUrl(u); })
      .catch(() => {});
  }, [placeId, useLocalApi]);
  return (
    <div style={{ width: size, height: size, borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {url ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-device-gamepad" style={{ fontSize: size * 0.35, color: "#52525b" }}></i>}
    </div>
  );
}

type ConnLog = { id: string; roblox_id: string; roblox_name: string; place_id: string; place_name: string; executor: string; connected_at: string; uptime: number; };
type StoredUser = { roblox_id: string; roblox_name: string; last_seen: string; sessions: ConnLog[]; };

function loadStoredUsers(): Record<string, StoredUser> {
  try { return JSON.parse(localStorage.getItem("ys_users") || "{}"); } catch { return {}; }
}
function saveStoredUsers(map: Record<string, StoredUser>) {
  try { localStorage.setItem("ys_users", JSON.stringify(map)); } catch {}
}

const labelStyle = { color: "#71717a", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", fontWeight: "700", marginBottom: "8px" };

export default function Track() {
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
  const [lastCommandLog, setLastCommandLog] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [storedUsers, setStoredUsers] = useState<Record<string, StoredUser>>(loadStoredUsers);
  const [robloxNameCache, setRobloxNameCache] = useState<Record<string, string>>({});
  const robloxNameCacheRef = useRef<Record<string, string>>(robloxNameCache);
  useEffect(() => { robloxNameCacheRef.current = robloxNameCache; }, [robloxNameCache]);
  const [announcementText, setAnnouncementText] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");

  // Previously the UI was gated by a fixed IP check which could prevent the
  // page from rendering in many environments (blocked requests, CORS, etc.).
  // Remove the gating and allow the app to show the Track UI by default.
  useEffect(() => {
    setAccessChecked(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette(true);
      }
      if (e.key === "Escape") setShowPalette(false);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
    return () => {};
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
        let res = await fetch(getApiUrl(`/api/clients`));
        if (!res.ok && useLocalApi) {
          res = await fetch(resolveApiUrl(`/api/clients`));
        }
        if (res.ok) {
          const data: Client[] = await res.json();
          setClients(data);
          const namesToFetch: string[] = [];
          const ts = Date.now();
          setClientUptimes(prevUT => {
            const nextUT: Record<string, number> = {};
            setClientUptimeAt(prevAt => {
              const nextAt: Record<string, number> = { ...prevAt };
              data.forEach(c => {
                const serverUptime = Number(c.uptime || 0);
                const prevUptime = Number(prevUT[c.id] ?? -1);
                nextUT[c.id] = serverUptime;
                if (prevUptime !== serverUptime || typeof nextAt[c.id] === "undefined") {
                  nextAt[c.id] = ts;
                }
              });
              return nextAt;
            });
            return nextUT;
          });
          setStoredUsers(prev => {
            const updated = { ...prev };
            data.forEach(c => {
              if (!c.robloxId) return;
              const normalizedName = normalizeClientName(c.name, c.robloxId, robloxNameCache);
              if ((!c.name || c.name === "Player" || c.name.trim() === "" || /^#+|^[0-9]+$/.test(c.name)) && !cache[c.robloxId]) {
                namesToFetch.push(c.robloxId);
              }
              const existing = updated[c.robloxId];
              const normalizedName = normalizeClientName(c.name, c.robloxId, cache);
              const sessionEntry: ConnLog = {
                id: c.id,
                roblox_id: c.robloxId,
                roblox_name: normalizedName,
                place_id: c.placeId,
                place_name: normalizeClientPlace(c.place, c.placeId),
                executor: c.executor || "Unknown",
                connected_at: new Date().toISOString(),
                uptime: c.uptime || 0,
              };
              updated[c.robloxId] = {
                roblox_id: c.robloxId,
                roblox_name: normalizedName,
                last_seen: new Date().toISOString(),
                sessions: existing
                  ? [sessionEntry, ...existing.sessions.filter(s => s.place_id !== c.placeId)].slice(0, 20)
                  : [sessionEntry],
              };
            });
            saveStoredUsers(updated);
            return updated;
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

  const filteredClients = useMemo(() => clients.filter(c =>
    c.name.toLowerCase().includes(clientQuery.toLowerCase()) ||
    c.place?.toLowerCase().includes(clientQuery.toLowerCase())
  ), [clients, clientQuery]);

  const activeGameCount = useMemo(() => new Set(clients.map(c => c.place || "")).size, [clients]);
  const uniqueExecutorCount = useMemo(() => new Set(clients.map(c => c.executor || "Unknown")).size, [clients]);

  const filteredUsers = useMemo(() => {
    const list = Object.values(storedUsers);
    return list.filter(u => 
      u.roblox_name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.roblox_id.toLowerCase().includes(userQuery.toLowerCase())
    ).sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
  }, [storedUsers, userQuery]);

  const onlineNow = (robloxId: string) => clients.find(c => String(c.robloxId) === String(robloxId));
  const selectedUserData = selectedUser ? storedUsers[selectedUser] : null;

  async function sendCommand(robloxId: string | undefined, type: string, script = "") {
    if (!robloxId) {
      console.warn("sendCommand: missing robloxId", type);
      return false;
    }
    try {
      const body = JSON.stringify({ robloxId, type: type.toLowerCase(), script });
      const urls = getApiUrls(`/api/clients?command=1`);
      let lastErr: any = null;
      for (const url of urls) {
        try {
          console.log("sendCommand->", url, body);
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
          if (!res.ok) {
            const err = await res.text().catch(() => null);
            lastErr = { url, status: res.status, body: err };
            console.warn("Command send failed", url, type, robloxId, err);
            setLastCommandLog({ url, ok: false, status: res.status, body: err });
            continue;
          }
          const data = await res.json().catch(() => null);
          const okResponse = data?.success === true;
          if (!okResponse) {
            lastErr = { url, status: res.status, body: data };
            console.warn("Command endpoint returned non-success response", url, data);
            setLastCommandLog({ url, ok: false, status: res.status, body: data });
            continue;
          }
          setLastCommandLog({ url, ok: true, status: res.status, body: data });
          return true;
        } catch (e) {
          lastErr = e;
          console.warn("Command send exception", url, e);
          setLastCommandLog({ url, ok: false, error: String(e) });
          continue;
        }
      }
      console.warn("All command endpoints failed", lastErr);
      setLastCommandLog({ ok: false, error: lastErr });
      return false;
    } catch (error) {
      console.warn("Command send error", error);
      setLastCommandLog({ ok: false, error: String(error) });
      return false;
    }
  }

  async function handleClientCommand(type: string, script = "") {
    if (!selectedClient) {
      if (typeof alert !== "undefined") alert("No client selected.");
      return false;
    }
    if (!selectedClient.robloxId) {
      if (typeof alert !== "undefined") alert("Selected client has no robloxId.");
      return false;
    }
    const ok = await sendCommand(selectedClient.robloxId, type, script);
    if (!ok && typeof alert !== "undefined") {
      alert(`Failed to send ${type} command.`);
      return false;
    }
    // Optimistically update UI for kick/ban actions
    if (ok && (type.toLowerCase() === "kick" || type.toLowerCase() === "ban")) {
      setClients(prev => prev.filter(c => String(c.robloxId) !== String(selectedClient.robloxId)));
      setSelectedClient(null);
      setInClientMode(false);
      pushTrackUrl();
      if (typeof alert !== "undefined") {
        alert(`${type} command sent.`);
      }
    }
    return ok;
  }

  async function broadcastAnnouncement() {
    if (!announcementText.trim()) return;
    setSendingAnnouncement(true);
    try {
      const promises = clients.map(c => c.robloxId ? sendCommand(c.robloxId, "announcement", announcementText) : Promise.resolve(false));
      await Promise.all(promises);
      setAnnouncementText("");
      if (typeof alert !== "undefined") alert("Announcement sent to all active clients!");
    } catch (e) {
      if (typeof alert !== "undefined") alert("Failed to send announcement.");
    } finally {
      setSendingAnnouncement(false);
    }
  }

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
                      <RobloxAvatar robloxId={c.robloxId ?? ""} size={48} useLocalApi={useLocalApi} />
                      <div>
                          <div style={{ fontSize: "16px", fontWeight: "800" }}>{normalizeClientName(c.name, c.robloxId, robloxNameCache)}</div>
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
                        <div style={{ fontSize: "11px", color: "#8b8b8b", marginTop: "4px" }}>
                          Total: {formatUptime(getSessionTotal(storedUsers[c.robloxId || ""]?.sessions || [], c.id) + Number(clientUptimes[c.id] || 0) + Math.max(0, Math.floor((now - Number(clientUptimeAt[c.id] || now)) / 1000)))}
                        </div>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px" }}>
                <div>
                  <div className="glass-card" style={{ padding: "40px", marginBottom: "40px" }}>
                    <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                      <RobloxAvatar robloxId={selectedClient.robloxId ?? ""} size={120} useLocalApi={useLocalApi} />
                      <div>
                        <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "4px" }}>{normalizeClientName(selectedClient.name, selectedClient.robloxId, robloxNameCache)}</h1>
                        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                          <span className="status-badge active">Online</span>
                          <span className="executor-badge">{selectedClient.executor}</span>
                        </div>
                        <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <div style={{ fontSize: "14px", color: "#a5b4fc" }}>
                            <strong>Total Uptime:</strong> {(() => {
                              const storedTotal = getSessionTotal(storedUsers[selectedClient.robloxId || ""]?.sessions || [], selectedClient.id);
                              const base = Number(clientUptimes[selectedClient.id] || 0);
                              const at = Number(clientUptimeAt[selectedClient.id] || now);
                              const elapsed = Math.max(0, Math.floor((now - at) / 1000));
                              return formatUptime(storedTotal + base + elapsed);
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="profile-card">
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "32px" }}>
                    <GameIcon placeId={selectedClient.placeId} size={64} useLocalApi={useLocalApi} />
                    <div>
                        <div style={{ fontSize: "16px", fontWeight: "800" }}>{normalizeClientPlace(selectedClient.place, selectedClient.placeId)}</div>
                      {selectedClient.placeId ? <div style={{ fontSize: "12px", color: "#52525b" }}>{selectedClient.placeId}</div> : null}
                    </div>
                  </div>
                  <div style={labelStyle}>Actions</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button className="btn-action danger" onClick={async () => {
                      console.log("Kick clicked", selectedClient?.robloxId);
                      const ok = await handleClientCommand("kick");
                      console.log("Kick result", ok);
                      if (!ok && typeof alert !== "undefined") alert("Kick command failed. Check console/network.");
                    }}>Kick Player</button>
                    <button className="btn-action danger" onClick={async () => {
                      console.log("Ban clicked", selectedClient?.robloxId);
                      const ok = await handleClientCommand("ban");
                      console.log("Ban result", ok);
                      if (!ok && typeof alert !== "undefined") alert("Ban command failed. Check console/network.");
                    }}>Ban Player</button>
                    <button className="btn-action" onClick={async () => {
                      console.log("Unban clicked", selectedClient?.robloxId);
                      const ok = await handleClientCommand("unban");
                      console.log("Unban result", ok);
                      if (!ok && typeof alert !== "undefined") alert("Unban command failed. Check console/network.");
                    }}>Unban Player</button>
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
                      <div style={{ fontSize: "16px", fontWeight: "800" }}>{u.roblox_name}</div>
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
            {selectedUserData.sessions
              .filter(s => s.place_name && !s.place_name.toLowerCase().includes("unknown"))
              .map((s, i) => (
                <div key={i} className="user-row" style={{ background: i === 0 && onlineNow(selectedUserData.roblox_id) ? "rgba(0,171,255,0.05)" : "rgba(255,255,255,0.01)" }}>
                  <GameIcon placeId={s.place_id} size={40} useLocalApi={useLocalApi} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "800" }}>{s.place_name}</div>
                    <div style={{ fontSize: "11px", color: "#71717a" }}>{timeAgo(s.connected_at, !!onlineNow(selectedUserData.roblox_id))}</div>
                  </div>
                  {i === 0 && onlineNow(selectedUserData.roblox_id) && <span className="status-badge active">Current</span>}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── COMMAND PALETTE ── */}
      {showPalette && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "15vh" }} onClick={() => setShowPalette(false)}>
          <div className="glass-card animate-slide-in" style={{ width: "600px", padding: "0", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
              <i className="ti ti-search" style={{ color: "#00ABFF" }}></i>
              <input 
                autoFocus
                placeholder="Search actions or users..." 
                style={{ background: "none", border: "none", color: "white", fontSize: "18px", width: "100%", outline: "none" }}
                value={paletteSearch}
                onChange={e => setPaletteSearch((e.target as HTMLInputElement).value)}
              />
            </div>
            <div style={{ padding: "12px", maxHeight: "400px", overflowY: "auto" }}>
              <div style={labelStyle}>Quick Actions</div>
              <button className="sidebar-item" onClick={() => { setHomeView("clients"); setShowPalette(false); }}>
                <i className="ti ti-refresh"></i> Refresh Clients
              </button>

            </div>
          </div>
        </div>
      )}
      <div style={{ position: "fixed", left: 12, bottom: 12, background: "rgba(0,0,0,0.7)", padding: 12, borderRadius: 8, zIndex: 2000, color: "#fff", fontSize: 12, maxWidth: 420 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={useLocalApi} onChange={e => setUseLocalApi((e.target as HTMLInputElement).checked)} />
          Use Local API
        </label>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Last Command</div>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 160, overflow: "auto", margin: 0 }}>{lastCommandLog ? JSON.stringify(lastCommandLog, null, 2) : "(none)"}</pre>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button className="btn-secondary" onClick={() => { console.log(clients); alert(JSON.stringify(clients.slice(0,5))); }}>Dump Clients</button>
          <button className="btn-secondary" onClick={() => { setLastCommandLog(null); }}>Clear</button>
        </div>
      </div>
    </div>
  );
}
