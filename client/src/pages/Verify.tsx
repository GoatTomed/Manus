import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Verify() {
  const search = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your access...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("wt");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 16, 92));
    }, 240);

    const steps = [
      { delay: 600, message: "Initializing verification module..." },
      { delay: 1400, message: "Validating your link..." },
      { delay: 2200, message: "Checking server credentials..." },
      { delay: 3000, message: "Preparing redirect..." },
    ];

    const timeouts = steps.map((step) =>
      window.setTimeout(() => {
        setMessage(step.message);
      }, step.delay)
    );

    const redirectTimeout = window.setTimeout(() => {
      setProgress(100);
      setStatus("success");
      setMessage("Verification complete. Redirecting...");

      window.setTimeout(() => {
        window.location.href = `/api/access?wt=${token}`;
      }, 900);
    }, 3600);

    return () => {
      clearInterval(progressInterval);
      timeouts.forEach((t) => clearTimeout(t));
      clearTimeout(redirectTimeout);
    };
  }, [search]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          background: "#090909",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "42px 32px",
          boxShadow: "0 0 70px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {status === "loading" ? (
              <Loader2 size={40} style={{ color: "#00ABFF", animation: "spin 1.5s linear infinite" }} />
            ) : status === "success" ? (
              <CheckCircle2 size={40} style={{ color: "#22c55e" }} />
            ) : (
              <AlertCircle size={40} style={{ color: "#ef4444" }} />
            )}
          </div>

          <div style={{ textAlign: "center", width: "100%" }}>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 900, color: "#f5f5f5", letterSpacing: "-0.02em" }}>
              {status === "loading" ? "Verfiying" : status === "success" ? "Verification Complete" : "Verification Failed"}
            </h1>
          </div>

          {status === "loading" && (
            <div style={{ width: "100%", height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #00ABFF, #0099EE)", transition: "width 0.25s ease-out" }} />
            </div>
          )}

          <div style={{ width: "100%", height: "120px" }} />
        </div>
      </div>
    </div>
  );
}
