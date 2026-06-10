import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check } from "lucide-react";
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

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img src={LOGO_URL} alt="Logo" className="w-32 h-32 object-contain" />
          </div>

          {/* Main GUI Container - Larger and Taller */}
          <div className="bg-[#0a0d14] border border-white/10 rounded-2xl p-12 shadow-2xl min-h-[600px] flex flex-col justify-between">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold tracking-tight mb-4">
                Get Your <span className="text-[#00ABFF]">Key</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium">
                Complete verification to generate your key
              </p>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-center">
              {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center mb-8 font-bold text-lg">
                  {error}
                </div>
              )}

              {currentStep === 1 ? (
                <div className="space-y-8">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                      You can generate <span className="text-[#00ABFF] font-bold text-xl">one key every 24 hours</span>
                    </p>
                    <p className="text-gray-500 text-base">
                      Click below to start the verification process
                    </p>
                  </div>
                  <button
                    onClick={handleStart}
                    disabled={isLoading}
                    className="w-full bg-[#00ABFF] hover:bg-[#0099EE] disabled:opacity-50 text-white py-6 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={28} />
                        Starting...
                      </>
                    ) : (
                      "Start Verification"
                    )}
                  </button>
                </div>
              ) : currentStep === 2 ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-block bg-white/5 border border-white/10 rounded-full px-8 py-3 mb-6">
                      <p className="text-gray-300 font-bold text-lg">1 of 2 Steps Completed</p>
                    </div>
                    <p className="text-gray-400 text-lg">
                      Complete the final step to generate your key
                    </p>
                  </div>
                  <button
                    onClick={handleStep2}
                    disabled={isLoading}
                    className="w-full bg-[#00ABFF] hover:bg-[#0099EE] disabled:opacity-50 text-white py-6 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={28} />
                        Continuing...
                      </>
                    ) : (
                      "Complete Final Step"
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="inline-block bg-green-500/10 border border-green-500/20 rounded-full px-8 py-3 mb-6">
                      <p className="text-green-500 font-bold text-lg">2 of 2 Steps Completed</p>
                    </div>
                    <p className="text-gray-300 text-lg font-semibold">
                      Your key is ready!
                    </p>
                  </div>

                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-8">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <code className="text-2xl font-mono font-bold tracking-wider text-white flex-1 break-all">
                        {generatedKey || "••••-••••"}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="text-[#00ABFF] p-3 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                        disabled={!generatedKey}
                      >
                        {copied ? <Check size={28} /> : <Copy size={28} />}
                      </button>
                    </div>
                    <p className="text-green-500/70 text-sm text-center">
                      {copied ? "✓ Copied to clipboard!" : "Click the icon to copy your key"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setLocation("/")}
                      className="bg-[#00ABFF] hover:bg-[#0099EE] text-white py-4 rounded-xl font-bold text-lg transition-all"
                    >
                      Home
                    </button>
                    <button
                      onClick={() => setLocation("/redeem")}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold text-lg transition-all"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
