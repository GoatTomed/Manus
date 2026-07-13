import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Key, Copy, Check } from "lucide-react";
import { Link } from "wouter";

const ALLOWED_IP = "24.49.252.230";

function AccessDenied() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      pulse: number;
      pulseSpeed: number;
    }[] = [];
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const createParticles = () => {
      const count = Math.min(50, Math.floor(window.innerWidth / 30));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const op = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${op})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(animate);
    };

    const onResize = () => {
      resize();
      createParticles();
    };

    resize();
    createParticles();
    animate();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans text-white"
      style={{ background: "#0a0a0f" }}
    >
      {/* base gradient */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.08) 0%, transparent 50%), linear-gradient(to bottom, #050508 0%, #0a0a0f 100%)",
        }}
      />
      {/* grid */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* dot accents */}
      <div
        className="fixed inset-0 z-[2]"
        style={{
          backgroundImage: "radial-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          backgroundPosition: "30px 30px",
        }}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[5] w-full h-full pointer-events-none"
        style={{ opacity: 0.6 }}
      />
      {/* vignette */}
      <div
        className="fixed inset-0 z-[3]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 8, 0.4) 100%)",
        }}
      />
      {/* scanlines */}
      <div
        className="fixed inset-0 z-[4] pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)",
        }}
      />
      <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1
          className="mb-6 leading-tight"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
        >
          <span className="font-light">Access </span>
          <span className="font-semibold" style={{ color: "#22d3ee" }}>
            Denied
          </span>
        </h1>
        <Link href="/">
          <a
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all"
            style={{
              border: "1px solid rgba(34, 211, 238, 0.3)",
              background: "rgba(34, 211, 238, 0.1)",
              color: "#22d3ee",
            }}
          >
            Return Home
          </a>
        </Link>
      </div>
    </div>
  );
}

export default function KeyAdmin() {
  const [accessChecked, setAccessChecked] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios
      .get("/api/check-access")
      .then(() => setAccessDenied(false))
      .catch(() => setAccessDenied(true))
      .finally(() => setAccessChecked(true));
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    const visitorId = localStorage.getItem("ys_visitor_id");
    try {
      const res = await axios.post("/api/admin/generate-key", { visitorId });
      setGeneratedKey(res.data.key_value);
      toast.success("Key generated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to generate key");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <Loader2 className="animate-spin text-[#00ABFF]" size={32} />
      </div>
    );
  }

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808] p-4">
      <Card className="w-full max-w-md bg-white/[0.02] border-white/[0.08] text-white">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#00ABFF]/10 rounded-full flex items-center justify-center mb-4 border border-[#00ABFF]/20">
            <Key className="w-6 h-6 text-[#00ABFF]" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Key Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!generatedKey ? (
            <Button
              className="w-full h-12 text-lg bg-[#00ABFF] hover:bg-[#0099EE] text-white border-none"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Generate Instant Key
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-lg border border-white/[0.08] flex items-center justify-between">
                <code className="text-xl font-bold tracking-wider text-[#00ABFF]">{generatedKey}</code>
                <Button size="icon" variant="ghost" onClick={copyToClipboard} className="hover:bg-white/5">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-zinc-400" />}
                </Button>
              </div>
              <Button variant="outline" className="w-full border-white/[0.08] hover:bg-white/5" onClick={() => setGeneratedKey("")}>
                Generate Another
              </Button>
            </div>
          )}
          <p className="text-center text-xs text-zinc-500">
            Authorized IP: <span className="text-zinc-400">{ALLOWED_IP}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
