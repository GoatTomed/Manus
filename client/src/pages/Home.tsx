/**
 * Design: Cyberpunk Minimal Dark — Page Home
 */
import { Link } from "wouter";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

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
      description: "Pick your key."
    },
    {
      number: "04",
      title: "Unlock",
      description: "Copy and use instantly."
    }
  ];

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#0c0c0c",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "4px solid #d1d5db",
          borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
        }} />
      </div>
    );
  }

  return (
    <div className="dot-grid-bg min-h-screen flex flex-col font-sans text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 space-y-24">
        {/* Hero Section */}
        <div className="text-center px-4 max-w-sm w-full animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-24 h-24 object-contain"
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
              <button className="w-full sm:w-auto bg-[#00ABFF] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0099EE] transition-all">
                Get Key
              </button>
            </Link>
{/* Redeem Key button hidden */}
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
