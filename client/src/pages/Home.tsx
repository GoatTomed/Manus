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

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 space-y-20">
        {/* Hero Section */}
        <div className="text-center px-4 max-w-sm w-full animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src={LOGO_URL}
              alt="YouSuck mascot"
              className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(0,171,255,0.3)]"
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

        {/* Tutorial Section */}
        <div className="w-full max-w-4xl space-y-10 animate-fade-in-up-delay-1 pb-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">How it <span className="text-[#00ABFF]">works</span></h2>
            <p className="text-gray-500 text-sm">Follow these simple steps to unlock your favorite scripts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, index) => (
              <div key={index} className="relative p-6 bg-[#0a0d14] border border-white/10 rounded-xl space-y-4 hover:border-[#00ABFF]/30 transition-all group">
                <div className="text-4xl font-black text-white/5 absolute top-2 right-4 group-hover:text-[#00ABFF]/10 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-[#00ABFF]">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
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
