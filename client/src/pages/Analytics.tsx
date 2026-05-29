import { useState, useEffect } from "react";
import axios from "axios";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, Key, MousePointer2, AlertCircle, Loader2, Globe, Clock, Activity } from "lucide-react";
import Navbar from "../components/Navbar";

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  totalKeys: number;
  usedKeys: number;
  dailyStats: { date: string; views: number }[];
  recentVisits: { ip: string; path: string; time: string }[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStats = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await axios.get("/api/analytics");
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.error || "Access Denied or Server Error");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);
    
    // Auto-refresh every 10 seconds for the "Live" effect
    const interval = setInterval(() => {
      fetchStats(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />
      
      <main className="flex-1 p-6 pt-24 max-w-6xl mx-auto w-full space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Live <span className="text-[#00ABFF]">Analytics</span>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </h1>
            <p className="text-gray-500 text-sm">Real-time tracking of your platform's activity.</p>
          </div>
          <div className="text-[10px] text-gray-500 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10">
            LAST UPDATED: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Unique Visitors</span>
              <div className="p-2 bg-[#00ABFF]/10 rounded-lg text-[#00ABFF]">
                <Globe size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tighter">{data?.uniqueVisitors.toLocaleString()}</div>
          </div>

          <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total Views</span>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Users size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tighter">{data?.totalViews.toLocaleString()}</div>
          </div>

          <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Keys Created</span>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Key size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tighter">{data?.totalKeys.toLocaleString()}</div>
          </div>

          <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Redeemed</span>
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <MousePointer2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tighter">{data?.usedKeys.toLocaleString()}</div>
          </div>
        </div>

        {/* Graph Section */}
        <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity size={20} className="text-[#00ABFF]" />
              Visitor <span className="text-[#00ABFF]">Trend</span>
            </h2>
            <span className="text-xs text-gray-500 font-medium">Last 7 Days (Uniques)</span>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ABFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ABFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                  }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val.toLocaleString()}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0d14', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#00ABFF' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#00ABFF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Board Table */}
        <div className="bg-[#0a0d14]/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl overflow-hidden border-t-2 border-t-[#00ABFF]">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00ABFF]/20 rounded-lg">
                <Activity size={20} className="text-[#00ABFF] animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Live <span className="text-[#00ABFF]">Board</span></h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Real-time visitor logs</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#00ABFF] text-[10px] font-bold animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ABFF]"></span>
              LIVE FEED
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
                  <tr key={i} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-8 py-4 font-mono text-[#00ABFF] group-hover:pl-10 transition-all duration-300">
                      <span className="opacity-50 mr-2">#</span>{visit.ip}
                    </td>
                    <td className="px-8 py-4">
                      <span className="bg-white/5 px-2 py-1 rounded text-xs text-gray-300 border border-white/5">
                        {visit.path}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-gray-500 text-xs font-mono">
                      {new Date(visit.time).toLocaleTimeString()} 
                      <span className="ml-2 opacity-30">({new Date(visit.time).toLocaleDateString()})</span>
                    </td>
                  </tr>
                ))}
                {(!data?.recentVisits || data.recentVisits.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-gray-600 italic">
                      No activity detected yet...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white/[0.02] border-t border-white/10 text-center">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
              Showing last 20 active sessions
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
