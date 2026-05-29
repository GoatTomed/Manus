import { useState, useEffect } from "react";
import axios from "axios";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, Key, MousePointer2, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";

interface AnalyticsData {
  totalViews: number;
  totalKeys: number;
  usedKeys: number;
  dailyStats: { date: string; views: number }[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/analytics");
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Access Denied or Server Error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#00ABFF] mb-4" size={48} />
        <p className="text-gray-400 font-medium">Loading Analytics...</p>
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
      
      <main className="flex-1 p-6 pt-24 max-w-6xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Project <span className="text-[#00ABFF]">Analytics</span></h1>
          <p className="text-gray-500 text-sm">Real-time statistics for your script platform.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0d14] border border-white/10 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Visits</span>
              <div className="p-2 bg-[#00ABFF]/10 rounded-lg text-[#00ABFF]">
                <Users size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold">{data?.totalViews.toLocaleString()}</div>
          </div>

          <div className="bg-[#0a0d14] border border-white/10 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Keys Generated</span>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Key size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold">{data?.totalKeys.toLocaleString()}</div>
          </div>

          <div className="bg-[#0a0d14] border border-white/10 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Keys Redeemed</span>
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <MousePointer2 size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold">{data?.usedKeys.toLocaleString()}</div>
          </div>
        </div>

        {/* Graph Section */}
        <div className="bg-[#0a0d14] border border-white/10 rounded-xl p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Traffic <span className="text-[#00ABFF]">Overview</span></h2>
            <span className="text-xs text-gray-500 font-medium">Last 7 Days</span>
          </div>
          
          <div className="h-[350px] w-full">
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
                    fontSize: '12px'
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
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
