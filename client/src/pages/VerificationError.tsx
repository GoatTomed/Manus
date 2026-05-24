import Navbar from "../components/Navbar";
import { AlertCircle, RotateCcw } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function VerificationError() {
  const handleRestart = () => {
    window.location.href = "/get-key";
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain" />
          </div>

          <div className="bg-[#0a0d14] border border-red-500/20 rounded-lg p-8 shadow-xl space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="text-red-500" size={32} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Link <span className="text-red-500">Expired</span>
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                This verification link has already been used or has expired. 
                For security reasons, each link can only be used once.
              </p>
            </div>

            <button
              onClick={handleRestart}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={16} />
              Start New Verification
            </button>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
              YouSuck Security System
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
