import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check, Search, Clock } from "lucide-react";
import Navbar from "../components/Navbar";

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
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#00ABFF]" size={48} />
        </main>
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* GET KEY Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#00ABFF]/15 border border-[#00ABFF]/40 rounded-full px-4 py-2">
              <Search size={16} className="text-[#00ABFF]" />
              <span className="font-bold text-[#00ABFF] tracking-wider text-sm">GET KEY</span>
            </div>
          </div>

          {/* Main Container */}
          <div className="bg-[#0a0d14] border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Title */}
            <h1 className="text-3xl font-bold text-center mb-3 text-white">
              {currentStep === 3 ? "Your Key is Ready" : "Complete Verification"}
            </h1>
            <p className="text-gray-400 text-center mb-8 text-sm">
              {currentStep === 3 
                ? "You have already generated a key in the last 24 hours." 
                : "Complete a quick verification to get your key and start using our scripts"}
            </p>

            {/* Progress Section - Only show if not finished */}
            {currentStep < 3 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 font-semibold text-sm">Progress</span>
                  <span className="text-[#00ABFF] font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00ABFF] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center mb-6 font-bold text-sm">
                {error}
              </div>
            )}

            {/* Checkpoints Section */}
            {currentStep < 3 && (
              <div className="space-y-3 mb-6">
                <div className="text-gray-400 font-semibold text-xs uppercase tracking-widest">
                  CHECKPOINTS ({currentStep > 1 ? 1 : 0}/2)
                </div>

                {/* Step 1 */}
                {currentStep === 1 && (
                  <div className="border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border-2 border-[#00ABFF] flex items-center justify-center bg-[#00ABFF]/10">
                          <span className="text-[#00ABFF] font-bold text-sm">1</span>
                        </div>
                        <h3 className="text-base font-bold text-white">First Step</h3>
                      </div>
                      <button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="bg-[#00ABFF] hover:bg-[#0099EE] disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 flex-shrink-0"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Start"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {currentStep === 2 && (
                  <div className="border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border-2 border-[#00ABFF] bg-[#00ABFF]/10 flex items-center justify-center">
                          <span className="text-[#00ABFF] font-bold text-sm">2</span>
                        </div>
                        <h3 className="text-base font-bold text-white">Last Step</h3>
                      </div>
                      <button
                        onClick={handleStep2}
                        disabled={isLoading}
                        className="bg-[#00ABFF] hover:bg-[#0099EE] disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 flex-shrink-0"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Start"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 - Key Display */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border border-green-500/30 rounded-xl p-6 bg-green-500/5 space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-400 mb-1">Verification Complete!</h3>
                    <p className="text-gray-400 text-sm">Your key is ready to use</p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex items-center justify-between gap-3">
                    <code className="text-sm font-mono font-bold tracking-wider text-white flex-1 break-all">
                      {generatedKey || "••••-••••"}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="text-[#00ABFF] p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                      disabled={!generatedKey}
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                  <p className="text-green-500/70 text-xs text-center">
                    {copied ? "✓ Copied to clipboard!" : "Click to copy your key"}
                  </p>
                </div>

                {/* Expiry Timer */}
                {timeLeft && timeLeft !== "Expired" && (
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm bg-white/5 py-3 rounded-xl border border-white/10">
                    <Clock size={16} className="text-[#00ABFF]" />
                    <span>New key available in:</span>
                    <span className="font-bold text-white font-mono">{timeLeft}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Button - Only show after key is generated */}
            {currentStep === 3 && (
              <div className="mt-6">
                <button
                  onClick={() => setLocation("/")}
                  className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-2.5 rounded-lg font-bold text-sm transition-all"
                >
                  Home
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
