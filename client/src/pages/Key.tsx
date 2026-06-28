import { useState } from "react";
import { useLocation } from "wouter";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const KEY_VALUE = "YourFat";

export default function Key() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(KEY_VALUE);
    setCopied(true);
    toast.success("Key copied!", {
      description: `${KEY_VALUE} has been copied to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    }}>
      <div className="w-full max-w-md">
        {/* Container with rounded border */}
        <div className="rounded-2xl p-8 space-y-8" style={{
          background: "linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}>
          {/* Logo/Badge at top */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{
              background: "linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}>
              <span className="text-white font-bold text-xs tracking-wider">KEY</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight" style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}>
              Key : {KEY_VALUE}
            </h1>
          </div>

          {/* Input Field (Display Only) */}
          <div className="space-y-3">
            <input
              type="text"
              value={KEY_VALUE}
              readOnly
              className="w-full px-6 py-4 rounded-lg text-white font-mono text-lg tracking-wider transition-all"
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
            />
          </div>

          {/* Copy Button - Large and Prominent */}
          <button
            onClick={handleCopyKey}
            className="w-full py-4 rounded-lg font-bold text-base tracking-wider transition-all flex items-center justify-center gap-2"
            style={{
              background: copied ? "#00d4ff" : "#00b8ff",
              color: "#000",
              border: "none",
              boxShadow: "0 4px 16px rgba(0, 184, 255, 0.3)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (!copied) e.currentTarget.style.background = "#00c8ff";
            }}
            onMouseLeave={(e) => {
              if (!copied) e.currentTarget.style.background = "#00b8ff";
            }}
          >
            {copied ? (
              <>
                <Check size={20} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={20} />
                <span>Copy Key</span>
              </>
            )}
          </button>

          {/* Back Button */}
          <button
            onClick={() => setLocation("/")}
            className="w-full py-3 rounded-lg font-bold text-sm tracking-wider transition-all"
            style={{
              background: "transparent",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
