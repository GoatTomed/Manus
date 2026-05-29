import { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, Key, MousePointer2, AlertCircle, Loader2, Globe, Clock, Activity,
  Plus, Minus, X, ChevronLeft, ChevronRight, Hash
} from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  totalKeys: number;
  usedKeys: number;
  dailyStats: { date: string; views: number }[];
  recentVisits: { ip_hash: string; path: string; created_at: string }[];
  pagination: { currentPage: number; totalPages: number; totalItems: number };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");
  const [overlay, setOverlay] = useState<{ type: 'add' | 'remove' | null; amount: string }>({ type: null, amount: "100" });
  const [isModifying, setIsModifying] = useState(false);
  const [, setLocation] = useLocation();

  const fetchStats = async (showLoading = false, page = currentPage) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await axios.get(`/api/analytics?page=${page}`);
      setData(response.data);
      setLastUpdated(new Date());
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Access Denied or Server Error");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true, currentPage);
    const interval = setInterval(() => fetchStats(false, currentPage), 10000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const handleModify = async () => {
    if (!overlay.type) return;
    const amount = parseInt(overlay.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsModifying(true);
    try {
      await axios.post("/api/analytics/modify", { type: overlay.type, amount: overlay.amount });
      toast.success(`${overlay.type === 'add' ? 'Injected' : 'Purged'} ${overlay.amount} visits successfully`);
      setOverlay({ type: null, amount: "100" });
      fetchStats(false);
    } catch {
      toast.error("Operation failed");
    } finally {
      setIsModifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#00ABFF] mb-6" size={64} />
        <p className="text-gray-400 font-bold animate-pulse tracking-widest text-xs uppercase">Initializing System...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white p-8">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 max-w-xl w-full text-center space-y-8 backdrop-blur-xl">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="text-red-500" size={48} />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight uppercase">Access Denied</h1>
            <p className="text-gray-400 text-base font-medium px-8 leading-relaxed">{error}</p>
          </div>
          <button onClick={() => setLocation("/")} className="w-full bg-[#00ABFF] text-white font-bold py-5 rounded-2xl hover:bg-[#0099EE] transition-all uppercase tracking-widest text-sm shadow-2xl shadow-[#00ABFF]/30">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white relative selection:bg-[#00ABFF] selection:text-white">
      <Navbar />

      {/* ── Manipulation Overlay ── */}
      {overlay.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-lg p-6 transition-all">
          <div className="bg-[#0a0d14] border border-white/10 rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl space-y-8 relative overflow-hidden">
            <button onClick={() => setOverlay({ type: null, amount: "100" })} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all">
              <X size={28} />
            </button>
            <div className="text-center space-y-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 ${overlay.type === 'add' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                {overlay.type === 'add' ? <Plus size={32} /> : <Minus size={32} />}
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">
                {overlay.type === 'add' ? 'Inject Traffic' : 'Purge Traffic'}
              </h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Database Protocol</p>
            </div>
            <div className="space-y-6">
              <input
                type="number"
                autoFocus
                value={overlay.amount}
                onChange={e => setOverlay({ ...overlay, amount: e.target.value })}
                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-6 text-center text-5xl font-bold focus:outline-none focus:border-[#00ABFF] transition-all"
                placeholder="0"
              />
              <div className="grid grid-cols-3 gap-4">
                {["100", "500", "1000"].map(val => (
                  <button key={val} onClick={() => setOverlay({ ...overlay, amount: val })} className="bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl text-sm font-bold transition-all">
                    +{val}
                  </button>
                ))}
              </div>
            </div>
            <button
              disabled={isModifying}
              onClick={handleModify}
              className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4 ${
                overlay.type === 'add'
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-2xl shadow-green-600/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-600/30'
              } disabled:opacity-50`}
            >
              {isModifying ? <Loader2 className="animate-spin" size={24} /> : 'Execute Protocol'}
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 p-8 pt-32 max-w-[1400px] mx-auto w-full space-y-12 pb-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-12 bg-[#00ABFF] rounded-full"></div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#00ABFF]">System Analytics</span>
            </div>
            <h1 className="text-6xl font-extrabold tracking-tighter uppercase flex items-center gap-5">
              Live <span className="text-[#00ABFF]">Board</span>
              <span className="flex h-5 w-5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Users page redirect */}
            <button
              onClick={() => setLocation("/users")}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl border font-bold uppercase tracking-widest text-sm transition-all shadow-lg bg-white/5 border-white/10 text-gray-300 hover:border-[#00ABFF]/40 hover:text-white"
            >
              <Users size={20} />
              Users
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold bg-white/10 text-gray-400">
                {data?.uniqueVisitors || 0}
              </span>
            </button>

            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-2xl">
              <button onClick={() => setOverlay({ type: 'add', amount: "100" })} className="p-3 text-green-500 hover:bg-green-500/10 rounded-xl transition-all"><Plus size={32} /></button>
              <div className="w-px h-8 bg-white/10 my-auto mx-2"></div>
              <button onClick={() => setOverlay({ type: 'remove', amount: "100" })} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Minus size={32} /></button>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-[#00ABFF] font-bold uppercase tracking-widest mb-1">Live Sync</div>
              <div className="text-sm text-gray-400 font-mono bg-white/5 px-5 py-2 rounded-2xl border border-white/10">{lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Unique Visitors", value: data?.uniqueVisitors, icon: Globe, color: "#00ABFF" },
            { label: "Total Views", value: data?.totalViews, icon: Users, color: "#3b82f6" },
            { label: "Keys Generated", value: data?.totalKeys, icon: Key, color: "#a855f7" },
            { label: "Keys Redeemed", value: data?.usedKeys, icon: MousePointer2, color: "#22c55e" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-5 hover:border-[#00ABFF]/30 transition-all group shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <stat.icon size={28} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-5xl font-bold tracking-tight">{stat.value?.toLocaleString() || 0}</div>
            </div>
          ))}
        </div>

        {/* Graph Section */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-[#00ABFF]/10 rounded-2xl border border-[#00ABFF]/20">
                <Activity size={32} className="text-[#00ABFF]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Visitor <span className="text-[#00ABFF]">Trend</span></h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">7-day rolling unique visitor log</p>
              </div>
            </div>
          </div>
          <div className="h-[450px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ABFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00ABFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} />
                <YAxis stroke="#666" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => val.toLocaleString()} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0d14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', padding: '14px' }} itemStyle={{ color: '#00ABFF' }} cursor={{ stroke: '#00ABFF', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="views" stroke="#00ABFF" strokeWidth={5} fillOpacity={1} fill="url(#colorViews)" animationDuration={1800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Board Table */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Clock size={32} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Recent <span className="text-[#00ABFF]">Visits</span></h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Real-time unique visitor log</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2.5 hover:bg-white/10 disabled:opacity-20 rounded-xl transition-all">
                <ChevronLeft size={28} />
              </button>
              <div className="flex items-center gap-2 px-5 text-xs font-bold border-x border-white/10">
                <span className="text-gray-500">PAGE</span>
                <span className="text-[#00ABFF] text-xl">{currentPage}</span>
                <span className="text-gray-500">/</span>
                <span className="text-xl">{data?.pagination.totalPages || 1}</span>
              </div>
              <button disabled={currentPage === data?.pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 hover:bg-white/10 disabled:opacity-20 rounded-xl transition-all">
                <ChevronRight size={28} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">
                  <th className="px-10 py-7">Visitor Identifier</th>
                  <th className="px-10 py-7">Resource Path</th>
                  <th className="px-10 py-7">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentVisits.map((visit, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-9 font-mono text-[#00ABFF] text-base group-hover:translate-x-2 transition-transform">
                      {visit.ip_hash}
                    </td>
                    <td className="px-10 py-9">
                      <span className="bg-[#00ABFF]/10 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#00ABFF] border border-[#00ABFF]/20">
                        {visit.path}
                      </span>
                    </td>
                    <td className="px-10 py-9 text-gray-400 text-sm font-medium">
                      {new Date(visit.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!data?.recentVisits || data.recentVisits.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-10 py-24 text-center text-gray-600 font-bold uppercase tracking-[0.35em] text-base">
                      Awaiting Incoming Traffic...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Hash size={18} className="text-gray-600" />
              <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                Total Log Entries: <span className="text-gray-400 ml-3 text-base">{data?.pagination.totalItems.toLocaleString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Jump to page</span>
              <input
                type="number"
                min="1"
                max={data?.pagination.totalPages}
                value={goToPage}
                onChange={e => setGoToPage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = parseInt(goToPage);
                    if (val >= 1 && val <= (data?.pagination.totalPages || 1)) {
                      setCurrentPage(val);
                      setGoToPage("");
                    }
                  }
                }}
                className="bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-3 text-sm font-bold w-28 text-center focus:outline-none focus:border-[#00ABFF] transition-all"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
