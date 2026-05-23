/**
 * Design: Cyberpunk Minimal Dark — Page Redeem Key
 * - Fond : noir profond (#0a0d14) avec grille de points CSS
 * - Lueur ambiante bleue en haut à gauche
 * - Carte centrale : glassmorphism sombre, bordure subtile
 * - Logo mascotte centré au-dessus du titre
 * - Titre : "Redeem" blanc bold + "Key" bleu électrique
 * - Input avec icône clé, placeholder "XXX-XXX-XXX"
 * - Bouton "Verify Key" bleu plein avec lueur
 */

import { useState } from "react";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Redeem() {
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      toast.error("Please enter a key", {
        description: "The key field cannot be empty.",
      });
      return;
    }
    setIsLoading(true);
    // Simulate verification
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    toast.error("Invalid key", {
      description: "The key you entered is not valid. Please try again.",
    });
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center pt-14 relative z-10">
        <div className="w-full max-w-md px-4">
          {/* Logo Standalone */}
          <div className="flex justify-center mb-6 animate-fade-in-up">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-20 h-20 object-contain rounded-full"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-2 animate-fade-in-up-delay-1">
            <h1
              className="text-4xl font-bold tracking-tight"
            >
              <span className="text-white">Redeem </span>
              <span style={{ color: "#00ABFF" }}>Key</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-center text-sm mb-8 animate-fade-in-up-delay-2"
            style={{ color: "oklch(0.60 0.015 264)" }}
          >
            Enter your key to get access to your script
          </p>

          {/* Card */}
          <div className="redeem-card p-5 animate-fade-in-up-delay-3">
            <form onSubmit={handleVerify} className="flex flex-col gap-3">
              {/* Key input */}
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

              {/* Verify button */}
              <button
                type="submit"
                disabled={isLoading}
                className="verify-btn w-full h-11 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
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
