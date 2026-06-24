// Track.tsx
import { useEffect, useMemo, useState } from "react";
import { Client } from "./trackData";
import "./Track.css";

type HomeView = "clients" | "server" | "users" | "keys" | "stats";

const homeNav: { id: HomeView; label: string; icon: string }[] = [
  { id: "clients", label: "Clients", icon: "ti-users" },
  { id: "server", label: "Server", icon: "ti-server" },
  { id: "users", label: "Users", icon: "ti-user-circle" },
  { id: "keys", label: "Keys", icon: "ti-key" },
  { id: "stats", label: "Stats", icon: "ti-chart-bar" },
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
type Snapshot = { id: string; date: string; hour: number; roblox_id: string; roblox_name: string; place_id: string; place_name: string; executor: string; recorded_at: string; };
type KeyRecord = { id: string; key_value: string; is_used: boolean; created_at: string; generated_by: string; roblox_id?: string; used_at?: string; };

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

  const [allSnapshots, setAllSnapshots] = useState<Snapshot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateSnapshots, setSelectedDateSnapshots] = useState<Snapshot[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [dayDetailLoading, setDayDetailLoading] = useState(false);
  const [dayTimer, setDayTimer] = useState("");

  const [storedUsers, setStoredUsers] = useState<Record<string, StoredUser>>(loadStoredUsers);

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

  const fetchAllSnapshots = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/daily-snapshots');
      if (res.ok) setAllSnapshots(await res.json());
    } catch (e) {} finally { setStatsLoading(false); }
  };

  const fetchDaySnapshots = async (date: string) => {
    setDayDetailLoading(true);
    try {
      const res = await fetch(`/api/daily-snapshots?date=${date}`);
      if (res.ok) setSelectedDateSnapshots(await res.json());
    } catch (e) {} finally { setDayDetailLoading(false); }
  };

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      setDayTimer(`${h}:${m}:${s}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

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
    if (homeView === "stats") fetchAllSnapshots();
  }, [homeView]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data: Client[] = await res.json();
          setClients(data);

          const newIds = new Set(data.map((c: Client) => c.robloxId || c.id));
          if (prevClientIds.size > 0) {
            const hasNew = data.some((c: Client) => !prevClientIds.has(c.robloxId || c.id));
            if (hasNew) setNewClientAlert(true);
          }
          setPrevClientIds(newIds);

          const newUptimes: Record<string, number> = {};
          data.forEach(c => { newUptimes[c.id] = c.uptime || 0; });
          setClientUptimes(prev => ({ ...prev, ...newUptimes }));

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
    const timer = setInterval(() => { 
      setClientUptimes(prev => { const next = { ...prev }; Object.keys(next).forEach(id => { next[id] += 1; }); return next; }); 
    }, 1000);
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
    allLogs.forEach(l => { 
      if (!map[l.place_id]) map[l.place_id] = { name: l.place_name, count: 0 }; 
      map[l.place_id].count++; 
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  }, [allLogs]);

  const allUsers = useMemo(() => Object.values(storedUsers).sort((a, b) =>
    new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
  ), [storedUsers]);

  function selectClient(c: Client) { setSelectedClient(c); setInClientMode(true); }

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

  const today = new Date().toISOString().split("T")[0];
  const groupedDays = useMemo(() => {
    const map: Record<string, Snapshot[]> = {};
    allSnapshots.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    if (!map[today]) map[today] = [];
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allSnapshots, today]);

  // FIXED HOURLY DATA - Only active hours + proper scaling
  const hourlyData = useMemo(() => {
    if (!selectedDateSnapshots.length) return [];

    const counts = Array.from({ length: 24 }, () => 0);
    selectedDateSnapshots.forEach(s => {
      if (s.hour >= 0 && s.hour < 24) counts[s.hour]++;
    });

    const active = counts
      .map((count, hour) => ({ hour, count }))
      .filter(item => item.count > 0);

    if (active.length === 0) return [];

    const maxCount = Math.max(...active.map(h => h.count));

    return active.map(({ hour, count }) => ({
      hour,
      count,
      height: Math.max((count / maxCount) * 92, 12)   // percentage based
    }));
  }, [selectedDateSnapshots]);

  if (!accessChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", color: "#fff" }}>
      Verifying access...
    </div>
  );

  if (accessDenied) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
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
          {/* ... all other sections stay exactly the same ... */}

          {/* ── STATS DAY DETAIL ── */}
          {!inClientMode && homeView === "stats" && selectedDate && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "20px" }}>
              <button onClick={() => { setSelectedDate(null); setSelectedDateSnapshots([]); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "4px" }}>
                <i className="ti ti-arrow-left"></i> Back to Stats
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700" }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                    {selectedDate === today ? `Live · Resets in ${dayTimer}` : "Completed period"}
                  </p>
                </div>
              </div>

              {dayDetailLoading ? (
                <div style={{ textAlign: "center", padding: "80px", color: "var(--text-tertiary)" }}>Loading...</div>
              ) : (
                <>
                  {/* Summary cards unchanged */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
                    {[
                      { label: "Total Connections", value: selectedDateSnapshots.length, color: "var(--text-primary)", icon: "ti-plug" },
                      { label: "Unique Players", value: new Set(selectedDateSnapshots.map(s => s.roblox_id)).size, color: "var(--text-info)", icon: "ti-user-check" },
                      { label: "Unique Games", value: new Set(selectedDateSnapshots.map(s => s.place_id)).size, color: "var(--text-warning)", icon: "ti-device-gamepad" },
                      { label: "Peak Hour", value: (() => {
                        const m: Record<number, number> = {};
                        selectedDateSnapshots.forEach(s => { m[s.hour] = (m[s.hour] || 0) + 1; });
                        const peak = Object.entries(m).sort((a, b) => b[1] - a[1])[0];
                        return peak ? `${peak[0].padStart(2, "0")}:00` : "—";
                      })(), color: "#4ade80", icon: "ti-clock" },
                    ].map((s, i) => (
                      <div key={i} style={card({ padding: "20px" })}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                          <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: "16px" }}></i>
                          <span style={lbl()}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "700", color: s.color, fontFamily: "var(--font-mono)" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* FIXED RESPONSIVE HOURLY GRAPH */}
                  <div style={card({ padding: "24px" })}>
                    <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>Hourly Activity</div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>UTC • Only hours with activity</div>
                    </div>

                    {hourlyData.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-tertiary)" }}>No activity recorded this day</div>
                    ) : (
                      <div style={{ position: "relative", height: "300px", width: "100%" }}>
                        <svg width="100%" height="100%" viewBox="0 0 1000 280" preserveAspectRatio="xMidYMid meet">
                          {/* Background grid */}
                          {[0,1,2,3,4,5].map(i => (
                            <line key={i} x1="60" y1={50 + i*40} x2="940" y2={50 + i*40} stroke="var(--bg-tertiary)" strokeWidth="1" />
                          ))}

                          {hourlyData.map((d, idx) => {
                            const totalBars = hourlyData.length;
                            const barWidth = Math.max(32, Math.floor(780 / totalBars));
                            const gap = Math.max(12, Math.floor(160 / totalBars));
                            const x = 70 + idx * (barWidth + gap);
                            const barHeight = (d.height / 100) * 200;
                            const isCurrent = selectedDate === today && new Date().getUTCHours() === d.hour;

                            return (
                              <g key={idx}>
                                <rect 
                                  x={x} 
                                  y={240 - barHeight} 
                                  width={barWidth} 
                                  height={barHeight} 
                                  rx="6" 
                                  fill={isCurrent ? "#22c55e" : "#4ade80"} 
                                />
                                <text 
                                  x={x + barWidth / 2} 
                                  y={225 - barHeight} 
                                  textAnchor="middle" 
                                  fill="#fff" 
                                  fontSize="12" 
                                  fontWeight="700"
                                >
                                  {d.count}
                                </text>
                                <text 
                                  x={x + barWidth / 2} 
                                  y="265" 
                                  textAnchor="middle" 
                                  fill="var(--text-tertiary)" 
                                  fontSize="11" 
                                  fontFamily="var(--font-mono)"
                                >
                                  {String(d.hour).padStart(2, '0')}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Players and Games sections (unchanged) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={card({ overflow: "hidden" })}>
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px", fontWeight: "600" }}>Players</div>
                      {Array.from(new Set(selectedDateSnapshots.map(s => s.roblox_id))).map(rid => {
                        const snaps = selectedDateSnapshots.filter(s => s.roblox_id === rid);
                        return (
                          <div key={rid} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                            <RobloxAvatar robloxId={rid} size={32} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "13px", fontWeight: "500" }}>{snaps[0].roblox_name}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{snaps.length} session{snaps.length > 1 ? "s" : ""}</div>
                            </div>
                            {onlineNow(rid) && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }}></div>}
                          </div>
                        );
                      })}
                    </div>

                    <div style={card({ overflow: "hidden" })}>
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px", fontWeight: "600" }}>Games</div>
                      {Array.from(new Set(selectedDateSnapshots.map(s => s.place_id))).map(pid => {
                        const snaps = selectedDateSnapshots.filter(s => s.place_id === pid);
                        return (
                          <div key={pid} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                            <GameIcon placeId={pid} size={36} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "13px", fontWeight: "500" }}>{snaps[0].place_name || pid}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{snaps.length} connection{snaps.length > 1 ? "s" : ""}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}