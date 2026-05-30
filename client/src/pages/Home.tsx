/**
 * Design: Cyberpunk Minimal Dark — Page Home
 */
import { Link } from "wouter";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const STEPS = [
    {
      number: "01",
      title: "Get Key",
      description: "Verify to generate a key."
    },
    {
      number: "02",
      title: "Redeem",
      description: "Add it to your balance."
    },
    {
      number: "03",
      title: "Browse",
      description: "Pick your script."
    },
    {
      number: "04",
      title: "Unlock",
      description: "Copy and use instantly."
    }
  ];

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      {isLoading && (
        <>
          <style>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "rgba(10,10,10,0.75)",
                border: "1px solid rgba(0,171,255,0.2)",
                borderRadius: 16,
                padding: "40px 48px",
                textAlign: "center",
                backdropFilter: "blur(16px)",
                boxShadow: "0 0 60px rgba(0,171,255,0.09)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  margin: "0 auto 28px",
                  width: 72,
                  height: 72,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 22,
                    background: "rgba(0,171,255,0.08)",
                    border: "1px solid rgba(0,171,255,0.27)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00ABFF",
                  }}
                >
                  <Fingerprint size={36} strokeWidth={1.6} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    borderRadius: 34,
                    border: "3px solid transparent",
                    borderTopColor: "#00ABFF",
                    animation: "spin 800ms linear infinite",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#00ABFF",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Loading
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fafafa",
                  letterSpacing: "-0.03em",
                  marginBottom: 8,
                }}
              >
                Securing Identity
              </div>

              <div
                style={{
                  fontSize: 13.5,
                  color: "rgba(255,255,255,0.35)",
                  minHeight: 40,
                }}
              >
                Generating your unique system identifier...
              </div>
            </div>
          </div>
        </>
      )}
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 space-y-24">
        {/* Hero Section */}
        <div className="text-center px-4 max-w-sm w-full animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(0,171,255,0.2)]"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold tracking-tight mb-8">
            <span className="text-white">You</span>
            <span style={{ color: "#00ABFF" }}>Suck</span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/get-key">
              <button className="w-full sm:w-auto bg-[#00ABFF] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0099EE] transition-all shadow-[0_0_20px_rgba(0,171,255,0.3)]">
                Get Key
              </button>
            </Link>
            <Link href="/redeem">
              <button className="w-full sm:w-auto bg-transparent text-white px-8 py-2.5 rounded-lg font-bold text-sm border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                Redeem Key
              </button>
            </Link>
          </div>
        </div>

        {/* Tutorial Section (Exact User Specifications) */}
        <div className="w-full max-w-6xl animate-fade-in-up-delay-1 pb-16 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, index) => (
              <div 
                key={index} 
                className="relative p-[18px_16px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden group flex flex-col"
                style={{ padding: '18px 16px' }}
              >
                {/* Top shine effect (decorative line) */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent"></div>
                
                {/* Step number (large muted label) */}
                <div 
                  className="text-[1.4rem] font-extrabold text-[rgba(255,255,255,0.06)] tracking-[-0.04em] mb-[10px]"
                >
                  {step.number}
                </div>
                
                {/* Title */}
                <h3 className="text-[0.76rem] font-bold text-white mb-[6px] tracking-tight">
                  {step.title}
                </h3>
                
                {/* Subtitle/description */}
                <p className="text-[0.65rem] text-[rgba(255,255,255,0.3)] leading-[1.6] font-medium">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
