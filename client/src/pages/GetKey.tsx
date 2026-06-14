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

  if (isLoading && currentStep !== 3) {
    return (
      <div className="dot-grid-bg min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00ABFF]" size={32} />
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Simple Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-12 no-underline"
          >
            <ArrowLeft size={14} />
            Back
          </Link>

          {/* Clean Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">
              {currentStep === 3 ? "Access Granted" : "Key System"}
            </h1>
            <p className="text-zinc-500 text-sm">
              {currentStep === 3
                ? "Your key is valid for the next 24 hours."
                : `Complete step ${currentStep} to receive your access key.`}
            </p>
          </div>

          {/* Minimal Content Area */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-8">
            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium mb-6">
                {error}
              </div>
            )}

            {currentStep < 3 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ABFF] mb-1">
                      Step {currentStep} of 2
                    </div>
                    <div className="text-lg font-bold text-white">
                      {currentStep === 1 ? "Initialize" : "Finalize"}
                    </div>
                  </div>
                  <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00ABFF] transition-all duration-500"
                      style={{ width: currentStep === 1 ? "50%" : "100%" }}
                    />
                  </div>
                </div>

                <button
                  onClick={currentStep === 1 ? handleStart : handleStep2}
                  disabled={isLoading}
                  className="w-full py-4 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Continue"}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Your Access Key
                  </label>
                  <div className="relative group">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm text-white break-all pr-12">
                      {generatedKey}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {timeLeft && timeLeft !== "Expired" && (
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                      <Clock size={14} />
                      Expires in
                    </div>
                    <div className="text-xs font-bold font-mono text-white">{timeLeft}</div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => setLocation("/")}
                    className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-lg text-sm font-bold transition-all"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Subtle Footer */}
          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-600">
              Need help? <a href="#" className="text-zinc-400 hover:text-white transition-colors no-underline ml-1">Support Discord</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
