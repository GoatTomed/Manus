import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "../components/Navbar";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

const KEY_VALUE = "YourFat";

export default function Key() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(KEY_VALUE);
    setCopied(true);
    toast.success("Key copied to clipboard!", {
      description: `${KEY_VALUE} has been copied successfully.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain" />
          </div>

          {/* Main GUI Container */}
          <div className="bg-[#0a0d14] border border-white/10 rounded-2xl p-8 shadow-xl space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Your <span className="text-[#00ABFF]">Key</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium">Copy your key to use it anywhere</p>
            </div>

            {/* Key Display Box */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Key :
              </label>
              <div className="relative bg-black/40 border border-white/10 rounded-xl p-6 flex items-center justify-between group hover:border-white/20 transition-all">
                {/* Key Text */}
                <code className="text-2xl font-bold font-mono tracking-wider text-[#00ABFF]">
                  {KEY_VALUE}
                </code>

                {/* Copy Button */}
                <button
                  onClick={handleCopyKey}
                  className="ml-4 p-3 rounded-lg bg-[#00ABFF] hover:bg-[#0099EE] text-white transition-all flex items-center justify-center shrink-0 shadow-lg shadow-[#00ABFF]/20"
                  title="Copy key to clipboard"
                >
                  {copied ? (
                    <Check size={20} className="text-white" />
                  ) : (
                    <Copy size={20} className="text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Info Text */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 leading-relaxed">
                This key is unique to your session. Keep it safe and secure.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setLocation("/")}
                className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#00ABFF]/20"
              >
                Back to Home
              </button>
              <button
                onClick={() => setLocation("/redeem")}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold text-sm transition-all"
              >
                Redeem Key
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
