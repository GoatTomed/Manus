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
            <h1
              className="text-4xl font-bold tracking-tight"
            >
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
          <div className="redeem-card p-6 animate-fade-in-up-delay-3 mb-6">
            {/* Verification Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircleIcon />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.60 0.22 264)" }}
                >
                  Verification
                </span>
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.50 0.015 264)" }}
              >
                {currentStep} / 2
              </span>
            </div>

            {/* Steps */}
            <div className="flex justify-center gap-12 mb-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep >= 1
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "border-2 border-gray-600 text-gray-400"
                  }`}
                  style={
                    currentStep >= 1
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.60 0.22 264) 0%, oklch(0.52 0.24 264) 100%)",
                          boxShadow:
                            "0 0 20px oklch(0.60 0.22 264 / 0.4)",
                        }
                      : {
                          borderColor: "oklch(0.25 0.015 264)",
                          color: "oklch(0.45 0.015 264)",
                        }
                  }
                >
                  1
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.50 0.015 264)" }}
                >
                  Step 1
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep >= 2
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "border-2 border-gray-600 text-gray-400"
                  }`}
                  style={
                    currentStep >= 2
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.60 0.22 264) 0%, oklch(0.52 0.24 264) 100%)",
                          boxShadow:
                            "0 0 20px oklch(0.60 0.22 264 / 0.4)",
                        }
                      : {
                          borderColor: "oklch(0.25 0.015 264)",
                          color: "oklch(0.45 0.015 264)",
                        }
                  }
                >
                  2
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.50 0.015 264)" }}
                >
                  Step 2
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.50 0.015 264)" }}
                >
                  Progress
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.50 0.015 264)" }}
                >
                  {progress}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "oklch(0.15 0.015 264)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, oklch(0.60 0.22 264) 0%, oklch(0.65 0.20 264) 100%)",
                    boxShadow: "0 0 12px oklch(0.60 0.22 264 / 0.6)",
                  }}
                />
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartVerification}
              disabled={isStarted}
              className="verify-btn w-full h-11 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isStarted ? "Verification in progress..." : "Start Verification"}
            </button>
          </div>

          {/* Bottom Link */}
          <p
            className="text-center text-sm animate-fade-in-up-delay-3"
            style={{ color: "oklch(0.50 0.015 264)" }}
          >
            Got your key?{" "}
            <Link
              href="/redeem"
              className="no-underline font-semibold"
              style={{ color: "oklch(0.60 0.22 264)" }}
            >
              Redeem it here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="oklch(0.60 0.22 264)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
