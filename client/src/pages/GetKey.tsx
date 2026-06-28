import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check, Clock, ArrowLeft } from "lucide-react";

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

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
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
      // Use the expiresAt returned by the backend (handles key reuse correctly)
      setExpiresAt(res.data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
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
      <div className="dot-grid-bg min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00ABFF]" size={32} />
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#00ABFF] transition-colors mb-8 no-underline"
          >
            <ArrowLeft size={16} />
            Return Home
          </Link>

          <div className="border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02]">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-4 border"
                style={{
                  background: "rgba(0,171,255,0.1)",
                  borderColor: "rgba(0,171,255,0.2)",
                }}
              >
                <span className="font-semibold text-sm uppercase tracking-wide" style={{ color: "#00ABFF" }}>
                  GET KEY
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {currentStep === 3 ? "Access Granted" : "Complete Verification"}
              </h2>
              <p className="text-zinc-400">
                {currentStep === 3
                  ? "Your key is valid for the next 24 hours."
                  : "Complete a quick verification to get your key and start using our scripts"}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-400">Progress</span>
                <span className="text-sm font-semibold" style={{ color: "#00ABFF" }}>
                  {progressPercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: "#00ABFF",
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center mb-8 font-bold text-sm">
                {error}
              </div>
            )}

            {/* Checkpoints Section */}
            {currentStep < 3 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                    Checkpoints ({currentStep - 1}/2)
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div
                    className={`bg-black/40 border rounded-xl p-5 flex items-center justify-between transition-colors ${
                      currentStep === 1 ? "border-[#00ABFF]/30" : "border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center"
                        style={{
                          background: currentStep === 1 ? "rgba(0,171,255,0.1)" : "rgba(255,255,255,0.05)",
                          borderColor: currentStep === 1 ? "rgba(0,171,255,0.2)" : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <span className={`font-bold ${currentStep === 1 ? "text-[#00ABFF]" : "text-zinc-500"}`}>1</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">First Step</h3>
                      </div>
                    </div>
                    {currentStep === 1 && (
                      <button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-[#00ABFF] hover:bg-[#0099EE] text-white rounded-lg font-semibold text-sm transition-all"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Start"}
                      </button>
                    )}
                    {currentStep > 1 && <Check className="text-green-500" size={20} />}
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`bg-black/40 border rounded-xl p-5 flex items-center justify-between transition-colors ${
                      currentStep === 2 ? "border-[#00ABFF]/30" : "border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center"
                        style={{
                          background: currentStep === 2 ? "rgba(0,171,255,0.1)" : "rgba(255,255,255,0.05)",
                          borderColor: currentStep === 2 ? "rgba(0,171,255,0.2)" : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <span className={`font-bold ${currentStep === 2 ? "text-[#00ABFF]" : "text-zinc-500"}`}>2</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">Last Step</h3>
                      </div>
                    </div>
                    {currentStep === 2 && (
                      <button
                        onClick={handleStep2}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-[#00ABFF] hover:bg-[#0099EE] text-white rounded-lg font-semibold text-sm transition-all"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Start"}
                      </button>
                    )}
                    {currentStep < 2 && <div className="w-10" />}
                  </div>
                </div>
              </div>
            ) : (
              /* Key Display Section */
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Your Key (1/1)</span>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Time Left</span>
                      <span className="font-mono font-bold text-zinc-200">{timeLeft}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Status</span>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-xs font-semibold text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-white/[0.08] rounded-xl p-6 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold">Access Key</h3>
                        <p className="text-xs text-zinc-500">Valid for 24 hours</p>
                      </div>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ABFF] hover:bg-[#0099EE] text-white rounded-lg font-semibold text-sm transition-all"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? "Copied" : "Copy Key"}
                    </button>
                  </div>
                  <div className="bg-black/40 border border-white/[0.08] rounded-lg p-4">
                    <code className="font-mono text-sm text-[#00ABFF] break-all">{generatedKey}</code>
                  </div>
                </div>

                <button
                  onClick={() => setLocation("/")}
                  className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-lg text-sm font-bold transition-all"
                >
                  Return Home
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
