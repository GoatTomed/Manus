import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Redeem from "./pages/Redeem";
import GetKey from "./pages/GetKey";
import Analytics from "./pages/Analytics";
import Scripts from "./pages/Scripts";
import VerificationError from "./pages/VerificationError";
import { useEffect, useState } from "react";
import axios from "axios";
import { nanoid } from "nanoid";
import { Loader2, Fingerprint } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/redeem" component={Redeem} />
      <Route path="/get-key" component={GetKey} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/scripts" component={Scripts} />
      <Route path="/verification-error" component={VerificationError} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "YouSuck";
    
    const initializeIdentity = async () => {
      // 1. Check if we already know this user
      let id = localStorage.getItem("ys_visitor_id") || 
               document.cookie.split('; ').find(row => row.startsWith('ys_visitor_id='))?.split('=')[1];
      
      if (!id) {
        // 2. New visitor! Show initialization overlay
        setIsInitializing(true);
        
        // Generate a hardware-based fingerprint
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
        
        // 3. Persist ID
        localStorage.setItem("ys_visitor_id", newId);
        document.cookie = `ys_visitor_id=${newId}; path=/; max-age=31536000; SameSite=Lax`;
        id = newId;
        
        // Brief delay for the effect
        setTimeout(() => setIsInitializing(false), 2500);
      }
      
      setVisitorId(id);

      // 4. Track visit (once per session)
      const hasTrackedInSession = sessionStorage.getItem("has_tracked_visit");
      if (!hasTrackedInSession && id) {
        try {
          await axios.post("/api/track-visit", { 
            path: window.location.pathname,
            visitorId: id
          });
          sessionStorage.setItem("has_tracked_visit", "true");
        } catch (e) {
          console.error("Tracking failed");
        }
      }
    };
    
    initializeIdentity();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          
          {/* Identity Initialization Overlay */}
          {isInitializing && (
            <div className="fixed inset-0 z-[9999] bg-[#05070a] flex flex-col items-center justify-center text-white p-6">
              <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-[#00ABFF]/20 blur-2xl rounded-full animate-pulse"></div>
                  <div className="relative bg-white/5 border border-white/10 rounded-3xl w-full h-full flex items-center justify-center">
                    <Fingerprint className="text-[#00ABFF] animate-pulse" size={48} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold uppercase tracking-widest">Securing Identity</h2>
                  <p className="text-gray-500 text-sm font-medium tracking-tight px-4">
                    Generating your unique system identifier for secure access...
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-[#00ABFF] h-full animate-progress-loading"></div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#00ABFF] uppercase tracking-[0.3em]">
                    <Loader2 className="animate-spin" size={12} />
                    Syncing Protocol
                  </div>
                </div>
              </div>
            </div>
          )}

          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
