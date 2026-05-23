/**
 * Design: Ultra Premium Interactive — Page Get Key
 * - Animations fluides et dynamiques
 * - Gradients sophistiqués
 * - Effets visuels avancés
 * - Design premium et moderne
 */

import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { CheckCircle2, Zap, Lock, Gift, ArrowRight } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function GetKey() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

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
    <div className="dot-grid-bg min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 20% 50%, rgba(0, 171, 255, 0.1) 0%, transparent 50%)",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 80% 80%, rgba(0, 171, 255, 0.08) 0%, transparent 50%)",
          animation: "pulse 10s ease-in-out infinite 2s",
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out;
        }
        .animate-slide-in-down {
          animation: slideInDown 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }
        .group:hover .group-hover\\:scale-105 {
          transform: scale(1.05);
        }
        .benefit-card {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .benefit-card:hover {
          transform: translateY(-4px);
        }
      `}</style>

      <main className="flex-1 flex items-center justify-center relative z-10" style={{ minHeight: '200vh' }}>
        <div className="w-full max-w-4xl px-4">
          {/* Logo */}
          <div className="flex justify-center mb-12 animate-slide-in-down">
            <div className="relative">
              <img
                src={LOGO_URL}
                alt="YouSuck mascot"
                className="w-24 h-24 object-contain rounded-full"
                style={{
                  boxShadow: "0 0 30px rgba(0, 171, 255, 0.4)",
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              <span className="text-white">Get Your </span>
              <span 
                style={{ 
                  color: "#00ABFF",
                  background: "linear-gradient(135deg, #00ABFF 0%, #0088FF 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Key
              </span>
            </h1>
          </div>

          {/* Description */}
          <p
            className="text-center text-lg mb-8 animate-slide-in-up"
            style={{ color: "oklch(0.55 0.015 264)", animationDelay: "0.2s" }}
          >
            Unlock premium access in seconds
          </p>

          {/* Main Card */}
          {!started ? (
            <div
              className="p-20 rounded-2xl border mb-32 flex flex-col justify-center animate-scale-in group cursor-pointer"
              style={{
                background: "linear-gradient(135deg, oklch(0.12 0.012 264 / 0.8) 0%, oklch(0.10 0.01 264 / 0.6) 100%)",
                borderColor: "#00ABFF",
                borderWidth: "1px",
                backdropFilter: "blur(10px)",
                minHeight: '400px',
                boxShadow: "0 8px 32px rgba(0, 171, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 48px rgba(0, 171, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 171, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
              }}
            >
              <div className="mb-8">
                <div className="flex justify-center mb-6">
                  <div style={{
                    animation: "pulse 2s ease-in-out infinite",
                  }}>
                    <Zap size={48} style={{ color: "#00ABFF" }} />
                  </div>
                </div>
                <p className="text-xl font-semibold text-white mb-4">
                  Ready to unlock your script?
                </p>
                <p
                  className="text-base mb-8"
                  style={{ color: "oklch(0.55 0.015 264)" }}
                >
                  Get instant access to premium features
                </p>
                
                {/* Benefits Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: CheckCircle2, label: "Instant Access" },
                    { icon: Gift, label: "Lifetime Use" },
                    { icon: Lock, label: "Secure" },
                  ].map((benefit, idx) => (
                    <div
                      key={idx}
                      className="benefit-card p-4 rounded-lg"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.10 0.01 264) 0%, oklch(0.08 0.01 264) 100%)",
                        border: "1px solid rgba(0, 171, 255, 0.2)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHoveredBenefit(idx)}
                      onMouseLeave={() => setHoveredBenefit(null)}
                    >
                      <benefit.icon 
                        size={24} 
                        style={{ 
                          color: hoveredBenefit === idx ? "#00ABFF" : "rgba(0, 171, 255, 0.7)",
                          margin: "0 auto 4px",
                          transition: "color 0.3s ease",
                        }} 
                      />
                      <p className="text-xs text-white font-medium">{benefit.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleStart}
                className="verify-btn px-12 py-3 text-lg font-bold flex items-center justify-center gap-2 group/btn"
                style={{
                  transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                Start Now
                <ArrowRight size={20} style={{
                  transition: "transform 0.3s ease",
                  transform: "translateX(0)",
                }} />
              </button>
            </div>
          ) : (
            <div
              className="p-20 rounded-2xl border mb-32 animate-scale-in"
              style={{
                background: "linear-gradient(135deg, oklch(0.12 0.012 264 / 0.8) 0%, oklch(0.10 0.01 264 / 0.6) 100%)",
                borderColor: "#00ABFF",
                borderWidth: "1px",
                backdropFilter: "blur(10px)",
                minHeight: '900px',
                boxShadow: "0 8px 32px rgba(0, 171, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Progress Indicator */}
              <div className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm" style={{ color: "oklch(0.50 0.015 264)" }}>
                    Progress
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#00ABFF" }}>
                    {step2Complete ? "100%" : step1Complete ? "50%" : "0%"}
                  </span>
                </div>
                <div
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.15 0.01 264)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      background: "linear-gradient(90deg, #00ABFF 0%, #0088FF 100%)",
                      width: step2Complete ? "100%" : step1Complete ? "50%" : "0%",
                      boxShadow: "0 0 20px rgba(0, 171, 255, 0.6)",
                    }}
                  />
                </div>
              </div>

              {/* Steps Display */}
              <div className="space-y-16">
                {/* Step 1 */}
                <div
                  className="p-12 rounded-xl border transition-all animate-slide-in-up"
                  style={{
                    background: step1Complete 
                      ? "linear-gradient(135deg, rgba(0, 171, 255, 0.15) 0%, rgba(0, 136, 255, 0.1) 100%)"
                      : "linear-gradient(135deg, oklch(0.10 0.01 264) 0%, oklch(0.08 0.01 264) 100%)",
                    borderColor: step1Complete ? "#00ABFF" : "rgba(0, 171, 255, 0.3)",
                    borderWidth: "1px",
                    boxShadow: step1Complete 
                      ? "0 0 20px rgba(0, 171, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                    minHeight: '320px',
                  }}
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center font-bold text-2xl transition-all flex-shrink-0"
                      style={{
                        background: step1Complete 
                          ? "linear-gradient(135deg, #00ABFF 0%, #0088FF 100%)"
                          : "linear-gradient(135deg, rgba(0, 171, 255, 0.3) 0%, rgba(0, 136, 255, 0.2) 100%)",
                        color: step1Complete ? "white" : "#00ABFF",
                        boxShadow: step1Complete ? "0 0 20px rgba(0, 171, 255, 0.4)" : "none",
                      }}
                    >
                      {step1Complete ? (
                        <CheckCircle2 size={32} />
                      ) : (
                        "1"
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Step 1: Verification
                      </h3>
                      <p
                        className="text-base"
                        style={{ color: "oklch(0.50 0.015 264)" }}
                      >
                        {step1Complete
                          ? "Verification completed successfully"
                          : "Verify your identity to proceed"}
                      </p>
                    </div>
                  </div>
                  
                  <div
                    className="p-4 rounded-lg mb-6 flex gap-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(0, 171, 255, 0.1) 0%, rgba(0, 136, 255, 0.05) 100%)",
                      borderLeft: "3px solid #00ABFF",
                      border: "1px solid rgba(0, 171, 255, 0.2)",
                    }}
                  >
                    <Lock size={20} style={{ color: "#00ABFF", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p className="text-sm text-white mb-1 font-semibold">Security Check</p>
                      <p className="text-sm" style={{ color: "oklch(0.50 0.015 264)" }}>
                        We verify you're a real player to ensure fair access
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
                  className="p-12 rounded-xl border transition-all animate-slide-in-up"
                  style={{
                    background: step2Complete 
                      ? "linear-gradient(135deg, rgba(0, 171, 255, 0.15) 0%, rgba(0, 136, 255, 0.1) 100%)"
                      : "linear-gradient(135deg, oklch(0.10 0.01 264) 0%, oklch(0.08 0.01 264) 100%)",
                    borderColor: step2Complete ? "#00ABFF" : currentStep === 2 ? "rgba(0, 171, 255, 0.5)" : "rgba(0, 171, 255, 0.2)",
                    borderWidth: "1px",
                    opacity: currentStep === 2 || step1Complete ? 1 : 0.6,
                    boxShadow: step2Complete 
                      ? "0 0 20px rgba(0, 171, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                    minHeight: '320px',
                    animationDelay: "0.1s",
                  }}
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center font-bold text-2xl transition-all flex-shrink-0"
                      style={{
                        background: step2Complete 
                          ? "linear-gradient(135deg, #00ABFF 0%, #0088FF 100%)"
                          : "linear-gradient(135deg, rgba(0, 171, 255, 0.3) 0%, rgba(0, 136, 255, 0.2) 100%)",
                        color: step2Complete ? "white" : currentStep === 2 ? "#00ABFF" : "rgba(0, 171, 255, 0.5)",
                        boxShadow: step2Complete ? "0 0 20px rgba(0, 171, 255, 0.4)" : "none",
                      }}
                    >
                      {step2Complete ? (
                        <CheckCircle2 size={32} />
                      ) : (
                        "2"
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Step 2: Generate Key
                      </h3>
                      <p
                        className="text-base"
                        style={{ color: "oklch(0.50 0.015 264)" }}
                      >
                        {step2Complete
                          ? "Your key has been generated!"
                          : currentStep === 2
                            ? "Generate your unique key now"
                            : "Complete step 1 first"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-lg mb-6 flex gap-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(0, 171, 255, 0.1) 0%, rgba(0, 136, 255, 0.05) 100%)",
                      borderLeft: "3px solid #00ABFF",
                      border: "1px solid rgba(0, 171, 255, 0.2)",
                    }}
                  >
                    <Gift size={20} style={{ color: "#00ABFF", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p className="text-sm text-white mb-1 font-semibold">Key Generation</p>
                      <p className="text-sm" style={{ color: "oklch(0.50 0.015 264)" }}>
                        Your unique key will be ready to use immediately
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
                      className="p-6 rounded-lg border-2 text-center animate-scale-in"
                      style={{
                        background: "linear-gradient(135deg, rgba(0, 171, 255, 0.1) 0%, rgba(0, 136, 255, 0.05) 100%)",
                        borderColor: "#00ABFF",
                        boxShadow: "0 0 20px rgba(0, 171, 255, 0.2)",
                      }}
                    >
                      <div className="flex justify-center mb-3">
                        <CheckCircle2 size={32} style={{ color: "#00ABFF" }} />
                      </div>
                      <p
                        className="text-sm mb-3"
                        style={{ color: "oklch(0.50 0.015 264)" }}
                      >
                        Your Key:
                      </p>
                      <code
                        className="text-lg font-mono font-bold block mb-4"
                        style={{ color: "#00ABFF" }}
                      >
                        YOUSUCK-XXXX-XXXX-XXXX
                      </code>
                      <p className="text-xs" style={{ color: "oklch(0.45 0.015 264)" }}>
                        Copy this key to activate your script
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Link */}
          <div className="text-center animate-slide-in-up" style={{ animationDelay: "0.3s" }}>
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
