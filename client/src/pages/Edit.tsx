import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Lock } from "lucide-react";

export default function Edit() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogin = async () => {
    if (password === "YouSuckTocson") {
      setIsAuthorized(true);
      fetchContent();
    } else {
      toast.error("Invalid Password");
    }
  };

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/file-content?password=${password}`);
      setContent(res.data.content);
    } catch (error) {
      toast.error("Failed to fetch content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (append: boolean) => {
    setIsSaving(true);
    try {
      await axios.post("/api/edit-file", {
        password,
        content: append ? content : content, // In manual mode, 'content' is the whole file
        append: false // We always overwrite with the current state of the textarea
      });
      toast.success("File saved successfully");
      fetchContent();
    } catch (error) {
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasteAppend = async () => {
    const pasteContent = await navigator.clipboard.readText();
    if (!pasteContent) {
      toast.error("Clipboard is empty");
      return;
    }
    
    setIsSaving(true);
    try {
      await axios.post("/api/edit-file", {
        password,
        content: "\n" + pasteContent,
        append: true
      });
      toast.success("Content appended successfully");
      fetchContent();
    } catch (error) {
      toast.error("Failed to append content");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Restricted Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button className="w-full" onClick={handleLogin}>
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit /yousuck.lua</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePasteAppend} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Paste & Append
            </Button>
            <Button onClick={() => handleSave(false)} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-[500px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Textarea
                className="min-h-[500px] font-mono text-sm p-4 resize-none border-none focus-visible:ring-0"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="File content..."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
