import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

import GetKey from "./pages/GetKey";
import Analytics from "./pages/Analytics";
import UsersPage from "./pages/UsersPage";
import Banned from "./pages/Banned";
// Scripts page removed
import Key from "./pages/Key";
import VerificationError from "./pages/VerificationError";
// Edit page removed
import KeyAdmin from "./pages/KeyAdmin";
import Executors from "./pages/Executors";
import { useEffect, useState } from "react";
import axios from "axios";
import { nanoid } from "nanoid";
import { Loader2, Fingerprint } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      <Route path="/get-key" component={GetKey} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/users" component={UsersPage} />
      <Route path="/banned" component={Banned} />
      {/* /scripts route removed */}
      <Route path="/key" component={Key} />
      <Route path="/verification-error" component={VerificationError} />
      {/* /edit route removed */}
      <Route path="/key-admin" component={KeyAdmin} />
      <Route path="/executors" component={Executors} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [location, setLocation] = useLocation();

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
        
        // No delay here, we handle loading screen in Home.tsx
        setIsInitializing(false);
      }
      
      setVisitorId(id);

      // 4. Track visit (once per session)
      const hasTracked = sessionStorage.getItem(`tracked_${window.location.pathname}`);
      if (!hasTracked) {
        try {
          const res = await axios.post("/api/track-visit", { 
            path: window.location.pathname,
            visitorId: id
          });
          
          if (res.data.isBanned) {
            localStorage.setItem("ban_reason", res.data.banRecord.reason);
            localStorage.setItem("ban_date", res.data.banRecord.banned_at);
            if (window.location.pathname !== "/banned") {
              setLocation("/banned");
            }
          } else {
            localStorage.removeItem("ban_reason");
            localStorage.removeItem("ban_date");
            if (window.location.pathname === "/banned") {
              setLocation("/");
            }
            sessionStorage.setItem(`tracked_${window.location.pathname}`, "true");
          }
        } catch (e) {
          console.error("Tracking failed:", e instanceof Error ? e.message : String(e));
        }
      }
    };
    
    initializeIdentity();
  }, []);

  // Background ban status check every 1 second
  useEffect(() => {
    if (!visitorId) return;

    const checkBanStatus = async () => {
      try {
        const res = await axios.post("/api/track-visit", {
          path: window.location.pathname,
          visitorId: visitorId,
        });

        if (res.data.isBanned) {
          localStorage.setItem("ban_reason", res.data.banRecord.reason);
          localStorage.setItem("ban_date", res.data.banRecord.banned_at);
          if (window.location.pathname !== "/banned") {
            setLocation("/banned");
          }
        } else {
          localStorage.removeItem("ban_reason");
          localStorage.removeItem("ban_date");
          if (window.location.pathname === "/banned") {
            setLocation("/");
          }
        }
      } catch (e) {
        // Silent fail - don't interrupt user experience
        console.error("Ban check failed:", e instanceof Error ? e.message : String(e));
      }
    };

    // Check ban status every 1 second
    const interval = setInterval(checkBanStatus, 1000);
    return () => clearInterval(interval);
  }, [visitorId, setLocation]);
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
