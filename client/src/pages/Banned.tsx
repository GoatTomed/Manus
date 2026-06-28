import { AlertCircle } from "@deemlol/next-icons";
import { useEffect, useState } from "react";

export default function BannedPage() {
  const [reason, setReason] = useState("Access Denied");

  useEffect(() => {
    const storedReason = localStorage.getItem("ban_reason");
    if (storedReason) {
      setReason(storedReason);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-5 font-sans">
      <AlertCircle size={80} color="#ef4444" />
      <h1 className="text-5xl font-extrabold tracking-tight text-[#f0eeeb]">
        You&apos;ve been <span className="text-[#ef4444]">banned.</span>
      </h1>
      <p className="text-sm font-mono text-[#888784] bg-white/5 border border-white/[0.08] px-4 py-2 rounded">
        Reason: <span className="text-[#c4c2be]">{reason}</span>
      </p>
    </main>
  );
}
