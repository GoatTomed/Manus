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
      description: "Complete verification to generate your unique access key."
    },
    {
      number: "02",
      title: "Redeem Key",
      description: "Enter your key to add it to your script balance."
    },
    {
      number: "03",
      title: "Choose Script",
      description: "Browse our library of premium game scripts."
    },
    {
      number: "04",
      title: "Copy & Use",
      description: "Consume a key to copy your script instantly."
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
