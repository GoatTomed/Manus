import { useEffect, useMemo, useState } from "react";
import {
  Client,
  clients,
  logData as initialLogData,
  LogEntry,
  scriptData,
  ToolDef,
  toolDefs,
} from "./trackData";
import "./Track.css";

type HomeView = "clients" | "server" | "logs" | "settings";
type ClientView = "overview" | "scripts" | "tools";

const homeNav: { id: HomeView; label: string; icon: string }[] = [
  { id: "clients", label: "Clients", icon: "ti-users" },
  { id: "server", label: "Server", icon: "ti-server" },
  { id: "logs", label: "Logs", icon: "ti-terminal" },
  { id: "settings", label: "Settings", icon: "ti-settings" },
];

const clientNav: { id: ClientView; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "ti-layout-dashboard" },
  { id: "scripts", label: "Scripts", icon: "ti-file-code" },
  { id: "tools", label: "Tools", icon: "ti-tool" },
];

function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export default function Track() {
  // -- Navigation state --
  const [inClientMode, setInClientMode] = useState(false);
  const [homeView, setHomeView] = useState<HomeView>("clients");
  const [clientView, setClientView] = useState<ClientView>("overview");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // -- Uptime --
  const [startTime] = useState(() => Date.now());
  const [uptime, setUptime] = useState("00:00:00");
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(formatUptime(Date.now() - startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // -- Client search filter --
  const [clientQuery, setClientQuery] = useState("");
  const filteredClients = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientQuery.toLowerCase()) ||
          c.place.toLowerCase().includes(clientQuery.toLowerCase())
      ),
    [clientQuery]
  );

  // -- Logs --
  const [logs, setLogs] = useState<LogEntry[]>(initialLogData);

  // -- Tools --
  const [activeTool, setActiveTool] = useState<ToolDef>(toolDefs[0]);
  const [toolOutput, setToolOutput] = useState("Click Send to execute the tool");
  const [resBadge, setResBadge] = useState("");
  const [resTime, setResTime] = useState("");
  const [running, setRunning] = useState(false);

  function runTool() {
    setRunning(true);
    setToolOutput("Running…");
    setResBadge("");
    setResTime("");
    setTimeout(() => {
      const ms = Math.floor(Math.random() * 200 + 40);
      setResBadge("200 OK");
      setResTime(`${ms} ms`);
      setToolOutput(
        `// ${activeTool.label} result\n{\n  "status": "ok",\n  "count": ${Math.floor(
          Math.random() * 40 + 1
        )},\n  "data": []\n}`
      );
      setRunning(false);
    }, 320);
  }

  function selectTool(t: ToolDef) {
    setActiveTool(t);
    setToolOutput("Click Send to execute the tool");
    setResBadge("");
    setResTime("");
  }

  // -- Settings --
  const [provider, setProvider] = useState<"openai" | "ollama">("openai");
  const [cacheEnabled, setCacheEnabled] = useState(false);

  // -- Navigation handlers --
  function selectClient(c: Client) {
    setSelectedClient(c);
    setInClientMode(true);
    setClientView("overview");
  }

  function chipClick() {
    if (inClientMode) {
      setInClientMode(false);
      setHomeView("clients");
    }
  }

  const topbarLabel = inClientMode
    ? clientNav.find((n) => n.id === clientView)?.label ?? ""
    : homeNav.find((n) => n.id === homeView)?.label ?? "";

  return (
    <div className="track-page">
      {/* Topbar */}
      <div className="topbar">
        <a className="topbar-logo" href="#">
          <i className=" "></i>{" "}
        </a>
        <div className="topbar-sep"></div>
        <div className="client-chip" onClick={chipClick}>
          <i className="ti ti-user"></i>
          <span>{selectedClient ? selectedClient.name : "Select Client"}</span>
          <i className="ti ti-chevron-down"></i>
        </div>
        <div className="topbar-right">
          <span className="topbar-section">{topbarLabel}</span>
        </div>
      </div>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          {!inClientMode ? (
            <nav className="sidebar-nav">
              {homeNav.map((n) => (
                <button
                  key={n.id}
                  className={"sidebar-item" + (homeView === n.id ? " active" : "")}
                  onClick={() => setHomeView(n.id)}
                >
                  <i className={`ti ${n.icon}`}></i>
                  {n.label}
                </button>
              ))}
            </nav>
          ) : (
            <nav className="sidebar-nav">
              {clientNav.map((n) => (
                <button
                  key={n.id}
                  className={"sidebar-item" + (clientView === n.id ? " active" : "")}
                  onClick={() => setClientView(n.id)}
                >
                  <i className={`ti ${n.icon}`}></i>
                  {n.label}
                </button>
              ))}
            </nav>
          )}
          <div className="sidebar-footer">
            <div className="uptime-chip">
              <i className="ti ti-clock"></i>
              <span>{uptime}</span>
            </div>
            <a
              className="gh-link"
              href="https://github.com/notpoiu/roblox-mcp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <i className="ti ti-brand-github"></i>
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content">
          {!inClientMode && homeView === "clients" && (
            <div className="view active">
              <div className="clients-center">
                <div className="no-client-box">
                  <div className="no-client-icon">
                    <i className="ti ti-layers"></i>
                  </div>
                  <h2>Continue to Dashboard</h2>
                  <p>Choose a client to continue</p>
                  <div className="search-field">
                    <i className="ti ti-search"></i>
                    <input
                      type="text"
                      placeholder="Find client…"
                      autoComplete="off"
                      value={clientQuery}
                      onChange={(e) => setClientQuery(e.target.value)}
                    />
                  </div>
                  <div className="client-list-box">
                    {filteredClients.map((c) => (
                      <div className="client-row" key={c.id} onClick={() => selectClient(c)}>
                        <div className={`client-avatar ${c.avc}`}>{c.av}</div>
                        <div className="client-row-meta">
                          <div className="client-row-name">{c.name}</div>
                          <div className="client-row-sub">{c.place.replace(" — ", " · ")}</div>
                        </div>
                        <i className="ti ti-chevron-right"></i>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!inClientMode && homeView === "server" && (
            <div className="view active">
              <div className="server-wrap">
                <div>
                  <h2>Server</h2>
                  <p>MCP server connectivity and relay topology</p>
                </div>
                <div className="graph-card">
                  <div className="graph-inner">
                    <div className="g-node">
                      <div className="g-circle" style={{ background: "var(--bg-info)" }}>
                        <i className="ti ti-cpu" style={{ fontSize: 22, color: "var(--text-info)" }}></i>
                      </div>
                      <span className="g-label">MCP Server</span>
                    </div>
                    <div className="g-line">
                      <div className="g-track"></div>
                      <div className="g-dot dot-green"></div>
                    </div>
                    <div className="g-node">
                      <div className="g-circle" style={{ background: "var(--bg-secondary)" }}>
                        <i className="ti ti-share" style={{ fontSize: 22, color: "var(--text-secondary)" }}></i>
                      </div>
                      <span className="g-label">Relay</span>
                    </div>
                    <div className="g-line">
                      <div className="g-track"></div>
                      <div className="g-dot dot-green"></div>
                    </div>
                    <div className="g-node">
                      <div className="g-circle" style={{ background: "var(--bg-success)" }}>
                        <i className="ti ti-device-gamepad" style={{ fontSize: 22, color: "var(--text-success)" }}></i>
                      </div>
                      <span className="g-label">Clients ({clients.length})</span>
                    </div>
                  </div>
                </div>
                <div className="server-stats-row">
                  <div className="stat-card">
                    <div className="stat-label">Status</div>
                    <div className="stat-val green">Connected</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Clients</div>
                    <div className="stat-val">{clients.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Relay Peers</div>
                    <div className="stat-val">1</div>
                  </div>
                </div>
                <div className="clients-table-card">
                  <div className="clients-table-head">
                    <span className="clients-table-title">Connected Clients</span>
                    <span className="count-pill">{clients.length}</span>
                  </div>
                  {clients.map((c) => (
                    <div className="ct-row" key={c.id}>
                      <div className="status-dot dot-green"></div>
                      <span className="ct-name">{c.name}</span>
                      <span className="ct-id">{c.id}</span>
                      <span className="ct-transport">WebSocket</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!inClientMode && homeView === "logs" && (
            <div className="view active">
              <div className="logs-wrap">
                <div className="logs-header">
                  <h2>Server Logs</h2>
                  <div className="logs-controls">
                    <button className="log-btn">
                      <div className="live-dot"></div>Live
                    </button>
                    <button className="log-btn" onClick={() => setLogs([])}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="logs-card">
                  <div className="logs-col-head">
                    <div>Time</div>
                    <div>Level</div>
                    <div>Message</div>
                  </div>
                  <div className="logs-body">
                    {logs.length === 0 ? (
                      <div style={{ padding: 14, fontSize: 12, color: "var(--text-tertiary)" }}>
                        No server logs yet
                      </div>
                    ) : (
                      logs.map((l, i) => {
                        const cls =
                          l.level === "info" ? "lvl-info" : l.level === "warn" ? "lvl-warn" : "lvl-err";
                        return (
                          <div className="log-row" key={i}>
                            <div className="log-time">{l.time}</div>
                            <div className="log-level">
                              <span className={cls}>{l.level.toUpperCase()}</span>
                            </div>
                            <div className="log-msg">{l.msg}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!inClientMode && homeView === "settings" && (
            <div className="view active">
              <div className="settings-wrap">
                <div>
                  <h2>Settings</h2>
                  <p>Configure semantic search embedding provider</p>
                </div>

                <div className="settings-card">
                  <div className="settings-card-body">
                    <div className="settings-card-title">Embedding Provider</div>
                    <div className="settings-card-desc">
                      Choose between OpenAI or Ollama for generating script embeddings.
                    </div>
                    <div className="provider-toggle">
                      <button
                        className={"prov-btn" + (provider === "openai" ? " active" : "")}
                        onClick={() => setProvider("openai")}
                      >
                        OpenAI
                      </button>
                      <button
                        className={"prov-btn" + (provider === "ollama" ? " active" : "")}
                        onClick={() => setProvider("ollama")}
                      >
                        Ollama
                      </button>
                    </div>
                  </div>
                  <div className="settings-card-footer">
                    <span className="settings-footer-hint">Changing provider clears all cached indexes.</span>
                    <button className="save-btn">Save</button>
                  </div>
                </div>

                {provider === "openai" && (
                  <div className="settings-card">
                    <div className="settings-card-body">
                      <div className="settings-card-title">OpenAI Configuration</div>
                      <div className="settings-card-desc">
                        API key, compatible base URL, and model for embeddings.
                      </div>
                      <div className="settings-field">
                        <label>API Key</label>
                        <input type="password" placeholder="sk-…" />
                      </div>
                      <div className="settings-field">
                        <label>Base URL</label>
                        <input type="text" placeholder="https://api.openai.com/v1" />
                      </div>
                      <div className="settings-field">
                        <label>Model</label>
                        <input type="text" placeholder="text-embedding-3-small" />
                      </div>
                    </div>
                    <div className="settings-card-footer">
                      <span className="settings-footer-hint">
                        Stored locally at ~/.roblox-mcp/semantic-search.json
                      </span>
                      <button className="save-btn">Save</button>
                    </div>
                  </div>
                )}

                {provider === "ollama" && (
                  <div className="settings-card">
                    <div className="settings-card-body">
                      <div className="settings-card-title">Ollama Configuration</div>
                      <div className="settings-card-desc">Base URL and model for local Ollama embeddings.</div>
                      <div className="settings-field">
                        <label>Base URL</label>
                        <input type="text" placeholder="http://localhost:11434" />
                      </div>
                      <div className="settings-field">
                        <label>Model</label>
                        <input type="text" placeholder="embeddinggemma" />
                      </div>
                    </div>
                    <div className="settings-card-footer">
                      <span className="settings-footer-hint">Ensure Ollama is running locally.</span>
                      <button className="save-btn">Save</button>
                    </div>
                  </div>
                )}

                <div className="settings-card">
                  <div className="settings-card-body">
                    <div className="settings-card-title">Embedding Cache</div>
                    <div className="settings-card-desc">
                      Reuse script embeddings after server restarts or Roblox reconnects.
                    </div>
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        className="toggle-check"
                        checked={cacheEnabled}
                        onChange={(e) => setCacheEnabled(e.target.checked)}
                      />
                      <div
                        className="toggle-track"
                        style={{ background: cacheEnabled ? "#22c55e" : undefined }}
                      >
                        <div
                          className="toggle-thumb"
                          style={{ left: cacheEnabled ? 18 : 2 }}
                        ></div>
                      </div>
                      <span>Persist embeddings to disk</span>
                    </label>
                  </div>
                  <div className="settings-card-footer">
                    <span className="settings-footer-hint">
                      Stored locally at ~/.roblox-mcp/semantic-embeddings.json
                    </span>
                    <div className="footer-actions">
                      <button className="delete-btn">Delete Cache</button>
                      <button className="save-btn">Save</button>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-card-body">
                    <div className="settings-card-title">Test Connection</div>
                    <div className="settings-card-desc">
                      Verify that the current embedding provider is reachable and configured correctly.
                    </div>
                    <button className="test-btn">
                      <i className="ti ti-plug"></i>Test Embedding Provider
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {inClientMode && selectedClient && clientView === "overview" && (
            <div className="view active">
              <div className="overview-wrap">
                <div className="hero-card">
                  <div className={`hero-avatar ${selectedClient.avc}`}>{selectedClient.av}</div>
                  <div className="hero-meta">
                    <h1>{selectedClient.name}</h1>
                    <p>{selectedClient.place}</p>
                  </div>
                  <span className="transport-pill">WS</span>
                </div>
                <div className="cards-row">
                  <div className="info-card">
                    <div className="info-card-label">Client ID</div>
                    <div className="info-card-value">{selectedClient.id}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-label">Place ID</div>
                    <div className="info-card-value">{selectedClient.placeId}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-label">User ID</div>
                    <div className="info-card-value">3141592</div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-label">Job ID</div>
                    <div className="info-card-value">a8d1…fc3</div>
                  </div>
                </div>
                <div className="tiles-row">
                  <div className="tile">
                    <div className="tile-head">
                      <span className="tile-title">Connection</span>
                      <span className="badge badge-green">Active</span>
                    </div>
                    <div className="tile-stat">
                      <span className="tile-stat-label">Transport</span>
                      <span className="tile-stat-val">WebSocket</span>
                    </div>
                  </div>
                  <div className="tile">
                    <div className="tile-head">
                      <span className="tile-title">Activity</span>
                    </div>
                    <div className="tile-stat">
                      <span className="tile-stat-label">Scripts Synced</span>
                      <span className="tile-stat-val">{scriptData.length === 8 ? 847 : scriptData.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {inClientMode && clientView === "scripts" && (
            <div className="view active">
              <div className="scripts-wrap">
                <div className="scripts-header">
                  <h2>Scripts</h2>
                  <p>Indexed scripts from the connected client</p>
                </div>
                <div className="scripts-body">
                  <div className="scripts-main">
                    <div className="scripts-toolbar">
                      <div className="scripts-search">
                        <i className="ti ti-search"></i>
                        <input type="text" placeholder="Go to file…" autoComplete="off" />
                      </div>
                      <span className="scripts-count">847 scripts</span>
                    </div>
                    <div className="scripts-col-head">
                      <div>Name</div>
                      <div>Lines</div>
                      <div>Size</div>
                      <div></div>
                    </div>
                    <div className="scripts-list">
                      {scriptData.map((s) => (
                        <div className="script-row" key={s.name}>
                          <div className="script-row-name">{s.name}</div>
                          <div>{s.lines}</div>
                          <div>{s.size}</div>
                          <div className="script-action">
                            <button className="action-btn">Open</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="scripts-sidebar-panel">
                    <div className="sidebar-section-card">
                      <div className="sidebar-sec-title">Scripts Synced</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "100%", background: "#378add" }}></div>
                      </div>
                      <div className="legend-row">
                        <div className="legend-dot" style={{ background: "#378add" }}></div>
                        <span className="legend-label">Synced</span>
                        <span className="legend-val">847/847</span>
                        <span className="legend-perc">100%</span>
                      </div>
                      <div className="sec-footer">
                        <span className="sync-badge done">Complete</span>
                      </div>
                    </div>
                    <div className="sidebar-section-card">
                      <div className="sidebar-sec-title">Semantic Indexing</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "62%", background: "#1d9e75" }}></div>
                      </div>
                      <div className="legend-row">
                        <div className="legend-dot" style={{ background: "#1d9e75" }}></div>
                        <span className="legend-label">Indexed</span>
                        <span className="legend-val">525/847</span>
                        <span className="legend-perc">62%</span>
                      </div>
                      <div className="sec-footer">
                        <button className="index-btn">Index Game</button>
                        <span className="idle-label">Indexing…</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {inClientMode && clientView === "tools" && (
            <div className="view active">
              <div className="tools-wrap">
                <div className="tools-main">
                  <div className="tools-card">
                    <div className="tool-exec-header">
                      <div className="tool-exec-info">
                        <h3>{activeTool.label}</h3>
                        <p>{activeTool.desc}</p>
                      </div>
                      <button className="send-btn" onClick={runTool} disabled={running}>
                        <span>Send</span>
                        <i className="ti ti-player-play"></i>
                      </button>
                    </div>
                    <table className="params-table">
                      <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTool.params.map((p) => (
                          <tr key={p.k}>
                            <td className="param-key">{p.k}</td>
                            <td className="param-val">
                              <input type="text" placeholder={p.p} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="tool-response">
                      <div className="tool-res-header">
                        <span className="tool-res-title">Body</span>
                        <div className="tool-res-meta">
                          <span
                            className="res-badge"
                            style={
                              resBadge
                                ? { background: "var(--bg-success)", color: "var(--text-success)" }
                                : undefined
                            }
                          >
                            {resBadge}
                          </span>
                          <span>{resTime}</span>
                        </div>
                      </div>
                      <div className="tool-res-body">{toolOutput}</div>
                    </div>
                  </div>
                </div>
                <div className="tools-sidebar-panel">
                  <div className="tools-sidebar-label">Collections</div>
                  <div className="tools-list">
                    {toolDefs.map((t) => (
                      <div
                        key={t.id}
                        className={"tool-item" + (activeTool.id === t.id ? " active" : "")}
                        onClick={() => selectTool(t)}
                      >
                        <i className={`ti ${t.icon}`}></i>
                        <span>{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
