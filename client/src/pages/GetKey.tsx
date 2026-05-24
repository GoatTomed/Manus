/**
 * Design: Cyberpunk Minimal Dark — Page Get Key
 * Améliorations UI :
 * - Appel EarnPaste côté client (élimine les timeouts Vercel)
 * - Indicateur de chargement avec message contextuel
 * - Barre de progression animée pendant le chargement
 * - Messages d'erreur plus clairs avec bouton "Retry"
 * - Stepper visuel (Step 1 / Step 2)
 * - Animation de succès sur la clé générée
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check, ExternalLink, RefreshCw, ShieldCheck, Key } from "lucide-react";
import { createEarnPasteLink } from "../hooks/useEarnPaste";
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
  const [loadingMsg, setLoadingMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const step = params.get("step");
    const completed = params.get("completed");
    const session = params.get("session");

    if (completed === "true" && session) {
      setCurrentStep(3);
      fetchResult(session);
    } else if (step === "2") {
      setCurrentStep(2);
    }
  }, [location]);

  const fetchResult = async (sessionId: string) => {
    try {
      const res = await axios.get(`/api/get-key/result/${sessionId}`);
      setGeneratedKey(res.data.key);
    } catch {
      setError("Failed to retrieve your key. Please refresh the page.");
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError("");
    setLoadingMsg("Connecting to verification service...");
    const msgTimer = setTimeout(() => setLoadingMsg("Almost there, generating your link..."), 3000);
    try {
      const res = await axios.post("/api/get-key/start");
      const earnPasteUrl = await createEarnPasteLink(
        `${window.location.origin}/api/get-key/verify-step1?token=${res.data.sessionId.split("-")[0]}&session=${res.data.sessionId}`
      );
      clearTimeout(msgTimer);
      window.location.href = earnPasteUrl;
    } catch (err: any) {
      clearTimeout(msgTimer);
      const msg = err.response?.data?.error || err.message || "Error starting process. Please try again.";
      setError(msg);
      setIsLoading(false);
      setLoadingMsg("");
    }
  };

  const handleStep2 = async () => {
    setIsLoading(true);
    setError("");
    setLoadingMsg("Generating your final verification link...");
    const msgTimer = setTimeout(() => setLoadingMsg("Almost there, hold on..."), 3000);
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session");
    try {
      const res = await axios.post("/api/get-key/step2", { sessionId });
      const earnPasteUrl = await createEarnPasteLink(
        `${window.location.origin}/api/get-key/verify-step2?token=${res.data.sessionId || sessionId}&session=${sessionId}`
      );
      clearTimeout(msgTimer);
      window.location.href = earnPasteUrl;
    } catch (err: any) {
      clearTimeout(msgTimer);
      const msg = err.response?.data?.error || err.message || "Error starting final step. Please try again.";
      setError(msg);
      setIsLoading(false);
      setLoadingMsg("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain" />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Get Your <span style={{ color: "#00ABFF" }}>Key</span>
            </h1>
            <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-semibold">
              2-Step Verification
            </p>
          </div>

          {/* Step indicator */}
          {currentStep < 3 && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <StepDot active={currentStep >= 1} done={currentStep > 1} label="1" />
              <div
                className="h-px flex-1 max-w-[60px] transition-all duration-500"
                style={{
                  background: currentStep > 1 ? "#00ABFF" : "rgba(255,255,255,0.1)",
                }}
              />
              <StepDot active={currentStep >= 2} done={currentStep > 2} label="2" />
            </div>
          )}

          {/* Card */}
          <div className="bg-[#0a0d14] border border-white/10 rounded-xl p-8 shadow-2xl">
            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center flex flex-col gap-2">
                <span>{error}</span>
                <button
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-300 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1"
                >
                  <RefreshCw size={10} /> Dismiss
                </button>
              </div>
            )}

            {currentStep === 1 ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-lg">
                  <ShieldCheck size={18} className="text-[#00ABFF] shrink-0" />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Complete <strong className="text-white">2 quick verifications</strong> to receive your unique key.
                  </p>
                </div>
                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,171,255,0.2)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="text-sm">{loadingMsg || "Loading..."}</span>
                    </>
                  ) : (
                    "Start Verification — Step 1"
                  )}
                </button>
                {isLoading && (
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00ABFF] animate-progress-bar" />
                  </div>
                )}
              </div>
            ) : currentStep === 2 ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-600">Progress</span>
                  <span style={{ color: "#00ABFF" }}>Step 2 of 2</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: "50%", background: "#00ABFF" }}
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-lg">
                  <Key size={16} className="text-[#00ABFF] shrink-0" />
                  <p className="text-gray-400 text-sm">
                    Step 1 complete! One more verification to generate your key.
                  </p>
                </div>
                <button
                  onClick={handleStep2}
                  disabled={isLoading}
                  className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,171,255,0.2)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="text-sm">{loadingMsg || "Loading..."}</span>
                    </>
                  ) : (
                    "Generate Final Key — Step 2"
                  )}
                </button>
                {isLoading && (
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00ABFF] animate-progress-bar" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5 text-center">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Check size={20} className="text-green-400" />
                  </div>
                  <span className="text-green-400 text-xs font-bold uppercase tracking-widest">
                    Key Generated
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between gap-3">
                  <code className="text-base font-mono font-bold tracking-wider text-white flex-1 text-left truncate">
                    {generatedKey || "Loading..."}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="text-[#00ABFF] p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                    title="Copy key"
                  >
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-400 text-xs font-semibold">Copied to clipboard!</p>
                )}
                <button
                  onClick={() => (window.location.href = "/redeem")}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  Go to Redeem <ExternalLink size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300"
      style={{
        background: done ? "#00ABFF" : active ? "rgba(0,171,255,0.15)" : "rgba(255,255,255,0.04)",
        borderColor: active || done ? "#00ABFF" : "rgba(255,255,255,0.1)",
        color: active || done ? "#fff" : "rgba(255,255,255,0.3)",
      }}
    >
      {done ? <Check size={12} /> : label}
    </div>
  );
}
