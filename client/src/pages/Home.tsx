/**
 * Design: Cyberpunk Minimal Dark — Page Home
 */
import { Link } from "wouter";
import Navbar from "../components/Navbar";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Home() {
  const STEPS = [
    {
      number: "01",
      title: "Get Key",
      description: "Complete a quick verification to generate your unique access key."
    },
    {
      number: "02",
      title: "Redeem",
      description: "Enter your key in the redeem section to add it to your balance."
    },
    {
      number: "03",
      title: "Copy Script",
      description: "Browse our library and use your keys to unlock any script instantly."
    }
  ];

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
              <button className="w-full sm:w-auto bg-[#00ABFF] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0099EE] transition-all shadow-[0_0_20px_rgba(0,171,255,0.3)] hover:shadow-[0_0_28px_rgba(0,171,255,0.4)]">
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

        {/* Tutorial Section (Premium Look) */}
        <div className="w-full max-w-5xl animate-fade-in-up-delay-1 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((step, index) => (
              <div 
                key={index} 
                className="relative p-8 bg-[#0a0d14]/40 border border-white/[0.05] rounded-2xl space-y-4 hover:border-white/[0.1] transition-all duration-500 group overflow-hidden"
              >
                {/* Background Number (Subtle) */}
                <div className="text-6xl font-bold text-white/[0.03] absolute top-4 left-6 group-hover:text-white/[0.05] transition-colors duration-500 pointer-events-none">
                  {step.number}
                </div>
                
                {/* Content */}
                <div className="relative z-10 space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight pt-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                {/* Subtle Glow Effect on Hover */}
                <div className="absolute -inset-px bg-gradient-to-br from-[#00ABFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
