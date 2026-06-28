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
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
const ALLOWED_IP = "24.49.252.230";
const DEV_MODE = process.env.NODE_ENV === "development";

// --- Rate Limiting ---
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: { error: "Too many requests" },
});

app.use(globalLimiter);
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

const generateToken = () => crypto.randomBytes(32).toString('hex');

const authorizeAdmin = (req: any, res: any, next: any) => {
  const ip = getClientIp(req);
  if (!DEV_MODE && ip !== ALLOWED_IP) return res.status(403).json({ error: "Access Denied" });
  next();
};

// --- CLEAN ROUTES ---

app.get("/api/check-access", authorizeAdmin, (req: any, res: any) => {
  res.json({ allowed: true });
});

// 1. START FLOW
app.post("/api/get-key/start", async (req: any, res: any) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ error: "Missing visitorId" });

    const sessionId = crypto.randomUUID();
    const secretToken = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MINUTES * 60000).toISOString();

    const { error: sessionError } = await supabase.rpc('create_auth_session', {
      p_id: sessionId,
      p_visitor_id: visitorId,
      p_ip_address: getClientIp(req),
      p_step: 'started',
      p_secret_token: secretToken,
      p_expires_at: expiresAt
    });

    if (sessionError) return res.status(500).json({ error: `DB Error: ${sessionError.message}` });

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
    const { data: sessionData, error: fetchError } = await supabase
      .from('auth_sessions').select('*').eq('id', session).eq('secret_token', token).single();

    if (fetchError || !sessionData) return res.status(403).send("Invalid Session");

    let nextStep = sessionData.step;
    let redirectUrl = `/get-key`;

    if (step === '1' && sessionData.step === 'started') {
      nextStep = 'step1_verified';
      redirectUrl += `?step=2&session=${session}`;
    } else if (step === '2' && sessionData.step === 'step1_verified') {
      nextStep = 'completed';
      redirectUrl += `?completed=true&session=${session}`;
    }

    await supabase.from('auth_sessions').update({ step: nextStep, secret_token: generateToken() }).eq('id', session);
    res.redirect(redirectUrl);
  } catch (e: any) {
    res.status(500).send("Verify Error");
  }
});

// 3. STEP 2
app.post("/api/get-key/step2", async (req: any, res: any) => {
  try {
    const { sessionId } = req.body;
    const { data: sessionData, error: fetchError } = await supabase
      .from('auth_sessions').select('*').eq('id', sessionId).single();

    if (fetchError || !sessionData || sessionData.step !== 'step1_verified') {
      return res.status(403).json({ error: "Step 1 not verified" });
    }

    const callbackUrl = `${BASE_URL}/api/get-key/verify?session=${sessionId}&token=${sessionData.secret_token}&step=2`;
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

    const { data: sessionData, error: sessionError } = await supabase
      .from('auth_sessions').select('*').eq('id', sessionId).single();

    if (sessionError || !sessionData || sessionData.step !== 'completed') {
      return res.status(403).json({ error: "Incomplete" });
    }

    const { data: existingKey } = await supabase.from("keys").select("*").eq("visitor_id", visitorId).single();

    if (existingKey) {
      const { data: updatedKey } = await supabase.from("keys").update({ created_at: new Date().toISOString(), is_used: false }).eq("id", existingKey.id).select().single();
      return res.json({ key: updatedKey.key_value, expiresAt: new Date(Date.now() + 86400000).toISOString() });
    }

    const newKeyVal = `YS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const { data: newKey } = await supabase.from("keys").insert([{ key_value: newKeyVal, visitor_id: visitorId, is_used: false }]).select().single();
    
    await supabase.from('auth_sessions').delete().eq('id', sessionId);
    res.json({ key: newKey.key_value, expiresAt: new Date(Date.now() + 86400000).toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/generate-key", authorizeAdmin, async (req: any, res: any) => {
  try {
    const { visitorId } = req.body;
    const keyValue = `YS-ADMIN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const { data } = await supabase.from("keys").insert([{ key_value: keyValue, visitor_id: visitorId, is_used: false }]).select().single();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/get-key/check", async (req: any, res: any) => {
  try {
    const { visitorId } = req.query;
    const { data } = await supabase.from("keys").select("*").eq("visitor_id", visitorId).single();
    if (data) {
      const expiry = new Date(new Date(data.created_at).getTime() + 86400000);
      if (expiry > new Date()) return res.json({ hasKey: true, key: data.key_value, expiresAt: expiry.toISOString() });
    }
    res.json({ hasKey: false });
  } catch (e) { res.json({ hasKey: false }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
