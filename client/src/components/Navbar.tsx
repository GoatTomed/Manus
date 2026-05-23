/**
 * Design: Cyberpunk Minimal Dark — Navbar Simplifiée
 * - Titre uniquement, pas de logo
 */

import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 h-14">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
        {/* Title Only */}
        <Link href="/" className="no-underline">
          <span
            className="text-white font-bold text-lg tracking-tight"
          >
            <span className="text-white">You</span>
            <span style={{ color: "#00ABFF" }}>Suck</span>
          </span>
        </Link>
      </div>
    </nav>
  );
}
