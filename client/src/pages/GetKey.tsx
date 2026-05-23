/**
 * Design: Ultra Clean Minimal — Page Get Key
 * - Logo en haut
 * - Titre "Get Your Key"
 * - Description courte
 * - Input email
 * - Bouton "Get Key"
 * - Design épuré et minimaliste
 */

import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetKey = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    toast.loading("Processing...");

    setTimeout(() => {
      setIsLoading(false);
      setEmail("");
      toast.success("Key sent to your email!");
    }, 2000);
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center pt-20 pb-20 relative z-10">
        <div className="w-full max-w-md px-4">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-24 h-24 object-contain rounded-full"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-3 animate-fade-in-up-delay-1">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-white">Get Your </span>
              <span style={{ color: "#00ABFF" }}>Key</span>
            </h1>
          </div>

          {/* Description */}
          <p
            className="text-center text-base mb-10 animate-fade-in-up-delay-2"
            style={{ color: "oklch(0.55 0.015 264)" }}
          >
            Enter your email to receive your free key instantly
          </p>

          {/* Form */}
          <form onSubmit={handleGetKey} className="animate-fade-in-up-delay-3">
            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="key-input w-full h-12 px-4 text-base"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="verify-btn w-full text-base font-semibold"
            >
              {isLoading ? "Processing..." : "Get Key"}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="text-center mt-8 animate-fade-in-up-delay-4">
            <span style={{ color: "oklch(0.50 0.015 264)" }}>Already have a key? </span>
            <Link href="/redeem">
              <span style={{ color: "#00ABFF", cursor: "pointer", fontWeight: 600 }}>
                Redeem it here
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
