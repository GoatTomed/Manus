// Track.tsx
import { useEffect, useMemo, useState } from "react";
import { Client, LogEntry } from "./trackData";
import "./Track.css";

type HomeView = "clients" | "server" | "logs" | "scripts";
type ClientView = "overview" | "scripts";

const homeNav: { id: HomeView; label: string; icon: string }[] = [
  { id: "clients", label: "Clients", icon: "ti-users" },
  { id: "scripts", label: "Scripts", icon: "ti-file-code" },
  { id: "server", label: "Server", icon: "ti-server" },
  { id: "logs", label: "Logs", icon: "ti-terminal" },
];

function formatUptime(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
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
      {url
        ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <i className="ti ti-user" style={{ fontSize: size * 0.5 }}></i>
      }
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
    <div style={{ width: size, height: size, borderRadius: size > 80 ? "16px" : "12px", overflow: "hidden", border: "2px solid var(--border)", flexShrink: 0, background: "#1f1f28", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {url
        ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <i className="ti ti-device-gamepad" style={{ fontSize: size * 0.35, color: "var(--text-tertiary)" }}></i>
      }
    </div>
  );
}

// Connection log entry type stored in memory
type ConnLog = {
  id: string;
  robloxId: string;
  robloxName: string;
  placeId: string;
  placeName: string;
  executor: string;
  connectedAt: number;
  uptime: number;
};

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

  // Connection logs — built from client heartbeats
  const [connLogs, setConnLogs] = useState<ConnLog[]>([]);
  // Selected log for history modal
  const [selectedLog, setSelectedLog] = useState<ConnLog | null>(null);

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
    } catch (e) {
      setAllGames({ "123456789": "https://example.com/script1.lua" });
    } finally { setGamesLoading(false); }
  };

  useEffect(() => {
    if (homeView === "scripts") fetchGames();
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

          // Build connection logs from clients
          setConnLogs(prev => {
            const updated = [...prev];
            data.forEach(c => {
              if (!updated.find(l => l.robloxId === c.robloxId)) {
                updated.unshift({
                  id: c.id,
                  robloxId: c.robloxId || "",
                  robloxName: c.name,
                  placeId: c.placeId,
                  placeName: c.place,
                  executor: c.executor || "Unknown",
                  connectedAt: Date.now(),
                  uptime: c.uptime || 0,
                });
              }
            });
            return updated.slice(0, 50); // keep last 50
          });
        }
      } catch (e) {
        if (clients.length === 0) {
          const mock: Client[] = [
            { id: "1", name: "PlayerOne", place: "Paint or Die", placeId: "123456789", av: "", avc: "av-green", robloxId: "123", uptime: 1240 },
          ];
          setClients(mock);
        }
      } finally { setLoading(false); }
    };
    fetchClients();
    const interval = setInterval(fetchClients, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setClientUptimes(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => { next[id] += 1; });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedStart = localStorage.getItem('serverStartTime');
    let startTime = savedStart ? parseInt(savedStart) : Date.now();
    if (!savedStart) localStorage.setItem('serverStartTime', startTime.toString());
    const interval = setInterval(() => {
      setServerUptime(formatUptime(Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredClients = useMemo(() =>
    clients.filter(c =>
      c.name.toLowerCase().includes(clientQuery.toLowerCase()) ||
      c.place?.toLowerCase().includes(clientQuery.toLowerCase())
    ), [clients, clientQuery]);

  function selectClient(c: Client) {
    setSelectedClient(c);
    setInClientMode(true);
  }

  function chipClick() {
    setInClientMode(false);
    setHomeView("clients");
  }

  const topbarLabel = inClientMode
    ? (selectedClient?.name || "Client")
    : homeNav.find(n => n.id === homeView)?.label ?? "";

  return (
    <div className="track-page">
      {/* History Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedLog(null)}>×</button>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "28px" }}>
              <RobloxAvatar robloxId={selectedLog.robloxId} size={64} />
              <div>
                <div className="modal-title">{selectedLog.robloxName}</div>
                <div className="modal-subtitle">Roblox ID: {selectedLog.robloxId} · Executor: {selectedLog.executor}</div>
              </div>
            </div>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "12px", padding: "20px", display: "flex", gap: "20px", alignItems: "center", marginBottom: "24px" }}>
              <GameIcon placeId={selectedLog.placeId} size={80} />
              <div>
                <div style={{ fontSize: "18px", fontWeight: "600" }}>{selectedLog.placeName}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>Place ID: {selectedLog.placeId}</div>
                <div style={{ color: "#4ade80", fontSize: "13px", marginTop: "8px" }}>
                  Connected {timeAgo(selectedLog.connectedAt)} · Uptime {formatUptime(selectedLog.uptime)}
                </div>
              </div>
            </div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", textAlign: "center", padding: "20px" }}>
              Full session history requires persistent storage — connect a database to track across sessions.
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
              <button key={n.id}
                className={`sidebar-item ${homeView === n.id && !inClientMode ? "active" : ""}`}
                onClick={() => { setHomeView(n.id); setInClientMode(false); }}
              >
                <i className={`ti ${n.icon}`}></i>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="uptime-chip">
              <i className="ti ti-clock"></i>
              <span>{serverUptime}</span>
            </div>
          </div>
        </aside>

        <main className="main-content">

          {/* ── SCRIPTS PAGE ── */}
          {!inClientMode && homeView === "scripts" && (
            <div className="view active" style={{ padding: "32px" }}>
              <div className="scripts-header">
                <h2>Supported Games & Scripts</h2>
                <p>Loadstrings ready to copy</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(560px, 1fr))", gap: "20px" }}>
                {gamesLoading ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "120px" }}>Loading...</div>
                ) : Object.keys(allGames).length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "120px", color: "var(--text-tertiary)" }}>No games found</div>
                ) : Object.entries(allGames).map(([gameId, url]) => (
                  <div key={gameId} style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", display: "flex", alignItems: "center", gap: "20px" }}>
                    <GameIcon placeId={gameId} size={72} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "17px", fontWeight: "600" }}>{gameId}</div>
                      <div style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "13px", wordBreak: "break-all" }}>{url}</div>
                    </div>
                    <button style={{ padding: "12px 26px", background: "#22c55e", color: "#000", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}
                      onClick={() => { const ls = `loadstring(game:HttpGet("${url}"))()`; navigator.clipboard.writeText(ls); alert(`✅ Copied!\n\n${ls}`); }}>
                      Copy loadstring
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CLIENTS LIST ── */}
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
                    {filteredClients.length === 0 && !loading && (
                      <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>No clients found</div>
                    )}
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

          {/* ── LOGS PAGE ── */}
          {!inClientMode && homeView === "logs" && (
            <div className="view active" style={{ padding: "32px", flexDirection: "column", gap: "0" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Connection Logs</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>Click a row to view session details</p>
              </div>
              <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 120px 100px", padding: "10px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: "600", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <div></div>
                  <div>Player</div>
                  <div>Game</div>
                  <div>Executor</div>
                  <div style={{ textAlign: "right" }}>When</div>
                </div>
                {connLogs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>
                    <i className="ti ti-terminal" style={{ fontSize: "32px", display: "block", marginBottom: "12px" }}></i>
                    No connections logged yet
                  </div>
                ) : connLogs.map(log => (
                  <div key={log.id} onClick={() => setSelectedLog(log)}
                    style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 120px 100px", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <RobloxAvatar robloxId={log.robloxId} size={32} />
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{log.robloxName}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>ID: {log.robloxId}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <GameIcon placeId={log.placeId} size={32} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "500" }}>{log.placeName}</div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>{log.placeId}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{log.executor}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textAlign: "right" }}>{timeAgo(log.connectedAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CLIENT OVERVIEW ── */}
          {inClientMode && selectedClient && (
            <div className="view active" style={{ padding: "32px 40px", flexDirection: "column", gap: "20px" }}>

              {/* Hero card */}
              <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "18px", padding: "36px" }}>
                <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                  {selectedClient.placeId && <GameIcon placeId={selectedClient.placeId} size={140} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "26px", fontWeight: "700", marginBottom: "16px" }}>
                      {selectedClient.place || "Unknown Game"}
                    </div>
                    <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "11px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Player</div>
                        <div style={{ fontSize: "20px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
                          {selectedClient.robloxId && <RobloxAvatar robloxId={selectedClient.robloxId} size={28} />}
                          {selectedClient.name}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "11px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Uptime</div>
                        <div style={{ fontSize: "20px", fontWeight: "600", color: "#4ade80" }}>{formatUptime(clientUptimes[selectedClient.id] || selectedClient.uptime || 0)}</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "11px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Executor</div>
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>{selectedClient.executor || "Unknown"}</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "11px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Roblox ID</div>
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>{selectedClient.robloxId || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Status</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></div>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#22c55e" }}>Online</span>
                  </div>
                </div>
                <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Place ID</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", fontFamily: "var(--font-mono)" }}>{selectedClient.placeId || "N/A"}</div>
                </div>
                <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Session Start</div>
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>{new Date(Date.now() - (clientUptimes[selectedClient.id] || 0) * 1000).toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Recent logs for this player */}
              <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: "14px", fontWeight: "600" }}>Recent Sessions</div>
                {connLogs.filter(l => l.robloxId === selectedClient.robloxId).length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>No session history yet</div>
                ) : connLogs.filter(l => l.robloxId === selectedClient.robloxId).map(log => (
                  <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                    <GameIcon placeId={log.placeId} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "500", fontSize: "14px" }}>{log.placeName}</div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "2px" }}>Uptime {formatUptime(log.uptime)} · {log.executor}</div>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{timeAgo(log.connectedAt)}</div>
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