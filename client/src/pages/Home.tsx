/**
 * Design: Cyberpunk Minimal Dark — Page Home
 */
import { Link } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Home() {
  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center px-4 max-w-sm w-full">
          {/* Logo */}
          <div className="flex justify-center mb-5 animate-fade-in-up">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(0,171,255,0.3)]"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold tracking-tight mb-8 animate-fade-in-up-delay-1">
            <span className="text-white">You</span>
            <span style={{ color: "#00ABFF" }}>Suck</span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up-delay-2">
            <Link href="/get-key">
              <button className="w-full sm:w-auto bg-[#00ABFF] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0099EE] transition-all shadow-[0_0_20px_rgba(0,171,255,0.35)] hover:shadow-[0_0_28px_rgba(0,171,255,0.5)] hover:-translate-y-0.5">
                Get Key
              </button>
            </Link>
            <Link href="/redeem">
              <button className="w-full sm:w-auto bg-transparent text-white px-8 py-2.5 rounded-lg font-bold text-sm border border-white/20 hover:border-[#00ABFF]/50 hover:bg-white/5 transition-all">
                Redeem Key
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
