import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "../components/Navbar";
import KeyCounter from "../components/KeyCounter";
import { useKeyCounter } from "../hooks/useKeyCounter";
import axios from "axios";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Redeem() {
  const [, setLocation] = useLocation();
  const { addKey } = useKeyCounter();
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

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md space-y-8">
          {/* Key Counter Display */}
          <div className="flex justify-center animate-fade-in-up">
            <KeyCounter />
          </div>

          {/* Logo */}
          <div className="flex justify-center animate-fade-in-up-delay-1">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain" />
          </div>

          <div className="bg-[#0a0d14] border border-white/10 rounded-xl p-8 shadow-2xl space-y-6 animate-fade-in-up-delay-2">
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
                    placeholder="YS-XXXX-XXXX"
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
      </main>
    </div>
  );
}
