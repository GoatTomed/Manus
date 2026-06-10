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
      const { sessionId, verificationHash } = res.data;

      const verifyUrl = `${window.location.origin}/api/v/${verificationHash}?session=${sessionId}`;
      const earnPasteUrl = await createEarnPasteLink(verifyUrl, 15);

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
      const verificationHash = res.data.verificationHash;

      const verifyUrl = `${window.location.origin}/api/v/${verificationHash}?session=${sessionId}`;
      const earnPasteUrl = await createEarnPasteLink(verifyUrl, 15);

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
        <div className="w-full max-w-3xl">
          {/* GET KEY Badge */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/50 rounded-full px-6 py-2">
              <Search size={18} className="text-blue-400" />
              <span className="font-bold text-blue-400 tracking-wider">GET KEY</span>
            </div>
          </div>

          {/* Main Container */}
          <div className="bg-[#0a0d14] border border-white/10 rounded-2xl p-12 shadow-2xl">
            {/* Title */}
            <h1 className="text-4xl font-bold text-center mb-4">
              Complete Verification
            </h1>
            <p className="text-gray-400 text-center mb-12 text-lg">
              Complete a quick verification to get your key and start using our scripts
            </p>

            {/* Progress Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 font-semibold">Progress</span>
                <span className="text-blue-400 font-bold text-lg">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center mb-8 font-bold">
                {error}
              </div>
            )}

            {/* Checkpoints */}
            <div className="space-y-4">
              {/* Step 1 - Always visible until completed */}
              {currentStep === 1 && (
                <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg border-2 border-blue-500 flex items-center justify-center bg-blue-500/10">
                        <span className="text-blue-400 font-bold text-lg">1</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">First Step</h3>
                      </div>
                    </div>
                    <button
                      onClick={handleStart}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                        </>
                      ) : (
                        "Start"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 - Only visible after step 1 is completed */}
              {currentStep >= 2 && (
                <div className={`border rounded-xl p-6 transition-all ${
                  currentStep === 2 ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-green-500/30 bg-green-500/5"
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                        currentStep === 2 
                          ? "border-blue-500 bg-blue-500/10" 
                          : "border-green-500 bg-green-500/10"
                      }`}>
                        {currentStep === 2 ? (
                          <span className="text-blue-400 font-bold text-lg">2</span>
                        ) : (
                          <Check className="text-green-400" size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Last Step</h3>
                      </div>
                    </div>
                    {currentStep === 2 && (
                      <button
                        onClick={handleStep2}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                          </>
                        ) : (
                          "Start"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 - Key Display */}
              {currentStep === 3 && (
                <div className="border border-green-500/30 rounded-xl p-6 bg-green-500/5">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-green-400 mb-2">Verification Complete!</h3>
                      <p className="text-gray-400">Your key is ready to use</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-lg p-6 flex items-center justify-between gap-4">
                      <code className="text-xl font-mono font-bold tracking-wider text-white flex-1 break-all">
                        {generatedKey || "••••-••••"}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="text-blue-400 p-3 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                        disabled={!generatedKey}
                      >
                        {copied ? <Check size={24} /> : <Copy size={24} />}
                      </button>
                    </div>
                    <p className="text-green-500/70 text-sm text-center">
                      {copied ? "✓ Copied to clipboard!" : "Click to copy your key"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Only show after key is generated */}
            {currentStep === 3 && (
              <div className="grid grid-cols-2 gap-4 mt-12">
                <button
                  onClick={() => setLocation("/")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all"
                >
                  Home
                </button>
                <button
                  onClick={() => setLocation("/redeem")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg font-bold transition-all"
                >
                  Redeem
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
