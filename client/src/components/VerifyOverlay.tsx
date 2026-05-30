import { useEffect, useState } from "react";

export function VerifyOverlay({
  step,
  onDone,
  accent = "#06b6d4",
  duration = 3000,
}: {
  step: number;
  onDone: () => void;
  accent?: string;
  duration?: number;
}) {
  const [statusMsg, setStatusMsg] = useState(
    "Connecting to verification server..."
  );

  useEffect(() => {
    const messages = [
      "Connecting...",
      "Generating link...",
      "Preparing timer...",
      "Redirecting...",
    ];

    let frame: number;
    const start = Date.now();

    const animate = () => {
      const t = Math.min((Date.now() - start) / duration, 1);

      setStatusMsg(
        messages[
          Math.min(
            Math.floor(t * messages.length),
            messages.length - 1
          )
        ]
      );

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(onDone, 150);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [onDone, duration]);

  return (
    <>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(10,10,10,0.75)",
            border: `1px solid ${accent}33`,
            borderRadius: 16,
            padding: "40px 48px",
            textAlign: "center",
            backdropFilter: "blur(16px)",
            boxShadow: `0 0 60px ${accent}18`,
          }}
        >
          <div
            style={{
              position: "relative",
              margin: "0 auto 28px",
              width: 72,
              height: 72,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                background: `${accent}15`,
                border: `1px solid ${accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accent,
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <div
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: 34,
                border: "3px solid transparent",
                borderTopColor: accent,
                animation: "spin 800ms linear infinite",
              }}
            />
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: accent,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Loading
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Verifying Step {step}
          </div>

          <div
            style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.35)",
              minHeight: 40,
            }}
          >
            {statusMsg}
          </div>
        </div>
      </div>
    </>
  );
}
