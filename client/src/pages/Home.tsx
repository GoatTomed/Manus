/**
 * Design: Cyberpunk Minimal Dark — Page Home (Restored from Image)
 */
import { Link } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Home() {
  return (
    <div className="dot-grid-bg min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center px-4">
          {/* Logo - Standalone without rounded-full circle */}
          <div className="flex justify-center mb-6">
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

          {/* CTA Buttons - Matching the blue in the image */}
          <div className="flex items-center justify-center gap-4">
            <Link href="/redeem">
              <button className="bg-[#00ABFF] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0099EE] transition-all shadow-[0_0_15px_rgba(0,171,255,0.3)]">
                Redeem Key
              </button>
            </Link>
            <Link href="/get-key">
              <button className="bg-[#00ABFF] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0099EE] transition-all shadow-[0_0_15px_rgba(0,171,255,0.3)]">
                Get Key
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  ); 
}
