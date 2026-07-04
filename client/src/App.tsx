import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GetKey from "./pages/GetKey";
import Key from "./pages/Key";
import VerificationError from "./pages/VerificationError";
import KeyAdmin from "./pages/KeyAdmin";
import Executors from "./pages/Executors";
import Track from "./pages/Track";
import AICoding from "./pages/AICoding";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { useLocation } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/get-key" component={GetKey} />
      <Route path="/key" component={Key} />
      <Route path="/verification-error" component={VerificationError} />
      <Route path="/key-admin" component={KeyAdmin} />
      <Route path="/executors" component={Executors} />
      <Route path="/track" component={Track} />
      <Route path="/ai" component={AICoding} />
      <Route path="/ai/chat/:chatId" component={AICoding} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  useEffect(() => {
    document.title = "YouSuck";
    
    // Request fullscreen on app start
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).mozRequestFullScreen) {
          await (document.documentElement as any).mozRequestFullScreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen request was denied or not supported");
      }
    };
    
    // Request fullscreen after a short delay to ensure DOM is ready
    const fullscreenTimer = setTimeout(requestFullscreen, 500);
    
    const initializeIdentity = () => {
      let id = localStorage.getItem("ys_visitor_id") || 
               document.cookie.split('; ').find(row => row.startsWith('ys_visitor_id='))?.split('=')[1];
      
      if (!id) {
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const userAgent = navigator.userAgent;
        const language = navigator.language;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const rawSignature = `${screenRes}|${userAgent}|${language}|${timezone}`;
        
        let hash = 0;
        for (let i = 0; i < rawSignature.length; i++) {
          const char = rawSignature.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        
        const newId = `USER-${Math.abs(hash).toString(16).toUpperCase()}-${nanoid(4).toUpperCase()}`;
        localStorage.setItem("ys_visitor_id", newId);
        document.cookie = `ys_visitor_id=${newId}; path=/; max-age=31536000; SameSite=Lax`;
      }
    };
    
    // Show PWA installation prompt - only on home page
    const showPWAPrompt = () => {
      if (location !== "/") return;
      
      // Check if running on Windows (via user agent)
      const isWindows = navigator.userAgent.indexOf("Windows") > -1;
      
      if (isWindows) {
        toast.custom(
          (t) => (
            <div 
              className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-50"
              style={{
                background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)",
                border: "1px solid rgba(0, 171, 255, 0.3)",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#00ABFF" }} />
                    <p className="font-bold text-sm" style={{ color: "#00ABFF" }}>YouSuck</p>
                  </div>
                  <button
                    onClick={() => toast.dismiss(t)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Content */}
                <div className="mb-4">
                  <p className="text-white font-semibold text-sm mb-1">Installer l'application ?</p>
                  <p className="text-gray-300 text-xs leading-relaxed">Obtenez une meilleure expérience sans navigateur. Lancez l'app directement depuis votre bureau.</p>
                </div>
                
                {/* Buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      toast.dismiss(t);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    Plus tard
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(t);
                      // Trigger PWA install prompt if available
                      if ((window as any).deferredPrompt) {
                        (window as any).deferredPrompt.prompt();
                      }
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white rounded transition-all"
                    style={{
                      background: "linear-gradient(135deg, #00ABFF 0%, #0099EE 100%)",
                    }}
                  >
                    Installer
                  </button>
                </div>
              </div>
            </div>
          ),
          {
            duration: Infinity,
            position: "top-center",
          }
        );
      }
    };
    
    initializeIdentity();
    
    // Show PWA prompt after a delay
    const promptTimer = setTimeout(showPWAPrompt, 1000);
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    return () => {
      clearTimeout(fullscreenTimer);
      clearTimeout(promptTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [location]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
