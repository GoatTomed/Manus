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
    // We'll use a special format for key_value to identify sessions
    const sessionId = crypto.randomUUID();
    const secretToken = crypto.randomBytes(16).toString('hex');
    
    // Store session info in a special key record
    // Using 'redeemed_by' instead of 'visitor_id' because 'visitor_id' column is missing from cache
    const sessionKey = `SESS1_${secretToken}`;
    const { error } = await supabase.from('keys').insert([{
      key_value: sessionKey,
      redeemed_by: sessionId, // Store sessionId here
      is_used: true, // Mark as used so it doesn't show up as a real key
      generated_by: visitorId // Temporarily store visitorId here if needed
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
    
    // Find the session record in 'keys' table
    const { data: sessionData, error } = await supabase
      .from('keys')
      .select('*')
      .eq('redeemed_by', session)
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
      .eq('redeemed_by', sessionId)
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
      .eq('redeemed_by', sessionId)
      .like('key_value', 'COMPLETED_%')
      .single();

    if (error || !sessionData) return res.status(403).json({ error: "Incomplete" });

    // Clean up the session record
    await supabase.from('keys').delete().eq('id', sessionData.id);

    // Generate or refresh real key
    // Using 'redeemed_by' instead of 'visitor_id'
    const { data: existingKey } = await supabase.from("keys").select("*").eq("redeemed_by", visitorId).eq("is_used", false).single();

    if (existingKey) {
      return res.json({ key: existingKey.key_value, expiresAt: new Date(new Date(existingKey.created_at).getTime() + 86400000).toISOString() });
    }

    const newKeyVal = `YS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const { data: newKey, error: insertError } = await supabase.from("keys").insert([{ 
      key_value: newKeyVal, 
      redeemed_by: visitorId, 
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
      redeemed_by: visitorId, 
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
    // Using 'redeemed_by' instead of 'visitor_id'
    const { data } = await supabase.from("keys").select("*").eq("redeemed_by", visitorId).eq("is_used", false).single();
    if (data) {
      const expiry = new Date(new Date(data.created_at).getTime() + 86400000);
      if (expiry > new Date()) return res.json({ hasKey: true, key: data.key_value, expiresAt: expiry.toISOString() });
    }
    res.json({ hasKey: false });
  } catch (e) { res.json({ hasKey: false }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
