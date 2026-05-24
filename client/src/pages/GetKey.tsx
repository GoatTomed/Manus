/**
 * Design: Ultra Premium Interactive — Page Get Key
 * Integrated with EarnPaste automation and Supabase
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { CheckCircle2, Zap, Lock, Gift, ArrowRight, Copy, Check } from "lucide-react";
import axios from "axios";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [location, setLocation] = useLocation();
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");
    const step = params.get("step");
    const completed = params.get("completed");

    if (session) {
      setSessionId(session);
      setStarted(true);
      
      if (completed === "true") {
        setStep1Complete(true);
        setStep2Complete(true);
        setCurrentStep(3);
        fetchFinalKey(session);
      } else if (step === "2") {
        setStep1Complete(true);
        setCurrentStep(2);
      }
    }
  }, []);

  const fetchFinalKey = async (id: string) => {
    try {
      const response = await axios.get(`/api/get-key/result/${id}`);
      setGeneratedKey(response.data.key);
    } catch (error) {
      toast.error("Failed to fetch your key. Please try again.");
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/get-key/start");
      setSessionId(response.data.sessionId);
      window.location.href = response.data.earnPasteUrl;
    } catch (error) {
      toast.error("Failed to start the process. Please check your connection.");
      setIsLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const response = await axios.post("/api/get-key/step2", { sessionId });
      window.location.href = response.data.earnPasteUrl;
    } catch (error) {
      toast.error("Failed to generate Step 2 link.");
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      toast.success("Key copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col relative overflow-hidden">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up { animation: slideInUp 0.6s ease-out; }
        .benefit-card { transition: all 0.3s ease; }
        .benefit-card:hover { transform: translateY(-4px); border-color: #00ABFF !important; }
      `}</style>

      <main className="flex-1 flex items-center justify-center relative z-10 py-20">
        <div className="w-full max-w-2xl px-4">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-slide-in-up">
            <img src={LOGO_URL} alt="Logo" className="w-24 h-24 object-contain rounded-full shadow-[0_0_30px_rgba(0,171,255,0.4)]" />
          </div>

          {/* Title */}
          <div className="text-center mb-8 animate-slide-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Get Your <span className="text-[#00ABFF]">Key</span>
            </h1>
            <p className="text-gray-400 mt-2">Complete 2 steps to unlock premium access</p>
          </div>

          {/* Main Content Card */}
          <div className="bg-[#0a0d14]/80 backdrop-blur-md border border-[#00ABFF]/30 rounded-2xl p-8 md:p-12 shadow-2xl">
            {!started ? (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <Zap size={48} className="text-[#00ABFF] animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-4">Ready to start?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="benefit-card p-4 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 size={20} className="text-[#00ABFF] mx-auto mb-2" />
                    <p className="text-xs text-white">Instant</p>
                  </div>
                  <div className="benefit-card p-4 rounded-xl bg-white/5 border border-white/10">
                    <Gift size={20} className="text-[#00ABFF] mx-auto mb-2" />
                    <p className="text-xs text-white">Free</p>
                  </div>
                  <div className="benefit-card p-4 rounded-xl bg-white/5 border border-white/10">
                    <Lock size={20} className="text-[#00ABFF] mx-auto mb-2" />
                    <p className="text-xs text-white">Secure</p>
                  </div>
                </div>
                <button 
                  onClick={handleStart}
                  disabled={isLoading}
                  className="verify-btn w-full py-4 rounded-xl text-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? "Starting..." : "Start Step 1"} <ArrowRight size={20} />
                </button>
              </div>
            ) : currentStep === 3 ? (
              <div className="text-center animate-slide-in-up">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                <p className="text-gray-400 mb-8">Your unique key has been generated.</p>
                
                <div className="relative group mb-8">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00ABFF] to-[#0088FF] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative bg-[#0a0d14] border border-[#00ABFF]/50 rounded-xl p-6 flex items-center justify-between">
                    <code className="text-xl md:text-2xl font-mono text-white tracking-wider">
                      {generatedKey || "Loading..."}
                    </code>
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#00ABFF]"
                    >
                      {copied ? <Check size={24} /> : <Copy size={24} />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500">Keep this key safe. You can use it on the Redeem page.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-[#00ABFF] font-bold">{step1Complete ? "50%" : "0%"}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00ABFF] transition-all duration-1000 shadow-[0_0_10px_rgba(0,171,255,0.5)]"
                      style={{ width: step1Complete ? "50%" : "0%" }}
                    />
                  </div>
                </div>

                {/* Step 1 Status */}
                <div className={`p-6 rounded-xl border ${step1Complete ? 'bg-[#00ABFF]/10 border-[#00ABFF]' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step1Complete ? 'bg-[#00ABFF] text-white' : 'bg-white/10 text-[#00ABFF]'}`}>
                      {step1Complete ? <CheckCircle2 size={20} /> : "1"}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Step 1: Verification</h3>
                      <p className="text-xs text-gray-500">{step1Complete ? "Completed" : "Pending verification"}</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 Status/Action */}
                <div className={`p-6 rounded-xl border ${currentStep === 2 ? 'bg-[#00ABFF]/5 border-[#00ABFF]/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-[#00ABFF]">
                      2
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Step 2: Final Step</h3>
                      <p className="text-xs text-gray-500">Complete this to get your key</p>
                    </div>
                  </div>
                  
                  {currentStep === 2 && (
                    <button 
                      onClick={handleStep2}
                      disabled={isLoading}
                      className="verify-btn w-full py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      {isLoading ? "Loading..." : "Start Final Step"} <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
