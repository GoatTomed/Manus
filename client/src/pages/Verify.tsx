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
    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/access/verify?wt=${encodeURIComponent(token)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = await res.json();
        if (data.status === "success" && data.redirectUrl) {
          setStatus("success");
          window.setTimeout(() => {
            window.location.href = data.redirectUrl;
          }, 900);
          return;
        }

        setStatus("error");
      } catch (err) {
        setStatus("error");
      }
    };

    verifyToken();
    return () => {};
  }, [search]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: status === "loading" ? "#020202" : "#080808",
        backgroundImage:
          status === "loading"
            ? "none"
            : "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: status === "loading" ? undefined : "56px 56px",
        transition: "background 0.2s ease",
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
        </div>
      </div>
    </div>
  );
}
