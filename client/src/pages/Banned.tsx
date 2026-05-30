import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Banned() {
  const [banReason, setBanReason] = useState<string | null>(null);
  const [banDate, setBanDate] = useState<string | null>(null);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    // Try to get ban reason from localStorage (set by App.tsx)
    const reason = localStorage.getItem("ban_reason");
    const date = localStorage.getItem("ban_date");
    if (reason) setBanReason(reason);
    if (date) setBanDate(date);

    // Glitch effect animation
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 4000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0d14] text-white selection:bg-red-500/30 selection:text-white">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ABFF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Scanlines Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 4px)",
            animation: "scanlines 8s linear infinite",
          }}
        />
      </div>

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)",
      }} />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        @keyframes neon-glow {
          0%, 100% { text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000; }
          50% { text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 60px #ff0000; }
        }
        .glitch-effect {
          animation: glitch 0.3s ease-in-out;
        }
        .flicker-text {
          animation: flicker 0.15s infinite;
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="max-w-2xl w-full space-y-12">
          
          {/* Icon - Red Alert Circle */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-pulse" />
              <div className="absolute inset-4 rounded-full border-2 border-red-500/20 animate-pulse" style={{ animationDelay: "0.3s" }} />
              
              {/* Main circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/50 flex items-center justify-center shadow-2xl shadow-red-500/50">
                <div className="relative">
                  <AlertCircle size={96} className="text-red-500 animate-pulse" strokeWidth={1.5} />
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
                    <div className="w-full h-full rounded-full border-2 border-transparent border-t-red-500/50 border-r-red-500/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Title with Glitch */}
          <div className={`text-center space-y-4 ${glitch ? "glitch-effect" : ""}`}>
            <div className="space-y-2">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase" style={{
                animation: "neon-glow 2s ease-in-out infinite",
              }}>
                ACCESS
              </h1>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase text-red-500" style={{
                animation: "neon-glow 2s ease-in-out infinite",
                animationDelay: "0.1s",
              }}>
                DENIED
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-400 font-bold uppercase tracking-[0.2em] flicker-text">
              ▌ YOUR ACCOUNT HAS BEEN SUSPENDED ▌
            </p>
          </div>

          {/* Ban Details Card */}
          <div className="space-y-6">
            <div className="border-2 border-red-500/40 rounded-lg bg-red-500/5 backdrop-blur-xl p-8 space-y-6 shadow-2xl shadow-red-500/20">
              <div className="flex items-center gap-3 pb-6 border-b border-red-500/20">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">BAN INFORMATION</p>
              </div>

              {/* Reason */}
              {banReason && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">REASON</p>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
                    <p className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {banReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Effective Date */}
              {banDate && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">EFFECTIVE DATE</p>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
                    <p className="text-lg sm:text-xl font-mono text-white tracking-wider">
                      {new Date(banDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer Message */}
              <div className="pt-6 border-t border-red-500/20">
                <p className="text-sm text-gray-400 leading-relaxed text-center">
                  This account has been suspended due to a violation of our Terms of Service. 
                  If you believe this is an error, please contact support.
                </p>
              </div>
            </div>
          </div>

          {/* System Status Footer */}
          <div className="flex flex-col items-center gap-4 pt-8 border-t border-red-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-xs font-mono text-red-500 uppercase tracking-widest">
                SYSTEM STATUS: RESTRICTED
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
              <p className="text-xs font-mono text-red-500 uppercase tracking-widest">
                ACCESS PROTOCOL: DENIED
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }} />
              <p className="text-xs font-mono text-red-500 uppercase tracking-widest">
                SESSION: TERMINATED
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
