/**
 * Design: Large Clean — Page Get Key
 * - GUI imposante et bien visible
 * - Bouton "Start"
 * - 2 étapes à compléter
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
      <main className="flex-1 flex items-center justify-center pt-20 pb-20 relative z-10">
        <div className="w-full max-w-3xl px-4">
          {/* Logo */}
          <div className="flex justify-center mb-12 animate-fade-in-up">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-28 h-28 object-contain rounded-full"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-6 animate-fade-in-up-delay-1">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="text-white">Get Your </span>
              <span style={{ color: "#00ABFF" }}>Key</span>
            </h1>
          </div>

          {/* Description */}
          <p
            className="text-center text-lg mb-16 animate-fade-in-up-delay-2"
            style={{ color: "oklch(0.55 0.015 264)" }}
          >
            Complete 2 simple steps to unlock your key
          </p>

          {/* Main Card */}
          {!started ? (
            <div className="animate-fade-in-up-delay-3">
              <div
                className="p-12 rounded-lg border text-center"
                style={{
                  background: "oklch(0.12 0.012 264 / 0.6)",
                  borderColor: "oklch(0.20 0.01 264)",
                }}
              >
                <p
                  className="text-lg mb-8"
                  style={{ color: "oklch(0.55 0.015 264)" }}
                >
                  Ready to get started?
                </p>
                <button
                  onClick={handleStart}
                  className="verify-btn px-16 py-4 text-lg font-semibold"
                >
                  Start
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up-delay-3">
              <div
                className="p-12 rounded-lg border"
                style={{
                  background: "oklch(0.12 0.012 264 / 0.6)",
                  borderColor: "oklch(0.20 0.01 264)",
                }}
              >
                {/* Steps Display */}
                <div className="mb-12">
                  {/* Step 1 */}
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl transition-all"
                        style={{
                          background: step1Complete ? "#00ABFF" : "oklch(0.18 0.015 264)",
                          color: step1Complete ? "white" : "#00ABFF",
                        }}
                      >
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-1">
                          Step 1: Verification
                        </h3>
                        <p style={{ color: "oklch(0.50 0.015 264)" }}>
                          {step1Complete ? "✓ Completed" : "Click below to proceed"}
                        </p>
                      </div>
                    </div>
                    {currentStep === 1 && !step1Complete && (
                      <button
                        onClick={handleStep1}
                        className="verify-btn px-8 py-3 ml-20 text-base font-semibold"
                      >
                        Complete Step 1
                      </button>
                    )}
                  </div>

                  {/* Step 2 */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl transition-all"
                        style={{
                          background: step2Complete ? "#00ABFF" : "oklch(0.18 0.015 264)",
                          color: step2Complete ? "white" : currentStep === 2 ? "#00ABFF" : "oklch(0.35 0.01 264)",
                          opacity: currentStep === 2 ? 1 : 0.5,
                        }}
                      >
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-1">
                          Step 2: Generate Key
                        </h3>
                        <p style={{ color: "oklch(0.50 0.015 264)" }}>
                          {step2Complete ? "✓ Your key is ready!" : "Complete step 1 first"}
                        </p>
                      </div>
                    </div>
                    {currentStep === 2 && !step2Complete && (
                      <button
                        onClick={handleStep2}
                        className="verify-btn px-8 py-3 ml-20 text-base font-semibold"
                      >
                        Generate Key
                      </button>
                    )}
                    {step2Complete && (
                      <div
                        className="ml-20 p-4 rounded-lg"
                        style={{
                          background: "oklch(0.08 0.01 264)",
                          border: "1px solid #00ABFF",
                        }}
                      >
                        <code
                          className="text-lg font-mono"
                          style={{ color: "#00ABFF" }}
                        >
                          YOUSUCK-XXXX-XXXX-XXXX
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Link */}
          <div className="text-center mt-12 animate-fade-in-up-delay-4">
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
