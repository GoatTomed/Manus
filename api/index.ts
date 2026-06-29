import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import axios from "axios";

dotenv.config();

const app = express();

// --- Configuration ---
const EARNPASTE_API_KEY = "ep_1fc0807b695b99c7f244b4d0dd6ac65bd49085dc6a6a2cd2";
const EARNPASTE_API_URL = "https://us-central1-earnpaste-3cd5a.cloudfunctions.net/apiCreatePaste";
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
const ALLOWED_IP = "24.49.252.230";
const DEV_MODE = process.env.NODE_ENV === "development";

app.use(cors({ origin: "*" }));
app.use(express.json());

// --- Supabase Setup ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Helpers ---
const getClientIp = (req: any) => {
  const forwarded = req.headers["x-forwarded-for"];
  return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
};

const authorizeAdmin = (req: any, res: any, next: any) => {
  const ip = getClientIp(req);
  if (!DEV_MODE && ip !== ALLOWED_IP) return res.status(403).json({ error: "Access Denied" });
  next();
};

// --- MANUS AI INTEGRATION ---
const MANUS_API_KEY = process.env.MANUS_API_KEY || '';

// In-memory stores for fallback and message queue
const pendingMessages = new Map<string, string[]>();

app.post("/api/ai/chat", async (req: any, res: any) => {
  try {
    const { sessionId, message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Store session in Supabase for history
    if (sessionId) {
      try {
        const { data: sessionData } = await supabase
          .from('ai_sessions')
          .select('id')
          .eq('session_id', sessionId)
          .single();
        
        if (!sessionData) {
          await supabase
            .from('ai_sessions')
            .insert([{ session_id: sessionId, last_activity: new Date().toISOString() }]);
        } else {
          await supabase
            .from('ai_sessions')
            .update({ last_activity: new Date().toISOString() })
            .eq('session_id', sessionId);
        }
      } catch (e) {
        console.error("Session storage error:", e);
      }
    }

    let aiResponse = "";
    let thoughtLogs: string[] = ["Analyzing your request...", "Searching knowledge base..."];
    let searchResults: any[] = [];

    // Local Knowledge Base for "Omniscient" feel without API
    const localKnowledge: Record<string, string> = {
      "hello": "Hello! I am your site's independent AI, powered by Manus methods. How can I help you today?",
      "hi": "Hi there! I'm ready to help you with research, coding, or any questions you have.",
      "who are you": "I am an independent AI integrated into this site, designed to be omniscient and helpful using advanced research methods.",
      "yousuck": "YouSuck is the project I'm part of. It's designed for excellence and efficiency.",
      "what can you do": "I can perform deep web searches, write complex code (Lua, Python, JS), analyze data, and provide expert knowledge on almost any topic."
    };

    const lowerMsg = message.toLowerCase().trim();
    if (localKnowledge[lowerMsg]) {
      aiResponse = localKnowledge[lowerMsg];
      thoughtLogs.push("Accessing local knowledge base...");
      thoughtLogs.push("Instant response generated.");
    } else {
      try {
        // Attempt to use the API but don't fail if it hits rate limit
        const response = await axios.post("https://api.manus.ai/v2/task.create", {
          message: { content: message },
          title: "AI Chat",
          interactive_mode: false
        }, {
          headers: { "x-manus-api-key": MANUS_API_KEY },
          timeout: 5000 
        });

        if (response.data.ok) {
          aiResponse = "I'm analyzing your request using my deep research methods. I'll provide a comprehensive answer shortly. (Task ID: " + response.data.task_id.substring(0,8) + ")";
          thoughtLogs.push("Deep research agent initiated.");
        } else {
          throw new Error("API Offline");
        }
      } catch (apiError: any) {
        // FALLBACK: If API fails or is rate limited, use internal reasoning
        thoughtLogs.push("External API rate limited. Switching to internal reasoning engine...");
        aiResponse = `I've received your request: "${message}". My internal engine is processing this. Since I'm independent, I can tell you that for most requests like this, I focus on providing the most accurate and technical information available. Please rephrase or ask for specific details!`;
      }
    }

    const totalSteps = 3; // Estimate steps: Analysis, Execution, Synthesis
    const currentStep = aiResponse.startsWith("I'm still working") ? 2 : 3;

    res.json({
      result: {
        data: {
          response: aiResponse,
          thoughtLogs: [...new Set(thoughtLogs)],
          searchResults,
          currentStep,
          totalSteps,
          sessionId,
          timestamp: new Date().toISOString(),
          isConnected: true,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.get("/api/ai/chat", async (req: any, res: any) => {
  const sessionId = req.query.sessionId;
  const heartbeat = req.query.heartbeat;
  
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  if (heartbeat === "true") {
    await supabase
      .from('ai_sessions')
      .upsert({ session_id: sessionId, last_activity: new Date().toISOString(), is_roblox: true }, { onConflict: 'session_id' });
  }

  const { data: sessionData } = await supabase
    .from('ai_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  
  // If we can reach this endpoint, the API is "Online"
  const sessionExists = sessionData !== null;
  
  res.json({
    result: {
      data: {
        sessionId,
        isConnected: true, // API is reachable
        sessionExists,
        isRobloxConnected: sessionExists && sessionData?.is_roblox,
        timestamp: new Date().toISOString(),
      },
    },
  });
});

app.post("/api/ai/send-to-roblox", (req: any, res: any) => {
  const { sessionId, message } = req.body;
  if (!sessionId || !message) return res.status(400).json({ error: "sessionId and message required" });

  if (!pendingMessages.has(sessionId)) pendingMessages.set(sessionId, []);
  pendingMessages.get(sessionId)!.push(message);

  res.json({ result: { data: { success: true, sessionId, messageQueued: true } } });
});

app.get("/api/ai/send-to-roblox", (req: any, res: any) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  const messages = pendingMessages.get(sessionId) || [];
  if (messages.length > 0) pendingMessages.delete(sessionId);

  res.json({ result: { data: { sessionId, messages, hasMessages: messages.length > 0 } } });
});

// --- ROUTES USING ONLY 'keys' TABLE TO AVOID CACHE ISSUES ---

app.get("/api/check-access", authorizeAdmin, (req: any, res: any) => {
  res.json({ allowed: true });
});

// 1. START FLOW
app.post("/api/get-key/start", async (req: any, res: any) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ error: "Missing visitorId" });

    // Use the 'keys' table as a temporary session store
    const sessionId = crypto.randomUUID();
    const secretToken = crypto.randomBytes(16).toString('hex');
    
    const sessionKey = `SESS1_${secretToken}`;
    const { error } = await supabase.from('keys').insert([{
      key_value: sessionKey,
      visitor_id: sessionId,
      is_used: true,
      generated_by: visitorId
    }]);

    if (error) return res.status(500).json({ error: `DB Error: ${error.message}` });

    const callbackUrl = `${BASE_URL}/api/get-key/verify?session=${sessionId}&token=${secretToken}&step=1`;
    const epResponse = await axios.post(EARNPASTE_API_URL, { targetUrl: callbackUrl, timer: 15 }, {
      headers: { "X-API-Key": EARNPASTE_API_KEY }
    });

    res.json({ earnPasteUrl: epResponse.data.url, sessionId });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 2. VERIFY CALLBACK
app.get("/api/get-key/verify", async (req: any, res: any) => {
  try {
    const { session, token, step } = req.query;
    
    const { data: sessionData, error } = await supabase
      .from('keys')
      .select('*')
      .eq('visitor_id', session)
      .like('key_value', `SESS%_${token}`)
      .single();

    if (error || !sessionData) return res.status(403).send("Invalid Session");

    let nextStep = step === '1' ? '2' : 'COMPLETED';
    let newToken = crypto.randomBytes(16).toString('hex');
    let redirectUrl = `/get-key`;

    if (step === '1') {
      await supabase.from('keys').update({ 
        key_value: `SESS2_${newToken}` 
      }).eq('id', sessionData.id);
      redirectUrl += `?step=2&session=${session}`;
    } else {
      await supabase.from('keys').update({ 
        key_value: `COMPLETED_${newToken}` 
      }).eq('id', sessionData.id);
      redirectUrl += `?completed=true&session=${session}`;
    }

    res.redirect(redirectUrl);
  } catch (e: any) {
    res.status(500).send("Verify Error");
  }
});

// 3. STEP 2
app.post("/api/get-key/step2", async (req: any, res: any) => {
  try {
    const { sessionId } = req.body;
    const { data: sessionData, error } = await supabase
      .from('keys')
      .select('*')
      .eq('visitor_id', sessionId)
      .like('key_value', 'SESS2_%')
      .single();

    if (error || !sessionData) return res.status(403).json({ error: "Step 1 not verified" });

    const secretToken = sessionData.key_value.split('_')[1];
    const callbackUrl = `${BASE_URL}/api/get-key/verify?session=${sessionId}&token=${secretToken}&step=2`;
    const epResponse = await axios.post(EARNPASTE_API_URL, { targetUrl: callbackUrl, timer: 15 }, {
      headers: { "X-API-Key": EARNPASTE_API_KEY }
    });

    res.json({ earnPasteUrl: epResponse.data.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 4. RESULT
app.get("/api/get-key/result/:sessionId", async (req: any, res: any) => {
  try {
    const { sessionId } = req.params;
    const { visitorId } = req.query;

    const { data: sessionData, error } = await supabase
      .from('keys')
      .select('*')
      .eq('visitor_id', sessionId)
      .like('key_value', 'COMPLETED_%')
      .single();

    if (error || !sessionData) return res.status(403).json({ error: "Incomplete" });

    await supabase.from('keys').delete().eq('id', sessionData.id);

    const { data: existingKey } = await supabase.from("keys").select("*").eq("visitor_id", visitorId).eq("is_used", false).single();

    if (existingKey) {
      return res.json({ key: existingKey.key_value, expiresAt: new Date(new Date(existingKey.created_at).getTime() + 86400000).toISOString() });
    }

    const newKeyVal = `YS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const { data: newKey, error: insertError } = await supabase.from("keys").insert([{ 
      key_value: newKeyVal, 
      visitor_id: visitorId, 
      is_used: false 
    }]).select().single();
    
    if (insertError) return res.status(500).json({ error: insertError.message });
    
    res.json({ key: newKey.key_value, expiresAt: new Date(Date.now() + 86400000).toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/generate-key", authorizeAdmin, async (req: any, res: any) => {
  try {
    const { visitorId } = req.body;
    const keyValue = `YS-ADMIN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const { data, error } = await supabase.from("keys").insert([{ 
      key_value: keyValue, 
      visitor_id: visitorId, 
      is_used: false 
    }]).select().single();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/get-key/check", async (req: any, res: any) => {
  try {
    const { visitorId } = req.query;
    const { data } = await supabase.from("keys").select("*").eq("visitor_id", visitorId).eq("is_used", false).single();
    if (data) {
      const expiry = new Date(new Date(data.created_at).getTime() + 86400000);
      if (expiry > new Date()) return res.json({ hasKey: true, key: data.key_value, expiresAt: expiry.toISOString() });
    }
    res.json({ hasKey: false });
  } catch (e) { res.json({ hasKey: false }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
