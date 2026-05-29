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
  recentVisits: { ip_address: string; path: string; created_at: string }[];
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-md w-full text-center space-y-6 backdrop-blur-xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight uppercase">Access Denied</h1>
            <p className="text-gray-400 text-xs font-medium px-4 leading-relaxed">{error}</p>
          </div>
          <button onClick={() => window.location.href = "/"} className="w-full bg-[#00ABFF] text-white font-bold py-4 rounded-xl hover:bg-[#0099EE] transition-all uppercase tracking-widest text-xs">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white relative selection:bg-[#00ABFF] selection:text-white">
      <Navbar />
      
      {/* Manipulation Overlay */}
      {overlay.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all">
          <div className="bg-[#0a0d14] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <button 
              onClick={() => setOverlay({ type: null, amount: "100" })} 
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="text-center space-y-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 border ${overlay.type === 'add' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                {overlay.type === 'add' ? <Plus size={24} /> : <Minus size={24} />}
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight">
                {overlay.type === 'add' ? 'Inject Traffic' : 'Purge Traffic'}
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Database Protocol</p>
            </div>

            <div className="space-y-4">
              <input 
                type="number" 
                autoFocus
                value={overlay.amount} 
                onChange={(e) => setOverlay({ ...overlay, amount: e.target.value })} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-bold focus:outline-none focus:border-[#00ABFF] transition-all"
                placeholder="0"
              />

              <div className="grid grid-cols-3 gap-2">
                {["100", "500", "1000"].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setOverlay({ ...overlay, amount: val })} 
                    className="bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={isModifying} 
              onClick={handleModify} 
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                overlay.type === 'add' 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
              } disabled:opacity-50`}
            >
              {isModifying ? <Loader2 className="animate-spin" size={16} /> : 'Execute'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 pt-28 max-w-6xl mx-auto w-full space-y-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-[#00ABFF] rounded-full"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ABFF]">Analytics Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight uppercase flex items-center gap-3">
              Live <span className="text-[#00ABFF]">Board</span>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button onClick={() => setOverlay({ type: 'add', amount: "100" })} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all"><Plus size={20} /></button>
              <div className="w-px h-6 bg-white/10 my-auto mx-1"></div>
              <button onClick={() => setOverlay({ type: 'remove', amount: "100" })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Minus size={20} /></button>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-[#00ABFF] font-bold uppercase tracking-widest mb-1">Live Sync</div>
              <div className="text-xs text-gray-500 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Unique Visitors", value: data?.uniqueVisitors, icon: Globe, color: "#00ABFF" },
            { label: "Total Views", value: data?.totalViews, icon: Users, color: "#3b82f6" },
            { label: "Keys Generated", value: data?.totalKeys, icon: Key, color: "#a855f7" },
            { label: "Keys Redeemed", value: data?.usedKeys, icon: MousePointer2, color: "#22c55e" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-white/20 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">{stat.value?.toLocaleString() || 0}</div>
            </div>
          ))}
        </div>

        {/* Graph Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00ABFF]/10 rounded-lg border border-[#00ABFF]/20">
                <Activity size={20} className="text-[#00ABFF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-tight">Visitor <span className="text-[#00ABFF]">Trend</span></h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Last 7 days unique visits</p>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ABFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ABFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#555" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} 
                />
                <YAxis 
                  stroke="#555" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.toLocaleString()} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0d14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#00ABFF' }}
                  cursor={{ stroke: '#00ABFF', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="views" stroke="#00ABFF" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Board Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <Clock size={20} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-tight">Recent <span className="text-[#00ABFF]">Visits</span></h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Real-time traffic log</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                className="p-1.5 hover:bg-white/10 disabled:opacity-20 rounded-lg transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5 px-3 text-[10px] font-bold">
                <span className="text-gray-500">PAGE</span>
                <span className="text-[#00ABFF]">{currentPage}</span>
                <span className="text-gray-500">/</span>
                <span>{data?.pagination.totalPages || 1}</span>
              </div>
              <button 
                disabled={currentPage === data?.pagination.totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="p-1.5 hover:bg-white/10 disabled:opacity-20 rounded-lg transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-500 font-bold uppercase text-[9px] tracking-widest">
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Path</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentVisits.map((visit, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-6 py-4 font-mono text-[#00ABFF] text-xs">
                      {visit.ip_address}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-white/5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-gray-300 border border-white/5">
                        {visit.path}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-[10px] font-medium">
                      {new Date(visit.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!data?.recentVisits || data.recentVisits.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">
                      Awaiting Incoming Traffic...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Hash size={12} className="text-gray-600" />
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                Total Logs: <span className="text-gray-400 ml-1">{data?.pagination.totalItems.toLocaleString()}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Jump to</span>
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
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold w-16 text-center focus:outline-none focus:border-[#00ABFF] transition-all"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
