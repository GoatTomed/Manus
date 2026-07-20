// Track.tsx
import { useEffect, useMemo, useState } from "react";
import { Client } from "./trackData";
import "./Track.css";

type HomeView = "clients" | "users";

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

function RobloxAvatar({ robloxId, size = 40 }: { robloxId?: string | null; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!robloxId) return;
    fetch(`/api/roblox-avatar?userId=${robloxId}`)
      .then(r => r.json())
      .then(data => { const u = data?.data?.[0]?.imageUrl; if (u) setUrl(u); })
      .catch(() => {});
  }, [robloxId]);
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
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [storedUsers, setStoredUsers] = useState<Record<string, StoredUser>>(loadStoredUsers);
  const [announcementText, setAnnouncementText] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");

  const ALLOWED_IP = "24.49.252.230";

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then((data: any) => { if (data?.ip !== ALLOWED_IP) setAccessDenied(true); setAccessChecked(true); })
      .catch(() => setAccessChecked(true));
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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data: Client[] = await res.json();
          setClients(data);
          setClientUptimes(prev => {
            const next = { ...prev };
            data.forEach(c => {
              const serverUptime = Number(c.uptime || 0);
              const existing = Number(prev[c.id] || 0);
              next[c.id] = Math.max(existing, serverUptime);
            });
            return next;
          });
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
        }
      } catch (e: any) { console.error("Error fetching clients:", e.message); } finally { setLoading(false); }
    };
    fetchClients();
    const interval = setInterval(fetchClients, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const onlineNow = (robloxId: string) => clients.find(c => c.robloxId === robloxId);
  const selectedUserData = selectedUser ? storedUsers[selectedUser] : null;

  async function sendCommand(robloxId: string | undefined, type: string, script = "") {
    if (!robloxId) return false;
    try {
      const res = await fetch("/api/clients?command=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ robloxId, type: type.toLowerCase(), script }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.warn("Command send failed", type, robloxId, err);
        return false;
      }
      const data = await res.json().catch(() => null);
      return data?.success === true || res.ok;
    } catch (error) {
      console.warn("Command send error", error);
      return false;
    }
  }

  async function handleClientCommand(type: string, script = "") {
    if (!selectedClient?.robloxId) return;
    const ok = await sendCommand(selectedClient.robloxId, type, script);
    if (!ok && typeof alert !== "undefined") {
      alert(`Failed to send ${type} command.`);
    }
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
              onClick={() => { setHomeView(item.id); setInClientMode(false); setSelectedUser(null); }}
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
                      <RobloxAvatar robloxId={c.robloxId ?? ""} size={48} />
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "800" }}>{c.name}</div>
                        <div style={{ fontSize: "12px", color: "#71717a" }}>ID: {c.robloxId}</div>
                      </div>
                    </div>
                    <div className="card-info-row">
                      <div>
                        <div style={labelStyle}>Current Game</div>
                        <div style={{ fontSize: "13px", fontWeight: "700" }}>{c.place}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={labelStyle}>Uptime</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#00ABFF" }}>{formatUptime(clientUptimes[c.id] || 0)}</div>
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
                      <RobloxAvatar robloxId={selectedClient.robloxId ?? ""} size={120} />
                      <div>
                        <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "4px" }}>{selectedClient.name}</h1>
                        <p style={{ color: "#71717a", fontSize: "16px" }}>{selectedClient.robloxId}</p>
                        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                          <span className="status-badge active">Online</span>
                          <span className="executor-badge">{selectedClient.executor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                      <button className="btn-execute" style={{ width: "auto", padding: "8px 24px" }} onClick={() => sendCommand(selectedClient.robloxId, "execute", scriptInput)}>Run</button>
                    </div>
                    <textarea 
                      className="console-textarea" 
                      style={{ margin: "0", border: "none", width: "100%", height: "300px" }}
                      placeholder="Paste your script here..."
                      value={scriptInput}
                      onChange={e => setScriptInput((e.target as HTMLTextAreaElement).value)}
                    />
                  </div>
                </div>
                <div className="profile-card">
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "32px" }}>
                    <GameIcon placeId={selectedClient.placeId} size={64} />
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "800" }}>{selectedClient.place || (selectedClient.placeId ? `Place ${selectedClient.placeId}` : "Unknown Game")}</div>
                      {selectedClient.placeId ? <div style={{ fontSize: "12px", color: "#52525b" }}>{selectedClient.placeId}</div> : null}
                    </div>
                  </div>
                  <div style={labelStyle}>Actions</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button className="btn-action danger" onClick={() => { void handleClientCommand("kick"); }}>Kick Player</button>
                    <button className="btn-action danger" onClick={() => { void handleClientCommand("ban"); }}>Ban Player</button>
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
                    <RobloxAvatar robloxId={u.roblox_id} size={48} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "16px", fontWeight: "800" }}>{u.roblox_name}</div>
                      <div style={{ fontSize: "12px", color: "#71717a" }}>{u.roblox_id}</div>
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
            <RobloxAvatar robloxId={selectedUserData.roblox_id} size={100} />
            <h2 style={{ fontSize: "24px", fontWeight: "900", marginTop: "16px" }}>{selectedUserData.roblox_name}</h2>
            <p style={{ color: "#71717a" }}>{selectedUserData.roblox_id}</p>
            <div style={{ marginTop: "16px" }}>{timeAgo(selectedUserData.last_seen, !!onlineNow(selectedUserData.roblox_id))}</div>
          </div>
          <div style={labelStyle}>Game History</div>
          <div className="user-list">
            {selectedUserData.sessions.map((s, i) => (
              <div key={i} className="user-row" style={{ background: i === 0 && onlineNow(selectedUserData.roblox_id) ? "rgba(0,171,255,0.05)" : "rgba(255,255,255,0.01)" }}>
                <GameIcon placeId={s.place_id} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "800" }}>{s.place_name}</div>
                  <div style={{ fontSize: "11px", color: "#71717a" }}>{timeAgo(s.connected_at)}</div>
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
    </div>
  );
}
