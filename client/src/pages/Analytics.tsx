import { useState, useEffect } from "react";
import axios from "axios";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, Key, MousePointer2, AlertCircle, Loader2, Globe, Clock, Activity, Plus, Minus, X, ChevronLeft, ChevronRight } from "lucide-react";
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
    setIsModifying(true);
    try {
      await axios.post("/api/analytics/modify", {
        type: overlay.type,
        amount: overlay.amount
      });
      toast.success(`${overlay.type === 'add' ? 'Added' : 'Removed'} ${overlay.amount} visits`);
      setOverlay({ type: null, amount: "100" });
      fetchStats(false);
    } catch (err) {
      toast.error("Modification failed");
    } finally {
      setIsModifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#00ABFF] mb-4" size={48} />
        <p className="text-gray-400 font-medium">Loading Live Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="text-red-500 mx-auto" size={48} />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-gray-400 text-sm">{error}</p>
          <button onClick={() => window.location.href = "/"} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg transition-all">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white relative">
      <Navbar />
      
      {overlay.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a0d14] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${overlay.type === 'add' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <button onClick={() => setOverlay({ type: null, amount: "100" })} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">{overlay.type === 'add' ? 'Add Visitors' : 'Remove Visitors'}</h3>
              <p className="text-gray-500 text-xs">Enter amount of visits.</p>
            </div>
            <div className="space-y-4">
              <input type="number" value={overlay.amount} onChange={(e) => setOverlay({ ...overlay, amount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:border-[#00ABFF] transition-all" />
              <div className="grid grid-cols-3 gap-2">
                {["100", "500", "1000"].map(val => (
                  <button key={val} onClick={() => setOverlay({ ...overlay, amount: val })} className="bg-white/5 hover:bg-white/10 border border-white/10 py-1 rounded-lg text-[10px] font-bold transition-all">+{val}</button>
                ))}
              </div>
            </div>
            <button disabled={isModifying} onClick={handleModify} className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${overlay.type === 'add' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>
              {isModifying ? <Loader2 className="animate-spin" size={20} /> : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 pt-24 max-w-6xl mx-auto w-full space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">Live <span className="text-[#00ABFF]">Analytics</span></h1>
            <p className="text-gray-500 text-sm">Real-time tracking of your platform's activity.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setOverlay({ type: 'add', amount: "100" })} className="p-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all"><Plus size={20} /></button>
            <button onClick={() => setOverlay({ type: 'remove', amount: "100" })} className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"><Minus size={20} /></button>
            <div className="text-[10px] text-gray-500 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10">SYNC: {lastUpdated.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between"><span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Uniques</span><Globe size={18} className="text-[#00ABFF]" /></div>
            <div className="text-3xl font-bold tracking-tighter">{data?.uniqueVisitors.toLocaleString()}</div>
          </div>
          <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between"><span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Views</span><Users size={18} className="text-blue-400" /></div>
            <div className="text-3xl font-bold tracking-tighter">{data?.totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between"><span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Keys</span><Key size={18} className="text-purple-500" /></div>
            <div className="text-3xl font-bold tracking-tighter">{data?.totalKeys.toLocaleString()}</div>
          </div>
          <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between"><span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Used</span><MousePointer2 size={18} className="text-green-500" /></div>
            <div className="text-3xl font-bold tracking-tighter">{data?.usedKeys.toLocaleString()}</div>
          </div>
        </div>

        {/* Graph Section with White Quadrilled Background */}
        <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-xl space-y-6 overflow-hidden">
          <div className="p-7 pb-0 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2"><Activity size={20} className="text-[#00ABFF]" />Visitor <span className="text-[#00ABFF]">Trend</span></h2>
          </div>
          
          <div className="bg-white m-4 mt-0 rounded-lg p-6 relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ABFF" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#00ABFF" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={true} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.toLocaleString()} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontSize: '12px', color: '#000' }} />
                  <Area type="monotone" dataKey="views" stroke="#00ABFF" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Board Table with Pagination */}
        <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl overflow-hidden border-t-2 border-t-[#00ABFF]">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-[#00ABFF] animate-pulse" />
              <h2 className="text-xl font-bold">Live <span className="text-[#00ABFF]">Board</span></h2>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 hover:text-[#00ABFF] disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
              <span className="text-xs font-mono px-2">PAGE {currentPage} / {data?.pagination.totalPages || 1}</span>
              <button disabled={currentPage === data?.pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1 hover:text-[#00ABFF] disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-8 py-4 border-r border-white/5">IP Address</th>
                  <th className="px-8 py-4 border-r border-white/5">Page Path</th>
                  <th className="px-8 py-4">Time Captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentVisits.map((visit, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-all">
                    <td className="px-8 py-4 font-mono text-[#00ABFF]"><span className="opacity-50 mr-2">#</span>{visit.ip}</td>
                    <td className="px-8 py-4"><span className="bg-white/5 px-2 py-1 rounded text-xs text-gray-300 border border-white/5">{visit.path}</span></td>
                    <td className="px-8 py-4 text-gray-500 text-xs font-mono">{new Date(visit.time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-between items-center px-8">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Total Logs: {data?.pagination.totalItems.toLocaleString()}</p>
            <div className="flex gap-2">
              <input 
                type="number" 
                min="1" 
                max={data?.pagination.totalPages} 
                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-12 text-center"
                placeholder="Go"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    if (val >= 1 && val <= (data?.pagination.totalPages || 1)) setCurrentPage(val);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
