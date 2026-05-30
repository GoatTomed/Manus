import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Banned() {
  const [banReason, setBanReason] = useState<string | null>(null);
  const [banDate, setBanDate] = useState<string | null>(null);

  useEffect(() => {
    // Try to get ban reason from localStorage (set by App.tsx)
    const reason = localStorage.getItem("ban_reason");
    const date = localStorage.getItem("ban_date");
    if (reason) setBanReason(reason);
    if (date) setBanDate(date);
  }, []);

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col items-center justify-center text-white p-8">
      <div className="max-w-2xl w-full text-center space-y-12 animate-in fade-in zoom-in duration-700">
        
        {/* Icon Circle */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="relative bg-red-500/10 border-2 border-red-500/30 rounded-full w-full h-full flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full"></div>
              <AlertCircle className="text-red-500 relative" size={80} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-7xl font-black tracking-tighter uppercase drop-shadow-2xl">
            Access <span className="text-red-500">Denied</span>
          </h1>
          <p className="text-2xl text-gray-400 font-bold uppercase tracking-[0.15em]">
            Your account has been suspended
          </p>
        </div>

        {/* Ban Details */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 space-y-6 backdrop-blur-sm">
          <div className="space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">Ban Information</p>
            {banReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400">Reason</p>
                <p className="text-lg text-white font-medium">{banReason}</p>
              </div>
            )}
            {banDate && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400">Effective Date</p>
                <p className="text-lg text-white font-mono">{new Date(banDate).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="border-t border-red-500/20 pt-6">
            <p className="text-sm text-gray-400 leading-relaxed">
              This account has been suspended due to a violation of our Terms of Service. 
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>

        {/* Footer Message */}
        <div className="space-y-4 pt-8 border-t border-white/10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600">
            System Status: <span className="text-red-500">RESTRICTED</span>
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs text-gray-500 font-mono">Access Protocol: DENIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
