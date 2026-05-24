import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check } from "lucide-react";
import { createEarnPasteLink } from "../hooks/useEarnPaste";
import KeyCounter from "../components/KeyCounter";
import Navbar from "../components/Navbar";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const step = params.get("step");
    const completed = params.get("completed");
    const session = params.get("session");

    if (completed === "true" && session) {
      setCurrentStep(3);
      setSessionId(session);
      fetchResult(session);
      // Clean up the URL parameters immediately so the key disappears on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (step === "2" && session) {
      setCurrentStep(2);
      setSessionId(session);
    }
  }, [location]);

  const fetchResult = async (sid: string) => {
    try {
      const res = await axios.get(`/api/get-key/result/${sid}`);
      setGeneratedKey(res.data.key);
    } catch {
      // If refresh happened, we might lose the session, but that's what we want (key disappearance)
      setError("Verification expired or page refreshed. Please start again.");
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/get-key/start");
      const newSessionId = res.data.sessionId;
      const verificationHash = res.data.verificationHash;

      const verifyUrl = `${window.location.origin}/api/v/${verificationHash}`;
      const earnPasteUrl = await createEarnPasteLink(verifyUrl, 15);

      window.location.href = earnPasteUrl;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Error starting process.";
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
      const verificationHash = res.data.verificationHash;

      const verifyUrl = `${window.location.origin}/api/v/${verificationHash}`;
      const earnPasteUrl = await createEarnPasteLink(verifyUrl, 15);

      window.location.href = earnPasteUrl;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Error starting final step.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeemKey = () => {
    // Clear state before redirecting to ensure the key disappears
    setGeneratedKey("");
    setSessionId(null);
    setCurrentStep(1);
    window.location.href = "/redeem";
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain" />
          </div>

          <div className="bg-[#0a0d14] border border-white/10 rounded-lg p-8 shadow-xl space-y-6">
            <KeyCounter />

            <h1 className="text-2xl font-bold text-center tracking-tight">
              Get Your <span className="text-[#00ABFF]">Key</span>
            </h1>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            {currentStep === 1 ? (
              <div className="space-y-6">
                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Get Key"}
                </button>
              </div>
            ) : currentStep === 2 ? (
              <div className="space-y-6">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>Progress</span>
                  <span className="text-[#00ABFF]">Step 2 of 2</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00ABFF] w-1/2"></div>
                </div>
                <button
                  onClick={handleStep2}
                  disabled={isLoading}
                  className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Continue"}
                </button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="text-green-500 text-sm font-bold uppercase tracking-widest mb-2">Key Ready</div>
                <div className="bg-white/5 border border-white/10 rounded p-4 flex items-center justify-between">
                  <code className="text-lg font-mono font-bold tracking-wider">
                    {generatedKey || "••••-••••"}
                  </code>
                  <button onClick={copyToClipboard} className="text-[#00ABFF] p-2 hover:bg-white/5 rounded">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <button
                  onClick={handleRedeemKey}
                  className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded font-bold text-sm flex items-center justify-center transition-all"
                >
                  Redeem Key
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
