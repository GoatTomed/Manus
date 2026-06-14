/**
 * Design: Cyberpunk Minimal Dark — Page Home
 */
import { Link } from "wouter";
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
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Hero Section */}
        <div className="text-center px-4 max-w-sm w-full animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain block"
              loading="eager"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 sm:mb-8">
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
            <Link href="/executors">
              <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-white/10 transition-all">
                Get Executors
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
