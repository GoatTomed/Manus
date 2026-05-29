import { useState, useEffect } from "react";
import axios from "axios";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, Key, MousePointer2, AlertCircle, Loader2, Globe, Clock, Activity, Plus, Minus, X, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  totalKeys: number;
  usedKeys: number;
  dailyStats: { date: string; views: number }[];
  recentVisits: { ip: string; path: string; time: string }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");
  
  const [overlay, setOverlay] = useState<{ type: 'add' | 'remove' | null, amount: string }>({ type: null, amount: "100" });
  const [isModifying, setIsModifying] = useState(false);

  const fetchStats = async (showLoading = false, page = currentPage) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await axios.get(`/api/analytics?page=${page}`);
      setData(response.data);
      setLastUpdated(new Date());
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
      await axios.post("/api/analytics/modify", {
        type: overlay.type,
        amount: overlay.amount
      });
      toast.success(`${overlay.type === 'add' ? 'Injected' : 'Purged'} ${overlay.amount} visits successfully`);
      setOverlay({ type: null, amount: "100" });
      fetchStats(false);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsModifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#00ABFF] mb-4" size={48} />
        <p className="text-gray-400 font-medium animate-pulse tracking-widest text-[10px] uppercase font-bold">Initializing Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 max-w-md w-full text-center space-y-6 backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Access Denied</h1>
            <p className="text-gray-400 text-xs font-medium px-4 leading-relaxed">{error}</p>
          </div>
          <button onClick={() => window.location.href = "/"} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs">Return to Safety</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white relative selection:bg-[#00ABFF] selection:text-white">
      <Navbar />
      
      {/* Improved Manipulation Overlay */}
      {overlay.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 transition-all duration-500">
          <div className="bg-[#0a0d14] border border-white/10 rounded-3xl p-10 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-8 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${overlay.type === 'add' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}></div>
            
            <button 
              onClick={() => setOverlay({ type: null, amount: "100" })} 
              className="absolute top-6 right-6 text-gray-500 hover:text-white hover:rotate-90 transition-all duration-300"
            >
              <X size={24} />
            </button>
            
            <div className="text-center space-y-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 ${overlay.type === 'add' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                {overlay.type === 'add' ? <Plus size={32} /> : <Minus size={32} />}
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight">
                {overlay.type === 'add' ? 'Inject Traffic' : 'Purge Traffic'}
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Database Manipulation Protocol</p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="number" 
                  autoFocus
                  value={overlay.amount} 
                  onChange={(e) => setOverlay({ ...overlay, amount: e.target.value })} 
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-center text-4xl font-black focus:outline-none focus:border-[#00ABFF] focus:bg-white/[0.08] transition-all placeholder:text-white/10"
                  placeholder="0000"
                />
                <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5 group-focus-within:border-[#00ABFF]/50 transition-all"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {["100", "500", "1000"].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setOverlay({ ...overlay, amount: val })} 
                    className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={isModifying} 
              onClick={handleModify} 
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 shadow-2xl ${
                overlay.type === 'add' 
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isModifying ? <Loader2 className="animate-spin" size={20} /> : 'Execute Protocol'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 pt-28 max-w-6xl mx-auto w-full space-y-10 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-[#00ABFF] rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ABFF]">System Dashboard</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic flex items-center gap-4">
              Live <span className="text-[#00ABFF]">Analytics</span>
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-2xl">
              <button onClick={() => setOverlay({ type: 'add', amount: "100" })} className="p-3 text-green-500 hover:bg-green-500/10 rounded-xl transition-all"><Plus size={24} /></button>
              <div className="w-px h-8 bg-white/10 my-auto mx-1"></div>
              <button onClick={() => setOverlay({ type: 'remove', amount: "100" })} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Minus size={24} /></button>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-[#00ABFF] font-black uppercase tracking-widest mb-1">Live Sync</div>
              <div className="text-xs text-gray-500 font-mono bg-white/5 px-4 py-2 rounded-xl border border-white/10">{lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Unique Visitors", value: data?.uniqueVisitors, icon: Globe, color: "#00ABFF", bg: "bg-[#00ABFF]/10" },
            { label: "Total Views", value: data?.totalViews, icon: Users, color: "#3b82f6", bg: "bg-blue-500/10" },
            { label: "Keys Generated", value: data?.totalKeys, icon: Key, color: "#a855f7", bg: "bg-purple-500/10" },
            { label: "Keys Redeemed", value: data?.usedKeys, icon: MousePointer2, color: "#22c55e", bg: "bg-green-500/10" }
          ].map((stat, i) => (
            <div key={i} className="bg-[#0a0d14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-7 space-y-4 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-all duration-700`}></div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                <div className={`p-3 ${stat.bg} rounded-2xl border border-white/5`}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-4xl font-black tracking-tighter relative z-10 italic">{stat.value?.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Graph Section with White Quadrilled Background */}
        <div className="bg-[#0a0d14]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-2 shadow-2xl space-y-8 overflow-hidden">
          <div className="p-8 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#00ABFF]/10 rounded-2xl border border-[#00ABFF]/20">
                <Activity size={24} className="text-[#00ABFF]" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Visitor <span className="text-[#00ABFF]">Trend</span></h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Session-based unique analytics</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#00ABFF]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">7 Day Window</span>
            </div>
          </div>
          
          <div className="bg-white m-6 mt-0 rounded-3xl p-8 relative overflow-hidden shadow-inner" style={{ backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ABFF" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#00ABFF" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={true} />
                  <XAxis dataKey="date" stroke="#999" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} />
                  <YAxis stroke="#999" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => val.toLocaleString()} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', fontSize: '12px', fontWeight: '900', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} 
                    cursor={{ stroke: '#00ABFF', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#00ABFF" strokeWidth={6} fillOpacity={1} fill="url(#colorViews)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Board Table with Pagination */}
        <div className="bg-[#0a0d14]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden border-t-4 border-t-[#00ABFF]">
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#00ABFF]/20 rounded-2xl border border-[#00ABFF]/30">
                <Activity size={24} className="text-[#00ABFF] animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Live <span className="text-[#00ABFF]">Board</span></h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Deep-packet visitor inspection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/10">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                className="p-2 hover:bg-[#00ABFF] hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit rounded-xl transition-all duration-300"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2 px-4 border-x border-white/10">
                <span className="text-[10px] font-black text-gray-500 uppercase">Page</span>
                <span className="text-sm font-black text-[#00ABFF] italic">{currentPage}</span>
                <span className="text-[10px] font-black text-gray-500 uppercase">of</span>
                <span className="text-sm font-black text-white italic">{data?.pagination.totalPages || 1}</span>
              </div>
              <button 
                disabled={currentPage === data?.pagination.totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="p-2 hover:bg-[#00ABFF] hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit rounded-xl transition-all duration-300"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.03] text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
                  <th className="px-10 py-6 border-r border-white/5">Visitor Identifier</th>
                  <th className="px-10 py-6 border-r border-white/5">Resource Path</th>
                  <th className="px-10 py-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentVisits.map((visit, i) => (
                  <tr key={i} className="hover:bg-white/[0.04] transition-all group">
                    <td className="px-10 py-6 font-mono text-[#00ABFF] text-sm group-hover:translate-x-2 transition-transform duration-500">
                      <span className="opacity-30 mr-3 text-xs">ID_</span>{visit.ip}
                    </td>
                    <td className="px-10 py-6">
                      <span className="bg-[#00ABFF]/10 text-[#00ABFF] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-[#00ABFF]/20 tracking-wider">
                        {visit.path}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-gray-400 text-xs font-black italic tracking-tight">
                      {new Date(visit.time).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!data?.recentVisits || data.recentVisits.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-10 py-20 text-center text-gray-600 font-black uppercase italic tracking-[0.3em] text-xs">
                      Awaiting Incoming Traffic...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-white/[0.02] border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <Hash size={14} className="text-gray-500" />
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
                Total Log Entries: <span className="text-white ml-1">{data?.pagination.totalItems.toLocaleString()}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Jump to page</span>
              <div className="relative group">
                <input 
                  type="number" 
                  min="1" 
                  max={data?.pagination.totalPages} 
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(goToPage);
                      if (val >= 1 && val <= (data?.pagination.totalPages || 1)) {
                        setCurrentPage(val);
                        setGoToPage("");
                      }
                    }
                  }}
                  className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2 text-xs font-black w-24 text-center focus:outline-none focus:border-[#00ABFF] transition-all"
                  placeholder="00"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
