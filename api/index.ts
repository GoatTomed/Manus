<<<<<<< HEAD
import express from "express";
=======
﻿import express from "express";
>>>>>>> 8b8a372c405c400df42484fb07ea7c9bf08015a7
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

<<<<<<< HEAD
function generateAdminKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomGroup = () => {
    const bytes = crypto.randomBytes(3);
    return Array.from(bytes, (b) => chars[b % chars.length]).join("");
  };
  return `${randomGroup()}-${randomGroup()}-${randomGroup()}`;
}

=======
>>>>>>> 8b8a372c405c400df42484fb07ea7c9bf08015a7
dotenv.config();

const app = express();

// Anti-DDoS & Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const actualIp = typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;
    return actualIp === "24.49.252.230";
  }
});

const keyGenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  handler: (req: any, res: any) => {
    res.status(429).json({ 
      error: "Too many attempts. Please wait 5 minutes before trying again.",
      retryAfter: 300
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' }
});

(async () => {
  try {
    const { error } = await supabase.from('connection_logs').select('count', { count: 'exact', head: true });
    if (error) console.error("Supabase Check:", error.message);
  } catch (e) {}
})();

const ALLOWED_IP = "24.49.252.230";
const DEV_MODE = process.env.NODE_ENV === "development";

const authorizeAnalytics = (req: any, res: any, next: any) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const actualIp = typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;
  if (!DEV_MODE && actualIp !== ALLOWED_IP) return res.status(403).json({ error: "Access Denied" });
  next();
};

app.get("/api/debug-supabase", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const url = process.env.SUPABASE_URL || "MISSING";
    const testLogs = await supabase.from('connection_logs').select('count', { count: 'exact', head: true });
    const testKeys = await supabase.from('keys').select('count', { count: 'exact', head: true });
    res.json({
      url_host: url.includes('supabase.co') ? url.split('//')[1].split('.')[0] : "unknown",
      connection_logs: testLogs.error ? { error: testLogs.error.message } : { success: true, count: testLogs.count },
      keys: testKeys.error ? { error: testKeys.error.message } : { success: true, count: testKeys.count }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/connection-logs", async (req: any, res: any) => {
  try {
    let result = await supabase.from("connection_logs").select("*").order("connected_at", { ascending: false }).limit(100);
    if (result.error) result = await supabase.from("connection_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (result.error) result = await supabase.from("connection_logs").select("*").limit(100);
    if (result.error) return res.status(500).json({ error: result.error.message });
    res.json(result.data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/keys", async (req: any, res: any) => {
  try {
    const { data, error } = await supabase.from("keys").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

<<<<<<< HEAD

app.delete("/api/analytics/keys/:keyValue", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const { keyValue } = req.params;
    const { error } = await supabase.from("keys").delete().eq("key_value", keyValue);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/check-access", authorizeAnalytics, (req: any, res: any) => {
  res.json({ allowed: true });
});
=======
>>>>>>> 8b8a372c405c400df42484fb07ea7c9bf08015a7
app.post("/api/get-key/start", keyGenLimiter, async (req: any, res: any) => {
  try {
    const { visitorId } = req.body;
    const sessionId = crypto.randomUUID();
    res.json({ sessionId });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/get-key/check", async (req: any, res: any) => {
  res.json({ success: true });
});

app.get("/api/get-key/result/:sessionId", async (req: any, res: any) => {
  try {
    const { visitorId } = req.query;
    if (!visitorId) return res.status(400).json({ error: "Missing visitorId" });

    const { data: existingKey } = await supabase.from("keys").select("*").eq("visitor_id", visitorId).single();

    if (existingKey) {
      const { data: updatedKey, error } = await supabase
        .from("keys")
        .update({ created_at: new Date().toISOString(), is_used: false })
        .eq("id", existingKey.id)
        .select()
        .single();
      
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ key: updatedKey.key_value, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
    }

    const newKeyValue = `YS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const { data: newKey, error } = await supabase
      .from("keys")
      .insert([{ key_value: newKeyValue, visitor_id: visitorId, is_used: false }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ key: newKey.key_value, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/admin/generate-key", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ error: "Missing visitorId" });

    const { data: existingKey } = await supabase.from("keys").select("*").eq("visitor_id", visitorId).single();

    if (existingKey) {
      const { data: updatedKey, error } = await supabase
        .from("keys")
        .update({ created_at: new Date().toISOString(), is_used: false })
        .eq("id", existingKey.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(updatedKey);
    }

<<<<<<< HEAD
    const keyValue = generateAdminKey();
=======
    const keyValue = `YS-ADMIN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
>>>>>>> 8b8a372c405c400df42484fb07ea7c9bf08015a7
    const { data, error } = await supabase
      .from("keys")
      .insert([{ key_value: keyValue, visitor_id: visitorId, is_used: false }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/track-visit", async (req: any, res: any) => {
  try {
    const { path, visitorId } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const ipHash = visitorId || crypto.createHash("sha256").update(String(ip)).digest("hex");

    const { data: banRecord } = await supabase.from("banned_users").select("*").eq("visitor_id", ipHash).single();
    if (banRecord) return res.json({ isBanned: true, banRecord });

    await supabase.from("page_views").insert([{ ip_hash: ipHash, path, user_agent: req.headers["user-agent"] }]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Force redeploy
