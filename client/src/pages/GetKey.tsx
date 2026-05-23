/**
 * Design: Tall Unzoomed — Page Get Key
 * - Page beaucoup plus haute
 * - Dézoomée (texte plus petit)
 * - Beaucoup d'espace vertical
 */

import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);

  const handleStart = () => {
    setStarted(true);
    setCurrentStep(1);
  };

  const handleStep1 = () => {
    setStep1Complete(true);
    toast.success("Step 1 completed!");
    setTimeout(() => {
      setCurrentStep(2);
    }, 500);
  };

  const handleStep2 = () => {
    setStep2Complete(true);
    toast.success("Key generated successfully!");
  };

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center py-96 relative z-10">
        <div className="w-full max-w-4xl px-4">
          {/* Logo */}
          <div className="flex justify-center mb-40">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-24 h-24 object-contain rounded-full"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              <span className="text-white">Get Your </span>
              <span style={{ color: "#00ABFF" }}>Key</span>
            </h1>
          </div>

          {/* Description */}
          <p
            className="text-center text-lg mb-48"
            style={{ color: "oklch(0.55 0.015 264)" }}
          >
            Complete 2 simple steps to unlock your key
          </p>

          {/* Main Card */}
          {!started ? (
            <div
              className="p-12 rounded-xl border text-center mb-48"
              style={{
                background: "oklch(0.12 0.012 264 / 0.6)",
                borderColor: "oklch(0.20 0.01 264)",
              }}
            >
              <p
                className="text-lg mb-12"
                style={{ color: "oklch(0.55 0.015 264)" }}
              >
                Ready to get started?
              </p>
              <button
                onClick={handleStart}
                className="verify-btn px-12 py-3 text-lg font-bold"
              >
                Start
              </button>
            </div>
          ) : (
            <div
              className="p-12 rounded-xl border mb-48"
              style={{
                background: "oklch(0.12 0.012 264 / 0.6)",
                borderColor: "oklch(0.20 0.01 264)",
              }}
            >
              {/* Steps Display */}
              <div className="space-y-32">
                {/* Step 1 */}
                <div
                  className="p-8 rounded-lg border transition-all"
                  style={{
                    background: step1Complete ? "oklch(0.15 0.015 264)" : "oklch(0.10 0.01 264)",
                    borderColor: step1Complete ? "#00ABFF" : "oklch(0.20 0.01 264)",
                  }}
                >
                  <div className="flex items-start gap-6 mb-8">
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center font-bold text-2xl transition-all flex-shrink-0"
                      style={{
                        background: step1Complete ? "#00ABFF" : "oklch(0.18 0.015 264)",
                        color: step1Complete ? "white" : "#00ABFF",
                      }}
                    >
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Step 1: Verification
                      </h3>
                      <p
                        className="text-base mb-2"
                        style={{ color: "oklch(0.50 0.015 264)" }}
                      >
                        {step1Complete
                          ? "✓ Verification completed successfully"
                          : "Verify your identity to proceed"}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "oklch(0.45 0.015 264)" }}
                      >
                        This step ensures you are a real player
                      </p>
                    </div>
                  </div>
                  {currentStep === 1 && !step1Complete && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleStep1}
                        className="verify-btn px-10 py-2 text-base font-bold"
                      >
                        Complete Verification
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2 */}
                <div
                  className="p-8 rounded-lg border transition-all"
                  style={{
                    background: step2Complete ? "oklch(0.15 0.015 264)" : "oklch(0.10 0.01 264)",
                    borderColor: step2Complete ? "#00ABFF" : currentStep === 2 ? "oklch(0.25 0.01 264)" : "oklch(0.15 0.01 264)",
                    opacity: currentStep === 2 || step1Complete ? 1 : 0.6,
                  }}
                >
                  <div className="flex items-start gap-6 mb-8">
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center font-bold text-2xl transition-all flex-shrink-0"
                      style={{
                        background: step2Complete ? "#00ABFF" : "oklch(0.18 0.015 264)",
                        color: step2Complete ? "white" : currentStep === 2 ? "#00ABFF" : "oklch(0.35 0.01 264)",
                      }}
                    >
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Step 2: Generate Key
                      </h3>
                      <p
                        className="text-base mb-2"
                        style={{ color: "oklch(0.50 0.015 264)" }}
                      >
                        {step2Complete
                          ? "✓ Your key has been generated!"
                          : currentStep === 2
                            ? "Generate your unique key now"
                            : "Complete step 1 first"}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "oklch(0.45 0.015 264)" }}
                      >
                        Your key will be displayed below
                      </p>
                    </div>
                  </div>
                  {currentStep === 2 && !step2Complete && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleStep2}
                        className="verify-btn px-10 py-2 text-base font-bold"
                      >
                        Generate Key Now
                      </button>
                    </div>
                  )}
                  {step2Complete && (
                    <div
                      className="p-6 rounded-lg border text-center"
                      style={{
                        background: "oklch(0.08 0.01 264)",
                        borderColor: "#00ABFF",
                      }}
                    >
                      <p
                        className="text-sm mb-3"
                        style={{ color: "oklch(0.50 0.015 264)" }}
                      >
                        Your Key:
                      </p>
                      <code
                        className="text-lg font-mono font-bold"
                        style={{ color: "#00ABFF" }}
                      >
                        YOUSUCK-XXXX-XXXX-XXXX
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Link */}
          <div className="text-center">
            <span className="text-base" style={{ color: "oklch(0.50 0.015 264)" }}>
              Already have a key?{" "}
            </span>
            <Link href="/redeem">
              <span
                className="text-base font-bold"
                style={{ color: "#00ABFF", cursor: "pointer" }}
              >
                Redeem it here
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
