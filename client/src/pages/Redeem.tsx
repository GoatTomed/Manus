import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "../components/Navbar";
import { useKeyCounter } from "../hooks/useKeyCounter";
import axios from "axios";
import { ShoppingCart, Eye } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Redeem() {
  const [, setLocation] = useLocation();
  const { addKey, getCount } = useKeyCounter();
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/redeem", { key: key.trim() });
      if (response.data.success) {
        setSuccess(true);
        addKey(); // Add +1 to local counter
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or already used key");
    } finally {
      setIsLoading(false);
    }
  };

  const keyCount = getCount();

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
              <span className="text-xl font-bold text-[#00ABFF]">{keyCount}</span>
            </div>

            {/* Redeem GUI */}
            <div className="bg-[#0a0d14] border border-white/10 border-t-0 rounded-b-xl p-8 shadow-2xl space-y-6 animate-fade-in-up-delay-2">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Redeem <span className="text-[#00ABFF]">Key</span>
                </h1>
                <p className="text-gray-500 text-sm font-medium">Enter your key to add a credit</p>
              </div>

              {!success ? (
                <form onSubmit={handleRedeem} className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Place Your Key Here!"
                      value={key}
                      onChange={(e) => setKey(e.target.value.toUpperCase())}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ABFF]/50 transition-all font-mono text-sm"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#00ABFF] hover:bg-[#0099EE] disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(0,171,255,0.2)]"
                  >
                    {isLoading ? "Verifying..." : "Redeem Key"}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-green-500 font-bold text-sm">Key redeemed successfully!</p>
                    <p className="text-green-500/70 text-[10px] mt-1">+1 Credit added to your balance</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLocation("/scripts")}
                      className="bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded-lg font-bold text-xs transition-all"
                    >
                      Go to Scripts
                    </button>
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setKey("");
                        setLocation("/get-key");
                      }}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg font-bold text-xs transition-all"
                    >
                      Get Another Key
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons Section strictly UNDER the GUI */}
          <div className="text-center pt-4 space-y-4 animate-fade-in-up-delay-3">
            <p className="text-white font-semibold text-sm">
              Wanna spend your <span className="text-[#00ABFF] font-bold">{keyCount}</span> keys at the scripts shop?
            </p>
            
            {/* Shop and Preview Buttons */}
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => setLocation("/scripts")}
                className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded-lg font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,171,255,0.3)] flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Show Scripts
              </button>
              <button
                onClick={() => setLocation("/scripts")}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                Preview Scripts
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
