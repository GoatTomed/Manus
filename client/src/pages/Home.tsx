/**
 * Design: Cyberpunk Minimal Dark — Page Home
 * - Logo standalone en haut
 * - Titre "YouSuck" en dessous
 * - CTA buttons
 */

import { Link } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Home() {
  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">

      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center px-4 max-w-4xl">
          {/* Logo Standalone */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-full"
            />
          </div>

          {/* Title */}
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-10 animate-fade-in-up-delay-1"
          >
            <span className="text-white">You</span>
            <span style={{ color: "#00ABFF" }}>Suck</span>
          </h1>

          {/* CTA */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in-up-delay-2">
            <Link href="/redeem">
              <button className="verify-btn">
                Redeem Key
              </button>
            </Link>
            <Link href="/get-key">
              <button className="get-key-btn">
                Get Key
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
