import { useState, useEffect } from "react";
import { useKeyCounter } from "../hooks/useKeyCounter";
import { toast } from "sonner";
import { Copy, AlertCircle, ShoppingCart, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { useLocation } from "wouter";
import axios from "axios";

interface Script {
  id: string;
  name: string;
  image: string;
  description?: string;
  loadstring: string;
}

const SCRIPTS: Script[] = [
  {
    id: "push-rock-for-brainrots",
    name: "Push Rock for Brainrots",
    image: "https://tr.rbxcdn.com/180DAY-545885b2289cb5fae86a063c7238b743/768/432/Image/Webp/noFilter",
    description: "The ultimate script for Push Rock for Brainrots",
    loadstring: 'loadstring(game:HttpGet("https://yoursuck.vercel.app/PushRockforBrainrots.lua", true))()',
  },
  {
    id: "bite-by-night",
    name: "Bite By Night",
    image: "https://i.imgur.com/LLI5B2E.png",
    description: "Dominating Bite By Night with this powerful script",
    loadstring: 'loadstring(game:HttpGet("https://yoursuck.vercel.app/BiteByNight.lua", true))()',
  },
  {
    id: "violence-district",
    name: "Violence District",
    image: "https://i.imgur.com/1hwYNcw.png",
    description: "Full control over Violence District",
    loadstring: 'loadstring(game:HttpGet("https://yoursuck.vercel.app/ViolenceDistrict.lua", true))()',
  },
];

export default function Scripts() {
  const { getCount, consumeKey } = useKeyCounter();
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Show notification if user has 0 keys
    if (getCount() === 0) {
      const timer = setTimeout(() => setShowNotification(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [getCount()]);

  const handleCopyClick = (script: Script) => {
    setSelectedScript(script);
    setShowConfirm(true);
  };

  const handleConfirmCopy = () => {
    if (!selectedScript) return;

    const keyCount = getCount();
    if (keyCount <= 0) {
      toast.error("No keys available", {
        description: "You need to redeem a key first to copy scripts.",
      });
      setShowConfirm(false);
      return;
    }

    if (consumeKey()) {
      // Get visitor ID from local storage or cookie
      const visitorId = localStorage.getItem("ys_visitor_id");
      
      // Notify API that a script was redeemed
      axios.post("/api/redeem", {
        key: "CONSUMED_LOCAL", // Placeholder for local consumption tracking
        visitorId,
        scriptId: selectedScript.id
      }).catch(() => {}); // Silent catch

      navigator.clipboard.writeText(selectedScript.loadstring);
      toast.success("Script copied!", {
        description: `${selectedScript.name} has been copied to your clipboard. Keys remaining: ${getCount()}`,
      });
      setShowConfirm(false);
      setSelectedScript(null);
    }
  };

  const keyCount = getCount();

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      {/* No Keys Notification Overlay */}
      <div className={`fixed top-0 left-0 right-0 z-[60] p-4 transition-all duration-700 ease-out transform ${
        showNotification ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}>
        <div className="max-w-xl mx-auto bg-[#0a0d14] border border-amber-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.1)] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <ShoppingCart className="text-amber-500" size={24} />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-0.5">Empty Balance</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              You currently have <span className="text-amber-500 font-bold">0 keys</span>. You need at least one key to unlock these scripts.
            </p>
          </div>

          <button 
            onClick={() => setLocation("/redeem")}
            className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all shrink-0 shadow-lg shadow-amber-500/20"
          >
            Get a Key
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <main className="flex-1 p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Choose your <span className="text-[#00ABFF]">script</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Pick a game and copy its script — one use per verification
            </p>
          </div>

          {/* Key Counter */}
          <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00ABFF]"></div>
              <span className="text-sm font-semibold">Available Keys</span>
            </div>
            <span className="text-2xl font-bold text-[#00ABFF]">{keyCount}</span>
          </div>

          {/* Blue text under the GUI */}
          <div className="mb-8 text-center">
            <p className="text-[#00ABFF] font-semibold text-sm">
              Wanna spend your <span className="font-bold">{keyCount}</span> keys at the scripts shop?
            </p>
          </div>

          {/* Scripts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCRIPTS.map((script) => (
              <div
                key={script.id}
                className="bg-[#0a0d14] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Image */}
                <div className="relative w-full aspect-video overflow-hidden bg-black">
                  <img
                    src={script.image}
                    alt={script.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="text-lg font-bold tracking-tight">{script.name}</h3>
                  {script.description && (
                    <p className="text-gray-500 text-xs">{script.description}</p>
                  )}

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyClick(script)}
                    className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-2.5 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Copy size={16} />
                    Copy Script
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Confirmation Overlay */}
      {showConfirm && selectedScript && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0d14] border border-white/10 rounded-lg p-8 max-w-md w-full space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00ABFF]/10 flex items-center justify-center">
                <AlertCircle className="text-[#00ABFF]" size={20} />
              </div>
              <h2 className="text-xl font-bold">Confirm Copy</h2>
            </div>

            {/* Key Counter */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Keys Available</span>
                <span className="text-2xl font-bold text-[#00ABFF]">{keyCount}</span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <p className="text-white font-semibold">
                Copy <span className="text-[#00ABFF]">{selectedScript.name}</span>?
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                This will use <strong>1 key</strong> from your balance. Each script requires a different key. Make sure you want to copy this script before confirming.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedScript(null);
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCopy}
                className="flex-1 bg-[#00ABFF] hover:bg-[#0099EE] text-white py-2.5 rounded font-bold transition-all"
              >
                Copy Script
              </button>
            </div>

            {/* Info */}
            <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest">
              Need more keys? Go to Get Key to generate more.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
