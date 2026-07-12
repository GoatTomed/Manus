import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Verify() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your access...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate verification process with fake progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 30;
      });
    }, 300);

    // Get the token from URL
    const params = new URLSearchParams(search);
    const token = params.get("wt");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      clearInterval(progressInterval);
      return;
    }

    // Simulate verification steps
    const steps = [
      { delay: 800, message: "Initializing security check..." },
      { delay: 1600, message: "Validating credentials..." },
      { delay: 2400, message: "Processing verification..." },
      { delay: 3200, message: "Finalizing access..." },
    ];

    const timeouts = steps.map((step) =>
      setTimeout(() => {
        setMessage(step.message);
      }, step.delay)
    );

    // After fake verification, redirect to the actual verification endpoint
    const redirectTimeout = setTimeout(() => {
      setProgress(100);
      setStatus("success");
      setMessage("Access granted! Redirecting...");
      
      // Redirect to the actual verification endpoint after a short delay
      setTimeout(() => {
        window.location.href = `/verify?wt=${token}`;
      }, 1000);
    }, 4000);

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
        backgroundColor: "#0c0c0c",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow { 
          0%, 100% { box-shadow: 0 0 20px rgba(0, 171, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 171, 255, 0.6); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          background: "rgba(12, 12, 12, 0.8)",
          border: "1px solid rgba(0, 171, 255, 0.2)",
          borderRadius: "24px",
          padding: "48px 32px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
          animation: "slide-in 0.6s ease-out",
        }}
      >
        {/* Icon */}
        <div
          style={{
            marginBottom: "32px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {status === "loading" && (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(0, 171, 255, 0.1)",
                border: "2px solid rgba(0, 171, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse-glow 2s ease-in-out infinite",
              }}
            >
              <Loader2
                size={40}
                style={{
                  color: "#00ABFF",
                  animation: "spin 2s linear infinite",
                }}
              />
            </div>
          )}
          {status === "success" && (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.1)",
                border: "2px solid rgba(34, 197, 94, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={40} style={{ color: "#22c55e" }} />
            </div>
          )}
          {status === "error" && (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                border: "2px solid rgba(239, 68, 68, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle size={40} style={{ color: "#ef4444" }} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "white",
            marginBottom: "12px",
          }}
        >
          {status === "loading" && "Verifying Access"}
          {status === "success" && "Verification Complete"}
          {status === "error" && "Verification Failed"}
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: "14px",
            color: "#a1a1a1",
            marginBottom: "32px",
            minHeight: "20px",
          }}
        >
          {message}
        </p>

        {/* Progress Bar */}
        {status === "loading" && (
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "2px",
              overflow: "hidden",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                height: "100%",
                background: `linear-gradient(90deg, #00ABFF, #0099EE)`,
                width: `${progress}%`,
                transition: "width 0.3s ease-out",
                borderRadius: "2px",
              }}
            />
          </div>
        )}

        {/* Status Text */}
        <div
          style={{
            fontSize: "12px",
            color: "#71717a",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: "700",
          }}
        >
          {status === "loading" && "Processing..."}
          {status === "success" && "Redirecting..."}
          {status === "error" && "Please try again"}
        </div>
      </div>
    </div>
  );
}
