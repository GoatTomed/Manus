/**
 * Design: Cyberpunk Minimal Dark — Page Get Key
 * - Titre "Get Your Key" avec "Key" en bleu
 * - Sous-titre avec description
 * - Carte avec 2 étapes de vérification (cercles numérotés)
 * - Barre de progression
 * - Bouton "Start Verification" bleu plein
 * - Lien "Redeem it here" en bas
 */

import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleStartVerification = () => {
    setIsStarted(true);
    setCurrentStep(1);
    setProgress(50);
    // Simulate step 2
    setTimeout(() => {
      setCurrentStep(2);
      setProgress(100);
    }, 2000);
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center pt-14 relative z-10">
        <div className="w-full max-w-2xl px-4">
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
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-white">Get Your </span>
              <span style={{ color: "#00ABFF" }}>Key</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-center text-sm mb-8 animate-fade-in-up-delay-2"
            style={{ color: "oklch(0.60 0.015 264)" }}
          >
            Complete 2 quick checkpoints to receive your free key.
          </p>

          {/* Card */}
          <div className="redeem-card p-8 animate-fade-in-up-delay-3 mb-6">
            {/* Verification Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  style={{ color: "#00ABFF" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold" style={{ color: "#00ABFF" }}>
                  Verification
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: "oklch(0.50 0.015 264)" }}>
                {currentStep} / 2
              </span>
            </div>

            {/* Steps */}
            <div className="flex justify-center gap-16 mb-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300"
                  style={{
                    background: currentStep >= 1 ? "#00ABFF" : "oklch(0.16 0.012 264)",
                    color: currentStep >= 1 ? "white" : "oklch(0.45 0.01 264)",
                    border: currentStep >= 1 ? "none" : "2px solid oklch(0.25 0.01 264)",
                  }}
                >
                  1
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: currentStep >= 1 ? "#00ABFF" : "oklch(0.45 0.01 264)" }}
                >
                  Step 1
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300"
                  style={{
                    background: currentStep >= 2 ? "#00ABFF" : "oklch(0.16 0.012 264)",
                    color: currentStep >= 2 ? "white" : "oklch(0.45 0.01 264)",
                    border: currentStep >= 2 ? "none" : "2px solid oklch(0.25 0.01 264)",
                  }}
                >
                  2
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: currentStep >= 2 ? "#00ABFF" : "oklch(0.45 0.01 264)" }}
                >
                  Step 2
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium" style={{ color: "oklch(0.50 0.015 264)" }}>
                  Progress
                </span>
                <span className="text-xs font-medium" style={{ color: "oklch(0.50 0.015 264)" }}>
                  {progress}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full"
                style={{ background: "oklch(0.16 0.012 264)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: "#00ABFF",
                  }}
                />
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleStartVerification}
              disabled={isStarted}
              className="verify-btn w-full"
            >
              {isStarted ? "Verifying..." : "Start Verification"}
            </button>
          </div>

          {/* Bottom Link */}
          <div className="text-center animate-fade-in-up-delay-4">
            <span style={{ color: "oklch(0.50 0.015 264)" }}>Got your key? </span>
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
