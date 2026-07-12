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
import Verify from "./pages/Verify";
import { useEffect } from "react";
import { nanoid } from "nanoid";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/access" component={GetKey} />
      <Route path="/verify" component={Verify} />
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

    const fullscreenTimer = setTimeout(requestFullscreen, 500);

    const initializeIdentity = () => {
      let id =
        localStorage.getItem("ys_visitor_id") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("ys_visitor_id="))
          ?.split("=")[1];

      if (!id) {
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const userAgent = navigator.userAgent;
        const language = navigator.language;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const rawSignature = `${screenRes}|${userAgent}|${language}|${timezone}`;

        let hash = 0;
        for (let i = 0; i < rawSignature.length; i++) {
          const char = rawSignature.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }

        const newId = `USER-${Math.abs(hash)
          .toString(16)
          .toUpperCase()}-${nanoid(4).toUpperCase()}`;
        localStorage.setItem("ys_visitor_id", newId);
        document.cookie = `ys_visitor_id=${newId}; path=/; max-age=31536000; SameSite=Lax`;
      }
    };

    initializeIdentity();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(fullscreenTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

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
