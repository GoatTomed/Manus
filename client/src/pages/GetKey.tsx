import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check, Search, Clock, ArrowLeft } from "lucide-react";

export default function GetKey() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedKey, setGeneratedKey] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const checkExistingKey = async () => {
      try {
        const visitorId = localStorage.getItem("ys_visitor_id");
        if (!visitorId) {
          setIsLoading(false);
          return;
        }

        const res = await axios.get(`/api/get-key/check?visitorId=${visitorId}`);
        if (res.data.hasKey) {
          setGeneratedKey(res.data.key);
          setExpiresAt(res.data.expiresAt);
          setCurrentStep(3);
        }
      } catch (err) {
        console.error("Error checking existing key:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const step = params.get("step");
    const completed = params.get("completed");
    const session = params.get("session");

    if (completed === "true" && session) {
      setCurrentStep(3);
      setSessionId(session);
      fetchResult(session);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (step === "2" && session) {
      setCurrentStep(2);
      setSessionId(session);
      setIsLoading(false);
    } else {
      checkExistingKey();
    }
  }, [location]);

  // Timer effect for expiresAt
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const fetchResult = async (sid: string) => {
    setIsLoading(true);
    try {
      const visitorId = localStorage.getItem("ys_visitor_id");
      const res = await axios.get(`/api/get-key/result/${sid}?visitorId=${visitorId}`);
      setGeneratedKey(res.data.key);
      // When newly generated, we know it's 24h from now
      setExpiresAt(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
    } catch (err: any) {
      const msg = err.response?.data?.error || "Verification expired or error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError("");
    try {
      const visitorId = localStorage.getItem("ys_visitor_id");
      const res = await axios.post("/api/get-key/start", { visitorId });
      const { earnPasteUrl } = res.data;
      window.location.href = earnPasteUrl;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Error starting process.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!sessionId) {
      setError("Session not found. Please start over.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/get-key/step2", { sessionId });
      const { earnPasteUrl } = res.data;
      window.location.href = earnPasteUrl;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Error starting final step.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercentage = currentStep === 1 ? 0 : currentStep === 2 ? 50 : 100;

  if (isLoading && currentStep !== 3) {
    return (
      <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#00ABFF]" size={48} strokeWidth={3} />
        </main>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl relative z-10">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors mb-8 no-underline hover:text-[#00ABFF]"
          >
            <ArrowLeft size={16} />
            Return Home
          </Link>

          {/* Header Section */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border"
              style={{
                background: "rgba(0,171,255,0.1)",
                borderColor: "rgba(0,171,255,0.2)",
              }}
            >
              <Search size={16} style={{ color: "#00ABFF" }} />
              <span className="font-bold text-sm tracking-wider" style={{ color: "#00ABFF" }}>
                KEY SYSTEM
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">
              <span className="text-white">Get Your </span>
              <span style={{ color: "#00ABFF" }}>Access Key</span>
            </h1>
            <p className="text-zinc-400 text-base max-w-md mx-auto leading-relaxed">
              {currentStep === 3
                ? "Your verification is complete. You can now use your key for the next 24 hours."
                : "Complete a quick verification to get your premium access key and start using our scripts."}
            </p>
          </div>

          {/* Main Card */}
          <div className="relative group">
            {/* Shimmer effect */}
            <div 
              className="absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-30 transition duration-500 blur"
              style={{ background: "linear-gradient(90deg, #00ABFF, #0044FF, #00ABFF)" }}
            ></div>
            
            <div className="relative bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              {/* Progress Bar (Only show if not finished) */}
              {currentStep < 3 && (
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Progress</span>
                    <span className="font-bold text-sm" style={{ color: "#00ABFF" }}>{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${progressPercentage}%`,
                        background: "linear-gradient(90deg, #00ABFF, #0066FF)"
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center mb-8 font-bold text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* Steps / Key Display */}
              {currentStep < 3 ? (
                <div className="space-y-4">
                  <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Current Step
                  </div>
                  
                  <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02] transition-all duration-300 hover:bg-white/[0.04] relative overflow-hidden group/step">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ABFF]/30 to-transparent opacity-0 group-hover/step:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold"
                          style={{ 
                            background: "rgba(0,171,255,0.1)", 
                            borderColor: "rgba(0,171,255,0.4)",
                            color: "#00ABFF"
                          }}
                        >
                          {currentStep}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {currentStep === 1 ? "Checkpoint 1" : "Final Checkpoint"}
                          </h3>
                          <p className="text-zinc-500 text-sm">Verification step {currentStep} of 2</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={currentStep === 1 ? handleStart : handleStep2}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 text-white"
                        style={{ 
                          background: "linear-gradient(135deg, #00ABFF, #0066FF)",
                          boxShadow: "0 4px 15px rgba(0, 171, 255, 0.3)"
                        }}
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Continue"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  <div 
                    className="border rounded-2xl p-8 text-center relative overflow-hidden"
                    style={{ 
                      background: "rgba(34,197,94,0.05)",
                      borderColor: "rgba(34,197,94,0.2)"
                    }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                      <Check size={32} className="text-green-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Verification Success</h3>
                    <p className="text-zinc-400 text-sm mb-8">Copy your key below to use it in our scripts</p>
                    
                    <div className="relative group/key">
                      <div className="absolute -inset-px bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-sm opacity-0 group-hover/key:opacity-100 transition-opacity"></div>
                      <div className="relative bg-black/60 border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4">
                        <code className="text-lg font-mono font-bold tracking-wider text-white flex-1 break-all text-left">
                          {generatedKey || "••••-••••-••••"}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="p-3 rounded-lg transition-all flex-shrink-0"
                          style={{ 
                            background: copied ? "rgba(34,197,94,0.1)" : "rgba(0,171,255,0.1)",
                            color: copied ? "#22c55e" : "#00ABFF"
                          }}
                        >
                          {copied ? <Check size={22} /> : <Copy size={22} />}
                        </button>
                      </div>
                    </div>
                    
                    {copied && (
                      <p className="text-green-500 font-bold text-xs mt-3 animate-bounce">
                        Copied to clipboard!
                      </p>
                    )}
                  </div>

                  {/* Expiry Timer */}
                  {timeLeft && timeLeft !== "Expired" && (
                    <div className="flex items-center justify-center gap-3 text-zinc-400 text-sm bg-white/[0.03] py-4 rounded-2xl border border-white/10">
                      <Clock size={18} style={{ color: "#00ABFF" }} />
                      <span className="font-medium">New key available in:</span>
                      <span className="font-bold text-white font-mono text-base">{timeLeft}</span>
                    </div>
                  )}

                  <button
                    onClick={() => setLocation("/")}
                    className="w-full py-4 rounded-2xl font-bold text-base transition-all text-white border border-white/10 hover:bg-white/5"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-xs font-medium">
              Having issues? Join our <a href="#" className="text-[#00ABFF] hover:underline">Discord Server</a> for support.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
