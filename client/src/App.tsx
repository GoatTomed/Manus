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
import { useEffect } from "react";
import axios from "axios";
import { nanoid } from "nanoid";

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
  useEffect(() => {
    document.title = "YouSuck";
    
    // Advanced Fingerprinting: Identify who is who
    const getFingerprint = () => {
      // Create a signature based on browser/hardware characteristics
      const screenRes = `${window.screen.width}x${window.screen.height}`;
      const userAgent = navigator.userAgent;
      const language = navigator.language;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const hardwareConcurrency = navigator.hardwareConcurrency || "unknown";
      
      // Combine features into a single string
      const rawSignature = `${screenRes}|${userAgent}|${language}|${timezone}|${hardwareConcurrency}`;
      
      // Simple hash function for the signature
      let hash = 0;
      for (let i = 0; i < rawSignature.length; i++) {
        const char = rawSignature.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return `FP-${Math.abs(hash).toString(16)}`;
    };

    const trackVisit = async () => {
      // 1. Check for existing ID in multiple storages
      let visitorId = localStorage.getItem("ys_visitor_id") || 
                      document.cookie.split('; ').find(row => row.startsWith('ys_visitor_id='))?.split('=')[1];
      
      // 2. If no ID, combine with browser fingerprint for uniqueness
      if (!visitorId) {
        const fingerprint = getFingerprint();
        visitorId = `${fingerprint}-${nanoid(8)}`;
        
        // 3. Persist ID everywhere
        localStorage.setItem("ys_visitor_id", visitorId);
        document.cookie = `ys_visitor_id=${visitorId}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // 4. Only track once per session to avoid duplicate hits
      const hasTrackedInSession = sessionStorage.getItem("has_tracked_visit");
      if (hasTrackedInSession) return;

      try {
        await axios.post("/api/track-visit", { 
          path: window.location.pathname,
          visitorId: visitorId
        });
        sessionStorage.setItem("has_tracked_visit", "true");
      } catch (e) {
        console.error("Analytics tracking failed");
      }
    };
    
    trackVisit();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
