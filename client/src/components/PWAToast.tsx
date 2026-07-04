import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePWAToast(showOnPage: boolean) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!showOnPage || shown) return;

    // Check if running on Windows
    const isWindows = navigator.userAgent.toLowerCase().includes("windows");
    if (!isWindows) return;

    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setShown(true);
      
      toast.custom(
        (toastId) => (
          <div
            className="w-full max-w-sm p-4 rounded-xl shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              border: "1px solid #00d4ff",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)",
            }}
          >
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => toast.dismiss(toastId)}
                className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Icon and title */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{
                  background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                }}
              >
                📱
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Installer YouSuck</h3>
                <p className="text-gray-400 text-xs">Application de bureau</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-xs mb-4 leading-relaxed">
              Lancez le jeu directement depuis votre bureau sans navigateur. Accès plus rapide et expérience optimisée.
            </p>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => toast.dismiss(toastId)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors border border-gray-600 hover:border-gray-400"
              >
                Plus tard
              </button>
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  // Trigger PWA install prompt if available
                  if ((window as any).deferredPrompt) {
                    (window as any).deferredPrompt.prompt();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                }}
              >
                Installer
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: "top-center",
        }
      );
    }, 800);

    return () => clearTimeout(timer);
  }, [showOnPage, shown]);
}
