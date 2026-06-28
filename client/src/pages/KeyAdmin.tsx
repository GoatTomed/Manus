import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Key, Copy, Check } from "lucide-react";
import { Link } from "wouter";

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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] text-white font-sans">
        <div className="flex flex-col items-center gap-6">
          {/* Logo / Icon matching the image */}
          <div className="w-20 h-20 relative">
             <img 
                src="https://firebasestorage.googleapis.com/v0/b/earnpaste-3cd5a.firebasestorage.app/o/assets%2Ficonfinal%20tiny.png?alt=media&token=780ed354-67b3-48a6-840e-c3312d21c0ef" 
                alt="Access Denied"
                className="w-full h-full object-contain"
             />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Access <span className="text-[#00ABFF]">Denied</span>
          </h1>
          
          <Link href="/">
            <button className="px-6 py-2 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] rounded-lg text-xs font-semibold text-zinc-400 transition-all uppercase tracking-widest">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    );
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
