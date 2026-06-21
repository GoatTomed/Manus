import { useState, useEffect } from "react";
import { Activity, User, Gamepad2, Clock, Search, ExternalLink, Loader2, Key, ChevronRight, X, Settings, Zap, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

interface OnlineUser {
  key_value: string;
  roblox_id: string;
  roblox_name: string;
  game_id: string;
  game_name: string;
  last_heartbeat: string;
  avatar_color: string;
  transport: string;
}

interface LogEntry {
  id: string;
  time: string;
  level: "info" | "warn" | "error";
  message: string;
}

type ViewType = "clients" | "overview" | "scripts" | "tools" | "logs" | "settings";

// Mock data
const MOCK_USERS: OnlineUser[] = [
  {
    key_value: "ys_key_a1b2c3d4e5f6",
    roblox_id: "123456789",
    roblox_name: "PlayerOne",
    game_id: "286090429",
    game_name: "Adopt Me!",
    last_heartbeat: new Date(Date.now() - 2000).toISOString(),
    avatar_color: "bg-blue-500",
    transport: "WebSocket",
  },
  {
    key_value: "ys_key_f6e5d4c3b2a1",
    roblox_id: "987654321",
    roblox_name: "RoUser42",
    game_id: "655802394",
    game_name: "Bloxburg",
    last_heartbeat: new Date(Date.now() - 5000).toISOString(),
    avatar_color: "bg-green-500",
    transport: "WebSocket",
  },
  {
    key_value: "ys_key_9z8y7x6w5v4u",
    roblox_id: "555666777",
    roblox_name: "xXDevXx",
    game_id: "1671615235",
    game_name: "Tower of Hell",
    last_heartbeat: new Date(Date.now() - 8000).toISOString(),
    avatar_color: "bg-amber-500",
    transport: "HTTP",
  },
];

const MOCK_LOGS: LogEntry[] = [
  { id: "1", time: "14:32:15", level: "info", message: "Client connected: PlayerOne (ys_key_a1b2c3d4e5f6)" },
  { id: "2", time: "14:32:18", level: "info", message: "Heartbeat received from RoUser42" },
  { id: "3", time: "14:32:22", level: "warn", message: "High latency detected: 250ms" },
  { id: "4", time: "14:32:25", level: "info", message: "Game update: xXDevXx now in Tower of Hell" },
  { id: "5", time: "14:32:30", level: "error", message: "Connection timeout for inactive client" },
  { id: "6", time: "14:32:35", level: "info", message: "Relay peer connected: relay-us-01" },
];

export default function Track() {
  const [users, setUsers] = useState<OnlineUser[]>(MOCK_USERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("clients");
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [uptime, setUptime] = useState("00:00:00");
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);

  // Update uptime every second
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const seconds = String(elapsed % 60).padStart(2, "0");
      setUptime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          last_heartbeat: new Date().toISOString(),
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.roblox_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.key_value?.toLowerCase().includes(search.toLowerCase()) ||
      u.game_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col p-4 gap-6">
          <div className="text-lg font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">🎮</div>
            <span>Roblox MCP</span>
          </div>

          <nav className="flex flex-col gap-2">
            {(["clients", "overview", "scripts", "tools", "logs", "settings"] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === view
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">
                  {view === "clients" && "👥"}
                  {view === "overview" && "📊"}
                  {view === "scripts" && "📝"}
                  {view === "tools" && "🔧"}
                  {view === "logs" && "📋"}
                  {view === "settings" && "⚙️"}
                </span>
                <span className="capitalize">{view}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Roblox MCP</span>
              {selectedUser && (
                <span className="text-slate-400">
                  • {selectedUser.roblox_name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-slate-400">{currentView.toUpperCase()}</span>
              <span className="font-mono text-blue-400">Uptime: {uptime}</span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Clients View */}
            {currentView === "clients" && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search clients by name, game, or key..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="font-bold text-lg">Connected Clients</h2>
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                      {filteredUsers.length}
                    </span>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No clients found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.roblox_id}
                          className="px-6 py-4 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center justify-between group"
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-lg ${user.avatar_color} flex items-center justify-center font-bold text-sm text-white flex-shrink-0`}>
                              {user.roblox_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-white">{user.roblox_name}</div>
                              <div className="text-xs text-slate-500">
                                {user.game_name} • {user.key_value.substring(0, 12)}...
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-lg ${selectedUser.avatar_color} flex items-center justify-center font-bold text-2xl text-white`}>
                          {selectedUser.roblox_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{selectedUser.roblox_name}</h3>
                          <p className="text-sm text-slate-400">{selectedUser.game_name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-xs text-slate-500 mb-1">Roblox ID</div>
                        <div className="font-mono text-sm">{selectedUser.roblox_id}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-xs text-slate-500 mb-1">Transport</div>
                        <div className="font-mono text-sm">{selectedUser.transport}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-xs text-slate-500 mb-1">Game ID</div>
                        <div className="font-mono text-sm">{selectedUser.game_id}</div>
                      </div>
                    </div>

                    <a
                      href={`https://www.roblox.com/users/${selectedUser.roblox_id}/profile`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      View Roblox Profile <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Overview View */}
            {currentView === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Status</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-semibold">Connected</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Active Clients</div>
                    <div className="text-3xl font-bold">{users.length}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Relay Peers</div>
                    <div className="text-3xl font-bold">3</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Uptime</div>
                    <div className="font-mono text-lg font-bold">{uptime}</div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Server Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">API Version</span>
                      <span className="font-mono">v1.0.0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last Updated</span>
                      <span className="font-mono">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Memory Usage</span>
                      <span className="font-mono">124 MB / 512 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scripts View */}
            {currentView === "scripts" && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="font-bold text-lg">Loaded Scripts</h2>
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">4</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {[
                    { name: "ReplicatedStorage.MainModule", lines: 842, size: "34 KB" },
                    { name: "ServerScriptService.GameManager", lines: 312, size: "12 KB" },
                    { name: "StarterPlayer.CharController", lines: 508, size: "20 KB" },
                    { name: "ReplicatedStorage.UIHandler", lines: 221, size: "9 KB" },
                  ].map((script, idx) => (
                    <div key={idx} className="px-6 py-4 hover:bg-slate-800/50 transition-colors">
                      <div className="font-semibold text-sm mb-1">{script.name}</div>
                      <div className="text-xs text-slate-500">
                        {script.lines} lines • {script.size}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools View */}
            {currentView === "tools" && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="font-bold text-lg">Available Tools</h2>
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">4</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {[
                    { name: "RobloxMCP.GetPlaceInfo", desc: "Retrieve Roblox place metadata" },
                    { name: "RobloxMCP.GetUserInfo", desc: "Get user profile information" },
                    { name: "RobloxMCP.GetAssetInfo", desc: "Fetch asset details" },
                    { name: "RobloxMCP.SearchPlaces", desc: "Search for Roblox places" },
                  ].map((tool, idx) => (
                    <div key={idx} className="px-6 py-4 hover:bg-slate-800/50 transition-colors">
                      <div className="font-semibold text-sm mb-1">{tool.name}</div>
                      <div className="text-xs text-slate-500">{tool.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs View */}
            {currentView === "logs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Server Logs</h2>
                    <p className="text-sm text-slate-400 mt-1">Real-time server events</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors opacity-50 cursor-not-allowed">
                    Clear
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <div className="divide-y divide-slate-800">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`px-6 py-3 text-sm font-mono flex items-start gap-4 ${
                          log.level === "error"
                            ? "bg-red-500/10 text-red-400"
                            : log.level === "warn"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "text-slate-400"
                        }`}
                      >
                        <span className="text-xs text-slate-600 flex-shrink-0">{log.time}</span>
                        <span className="uppercase text-xs font-bold flex-shrink-0 w-12">
                          [{log.level}]
                        </span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings View */}
            {currentView === "settings" && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold mb-2">Settings</h2>
                  <p className="text-sm text-slate-400">Configure the tracking dashboard</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Auto-refresh Interval (seconds)</label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Max Log Entries</label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
