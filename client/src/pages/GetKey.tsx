import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check, ChevronRight, ExternalLink } from "lucide-react";
import Navbar from "../components/Navbar";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError("Failed to retrieve your key.");
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/get-key/start");
      window.location.href = res.data.earnPasteUrl;
    } catch (err: any) {
      setError(err.response?.data?.error || "Error starting process.");
      setIsLoading(false);
    }
  };

  const handleStep2 = async () => {
    setIsLoading(true);
    setError("");
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session");
    try {
      const res = await axios.post("/api/get-key/step2", { sessionId });
      window.location.href = res.data.earnPasteUrl;
    } catch (err: any) {
      setError(err.response?.data?.error || "Error starting final step.");
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
      
      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md">
          
          {/* Logo - Simple, no circle */}
          <div className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain" />
          </div>

          {/* Simple Rectangle Form */}
          <div className="bg-[#0a0d14] border border-white/10 rounded-lg p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-6 text-center tracking-tight">
              Get Your <span className="text-[#00ABFF]">Key</span>
            </h1>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            {currentStep === 1 ? (
              <div className="space-y-6">
                <p className="text-gray-400 text-sm text-center">Complete verification to receive your unique key.</p>
                <button 
                  onClick={handleStart}
                  disabled={isLoading}
                  className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Start Verification"}
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
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Generate Final Key"}
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
                  onClick={() => window.location.href = "/redeem"}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded font-bold text-sm flex items-center justify-center gap-2"
                >
                  Go to Redeem <ExternalLink size={16} />
                </button>
              </div>
            )}
          </div>
          
          <p className="text-center mt-8 text-gray-700 text-[10px] font-bold uppercase tracking-[0.2em]">
            YouSuck Security
          </p>
        </div>
      </main>
    </div>
  );
}
