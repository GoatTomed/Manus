import { useState } from "react";
import { Link } from "wouter";

type Category = "all" | "windows" | "macos" | "mobile";

interface Executor {
  name: string;
  logo: string;
  href: string;
  platform: string;
  category: Category[];
  badge?: "recommended" | "supported";
  price?: "free" | "paid";
}

const EXECUTORS: Executor[] = [
  // Windows
  {
    name: "Wave",
    logo: "https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f30a.png",
    href: "https://getwave.gg/",
    platform: "Windows",
    category: ["windows"],
    badge: "recommended",
    price: "paid",
  },
  {
    name: "Seliware",
    logo: "https://scriptblox.com/images/exec/thumbs/Seliware.png",
    href: "https://seliware.com/",
    platform: "Windows",
    category: ["windows"],
    badge: "recommended",
    price: "paid",
  },
  {
    name: "Velocity",
    logo: "https://velocity-executor.com/wp-content/uploads/2025/06/velocity-main.png",
    href: "https://velocity-executor.com/download/",
    platform: "Windows",
    category: ["windows"],
    badge: "recommended",
    price: "free",
  },
  {
    name: "Bunni",
    logo: "https://bunniexecutor.com/wp-content/uploads/2025/06/bunni-logo.png",
    href: "https://bunni.fun/",
    platform: "Windows",
    category: ["windows"],
    badge: "supported",
  },
  {
    name: "Xeno",
    logo: "https://xeno.now/images/xeno.png",
    href: "https://work.ink/2hKT/Xeno",
    platform: "Windows",
    category: ["windows"],
    badge: "supported",
  },
  {
    name: "Solara",
    logo: "https://avatars.githubusercontent.com/u/208881794?s=200&v=4",
    href: "https://getsolara.dev/download/static/files/BootstrapperNew.exe",
    platform: "Windows",
    category: ["windows"],
    badge: "supported",
  },
  // macOS + Mobile
  {
    name: "Cryptic",
    logo: "https://getcryptic.net/logo.png",
    href: "https://getcryptic.net/",
    platform: "macOS, Mobile",
    category: ["macos", "mobile"],
    badge: "supported",
  },
  // Mobile
  {
    name: "Delta",
    logo: "https://velocity-executor.com/wp-content/uploads/2025/06/velocity-main.png",
    href: "https://discord.gg/deltax",
    platform: "Mobile",
    category: ["mobile"],
    badge: "recommended",
  },
  {
    name: "Fluxus",
    logo: "https://images.dwncdn.net/images/t_app-icon-l/p/69d46195-d1b1-4d4e-9ece-4aac6a27faf7/3398186052/fluxus-executor-logo",
    href: "https://fluxus-team.com/#how-to-download--install-fluxus",
    platform: "Mobile",
    category: ["mobile"],
    badge: "supported",
  },
];

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  {
    id: "all",
    label: "All Executors",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "windows",
    label: "Windows",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
  },
  {
    id: "macos",
    label: "macOS",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16zm-5-1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
      </svg>
    ),
  },
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  windows: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#00ABFF" }}>
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  ),
  macos: (
    <svg className="w-5 h-5 text-zinc-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  mobile: (
    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16zm-5-1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
    </svg>
  ),
};

const SECTIONS: { id: Category; label: string }[] = [
  { id: "windows", label: "Windows" },
  { id: "macos", label: "macOS" },
  { id: "mobile", label: "Mobile" },
];

function ExecutorCard({ executor }: { executor: Executor }) {
  return (
    <a
      href={executor.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-white/[0.08] rounded-xl p-6 bg-white/[0.02] transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-0.5 relative overflow-hidden"
      style={{
        ["--hover-border" as string]: "rgba(0,171,255,0.3)",
      }}
    >
      {/* Top shimmer on hover */}
      <span
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,171,255,0.35), transparent)" }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={executor.logo}
            alt={executor.name}
            className="w-12 h-12 object-contain rounded-[10px] bg-white/[0.03] p-1.5"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{executor.name}</h3>
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {executor.badge === "recommended" && (
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-md lowercase tracking-[0.3px] text-white"
                  style={{ background: "linear-gradient(135deg, #a855f7, #9333ea)" }}
                >
                  recommended
                </span>
              )}
              {executor.badge === "supported" && (
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-md lowercase tracking-[0.3px] border"
                  style={{
                    background: "rgba(0,171,255,0.15)",
                    color: "#00ABFF",
                    borderColor: "rgba(0,171,255,0.3)",
                  }}
                >
                  supported
                </span>
              )}
              {executor.price === "free" && (
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-md lowercase tracking-[0.3px] border"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    color: "#22c55e",
                    borderColor: "rgba(34,197,94,0.3)",
                  }}
                >
                  free
                </span>
              )}
              {executor.price === "paid" && (
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-md lowercase tracking-[0.3px] border"
                  style={{
                    background: "rgba(234,179,8,0.15)",
                    color: "#eab308",
                    borderColor: "rgba(234,179,8,0.3)",
                  }}
                >
                  paid
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs text-zinc-500 font-medium">{executor.platform}</span>
      </div>
    </a>
  );
}

export default function Executors() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredSections =
    activeCategory === "all"
      ? SECTIONS
      : SECTIONS.filter((s) => s.id === activeCategory);

  const executorsForSection = (sectionId: Category) =>
    EXECUTORS.filter((e) => e.category.includes(sectionId));

  const countLabel = (sectionId: Category) => {
    const n = executorsForSection(sectionId).length;
    return `${n} executor${n !== 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen dot-grid-bg">
      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-16 z-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors mb-8 no-underline"
          style={{ ["--hover-color" as string]: "#00ABFF" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00ABFF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Return Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border"
            style={{
              background: "rgba(34,197,94,0.1)",
              borderColor: "rgba(34,197,94,0.2)",
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#22c55e" }}>
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold text-sm" style={{ color: "#22c55e" }}>
              Verified Executors
            </span>
          </div>

          <h1 className="text-5xl font-bold mb-4">
            <span className="text-white">Supported </span>
            <span style={{ color: "#00ABFF" }}>Executors</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-3xl mx-auto leading-relaxed">
            All Executors Below Redirect To Executor Official Site To Download.
          </p>

          {/* Filter Buttons */}
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all border flex items-center gap-2"
                  style={
                    isActive
                      ? {
                          background: "rgba(0,171,255,0.15)",
                          borderColor: "rgba(0,171,255,0.4)",
                          color: "#00ABFF",
                        }
                      : {
                          background: "rgba(255,255,255,0.02)",
                          borderColor: "rgba(255,255,255,0.08)",
                          color: "#a3a3a3",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.borderColor = "rgba(0,171,255,0.3)";
                      e.currentTarget.style.color = "#e5e5e5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "#a3a3a3";
                    }
                  }}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sections */}
        {filteredSections.map((section, i) => {
          const executors = executorsForSection(section.id);
          if (executors.length === 0) return null;
          return (
            <div
              key={section.id}
              className="mb-12"
              style={{ animation: `fadeIn 0.6s ease-out ${i * 0.1}s both` }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {SECTION_ICONS[section.id]}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{section.label}</h2>
                </div>
                <span className="text-sm text-zinc-500 font-medium">{countLabel(section.id)}</span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {executors.map((ex) => (
                  <ExecutorCard key={ex.name + ex.platform} executor={ex} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
