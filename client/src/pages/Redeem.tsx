import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useKeyCounter } from "../hooks/useKeyCounter";
import KeyCounter from "../components/KeyCounter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Redeem() {
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const { addKey } = useKeyCounter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      toast.error("Please enter a key", {
        description: "The key field cannot be empty.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("/api/redeem", { key });
      if (response.data.success) {
        addKey(1);
        setRedeemed(true);
        toast.success("Success!", {
          description: "Key redeemed successfully! You can now copy scripts.",
        });
        setKey("");
      }
    } catch (error: any) {
      toast.error("Invalid key", {
        description: error.response?.data?.error || "The key you entered is not valid or already used.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToScripts = () => {
    window.location.href = "/scripts";
  };

  const handleGetAnother = () => {
    window.location.href = "/get-key";
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center pt-14 relative z-10">
        <div className="w-full max-w-md px-4">
          <div className="flex justify-center mb-6 animate-fade-in-up">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-20 h-20 object-contain rounded-full"
            />
          </div>

          <div className="text-center mb-2 animate-fade-in-up-delay-1">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-white">Redeem </span>
              <span style={{ color: "#00ABFF" }}>Key</span>
            </h1>
          </div>

          <p
            className="text-center text-sm mb-8 animate-fade-in-up-delay-2"
            style={{ color: "oklch(0.60 0.015 264)" }}
          >
            Enter your key to get access to your scripts
          </p>

          <div className="redeem-card p-5 animate-fade-in-up-delay-3 space-y-6">
            <KeyCounter />

            {!redeemed ? (
              <form onSubmit={handleVerify} className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <KeyIcon />
                  </div>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Your Key Here"
                    className="key-input w-full h-11 pl-10 pr-4 text-sm"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="verify-btn w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon />
                      Verifying...
                    </>
                  ) : (
                    "Verify Key"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="text-green-500 text-sm font-bold uppercase tracking-widest">
                  ✓ Key Redeemed
                </div>
                <p className="text-gray-400 text-sm">
                  Your key has been added to your balance. You can now copy scripts!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleGoToScripts}
                    className="w-full bg-[#00ABFF] hover:bg-[#0099EE] text-white py-3 rounded font-bold text-sm flex items-center justify-center transition-all"
                  >
                    Go to Scripts
                  </button>
                  <button
                    onClick={handleGetAnother}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded font-bold text-sm flex items-center justify-center transition-all"
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

function KeyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="oklch(0.50 0.15 264)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
