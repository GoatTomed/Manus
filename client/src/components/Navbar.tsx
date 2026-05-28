import { Link } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default function Navbar() {
  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 h-14">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center gap-3">
        {/* Logo and Title */}
        <Link href="/" className="no-underline flex items-center gap-3">
          <img src={LOGO_URL} alt="YouSuck Logo" className="w-8 h-8 object-contain" />
          <span className="text-white font-bold text-lg tracking-tight">
            <span className="text-white">You</span>
            <span style={{ color: "#00ABFF" }}>Suck</span>
          </span>
        </Link>
      </div>
    </nav>
  );
}
