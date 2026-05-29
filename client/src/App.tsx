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
    
    // Track page visit
    const trackVisit = async () => {
      try {
        await axios.post("/api/track-visit", { 
          path: window.location.pathname 
        });
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
