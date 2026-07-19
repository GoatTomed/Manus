import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Key, Copy, Check } from "lucide-react";

export default function KeyAdmin() {
  const [generatedKey, setGeneratedKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
            Admin keys are now available without IP gating.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
