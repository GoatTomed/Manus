import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Verify() {
  const search = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("wt");

    if (!token) {
      setStatus("error");
      return;
    }

    const redirectTimeout = window.setTimeout(() => {
      setStatus("success");
      window.setTimeout(() => {
        window.location.href = `/api/access?wt=${token}`;
      }, 900);
    }, 3600);

    return () => {
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

      </div>
    </div>
  );
}
