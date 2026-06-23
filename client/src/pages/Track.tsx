// Track.tsx
import { useEffect, useMemo, useState } from "react";
import { Client } from "./trackData";
import "./Track.css";

type HomeView = "clients" | "server" | "logs" | "scripts" | "users" | "keys";

const homeNav: { id: HomeView; label: string; icon: string }[] = [
  { id: "clients", label: "Clients", icon: "ti-users" },
  { id: "scripts", label: "Scripts", icon: "ti-file-code" },
  { id: "server", label: "Server", icon: "ti-server" },
  { id: "logs", label: "Logs", icon: "ti-terminal" },
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

// Shared card style
const card = (extra?: any) => ({ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "14px", ...extra });
const label = (extra?: any) => ({ color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px", ...extra });

export default function Track() {
  const [inClientMode, setInClientMode] = useState(false);
  const [homeView, setHomeView] = useState<HomeView>("clients");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverUptime, setServerUptime] = useState("00:00:00");
  const [allGames, setAllGames] = useState<Record<string, string>>({});
  const [gamesLoading, setGamesLoading] = useState(false);
  const [clientUptimes, setClientUptimes] = useState<Record<string, number>>({});
  const [clientQuery, setClientQuery] = useState("");
  const [connLogs, setConnLogs] = useState<ConnLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ConnLog | null>(null);
  const [localLogs, setLocalLogs] = useState<ConnLog[]>([]);
  const [totalConnections, setTotalConnections] = useState(0);

  // Users
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // roblox_id

  // Keys
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeyRecord | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const fetchGames = async () => {
    setGamesLoading(true);
    try {
      const res = await fetch('/yousuck.lua');
      const text = await res.text();
      const match = text.match(/local GAMES\s*=\s*\{([\s\S]*?)\}/);
      if (match) {
        const entryRegex = /\[\s*(\d+)\s*\]\s*=\s*["']([^"']+)["']/g;
        const parsed: Record<string, string> = {};
        let m;
        while ((m = entryRegex.exec(match[1])) !== null) parsed[m[1]] = m[2];
        setAllGames(parsed);
      }
    } catch (e) { setAllGames({}); } finally { setGamesLoading(false); }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/connection-logs');
      if (res.ok) { const data: ConnLog[] = await res.json(); setConnLogs(data); setTotalConnections(data.length); }
    } catch (e) {} finally { setLogsLoading(false); }
  };

  const fetchKeys = async () => {
    setKeysLoading(true);
    try {
      const res = await fetch('/api/keys');
      if (res.ok) setKeys(await res.json());
    } catch (e) {} finally { setKeysLoading(false); }
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
    if (homeView === "scripts") fetchGames();
    if (homeView === "logs" || homeView === "server" || homeView === "users") fetchLogs();
    if (homeView === "keys") fetchKeys();
  }, [homeView]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data: Client[] = await res.json();
          setClients(data);
          const newUptimes: Record<string, number> = {};
          data.forEach(c => { newUptimes[c.id] = c.uptime || 0; });
          setClientUptimes(prev => ({ ...prev, ...newUptimes }));
          setLocalLogs(prev => {
            const updated = [...prev];
            data.forEach(c => {
              if (!updated.find(l => l.roblox_id === c.robloxId)) {
                updated.unshift({ id: c.id, roblox_id: c.robloxId || "", roblox_name: c.name, place_id: c.placeId, place_name: c.place, executor: c.executor || "Unknown", connected_at: new Date().toISOString(), uptime: c.uptime || 0 });
              }
            });
            return updated.slice(0, 50);
          });
        }
      } catch (e) {
        if (clients.length === 0) setClients([{ id: "1", name: "PlayerOne", place: "Paint or Die", placeId: "123456789", av: "", avc: "av-green", robloxId: "123", uptime: 1240 }]);
      } finally { setLoading(false); }
    };
    fetchClients();
    const interval = setInterval(fetchClients, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const filteredClients = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(clientQuery.toLowerCase()) || c.place?.toLowerCase().includes(clientQuery.toLowerCase())), [clients, clientQuery]);

  const allLogs = useMemo(() => {
    const merged = [...connLogs];
    localLogs.forEach(l => { if (!merged.find(m => m.roblox_id === l.roblox_id && m.place_id === l.place_id)) merged.unshift(l); });
    return merged;
  }, [connLogs, localLogs]);

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

  // Unique users from logs
  const uniqueUsers = useMemo(() => {
    const map: Record<string, { roblox_id: string; roblox_name: string; sessions: ConnLog[] }> = {};
    allLogs.forEach(l => {
      if (!map[l.roblox_id]) map[l.roblox_id] = { roblox_id: l.roblox_id, roblox_name: l.roblox_name, sessions: [] };
      map[l.roblox_id].sessions.push(l);
    });
    return Object.values(map);
  }, [allLogs]);

  function selectClient(c: Client) { setSelectedClient(c); setInClientMode(true); }
  function chipClick() { setInClientMode(false); setHomeView("clients"); }

  const topbarLabel = inClientMode ? (selectedClient?.name || "Client") : homeNav.find(n => n.id === homeView)?.label ?? "";

  const selectedUserData = selectedUser ? uniqueUsers.find(u => u.roblox_id === selectedUser) : null;
  const selectedKeyLogs = selectedKey ? allLogs.filter(l => l.roblox_id === selectedKey.roblox_id) : [];
  const onlineNow = (robloxId: string) => clients.some(c => c.robloxId === robloxId);

  return (
    <div className="track-page">

      {/* ── Log History Modal ── */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedLog(null)}>×</button>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "28px" }}>
              <RobloxAvatar robloxId={selectedLog.roblox_id} size={64} />
              <div>
                <div className="modal-title">{selectedLog.roblox_name}</div>
                <div className="modal-subtitle">Roblox ID: {selectedLog.roblox_id} · Executor: {selectedLog.executor}</div>
              </div>
            </div>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "12px", padding: "20px", display: "flex", gap: "20px", alignItems: "center", marginBottom: "24px" }}>
              <GameIcon placeId={selectedLog.place_id} size={80} />
              <div>
                <div style={{ fontSize: "18px", fontWeight: "600" }}>{selectedLog.place_name}</div>
                <div style={{ color: "#4ade80", fontSize: "13px", marginTop: "8px" }}>{timeAgo(selectedLog.connected_at)} · Uptime {formatUptime(selectedLog.uptime)}</div>
              </div>
            </div>
            <div style={{ ...label(), marginBottom: "12px" }}>All Sessions</div>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", overflow: "hidden" }}>
              {allLogs.filter(l => l.roblox_id === selectedLog.roblox_id).map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <GameIcon placeId={l.place_id} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{l.place_name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>{l.executor} · {formatUptime(l.uptime)}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{timeAgo(l.connected_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="topbar">
        <div className="client-chip" onClick={chipClick}>
          <i className="ti ti-user"></i>
          <span>{selectedClient ? selectedClient.name : "YouSuck Panel"}</span>
          <i className="ti ti-chevron-down"></i>
        </div>
        <div className="topbar-right">
          <span className="topbar-section">{topbarLabel}</span>
        </div>
      </div>

      <div className="layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {homeNav.map(n => (
              <button key={n.id} className={`sidebar-item ${homeView === n.id && !inClientMode ? "active" : ""}`}
                onClick={() => { setHomeView(n.id); setInClientMode(false); setSelectedUser(null); setSelectedKey(null); }}>
                <i className={`ti ${n.icon}`}></i>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="uptime-chip"><i className="ti ti-clock"></i><span>{serverUptime}</span></div>
          </div>
        </aside>

        <main className="main-content">

          {/* ── SCRIPTS ── */}
          {!inClientMode && homeView === "scripts" && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Supported Games</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>{Object.keys(allGames).length} games · Click to copy loadstring</p>
              </div>
              {gamesLoading ? (
                <div style={{ textAlign: "center", padding: "80px", color: "var(--text-tertiary)" }}>Loading games...</div>
              ) : Object.keys(allGames).length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px", color: "var(--text-tertiary)" }}>No games found</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {Object.entries(allGames).map(([gameId, url]) => (
                    <div key={gameId} style={{ ...card({ padding: "20px 24px", display: "flex", alignItems: "center", gap: "18px", transition: "border-color 0.15s" }) }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-md)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
                    >
                      <GameIcon placeId={gameId} size={56} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>{gameId}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
                      </div>
                      {clients.filter(c => c.placeId === gameId).length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-success)", borderRadius: "8px", padding: "6px 12px" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}></div>
                          <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "500" }}>{clients.filter(c => c.placeId === gameId).length} online</span>
                        </div>
                      )}
                      <button style={{ padding: "10px 20px", background: "#22c55e", color: "#000", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px", flexShrink: 0 }}
                        onClick={() => { const ls = `loadstring(game:HttpGet("${url}"))()`; navigator.clipboard.writeText(ls); alert(`✅ Copied!\n\n${ls}`); }}>
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                    {filteredClients.length === 0 && !loading && <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>No clients found</div>}
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
                {[
                  { label: "Online Now", value: clients.length, color: "#4ade80", icon: "ti-users" },
                  { label: "Total Connections", value: totalConnections, color: "var(--text-primary)", icon: "ti-plug" },
                  { label: "Unique Players", value: new Set(allLogs.map(l => l.roblox_id)).size, color: "var(--text-info)", icon: "ti-user-check" },
                  { label: "Server Uptime", value: serverUptime, color: "var(--text-warning)", icon: "ti-clock" },
                ].map((s, i) => (
                  <div key={i} style={card({ padding: "20px" })}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: "16px" }}></i>
                      <span style={label()}>{s.label}</span>
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
                        <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <i className="ti ti-terminal" style={{ fontSize: "16px", color: "var(--text-secondary)" }}></i>
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

          {/* ── LOGS ── */}
          {!inClientMode && homeView === "logs" && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Connection Logs</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>Click any row to view full session history</p>
              </div>
              <div style={card({ overflow: "hidden" })}>
                <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 120px 100px", padding: "10px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: "600", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <div></div><div>Player</div><div>Game</div><div>Executor</div><div style={{ textAlign: "right" }}>When</div>
                </div>
                {logsLoading ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>Loading...</div>
                ) : allLogs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>
                    <i className="ti ti-terminal" style={{ fontSize: "32px", display: "block", marginBottom: "12px" }}></i>No connections yet
                  </div>
                ) : allLogs.map((log, i) => (
                  <div key={i} onClick={() => setSelectedLog(log)}
                    style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 120px 100px", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <RobloxAvatar robloxId={log.roblox_id} size={32} />
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{log.roblox_name}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>ID: {log.roblox_id}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <GameIcon placeId={log.place_id} size={32} />
                      <div style={{ fontSize: "13px", fontWeight: "500" }}>{log.place_name}</div>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{log.executor}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textAlign: "right" }}>{timeAgo(log.connected_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {!inClientMode && homeView === "users" && !selectedUser && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Users</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>{uniqueUsers.length} unique players · Click to view lifetime history</p>
              </div>
              <div style={card({ overflow: "hidden" })}>
                <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 120px 100px", padding: "10px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: "600", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <div></div><div>Player</div><div>Sessions</div><div>Last Seen</div><div style={{ textAlign: "right" }}>Status</div>
                </div>
                {uniqueUsers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>No users yet</div>
                ) : uniqueUsers.map(u => (
                  <div key={u.roblox_id} onClick={() => setSelectedUser(u.roblox_id)}
                    style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 120px 100px", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <RobloxAvatar robloxId={u.roblox_id} size={32} />
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{u.roblox_name}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>ID: {u.roblox_id}</div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600" }}>{u.sessions.length}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{timeAgo(u.sessions[0].connected_at)}</div>
                    <div style={{ textAlign: "right" }}>
                      {onlineNow(u.roblox_id)
                        ? <span style={{ fontSize: "11px", fontWeight: "600", color: "#4ade80", background: "var(--bg-success)", padding: "3px 8px", borderRadius: "6px" }}>Online</span>
                        : <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Offline</span>
                      }
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
              {/* Hero */}
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
                    <div style={label()}>Sessions</div>
                    <div style={{ fontSize: "28px", fontWeight: "700" }}>{selectedUserData.sessions.length}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={label()}>Last Seen</div>
                    <div style={{ fontSize: "16px", fontWeight: "600" }}>{timeAgo(selectedUserData.sessions[0].connected_at)}</div>
                  </div>
                </div>
              </div>

              {/* Lifetime sessions */}
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

          {/* ── KEYS ── */}
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
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: "700", fontSize: "15px", letterSpacing: "0.08em", color: "var(--text-primary)" }}>{k.key_value}</div>
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
                      <button
                        onClick={() => { if (confirm(`Delete key ${k.key_value}?`)) deleteKey(k.key_value); }}
                        disabled={deletingKey === k.key_value}
                        style={{ background: "var(--bg-danger)", border: "none", borderRadius: "6px", padding: "5px 10px", color: "var(--text-danger)", fontSize: "12px", cursor: "pointer", opacity: deletingKey === k.key_value ? 0.5 : 1 }}
                      >
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

              {/* Key hero card */}
              <div style={card({ padding: "28px" })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: "700", letterSpacing: "0.1em" }}>{selectedKey.key_value}</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "8px", background: selectedKey.is_used ? "var(--bg-danger)" : "var(--bg-success)", color: selectedKey.is_used ? "var(--text-danger)" : "#4ade80" }}>
                      {selectedKey.is_used ? "Used" : "Active"}
                    </span>
                    <button onClick={() => { if (confirm(`Delete key ${selectedKey.key_value}?`)) { deleteKey(selectedKey.key_value); setSelectedKey(null); } }}
                      style={{ background: "var(--bg-danger)", border: "1px solid rgba(224,104,104,0.3)", borderRadius: "8px", padding: "5px 14px", color: "var(--text-danger)", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                      <i className="ti ti-trash"></i> Delete
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                  <div>
                    <div style={label()}>Created</div>
                    <div style={{ fontSize: "14px", fontWeight: "500" }}>{new Date(selectedKey.created_at).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={label()}>Roblox ID</div>
                    <div style={{ fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                      {selectedKey.roblox_id ? <><RobloxAvatar robloxId={selectedKey.roblox_id} size={20} />{selectedKey.roblox_id}</> : "Not used yet"}
                    </div>
                  </div>
                  <div>
                    <div style={label()}>Generated By</div>
                    <div style={{ fontSize: "14px", fontWeight: "500", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{selectedKey.generated_by}</div>
                  </div>
                </div>
              </div>

              {/* Sessions for this key's roblox id */}
              {selectedKey.roblox_id && (
                <div style={card({ overflow: "hidden" })}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                    {selectedKey.roblox_id && <RobloxAvatar robloxId={selectedKey.roblox_id} size={28} />}
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>Sessions for this key's player</div>
                  </div>
                  {selectedKeyLogs.length === 0 ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>No sessions recorded for this player yet</div>
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
                    <div style={{ fontSize: "26px", fontWeight: "700", marginBottom: "16px" }}>{selectedClient.place || "Unknown Game"}</div>
                    <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
                      <div>
                        <div style={label()}>Player</div>
                        <div style={{ fontSize: "20px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
                          {selectedClient.robloxId && <RobloxAvatar robloxId={selectedClient.robloxId} size={28} />}
                          {selectedClient.name}
                        </div>
                      </div>
                      <div>
                        <div style={label()}>Uptime</div>
                        <div style={{ fontSize: "20px", fontWeight: "600", color: "#4ade80" }}>{formatUptime(clientUptimes[selectedClient.id] || selectedClient.uptime || 0)}</div>
                      </div>
                      <div>
                        <div style={label()}>Executor</div>
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>{selectedClient.executor || "Unknown"}</div>
                      </div>
                      <div>
                        <div style={label()}>Roblox ID</div>
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>{selectedClient.robloxId || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={card({ padding: "20px" })}>
                  <div style={label()}>Status</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></div>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#22c55e" }}>Online</span>
                  </div>
                </div>
                <div style={card({ padding: "20px" })}>
                  <div style={label()}>Place ID</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", fontFamily: "var(--font-mono)" }}>{selectedClient.placeId || "N/A"}</div>
                </div>
                <div style={card({ padding: "20px" })}>
                  <div style={label()}>Session Start</div>
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>{new Date(Date.now() - (clientUptimes[selectedClient.id] || 0) * 1000).toLocaleTimeString()}</div>
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