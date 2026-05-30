import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Redeem from "./pages/Redeem";
import GetKey from "./pages/GetKey";
import Analytics from "./pages/Analytics";
import UsersPage from "./pages/UsersPage";
import Banned from "./pages/Banned";
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
      <Route path="/users" component={UsersPage} />
      <Route path="/banned" component={Banned} />
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
        
        // Brief delay for the effect (reduced to 1100ms to match the overlay animation)
        setTimeout(() => setIsInitializing(false), 3000);
      }
      
      setVisitorId(id);

      // 4. Track visit (once per session)
      const hasTrackedInSession = sessionStorage.getItem("has_tracked_visit");
      if (id) {
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
            sessionStorage.setItem("has_tracked_visit", "true");
          }
        } catch (e) {
          console.error("Tracking failed");
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
          
          {/* Identity Initialization Overlay */}
          {isInitializing && (
            <>
              <style>{`
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(20px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "rgba(10,10,10,0.75)",
                    border: "1px solid rgba(0,171,255,0.2)",
                    borderRadius: 16,
                    padding: "40px 48px",
                    textAlign: "center",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 0 60px rgba(0,171,255,0.09)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      margin: "0 auto 28px",
                      width: 72,
                      height: 72,
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 22,
                        background: "rgba(0,171,255,0.08)",
                        border: "1px solid rgba(0,171,255,0.27)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#00ABFF",
                      }}
                    >
                      <Fingerprint size={36} strokeWidth={1.6} />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        inset: -10,
                        borderRadius: 34,
                        border: "3px solid transparent",
                        borderTopColor: "#00ABFF",
                        animation: "spin 800ms linear infinite",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#00ABFF",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Loading
                  </div>

                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fafafa",
                      letterSpacing: "-0.03em",
                      marginBottom: 8,
                    }}
                  >
                    Securing Identity
                  </div>

                  <div
                    style={{
                      fontSize: 13.5,
                      color: "rgba(255,255,255,0.35)",
                      minHeight: 40,
                    }}
                  >
                    Generating your unique system identifier...
                  </div>
                </div>
              </div>
            </>
          )}

          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
