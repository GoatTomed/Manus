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
const SESSION_EXPIRY_MINUTES = 30;
// Note: In Vercel, VERCEL_URL is available. For production, use your actual domain.
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

// --- Rate Limiting ---
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 session attempts per 15 mins
  message: { error: "Too many session attempts. Please wait 15 minutes." },
});

app.use(globalLimiter);
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
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

const generateToken = () => crypto.randomBytes(32).toString('hex');

// --- Routes ---

// 1. START FLOW: Create session & generate EarnPaste link
app.post("/api/get-key/start", sessionLimiter, async (req: any, res: any) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ error: "Missing visitorId" });

    const ip = getClientIp(req);
    const sessionId = crypto.randomUUID();
    const secretToken = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MINUTES * 60000).toISOString();

    // Store session in Supabase
    const { error: sessionError } = await supabase.from('sessions').insert([{
      id: sessionId,
      visitor_id: visitorId,
      ip_address: ip,
      step: 'started',
      secret_token: secretToken,
      expires_at: expiresAt
    }]);

    if (sessionError) {
      console.error("Supabase Session Insert Error:", sessionError);
      return res.status(500).json({ error: `Database error: ${sessionError.message}` });
    }

    // Create EarnPaste link wrapping our callback
    // This callback is what prevents bypass: it must be called by the browser after locker completion
    const callbackUrl = `${BASE_URL}/api/get-key/verify?session=${sessionId}&token=${secretToken}&step=1`;
    
    const epResponse = await axios.post(EARNPASTE_API_URL, {
      targetUrl: callbackUrl,
      timer: 15
    }, {
      headers: { "X-API-Key": EARNPASTE_API_KEY }
    });

    if (!epResponse.data.url) {
      console.error("EarnPaste API Response Error:", epResponse.data);
      return res.status(500).json({ error: "Failed to generate locker link from EarnPaste" });
    }

    res.json({ earnPasteUrl: epResponse.data.url, sessionId });
  } catch (e: any) {
    console.error("Start Error:", e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. VERIFY CALLBACK: Called by EarnPaste after locker completion
// This route is the ONLY way to advance session state
app.get("/api/get-key/verify", async (req: any, res: any) => {
  try {
    const { session, token, step } = req.query;

    // 1. Validate session & token
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session)
      .eq('secret_token', token)
      .single();

    if (fetchError || !sessionData) {
      return res.status(403).send("Invalid or expired verification session.");
    }

    // 2. Check expiry
    if (new Date(sessionData.expires_at) < new Date()) {
      return res.status(403).send("Session expired. Please restart.");
    }

    // 3. Update state based on step
    let nextStep = sessionData.step;
    let redirectUrl = `/get-key`; // Relative redirect for frontend

    if (step === '1' && sessionData.step === 'started') {
      nextStep = 'step1_verified';
      redirectUrl += `?step=2&session=${session}`;
    } else if (step === '2' && sessionData.step === 'step1_verified') {
      nextStep = 'completed';
      redirectUrl += `?completed=true&session=${session}`;
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update({ step: nextStep, secret_token: generateToken() }) // Rotate token for next step security
      .eq('id', session);

    if (updateError) throw updateError;

    // 4. Redirect back to frontend
    res.redirect(redirectUrl);
  } catch (e: any) {
    res.status(500).send("Verification Error");
  }
});

// 3. STEP 2: Generate second locker link
app.post("/api/get-key/step2", sessionLimiter, async (req: any, res: any) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    // Verify session state: MUST be step1_verified
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !sessionData || sessionData.step !== 'step1_verified') {
      return res.status(403).json({ error: "Please complete Step 1 first." });
    }

    if (new Date(sessionData.expires_at) < new Date()) {
      return res.status(403).json({ error: "Session expired." });
    }

    const callbackUrl = `${BASE_URL}/api/get-key/verify?session=${sessionId}&token=${sessionData.secret_token}&step=2`;
    
    const epResponse = await axios.post(EARNPASTE_API_URL, {
      targetUrl: callbackUrl,
      timer: 15
    }, {
      headers: { "X-API-Key": EARNPASTE_API_KEY }
    });

    res.json({ earnPasteUrl: epResponse.data.url });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. RESULT: Grant the key only if session is 'completed'
app.get("/api/get-key/result/:sessionId", async (req: any, res: any) => {
  try {
    const { sessionId } = req.params;
    const { visitorId } = req.query;

    // 1. Verify session is actually completed in DB
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData || sessionData.step !== 'completed') {
      return res.status(403).json({ error: "Verification incomplete or bypassed." });
    }

    if (sessionData.visitor_id !== visitorId) {
      return res.status(403).json({ error: "Visitor ID mismatch." });
    }

    // 2. Logic to fetch or generate key
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
    
    // 3. Invalidate session after use to prevent reuse
    await supabase.from('sessions').delete().eq('id', sessionId);

    res.json({ key: newKey.key_value, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Existing check route
app.get("/api/get-key/check", async (req: any, res: any) => {
  try {
    const { visitorId } = req.query;
    if (!visitorId) return res.json({ hasKey: false });
    
    const { data } = await supabase.from("keys").select("*").eq("visitor_id", visitorId).single();
    if (data) {
      const expiry = new Date(new Date(data.created_at).getTime() + 24 * 60 * 60 * 1000);
      if (expiry > new Date()) {
        return res.json({ hasKey: true, key: data.key_value, expiresAt: expiry.toISOString() });
      }
    }
    res.json({ hasKey: false });
  } catch (e) {
    res.json({ hasKey: false });
  }
});

// Cleanup task for expired sessions
app.get("/api/admin/cleanup-sessions", async (req: any, res: any) => {
  const { error } = await supabase.from('sessions').delete().lt('expires_at', new Date().toISOString());
  res.json({ success: !error });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
