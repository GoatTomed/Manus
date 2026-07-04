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
  const [pwaPromptShown, setPwaPromptShown] = useState(false);

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
    
    // Show PWA installation prompt
    const showPWAPrompt = () => {
      if (pwaPromptShown) return;
      
      const hasShownPrompt = localStorage.getItem("pwa_prompt_shown");
      if (hasShownPrompt) return;
      
      // Check if running on Windows (via user agent)
      const isWindows = navigator.userAgent.indexOf("Windows") > -1;
      
      if (isWindows) {
        setPwaPromptShown(true);
        toast.custom(
          (t) => (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-lg flex items-center justify-between gap-4 max-w-md">
              <div className="flex-1">
                <p className="font-semibold text-sm">Installer l'application ?</p>
                <p className="text-xs opacity-90 mt-1">Obtenez une meilleure expérience sans navigateur</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    localStorage.setItem("pwa_prompt_shown", "true");
                    toast.dismiss(t);
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                >
                  Non
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("pwa_prompt_shown", "true");
                    toast.dismiss(t);
                    // Trigger PWA install prompt if available
                    if ((window as any).deferredPrompt) {
                      (window as any).deferredPrompt.prompt();
                    }
                  }}
                  className="px-3 py-1 bg-white text-blue-600 hover:bg-gray-100 rounded text-xs font-medium transition-colors"
                >
                  Oui
                </button>
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
  }, [pwaPromptShown]);

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
