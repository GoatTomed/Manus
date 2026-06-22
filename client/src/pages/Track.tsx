// Track.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Client,
  LogEntry,
  scriptData,
} from "./trackData";
import "./Track.css";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type HomeView = "clients" | "server" | "logs" | "scripts";
type ClientView = "overview" | "scripts";

const homeNav: { id: HomeView; label: string; icon: string }[] = [
  { id: "clients", label: "Clients", icon: "ti-users" },
  { id: "scripts", label: "Scripts", icon: "ti-file-code" },
  { id: "server", label: "Server", icon: "ti-server" },
  { id: "logs", label: "Logs", icon: "ti-terminal" },
];

const clientNav: { id: ClientView; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "ti-layout-dashboard" },
  { id: "scripts", label: "Scripts", icon: "ti-file-code" },
];

function formatUptime(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Track() {
  const [inClientMode, setInClientMode] = useState(false);
  const [homeView, setHomeView] = useState<HomeView>("clients");
  const [clientView, setClientView] = useState<ClientView>("overview");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [historicalClients, setHistoricalClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [serverUptime, setServerUptime] = useState("00:00:00");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [allGames, setAllGames] = useState<Record<string, string>>({});
  const [gamesLoading, setGamesLoading] = useState(false);

  const fetchGames = async () => {
    setGamesLoading(true);
    try {
      const res = await fetch('/yousuck.lua');
      const text = await res.text();
      const match = text.match(/local GAMES\s*=\s*\{([\s\S]*?)\}/);
      if (match) {
        const content = match[1];
        const entryRegex = /\[\s*(\d+)\s*\]\s*=\s*["']([^"']+)["']/g;
        const parsed: Record<string, string> = {};
        let m;
        while ((m = entryRegex.exec(content)) !== null) {
          parsed[m[1]] = m[2];
        }
        setAllGames(parsed);
      }
    } catch (e) { 
      console.error(e); 
      // Fallback
      setAllGames({
        "123456789": "https://example.com/script1.lua",
        "987654321": "https://example.com/script2.lua"
      });
    } finally { 
      setGamesLoading(false); 
    }
  };

  useEffect(() => {
    if (homeView === "scripts" || (inClientMode && clientView === "scripts")) {
      fetchGames();
    }
  }, [homeView, inClientMode, clientView]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data: Client[] = await res.json();
          setClients(data);
          setHistoricalClients(prev => [...prev, ...data.filter(c => !prev.find(h => h.id === c.id))]);
        }
      } catch (e) { 
        console.error(e); 
        if (clients.length === 0) {
          setClients([
            { id: "1", name: "PlayerOne", place: "Paint or Die", placeId: "123456789", av: "", avc: "av-green", robloxId: "123", uptime: 1240 },
            { id: "2", name: "NoobSlayer", place: "Merge a Nuke", placeId: "987654321", av: "", avc: "av-blue", robloxId: "456", uptime: 4560 },
          ]);
        }
      } finally { 
        setLoading(false); 
      }
    };
    fetchClients();
    const interval = setInterval(fetchClients, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedStart = localStorage.getItem('serverStartTime');
    let startTime = savedStart ? parseInt(savedStart) : Date.now();
    if (!savedStart) localStorage.setItem('serverStartTime', startTime.toString());

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setServerUptime(formatUptime(elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [clientQuery, setClientQuery] = useState("");
  const filteredClients = useMemo(() => clients.filter(c => 
    c.name.toLowerCase().includes(clientQuery.toLowerCase()) || 
    c.place?.toLowerCase().includes(clientQuery.toLowerCase())
  ), [clients, clientQuery]);

  function selectClient(c: Client) {
    setSelectedClient(c);
    setInClientMode(true);
    setClientView("overview");
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
            {homeNav.map((n) => (
              <button 
                key={n.id} 
                className={`sidebar-item ${homeView === n.id && !inClientMode ? "active" : ""}`}
                onClick={() => { 
                  setHomeView(n.id); 
                  setInClientMode(false); 
                }}
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
          {/* SCRIPTS PAGE - WITH GAME THUMBNAILS */}
          {!inClientMode && homeView === "scripts" && (
            <div className="view active" style={{ padding: "32px" }}>
              <div className="scripts-header">
                <h2>Supported Games & Scripts</h2>
                <p>Loadstrings ready to copy</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(560px, 1fr))", gap: "20px" }}>
                {gamesLoading ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "120px" }}>Loading supported games...</div>
                ) : Object.keys(allGames).length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "120px", color: "var(--text-tertiary)" }}>
                    No games found in yousuck.lua
                  </div>
                ) : (
                  Object.entries(allGames).map(([gameId, url]) => (
                    <div key={gameId} style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                      borderRadius: "16px",
                      padding: "28px",
                      display: "flex",
                      alignItems: "center",
                      gap: "20px"
                    }}>
                      {/* GAME THUMBNAIL */}
                      <div style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "2px solid var(--border)",
                        flexShrink: 0,
                        background: "#1f1f28"
                      }}>
                        <img
                          src={`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${gameId}&size=150x150&format=Png&isCircular=false`}
                          alt="Game Icon"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            e.currentTarget.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;">🎮</div>';
                          }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "17px", fontWeight: "600" }}>Game ID: <strong>{gameId}</strong></div>
                        <div style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "13px", wordBreak: "break-all" }}>{url}</div>
                      </div>

                      <button
                        style={{
                          padding: "12px 26px",
                          background: "#22c55e",
                          color: "#000",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          const ls = `loadstring(game:HttpGet("${url}"))()`;
                          navigator.clipboard.writeText(ls);
                          alert(`✅ Copied loadstring!\n\n${ls}`);
                        }}
                      >
                        Copy loadstring
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CLIENTS LIST */}
          {!inClientMode && homeView === "clients" && (
            <div className="view active">
              <div className="clients-center">
                <div className="no-client-box">
                  <div className="no-client-icon"><i className="ti ti-users"></i></div>
                  <h2>Connected Clients</h2>
                  <p>Active sessions • <strong>{clients.length}</strong> online</p>

                  <div className="search-field">
                    <i className="ti ti-search"></i>
                    <input 
                      type="text" 
                      placeholder="Search clients..." 
                      value={clientQuery} 
                      onChange={(e) => setClientQuery(e.target.value)} 
                    />
                  </div>

                  <div className="client-list-box">
                    {filteredClients.length === 0 && !loading && (
                      <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>
                        No clients found
                      </div>
                    )}
                    {filteredClients.map((c) => (
                      <div className="client-row" key={c.id} onClick={() => selectClient(c)}>
                        <div className={`client-avatar ${c.avc || "av-green"}`}>
                          {c.robloxId && (
                            <img 
                              src={`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${c.robloxId}&size=150x150&format=Png&isCircular=false`} 
                              alt="" 
                              style={{width:"100%", height:"100%", borderRadius:"50%"}} 
                              onError={e => (e.currentTarget as HTMLImageElement).style.display='none'} 
                            />
                          )}
                        </div>
                        <div className="client-row-meta">
                          <div className="client-row-name">{c.name}</div>
                          <div className="client-row-sub">{c.place}</div>
                        </div>
                        <div style={{ marginLeft: "auto", textAlign: "right" }}>
                          <div style={{ fontSize: "13px", color: "#4ade80" }}>{formatUptime(c.uptime || 0)}</div>
                        </div>
                        <i className="ti ti-chevron-right"></i>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLIENT OVERVIEW */}
          {inClientMode && selectedClient && clientView === "overview" && (
            <div className="view active" style={{ padding: "50px 40px" }}>
              <div style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                borderRadius: "18px",
                padding: "36px",
                maxWidth: "760px",
                margin: "0 auto"
              }}>
                <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                  {selectedClient.placeId && (
                    <div style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "2px solid var(--border)",
                      flexShrink: 0,
                      background: "#1f1f28"
                    }}>
                      <img
                        src={`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${selectedClient.placeId}&size=150x150&format=Png&isCircular=false`}
                        alt="Game Icon"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:42px;">🎮</div>';
                        }}
                      />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "24px", fontWeight: "600", marginBottom: "6px" }}>
                      {selectedClient.place || "Unknown Game"}
                    </div>
                    <div style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
                      Game ID: <strong>{selectedClient.placeId}</strong>
                    </div>

                    <div style={{ display: "flex", gap: "50px" }}>
                      <div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>PLAYER</div>
                        <div style={{ fontSize: "21px", fontWeight: "600" }}>{selectedClient.name}</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>PLAY TIME</div>
                        <div style={{ fontSize: "21px", fontWeight: "600", color: "#4ade80" }}>
                          {formatUptime(selectedClient.uptime || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other views placeholder */}
          {!inClientMode && (homeView === "server" || homeView === "logs") && (
            <div className="view active" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              <h2>{homeView === "server" ? "Server Status" : "Logs"}</h2>
              <p style={{ marginTop: "20px" }}>Coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
