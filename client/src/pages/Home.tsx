/**
 * Design: Cyberpunk Minimal Dark — Page Home
 * - Logo standalone en haut (sans cercle noir)
 * - Titre "YouSuck" en dessous
 * - CTA buttons
 */
import { Link } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Home() {
  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center px-4 max-w-4xl">
          {/* Logo Standalone - Retrait de rounded-full pour éviter le cercle noir */}
          <div className="flex justify-center mb-8 animate-fade-in-up relative">
            <div className="absolute inset-0 bg-[#00ABFF]/10 blur-3xl rounded-full"></div>
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(0,171,255,0.3)]"
            />
          </div>

          {/* Title */}
          <h1
            className="text-6xl md:text-8xl font-black tracking-tighter mb-12 animate-fade-in-up-delay-1"
          >
            <span className="text-white">YOU</span>
            <span style={{ color: "#00ABFF" }}>SUCK</span>
          </h1>

          {/* CTA */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 animate-fade-in-up-delay-2">
            <Link href="/redeem">
              <button className="verify-btn px-10 py-4 text-lg">
                Redeem Key
              </button>
            </Link>
            <Link href="/get-key">
              <button className="get-key-btn px-10 py-4 text-lg">
                Get Key
              </button>
            </Link>
          </div>
          
          <p className="mt-16 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">
            Premium Digital Security
          </p>
        </div>
      </main>
    </div>
  ); 
}
