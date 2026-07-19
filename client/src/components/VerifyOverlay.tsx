import { useEffect, useState } from "react";

export function VerifyOverlay({
  step,
  onDone,
  accent = "#00ABFF",
  duration = 3000,
}: {
  step: number;
  onDone: () => void;
  accent?: string;
  duration?: number;
}) {
  const [statusMsg, setStatusMsg] = useState("Connecting to verification server...");

  useEffect(() => {
    console.debug("VerifyOverlay mounted", { step, duration });
    const messages = [
      "Connecting...",
      "Generating your link...",
      "Preparing verification...",
      "Redirecting...",
    ];

    let frame: number;
    const start = Date.now();

    const animate = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const idx = Math.min(Math.floor(t * messages.length), messages.length - 1);
      const message = messages[idx];
      console.debug("VerifyOverlay animate", { step, progress: t, index: idx, message });
      setStatusMsg(message);

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        console.debug("VerifyOverlay done, calling onDone", { step });
        setTimeout(() => {
          console.debug("VerifyOverlay onDone timeout complete", { step });
          onDone();
        }, 700);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => {
      console.debug("VerifyOverlay unmounted", { step });
      cancelAnimationFrame(frame);
    };
  }, [onDone, duration, step]);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0, 0, 0, 0.88)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 520,
            background: "#060606",
            border: `1px solid rgba(255,255,255,0.06)`,
            borderRadius: 24,
            padding: "36px 32px",
            boxShadow: "0 0 70px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 42,
              height: 42,
              borderTop: `2px solid ${accent}`,
              borderLeft: `2px solid ${accent}`,
              borderBottomRightRadius: 12,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 42,
              height: 42,
              borderTop: `2px solid ${accent}`,
              borderRight: `2px solid ${accent}`,
              borderBottomLeftRadius: 12,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 42,
              height: 42,
              borderBottom: `2px solid ${accent}`,
              borderLeft: `2px solid ${accent}`,
              borderTopRightRadius: 12,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 42,
              height: 42,
              borderBottom: `2px solid ${accent}`,
              borderRight: `2px solid ${accent}`,
              borderTopLeftRadius: 12,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.08)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: accent,
                  opacity: 0.08,
                  position: "absolute",
                }}
              />
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: `2px solid ${accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    background: accent,
                  }}
                </div>
              </div>
            </div>

            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ color: "#f5f5f5", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
                Verifying Step {step}
              </div>
              <div style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7 }}>
                {statusMsg}
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: 8,
                borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", height: "100%", background: accent }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
