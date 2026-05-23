/**
 * Design: Modern Clean — Page Get Key
 * - Titre "Get Your Key"
 * - Deux cartes d'étapes côte à côte
 * - Chaque carte avec icône, titre, description
 * - Bouton "Start Verification" au centre
 * - Design épuré et moderne
 */

import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleStartVerification = () => {
    setIsVerifying(true);
    toast.loading("Starting verification...");
    
    setTimeout(() => {
      setIsVerifying(false);
      setCompleted(true);
      toast.success("Verification completed! Your key is ready.");
    }, 3000);
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center pt-20 pb-20 relative z-10">
        <div className="w-full max-w-4xl px-4">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-20 h-20 object-contain rounded-full"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-4 animate-fade-in-up-delay-1">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-white">Get Your </span>
              <span style={{ color: "#00ABFF" }}>Key</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-center text-base mb-16 animate-fade-in-up-delay-2"
            style={{ color: "oklch(0.55 0.015 264)" }}
          >
            Complete a quick verification to unlock your free key
          </p>

          {/* Steps Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-in-up-delay-3">
            {/* Step 1 Card */}
            <div
              className="p-8 rounded-lg border transition-all duration-300"
              style={{
                background: "oklch(0.12 0.012 264 / 0.6)",
                borderColor: completed ? "#00ABFF" : "oklch(0.20 0.01 264)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg"
                  style={{
                    background: completed ? "#00ABFF" : "oklch(0.18 0.015 264)",
                    color: completed ? "white" : "#00ABFF",
                  }}
                >
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Email Verification</h3>
                  <p style={{ color: "oklch(0.50 0.015 264)" }} className="text-sm">
                    Verify your email address to get started
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 Card */}
            <div
              className="p-8 rounded-lg border transition-all duration-300"
              style={{
                background: "oklch(0.12 0.012 264 / 0.6)",
                borderColor: completed ? "#00ABFF" : "oklch(0.20 0.01 264)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg"
                  style={{
                    background: completed ? "#00ABFF" : "oklch(0.18 0.015 264)",
                    color: completed ? "white" : "#00ABFF",
                  }}
                >
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Account Setup</h3>
                  <p style={{ color: "oklch(0.50 0.015 264)" }} className="text-sm">
                    Create your account and receive your key
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main CTA Button */}
          {!completed ? (
            <div className="flex justify-center mb-12 animate-fade-in-up-delay-4">
              <button
                onClick={handleStartVerification}
                disabled={isVerifying}
                className="verify-btn px-12 py-3 text-base font-semibold"
              >
                {isVerifying ? "Verifying..." : "Start Verification"}
              </button>
            </div>
          ) : (
            <div className="flex justify-center mb-12 animate-fade-in-up-delay-4">
              <div
                className="p-6 rounded-lg border text-center"
                style={{
                  background: "oklch(0.12 0.012 264 / 0.8)",
                  borderColor: "#00ABFF",
                }}
              >
                <p className="text-white font-semibold mb-2">✓ Verification Complete!</p>
                <p style={{ color: "oklch(0.55 0.015 264)" }} className="text-sm mb-4">
                  Your key has been generated and sent to your email
                </p>
                <code
                  className="block p-3 rounded text-sm font-mono"
                  style={{
                    background: "oklch(0.08 0.01 264)",
                    color: "#00ABFF",
                  }}
                >
                  YOUSUCK-XXXX-XXXX-XXXX
                </code>
              </div>
            </div>
          )}

          {/* Bottom Link */}
          <div className="text-center animate-fade-in-up-delay-4">
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
