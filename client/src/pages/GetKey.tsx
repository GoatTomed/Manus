import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check,
  ChevronRight,
  ExternalLink,
  Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Complete, setStep1Complete] = useState(false);
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
      setStep1Complete(true);
    }
  }, [location]);

  const fetchResult = async (sessionId: string) => {
    try {
      const res = await axios.get(`/api/get-key/result/${sessionId}`);
      setGeneratedKey(res.data.key);
    } catch (err) {
      console.error("Error fetching key:", err);
      setError("Failed to retrieve your key. Please try again.");
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/get-key/start");
      window.location.href = res.data.earnPasteUrl;
    } catch (err: any) {
      console.error("Error starting step 1:", err);
      setError(err.response?.data?.error || "Failed to start verification. Check your connection.");
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
      console.error("Error starting step 2:", err);
      setError(err.response?.data?.error || "Failed to start final step.");
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-lg animate-fade-in">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6 relative">
              <div className="absolute inset-0 bg-[#00ABFF]/20 blur-2xl rounded-full"></div>
              <img 
                src={LOGO_URL} 
                alt="Logo" 
                className="w-24 h-24 object-contain relative z-10" 
              />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
              GET YOUR <span className="text-[#00ABFF]">KEY</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">Complete 2 quick steps to unlock premium access</p>
          </div>

          {/* Main Card */}
          <div className="bg-[#0a0d14]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00ABFF]/10 blur-3xl rounded-full"></div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                <ShieldCheck size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {currentStep === 1 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <Zap size={20} className="text-[#00ABFF] mx-auto mb-2" />
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Fast</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <ShieldCheck size={20} className="text-[#00ABFF] mx-auto mb-2" />
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Secure</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <Clock size={20} className="text-[#00ABFF] mx-auto mb-2" />
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Simple</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-[#00ABFF]/10 flex items-center justify-center text-[#00ABFF] font-bold">1</div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Step 1: Link Verification</h3>
                      <p className="text-xs text-gray-500">Quick human verification via EarnPaste</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 font-bold">2</div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Step 2: Final Generation</h3>
                      <p className="text-xs text-gray-500">Your key will be ready instantly</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleStart}
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden bg-[#00ABFF] hover:bg-[#0099EE] text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,171,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      START VERIFICATION <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            ) : currentStep === 2 ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Progress</span>
                  <span className="text-xs font-bold text-[#00ABFF]">50% Complete</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-1">
                  <div className="h-full bg-[#00ABFF] rounded-full w-1/2 shadow-[0_0_15px_rgba(0,171,255,0.5)]"></div>
                </div>

                <div className="p-6 bg-[#00ABFF]/5 border border-[#00ABFF]/30 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00ABFF] flex items-center justify-center text-white shadow-lg">
                    <Check size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Step 1 Completed</h3>
                    <p className="text-xs text-gray-400">Human verification successful</p>
                  </div>
                </div>

                <button 
                  onClick={handleStep2}
                  disabled={isLoading}
                  className="w-full group bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      GENERATE FINAL KEY <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-4 animate-scale-in">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">ACCESS GRANTED</h2>
                <p className="text-gray-400 text-sm mb-8">Your unique license key is ready to use</p>
                
                <div className="relative group mb-8">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00ABFF] to-[#0088FF] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group-hover:border-[#00ABFF]/50 transition-colors">
                    <code className="text-xl md:text-2xl font-mono text-white font-bold tracking-widest">
                      {generatedKey || "••••-••••-••••"}
                    </code>
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 bg-white/10 hover:bg-[#00ABFF] hover:text-white rounded-xl transition-all duration-300 text-[#00ABFF]"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setLocation("/redeem")}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                  GO TO REDEEM <ExternalLink size={18} />
                </button>
              </div>
            )}
          </div>
          
          <p className="text-center mt-8 text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            Powered by YouSuck Security
          </p>
        </div>
      </main>
    </div>
  );
}
