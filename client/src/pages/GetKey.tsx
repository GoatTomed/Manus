import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check, Search } from "lucide-react";
import { createEarnPasteLink } from "../hooks/useEarnPaste";
import Navbar from "../components/Navbar";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [location, setLocation] = useLocation();
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
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (step === "2" && session) {
      setCurrentStep(2);
      setSessionId(session);
    }
  }, [location]);

  const fetchResult = async (sid: string) => {
    try {
      const visitorId = localStorage.getItem("ys_visitor_id");
      const res = await axios.get(`/api/get-key/result/${sid}?visitorId=${visitorId}`);
      setGeneratedKey(res.data.key);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Verification expired or error occurred.";
      setError(msg);
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
              Complete Verification
            </h1>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Complete a quick verification to get your key and start using our scripts
            </p>

            {/* Progress Section */}
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

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center mb-6 font-bold text-sm">
                {error}
              </div>
            )}

            {/* Checkpoints Section */}
            <div className="space-y-3 mb-6">
              <div className="text-gray-400 font-semibold text-xs uppercase tracking-widest">
                CHECKPOINTS ({currentStep > 1 ? 1 : 0}/{currentStep === 3 ? 2 : 2})
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
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                        </>
                      ) : (
                        "Start"
                      )}
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
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                        </>
                      ) : (
                        "Start"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3 - Key Display */}
            {currentStep === 3 && (
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
