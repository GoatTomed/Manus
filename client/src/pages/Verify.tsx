import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Verify() {
  const search = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your access...");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("wt");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

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
      setStatus("success");
      setMessage("Verification complete. Redirecting...");

      window.setTimeout(() => {
        window.location.href = `/api/access?wt=${token}`;
      }, 900);
    }, 3600);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      clearTimeout(redirectTimeout);
    };
  }, [search]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#080808",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 120 }}>
        <div
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {status === "loading" ? (
            <Loader2 size={44} style={{ color: "#00ABFF", animation: "spin 1.5s linear infinite" }} />
          ) : status === "success" ? (
            <CheckCircle2 size={44} style={{ color: "#22c55e" }} />
          ) : (
            <AlertCircle size={44} style={{ color: "#ef4444" }} />
          )}
        </div>

        <div style={{ width: "100%", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "2.4rem", fontWeight: 900, color: "#f5f5f5", letterSpacing: "-0.03em" }}>
            {status === "loading" ? "Verifying" : status === "success" ? "Verification Complete" : "Verification Failed"}
          </h1>
          <p style={{ margin: "16px auto 0", maxWidth: "420px", lineHeight: 1.6, color: "rgba(255,255,255,0.72)", fontSize: "1rem" }}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
