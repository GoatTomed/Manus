// Track.tsx
import { useEffect, useMemo, useState } from "react";
import { Client } from "./trackData";
import "./Track.css";

type HomeView = "clients" | "server" | "users" | "keys";

const homeNav: { id: HomeView; label: string; icon: string }[] = [
  { id: "clients", label: "Clients", icon: "ti-users" },
  { id: "server", label: "Server", icon: "ti-server" },
  { id: "users", label: "Users", icon: "ti-user-circle" },
  { id: "keys", label: "Keys", icon: "ti-key" },
];

function formatUptime(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function timeAgo(ts: number | string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function RobloxAvatar({ robloxId, size = 40 }: { robloxId: string; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!robloxId) return;
    fetch(`/api/roblox-avatar?userId=${robloxId}`)
      .then(r => r.json())
      .then(data => { const u = data?.data?.[0]?.imageUrl; if (u) setUrl(u); })
      .catch(() => {});
  }, [robloxId]);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {url ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-user" style={{ fontSize: size * 0.5 }}></i>}
    </div>
  );
}

function GameIcon({ placeId, size = 72 }: { placeId: string; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!placeId) return;
    fetch(`/api/roblox-gameicon?placeId=${placeId}`)
      .then(r => r.json())
      .then(data => { const u = data?.data?.[0]?.imageUrl; if (u) setUrl(u); })
      .catch(() => {});
  }, [placeId]);
  return (
    <div style={{ width: size, height: size, borderRadius: size > 80 ? "16px" : "10px", overflow: "hidden", border: "2px solid var(--border)", flexShrink: 0, background: "#1f1f28", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {url ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-device-gamepad" style={{ fontSize: size * 0.35, color: "var(--text-tertiary)" }}></i>}
    </div>
  );
}

type ConnLog = { id: string; roblox_id: string; roblox_name: string; place_id: string; place_name: string; executor: string; connected_at: string; uptime: number; };
type KeyRecord = { id: string; key_value: string; is_used: boolean; created_at: string; generated_by: string; roblox_id?: string; used_at?: string; };

// Persistent user store — survives refreshes via localStorage
type StoredUser = { roblox_id: string; roblox_name: string; last_seen: string; sessions: ConnLog[]; };

function loadStoredUsers(): Record<string, StoredUser> {
  try { return JSON.parse(localStorage.getItem("ys_users") || "{}"); } catch { return {}; }
}
function saveStoredUsers(map: Record<string, StoredUser>) {
  try { localStorage.setItem("ys_users", JSON.stringify(map)); } catch {}
}

const EXECUTOR_LOGOS: Record<string, string> = {
  "Wave": "https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f30a.png",
  "Seliware": "https://scriptblox.com/images/exec/thumbs/Seliware.png",
  "Velocity": "https://velocityget.com/icon.png",
  "Bunni": "https://tse2.mm.bing.net/th/id/OIP.w7S9MbhQ_CaXKgnAqFkVJQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  "Xeno": "https://xeno.now/images/xeno.png",
  "Solara": "https://avatars.githubusercontent.com/u/208881794?s=200&v=4",
  "Cryptic": "https://getcryptic.net/logo.png",
  "Delta": "https://images.sftcdn.net/images/t_app-icon-s/p/ed66733d-2d77-4331-a8d1-97d5ca7924b5/2787774532/delta-executor-Download-Delta-Executor.jpg",
  "Fluxus": "https://images.dwncdn.net/images/t_app-icon-l/p/69d46195-d1b1-4d4e-9ece-4aac6a27faf7/3398186052/fluxus-executor-logo",
};

const card = (extra?: any) => ({ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "14px", ...extra });
const lbl = (extra?: any) => ({ color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px", ...extra });

export default function Track() {
  const [inClientMode, setInClientMode] = useState(false);
  const [homeView, setHomeView] = useState<HomeView>("clients");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverUptime, setServerUptime] = useState("00:00:00");
  const [clientUptimes, setClientUptimes] = useState<Record<string, number>>({});
  const [clientQuery, setClientQuery] = useState("");
  const [connLogs, setConnLogs] = useState<ConnLog[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [newClientAlert, setNewClientAlert] = useState(false);
  const [prevClientIds, setPrevClientIds] = useState<Set<string>>(new Set());
  const [scriptInput, setScriptInput] = useState("");
  const [scriptSending, setScriptSending] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<"idle" | "sent" | "error">("idle");
  const [kickSending, setKickSending] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeyRecord | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  // Persistent user map — never clears on refresh
  const [storedUsers, setStoredUsers] = useState<Record<string, StoredUser>>(loadStoredUsers);

  // IP check
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(data => { if (data.ip !== "24.49.252.230") setAccessDenied(true); setAccessChecked(true); })
      .catch(() => setAccessChecked(true));
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/connection-logs');
      if (res.ok) { const data: ConnLog[] = await res.json(); setConnLogs(data); }
    } catch (e) {}
  };

  const fetchKeys = async () => {
    setKeysLoading(true);
    try { const res = await fetch('/api/keys'); if (res.ok) setKeys(await res.json()); }
    catch (e) {} finally { setKeysLoading(false); }
  };

  const deleteKey = async (keyValue: string) => {
    setDeletingKey(keyValue);
    try {
      await fetch(`/api/analytics/keys/${encodeURIComponent(keyValue)}`, { method: "DELETE" });
      setKeys(prev => prev.filter(k => k.key_value !== keyValue));
      if (selectedKey?.key_value === keyValue) setSelectedKey(null);
    } catch (e) {} finally { setDeletingKey(null); }
  };

  useEffect(() => {
    if (homeView === "server" || homeView === "users") fetchLogs();
    if (homeView === "keys") fetchKeys();
  }, [homeView]);

  // Client polling — only show clients that are actively heartbeating
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data: Client[] = await res.json();
          // Filter: only clients with a lastHeartbeat within 5 min (server already does this but double check)
          setClients(data);

          // Notification dot
          const newIds = new Set(data.map((c: Client) => c.robloxId || c.id));
          if (prevClientIds.size > 0) {
            const hasNew = data.some((c: Client) => !prevClientIds.has(c.robloxId || c.id));
            if (hasNew) setNewClientAlert(true);
          }
          setPrevClientIds(newIds);

          const newUptimes: Record<string, number> = {};
          data.forEach(c => { newUptimes[c.id] = c.uptime || 0; });
          setClientUptimes(prev => ({ ...prev, ...newUptimes }));

          // Update persistent user store
          setStoredUsers(prev => {
            const updated = { ...prev };
            data.forEach(c => {
              if (!c.robloxId) return;
              const existing = updated[c.robloxId];
              const sessionEntry: ConnLog = {
                id: c.id, roblox_id: c.robloxId, roblox_name: c.name,
                place_id: c.placeId, place_name: c.place,
                executor: c.executor || "Unknown",
                connected_at: existing?.sessions?.[0]?.connected_at || new Date().toISOString(),
                uptime: c.uptime || 0,
              };
              updated[c.robloxId] = {
                roblox_id: c.robloxId,
                roblox_name: c.name,
                last_seen: new Date().toISOString(),
                sessions: existing ? [sessionEntry, ...existing.sessions.filter(s => s.place_id !== c.placeId)].slice(0, 20) : [sessionEntry],
              };
            });
            saveStoredUsers(updated);
            return updated;
          });

          // If selected client was kicked / left, go back
          if (selectedClient && !data.find(c => c.robloxId === selectedClient.robloxId)) {
            setInClientMode(false);
          }
        }
      } catch (e) {} finally { setLoading(false); }
    };
    fetchClients();
    const interval = setInterval(fetchClients, 3000);
    return () => clearInterval(interval);
  }, [selectedClient]);

  useEffect(() => {
    const timer = setInterval(() => { setClientUptimes(prev => { const next = { ...prev }; Object.keys(next).forEach(id => { next[id] += 1; }); return next; }); }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedStart = localStorage.getItem('serverStartTime');
    let startTime = savedStart ? parseInt(savedStart) : Date.now();
    if (!savedStart) localStorage.setItem('serverStartTime', startTime.toString());
    const interval = setInterval(() => { setServerUptime(formatUptime(Math.floor((Date.now() - startTime) / 1000))); }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredClients = useMemo(() => clients.filter(c =>
    c.name.toLowerCase().includes(clientQuery.toLowerCase()) ||
    c.place?.toLowerCase().includes(clientQuery.toLowerCase())
  ), [clients, clientQuery]);

  // Merge supabase logs + stored session logs
  const allLogs = useMemo(() => {
    const merged = [...connLogs];
    Object.values(storedUsers).forEach(u => {
      u.sessions.forEach(s => {
        if (!merged.find(m => m.roblox_id === s.roblox_id && m.place_id === s.place_id && m.connected_at === s.connected_at)) {
          merged.push(s);
        }
      });
    });
    return merged.sort((a, b) => new Date(b.connected_at).getTime() - new Date(a.connected_at).getTime());
  }, [connLogs, storedUsers]);

  const executorStats = useMemo(() => {
    const map: Record<string, number> = {};
    allLogs.forEach(l => { map[l.executor] = (map[l.executor] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [allLogs]);

  const topGames = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    allLogs.forEach(l => { if (!map[l.place_id]) map[l.place_id] = { name: l.place_name, count: 0 }; map[l.place_id].count++; });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  }, [allLogs]);

  const allUsers = useMemo(() => Object.values(storedUsers).sort((a, b) =>
    new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
  ), [storedUsers]);

  function selectClient(c: Client) { setSelectedClient(c); setInClientMode(true); }
  function chipClick() { setInClientMode(false); setHomeView("clients"); }

  async function sendCommand(robloxId: string, type: string, script = "") {
    const res = await fetch("/api/clients?command=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ robloxId, type, script }),
    });
    return res.ok;
  }

  const onlineNow = (robloxId: string) => clients.some(c => c.robloxId === robloxId);
  const selectedUserData = selectedUser ? storedUsers[selectedUser] : null;
  const selectedKeyLogs = selectedKey?.roblox_id ? allLogs.filter(l => l.roblox_id === selectedKey.roblox_id) : [];

  if (!accessChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", color: "#fff" }}>
      <div style={{ textAlign: "center", opacity: 0.4 }}>
        <i className="ti ti-lock" style={{ fontSize: "32px", display: "block", marginBottom: "12px" }}></i>
        Verifying access...
      </div>
    </div>
  );

  if (accessDenied) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(2rem); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.08) 0%, transparent 50%)", zIndex: 0 }}></div>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", zIndex: 1 }}></div>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(rgba(34,211,238,0.15) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: "30px 30px", zIndex: 2 }}></div>
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", animation: "fadeInUp 0.7s ease-out forwards" }}>
        <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp"
          style={{ width: 120, height: 120, objectFit: "contain", display: "block", margin: "0 auto 24px" }} alt="Logo" />
        <h1 style={{ fontSize: "3.75rem", fontWeight: 300, marginBottom: "24px", lineHeight: 1.2 }}>
          Access <span style={{ fontWeight: 600, color: "#22d3ee" }}>Denied</span>
        </h1>
        <a href="https://yoursuck.vercel.app/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "8px", fontWeight: 500, fontSize: "14px", textDecoration: "none", border: "1px solid rgba(34,211,238,0.3)", background: "rgba(34,211,238,0.1)", color: "#22d3ee" }}>
          Return Home
        </a>
      </div>
    </div>
  );

  return (
    <div className="track-page">
      <div className="layout" style={{ height: "100vh" }}>
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {homeNav.map(n => (
              <button key={n.id} className={`sidebar-item ${homeView === n.id && !inClientMode ? "active" : ""}`}
                onClick={() => { setHomeView(n.id); setInClientMode(false); setSelectedUser(null); setSelectedKey(null); if (n.id === "clients") setNewClientAlert(false); }}>
                <i className={`ti ${n.icon}`}></i>
                {n.label}
                {n.id === "clients" && newClientAlert && (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", marginLeft: "auto", flexShrink: 0 }}></div>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="uptime-chip"><i className="ti ti-clock"></i><span>{serverUptime}</span></div>
          </div>
        </aside>

        <main className="main-content">

          {/* ── CLIENTS ── */}
          {!inClientMode && homeView === "clients" && (
            <div className="view active">
              <div className="clients-center">
                <div className="no-client-box">
                  <div className="no-client-icon"><i className="ti ti-users"></i></div>
                  <h2>Connected Clients</h2>
                  <p>Active sessions • <strong>{clients.length}</strong> online</p>
                  <div className="search-field">
                    <i className="ti ti-search"></i>
                    <input type="text" placeholder="Search clients..." value={clientQuery} onChange={e => setClientQuery(e.target.value)} />
                  </div>
                  <div className="client-list-box">
                    {filteredClients.length === 0 && !loading && <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>No clients online</div>}
                    {filteredClients.map(c => (
                      <div className="client-row" key={c.id} onClick={() => selectClient(c)}>
                        <div className="client-avatar" style={{ background: "transparent", border: "none" }}>
                          {c.robloxId ? <RobloxAvatar robloxId={c.robloxId} size={34} /> : <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-user"></i></div>}
                        </div>
                        <div className="client-row-meta">
                          <div className="client-row-name">{c.name}</div>
                          <div className="client-row-sub">{c.place}</div>
                        </div>
                        <div style={{ marginLeft: "auto", textAlign: "right" }}>
                          <div style={{ fontSize: "13px", color: "#4ade80" }}>{formatUptime(clientUptimes[c.id] || c.uptime || 0)}</div>
                        </div>
                        <i className="ti ti-chevron-right"></i>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SERVER ── */}
          {!inClientMode && homeView === "server" && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Server Overview</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>Live stats and usage breakdown</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                {[
                  { label: "Online Now", value: clients.length, color: "#4ade80", icon: "ti-users" },
                  { label: "Unique Players", value: allUsers.length, color: "var(--text-info)", icon: "ti-user-check" },
                  { label: "Server Uptime", value: serverUptime, color: "var(--text-warning)", icon: "ti-clock" },
                ].map((s, i) => (
                  <div key={i} style={card({ padding: "20px" })}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: "16px" }}></i>
                      <span style={lbl()}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: s.color, fontFamily: typeof s.value === "string" ? "var(--font-mono)" : undefined }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={card({ overflow: "hidden" })}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px", fontWeight: "600" }}>Top Games</div>
                  {topGames.length === 0 ? <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>No data yet</div>
                    : topGames.map(([placeId, { name, count }]) => (
                      <div key={placeId} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                        <GameIcon placeId={placeId} size={36} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: "500" }}>{name || placeId}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>{count} sessions</div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#4ade80" }}>{count}</div>
                      </div>
                    ))}
                </div>
                <div style={card({ overflow: "hidden" })}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px", fontWeight: "600" }}>Top Executors</div>
                  {executorStats.length === 0 ? <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>No data yet</div>
                    : executorStats.map(([executor, count]) => (
                      <div key={executor} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                          {EXECUTOR_LOGOS[executor]
                            ? <img src={EXECUTOR_LOGOS[executor]} alt={executor} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                            : <i className="ti ti-terminal" style={{ fontSize: "16px", color: "var(--text-secondary)" }}></i>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: "500" }}>{executor}</div>
                          <div style={{ height: 4, background: "var(--bg-tertiary)", borderRadius: 2, marginTop: 6 }}>
                            <div style={{ height: "100%", width: `${Math.round((count / (executorStats[0]?.[1] || 1)) * 100)}%`, background: "#4ade80", borderRadius: 2 }}></div>
                          </div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "600" }}>{count}</div>
                      </div>
                    ))}
                </div>
              </div>
              <div style={card({ overflow: "hidden" })}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px", fontWeight: "600" }}>Recent Connections</div>
                {allLogs.slice(0, 5).map((log, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    <RobloxAvatar robloxId={log.roblox_id} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "500" }}>{log.roblox_name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{log.place_name} · {log.executor}</div>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{timeAgo(log.connected_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS LIST ── */}
          {!inClientMode && homeView === "users" && !selectedUser && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Users</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>{allUsers.length} unique players · Persists across sessions</p>
              </div>
              <div style={card({ overflow: "hidden" })}>
                <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 140px 100px", padding: "10px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: "600", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <div></div><div>Player</div><div>Sessions</div><div>Last Seen</div><div style={{ textAlign: "right" }}>Status</div>
                </div>
                {allUsers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>No users yet — they appear when clients connect</div>
                ) : allUsers.map(u => (
                  <div key={u.roblox_id} onClick={() => setSelectedUser(u.roblox_id)}
                    style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 140px 100px", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <RobloxAvatar robloxId={u.roblox_id} size={32} />
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{u.roblox_name}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>ID: {u.roblox_id}</div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600" }}>{u.sessions.length}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{timeAgo(u.last_seen)}</div>
                    <div style={{ textAlign: "right" }}>
                      {onlineNow(u.roblox_id)
                        ? <span style={{ fontSize: "11px", fontWeight: "600", color: "#4ade80", background: "var(--bg-success)", padding: "3px 8px", borderRadius: "6px" }}>Online</span>
                        : <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Offline</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USER DETAIL ── */}
          {!inClientMode && homeView === "users" && selectedUser && selectedUserData && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "20px" }}>
              <button onClick={() => setSelectedUser(null)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "4px" }}>
                <i className="ti ti-arrow-left"></i> Back to Users
              </button>
              <div style={card({ padding: "28px", display: "flex", gap: "24px", alignItems: "center" })}>
                <RobloxAvatar robloxId={selectedUserData.roblox_id} size={72} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>{selectedUserData.roblox_name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Roblox ID: {selectedUserData.roblox_id}</div>
                  {onlineNow(selectedUserData.roblox_id) && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--bg-success)", borderRadius: "8px", padding: "4px 10px", marginTop: "10px" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}></div>
                      <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "600" }}>Online Now</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "32px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={lbl()}>Sessions</div>
                    <div style={{ fontSize: "28px", fontWeight: "700" }}>{selectedUserData.sessions.length}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={lbl()}>Last Seen</div>
                    <div style={{ fontSize: "16px", fontWeight: "600" }}>{timeAgo(selectedUserData.last_seen)}</div>
                  </div>
                </div>
              </div>
              <div style={card({ overflow: "hidden" })}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>Lifetime Sessions</div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{selectedUserData.sessions.length} total</div>
                </div>
                {selectedUserData.sessions.map((log, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                    <GameIcon placeId={log.place_id} size={44} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "500", fontSize: "14px" }}>{log.place_name}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "3px" }}>{log.executor} · Uptime {formatUptime(log.uptime)}</div>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{timeAgo(log.connected_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── KEYS LIST ── */}
          {!inClientMode && homeView === "keys" && !selectedKey && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Keys</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>{keys.length} total · Click a key to view details</p>
                </div>
                <button onClick={fetchKeys} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 14px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>
                  <i className="ti ti-refresh"></i> Refresh
                </button>
              </div>
              <div style={card({ overflow: "hidden" })}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px 80px", padding: "10px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: "600", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <div>Key</div><div>Roblox ID</div><div>Created</div><div>Status</div><div style={{ textAlign: "right" }}>Action</div>
                </div>
                {keysLoading ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>Loading keys...</div>
                ) : keys.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>
                    <i className="ti ti-key" style={{ fontSize: "32px", display: "block", marginBottom: "12px" }}></i>No keys found
                  </div>
                ) : keys.map(k => (
                  <div key={k.id}
                    style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px 80px", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <div onClick={() => setSelectedKey(k)} style={{ cursor: "pointer" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: "700", fontSize: "15px", letterSpacing: "0.08em" }}>{k.key_value}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>by {k.generated_by?.slice(0, 12)}...</div>
                    </div>
                    <div onClick={() => setSelectedKey(k)} style={{ fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer" }}>{k.roblox_id || "—"}</div>
                    <div onClick={() => setSelectedKey(k)} style={{ fontSize: "12px", color: "var(--text-tertiary)", cursor: "pointer" }}>{timeAgo(k.created_at)}</div>
                    <div onClick={() => setSelectedKey(k)} style={{ cursor: "pointer" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px", background: k.is_used ? "var(--bg-danger)" : "var(--bg-success)", color: k.is_used ? "var(--text-danger)" : "#4ade80" }}>
                        {k.is_used ? "Used" : "Active"}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <button onClick={() => { if (confirm(`Delete key ${k.key_value}?`)) deleteKey(k.key_value); }} disabled={deletingKey === k.key_value}
                        style={{ background: "var(--bg-danger)", border: "none", borderRadius: "6px", padding: "5px 10px", color: "var(--text-danger)", fontSize: "12px", cursor: "pointer", opacity: deletingKey === k.key_value ? 0.5 : 1 }}>
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── KEY DETAIL ── */}
          {!inClientMode && homeView === "keys" && selectedKey && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "20px" }}>
              <button onClick={() => setSelectedKey(null)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "4px" }}>
                <i className="ti ti-arrow-left"></i> Back to Keys
              </button>
              <div style={card({ padding: "28px" })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: "700", letterSpacing: "0.1em" }}>{selectedKey.key_value}</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "8px", background: selectedKey.is_used ? "var(--bg-danger)" : "var(--bg-success)", color: selectedKey.is_used ? "var(--text-danger)" : "#4ade80" }}>
                      {selectedKey.is_used ? "Used" : "Active"}
                    </span>
                    <button onClick={() => { if (confirm(`Delete key ${selectedKey.key_value}?`)) { deleteKey(selectedKey.key_value); } }}
                      style={{ background: "var(--bg-danger)", border: "1px solid rgba(224,104,104,0.3)", borderRadius: "8px", padding: "5px 14px", color: "var(--text-danger)", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                      <i className="ti ti-trash"></i> Delete
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                  <div><div style={lbl()}>Created</div><div style={{ fontSize: "14px", fontWeight: "500" }}>{new Date(selectedKey.created_at).toLocaleString()}</div></div>
                  <div>
                    <div style={lbl()}>Roblox ID</div>
                    <div style={{ fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                      {selectedKey.roblox_id ? <><RobloxAvatar robloxId={selectedKey.roblox_id} size={20} />{selectedKey.roblox_id}</> : "Not used yet"}
                    </div>
                  </div>
                  <div><div style={lbl()}>Generated By</div><div style={{ fontSize: "12px", fontWeight: "500", fontFamily: "var(--font-mono)" }}>{selectedKey.generated_by}</div></div>
                </div>
              </div>
              {selectedKey.roblox_id && (
                <div style={card({ overflow: "hidden" })}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <RobloxAvatar robloxId={selectedKey.roblox_id} size={28} />
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>Sessions for this key's player</div>
                  </div>
                  {selectedKeyLogs.length === 0 ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>No sessions yet</div>
                  ) : selectedKeyLogs.map((log, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                      <GameIcon placeId={log.place_id} size={44} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "500", fontSize: "14px" }}>{log.place_name}</div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "3px" }}>{log.executor} · Uptime {formatUptime(log.uptime)}</div>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{timeAgo(log.connected_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CLIENT OVERVIEW ── */}
          {inClientMode && selectedClient && (
            <div className="view active" style={{ padding: "32px 40px", flexDirection: "column", gap: "20px" }}>
              <div style={card({ padding: "36px" })}>
                <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                  {selectedClient.placeId && <GameIcon placeId={selectedClient.placeId} size={140} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div style={{ fontSize: "26px", fontWeight: "700" }}>{selectedClient.place || "Unknown Game"}</div>
                      <button disabled={kickSending}
                        onClick={async () => {
                          if (!confirm(`Kick ${selectedClient.name}?`)) return;
                          setKickSending(true);
                          await sendCommand(selectedClient.robloxId || "", "kick");
                          setKickSending(false);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-danger)", border: "1px solid rgba(224,104,104,0.3)", borderRadius: "8px", padding: "8px 16px", color: "var(--text-danger)", fontSize: "13px", fontWeight: "600", cursor: "pointer", opacity: kickSending ? 0.5 : 1 }}>
                        <i className="ti ti-user-x"></i> {kickSending ? "Kicking..." : "Kick"}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
                      <div>
                        <div style={lbl()}>Player</div>
                        <div style={{ fontSize: "20px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
                          {selectedClient.robloxId && <RobloxAvatar robloxId={selectedClient.robloxId} size={28} />}
                          {selectedClient.name}
                        </div>
                      </div>
                      <div>
                        <div style={lbl()}>Uptime</div>
                        <div style={{ fontSize: "20px", fontWeight: "600", color: "#4ade80" }}>{formatUptime(clientUptimes[selectedClient.id] || selectedClient.uptime || 0)}</div>
                      </div>
                      <div>
                        <div style={lbl()}>Executor</div>
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>
                          {selectedClient.executor || "Unknown"}
                          {(selectedClient as any).executorVersion && <span style={{ fontSize: "13px", color: "var(--text-tertiary)", marginLeft: "6px" }}>v{(selectedClient as any).executorVersion}</span>}
                        </div>
                      </div>
                      <div>
                        <div style={lbl()}>Roblox ID</div>
                        <div style={{ fontSize: "20px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          {selectedClient.robloxId || "N/A"}
                          {selectedClient.robloxId && (
                            <button onClick={() => navigator.clipboard.writeText(selectedClient.robloxId || "")}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: "2px" }} title="Copy">
                              <i className="ti ti-copy" style={{ fontSize: "14px" }}></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={card({ padding: "20px" })}>
                  <div style={lbl()}>Status</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></div>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#22c55e" }}>Online</span>
                  </div>
                </div>
                <div style={card({ padding: "20px" })}>
                  <div style={lbl()}>Place ID</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", fontFamily: "var(--font-mono)" }}>{selectedClient.placeId || "N/A"}</div>
                </div>
                <div style={card({ padding: "20px" })}>
                  <div style={lbl()}>Session Start</div>
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>{new Date(Date.now() - (clientUptimes[selectedClient.id] || 0) * 1000).toLocaleTimeString()}</div>
                </div>
              </div>

              <div style={card({ padding: "24px" })}>
                <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="ti ti-terminal" style={{ color: "#4ade80" }}></i> Script Executor
                </div>
                <textarea value={scriptInput} onChange={e => setScriptInput(e.target.value)}
                  placeholder="-- Enter Lua script to execute on this client..."
                  style={{ width: "100%", height: "120px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "13px", resize: "vertical", outline: "none" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                  <button disabled={scriptSending || !scriptInput.trim()}
                    onClick={async () => {
                      setScriptSending(true); setScriptStatus("idle");
                      const ok = await sendCommand(selectedClient.robloxId || "", "execute", scriptInput);
                      setScriptStatus(ok ? "sent" : "error"); setScriptSending(false);
                      if (ok) setScriptInput("");
                      setTimeout(() => setScriptStatus("idle"), 3000);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: "#22c55e", color: "#000", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", fontSize: "13px", cursor: "pointer", opacity: scriptSending || !scriptInput.trim() ? 0.5 : 1 }}>
                    <i className="ti ti-player-play"></i> {scriptSending ? "Sending..." : "Execute"}
                  </button>
                  {scriptStatus === "sent" && <span style={{ fontSize: "13px", color: "#4ade80" }}>✓ Script sent</span>}
                  {scriptStatus === "error" && <span style={{ fontSize: "13px", color: "var(--text-danger)" }}>✗ Failed to send</span>}
                </div>
              </div>

              <div style={card({ overflow: "hidden" })}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px", fontWeight: "600" }}>Session History</div>
                {allLogs.filter(l => l.roblox_id === selectedClient.robloxId).length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>No session history yet</div>
                ) : allLogs.filter(l => l.roblox_id === selectedClient.robloxId).map((log, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                    <GameIcon placeId={log.place_id} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "500", fontSize: "14px" }}>{log.place_name}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "2px" }}>Uptime {formatUptime(log.uptime)} · {log.executor}</div>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{timeAgo(log.connected_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}