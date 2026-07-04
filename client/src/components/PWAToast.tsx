import { useEffect, useState } from "react";

interface PWAToastProps {
  show: boolean;
}

export function PWAToast({ show }: PWAToastProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!show || dismissed) {
      setVisible(false);
      return;
    }

    // Check if running on Windows
    const isWindows = navigator.userAgent.toLowerCase().includes("windows");
    if (!isWindows) return;

    // Show toast after a short delay
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [show, dismissed]);

  if (!visible) return null;

  const handleInstall = () => {
    setDismissed(true);
    // Trigger PWA install prompt if available
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Roblox-style Toast */}
      <div
        className="rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          width: "320px",
        }}
      >
        {/* Header bar */}
        <div
          className="h-1"
          style={{
            background: "linear-gradient(90deg, #00a8ff 0%, #0088cc 100%)",
          }}
        />

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold text-sm">YouSuck</h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors text-lg leading-none w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Message */}
          <p className="text-gray-300 text-xs mb-4 leading-relaxed">
            Installer l'application pour une meilleure expérience sans navigateur.
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-1.5 rounded text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              style={{
                background: "#2a2a2a",
                border: "1px solid #3a3a3a",
              }}
            >
              Plus tard
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-3 py-1.5 rounded text-xs font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(90deg, #00a8ff 0%, #0088cc 100%)",
              }}
            >
              Installer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
