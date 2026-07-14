import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Test() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sessionId?: string; earnPasteUrl?: string; verifyUrl?: string } | null>(null);

  const simulateStep1 = async () => {
    setLoading(true);
    try {
      const visitorId = localStorage.getItem("ys_visitor_id") || "TEST-VISITOR";
      const response = await fetch("/api/access/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });
      const data = await response.json();
      setResult(data);
      toast.success("Step 1 initialized");
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize Step 1");
    } finally {
      setLoading(false);
    }
  };

  const simulateStep2 = async () => {
    if (!result?.sessionId) {
      toast.error("Please run Step 1 first to get a session ID");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/access/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: result.sessionId }),
      });
      const data = await response.json();
      setResult({ ...result, ...data });
      toast.success("Step 2 initialized");
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize Step 2");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-[#141414] border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Verification Simulator</CardTitle>
          <CardDescription className="text-white/60">
            Test the verification flow without going through Earnpaste.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={simulateStep1} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? "Processing..." : "Simulate Step 1"}
            </Button>
            <Button 
              onClick={simulateStep2} 
              disabled={loading || !result?.sessionId}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {loading ? "Processing..." : "Simulate Step 2"}
            </Button>
          </div>

          {result && (
            <div className="space-y-4 p-4 bg-black/40 rounded-xl border border-white/5 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Session ID</label>
                <div className="mt-1 font-mono text-sm text-blue-400">{result.sessionId}</div>
              </div>
              
              {result.verifyUrl && (
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Direct Verification URL (Bypass Earnpaste)</label>
                  <div className="mt-1 flex gap-2">
                    <Input 
                      readOnly 
                      value={result.verifyUrl} 
                      className="bg-black/50 border-white/10 text-xs font-mono"
                    />
                    <Button 
                      size="sm"
                      onClick={() => window.open(result.verifyUrl, "_blank")}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs"
                    >
                      Open
                    </Button>
                  </div>
                  <p className="mt-1 text-[10px] text-yellow-500/70 font-medium">
                    * Clicking this simulates coming back from Earnpaste to your site.
                  </p>
                </div>
              )}

              {result.earnPasteUrl && (
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Original Earnpaste URL</label>
                  <div className="mt-1 flex gap-2">
                    <Input 
                      readOnly 
                      value={result.earnPasteUrl} 
                      className="bg-black/50 border-white/10 text-xs font-mono text-white/40"
                    />
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(result.earnPasteUrl, "_blank")}
                      className="text-white/40 hover:text-white text-xs"
                    >
                      Test Original
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
