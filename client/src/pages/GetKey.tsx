import { useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Loader2, Copy, Check } from "lucide-react";
import KeyCounter from "../components/KeyCounter";
import Navbar from "../components/Navbar";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [keyGenerated, setKeyGenerated] = useState(false);

  const handleGenerateKey = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/generate-key");
      setGeneratedKey(res.data.key);
      setKeyGenerated(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Error generating key.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetAnother = () => {
    setGeneratedKey("");
    setKeyGenerated(false);
    setError("");
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex justify-center animate-fade-in-up">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain" />
          </div>

          {/* Main Container: Key Counter + GUI */}
          <div className="space-y-0 animate-fade-in-up-delay-1">
            {/* Key Counter - Attached to top of GUI */}
            <div className="bg-white/5 border border-white/10 rounded-t-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ABFF]"></div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Keys</span>
              </div>
              <KeyCounter />
            </div>

            {/* Get Key GUI */}
            <div className="bg-[#0a0d14] border border-white/10 border-t-0 rounded-b-xl p-8 space-y-6 animate-fade-in-up-delay-2">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Get Your <span className="text-[#00ABFF]">Key</span>
                </h1>
                <p className="text-gray-500 text-sm font-medium">Generate a new key instantly</p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              {!keyGenerated ? (
                <button
                  onClick={handleGenerateKey}
                  disabled={isLoading}
                  className="w-full bg-[#00ABFF] hover:bg-[#0099EE] disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Generating...
                    </>
                  ) : (
                    "Generate Key"
                  )}
                </button>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-500 font-bold text-sm text-center mb-3">Key Generated!</p>
                    <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                      <code className="text-sm font-mono font-bold tracking-wider text-white">
                        {generatedKey}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="text-[#00ABFF] p-2 hover:bg-white/5 rounded transition-all"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <p className="text-green-500/70 text-[10px] mt-3 text-center">
                      {copied ? "Copied to clipboard!" : "Click to copy your key"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLocation("/")}
                      className="bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded-lg font-bold text-xs transition-all"
                    >
                      Go Home
                    </button>
                    <button
                      onClick={handleGetAnother}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg font-bold text-xs transition-all"
                    >
                      Get Another
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
