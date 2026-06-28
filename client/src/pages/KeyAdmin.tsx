import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Key, Lock, Copy, Check } from "lucide-react";

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

  if (!accessChecked) return null;

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Your IP address is not authorized to access this panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Generate Admin Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!generatedKey ? (
            <Button
              className="w-full h-12 text-lg"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Generate Instant Key
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg border flex items-center justify-between">
                <code className="text-xl font-bold tracking-wider">{generatedKey}</code>
                <Button size="icon" variant="ghost" onClick={copyToClipboard}>
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setGeneratedKey("")}>
                Generate Another
              </Button>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            This key bypasses all timers and verification steps.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
