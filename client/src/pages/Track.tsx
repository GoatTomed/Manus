import { useState, useEffect } from "react";
import axios from "axios";
import { Activity, User, Gamepad2, Clock, Search, ExternalLink, Loader2, Key } from "lucide-react";
import Navbar from "../components/Navbar";

interface OnlineUser {
  key_value: string;
  roblox_id: string;
  roblox_name: string;
  game_id: string;
  game_name: string;
  last_heartbeat: string;
}

export default function Track() {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOnlineUsers = async () => {
    try {
      const res = await axios.get("/api/online-users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch online users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u => 
    u.roblox_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.key_value?.toLowerCase().includes(search.toLowerCase()) ||
    u.game_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />
      
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="text-[#00ABFF]" />
              Live Tracking
            </h1>
            <p className="text-gray-400 mt-1">Real-time overview of active script users</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00ABFF] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search user, key or game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-[#00ABFF]/50 transition-all w-full md:w-80"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00ABFF] mb-4" size={40} />
            <p className="text-gray-500 animate-pulse">Establishing connection...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Activity size={48} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No Active Sessions</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or wait for users to connect.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.roblox_id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#00ABFF]/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Online</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#00ABFF]/10 border border-[#00ABFF]/20 flex items-center justify-center">
                    <User className="text-[#00ABFF]" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate pr-16">{user.roblox_name || "Unknown"}</h3>
                    <p className="text-xs text-gray-500 font-mono">ID: {user.roblox_id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                    <Gamepad2 size={18} className="text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Current Game</p>
                      <p className="text-sm font-medium truncate">{user.game_name || "Unknown Game"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                    <Key size={18} className="text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">License Key</p>
                      <p className="text-sm font-mono truncate text-[#00ABFF]">{user.key_value}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                    <Clock size={18} className="text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Last Heartbeat</p>
                      <p className="text-sm font-medium">
                        {new Date(user.last_heartbeat).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                  <a 
                    href={`https://www.roblox.com/users/${user.roblox_id}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-[#00ABFF]/10 text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    View Profile <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
