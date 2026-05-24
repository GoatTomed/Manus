import express from "express";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import axios from "axios";

const app = express();
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || "https://dioqtcgvxqjvneqozraa.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const EARNPASTE_API_KEY = process.env.EARNPASTE_API_KEY || "ep_1fc0807b695b99c7f244b4d0dd6ac65bd49085dc6a6a2cd2";
const EARNPASTE_API_URL = "https://us-central1-earnpaste-3cd5a.cloudfunctions.net/apiCreatePaste";
const APP_URL = process.env.APP_URL || "https://yoursuck.vercel.app";

app.post("/api/get-key/start", async (req: any, res: any) => {
  try {
    const sessionId = nanoid();
    const step1Token = nanoid();
    
    console.log(`Starting session: ${sessionId}`);
    
    // Test Supabase connection/insert
    const { error: sbError } = await supabase.from("key_sessions").insert({ 
      id: sessionId, 
      step1_token: step1Token, 
      status: "step1_pending" 
    });
    
    if (sbError) {
      console.error("Supabase Error:", sbError);
      return res.status(500).json({ error: `Database error: ${sbError.message}` });
    }

    const targetUrl = `${APP_URL}/api/get-key/verify-step1?token=${step1Token}&session=${sessionId}`;
    console.log(`Target URL for EarnPaste: ${targetUrl}`);

    try {
      const response = await axios.post(EARNPASTE_API_URL, 
        { targetUrl, timer: 15 }, 
        { headers: { "X-API-Key": EARNPASTE_API_KEY } }
      );
      res.json({ sessionId, earnPasteUrl: response.data.url });
    } catch (axiosError: any) {
      console.error("EarnPaste API Error:", axiosError.response?.data || axiosError.message);
      res.status(500).json({ error: "External API error (EarnPaste)" });
    }
  } catch (error: any) { 
    console.error("Global API Error:", error);
    res.status(500).json({ error: error.message }); 
  }
});

app.get("/api/get-key/verify-step1", async (req: any, res: any) => {
  try {
    const { token, session } = req.query;
    const { data, error } = await supabase.from("key_sessions")
      .update({ status: "step1_completed", step2_token: nanoid() })
      .match({ id: session, step1_token: token, status: "step1_pending" })
      .select().single();
      
    if (error || !data) {
      console.error("Verify Step 1 Error:", error);
      return res.status(400).send("Invalid session or token");
    }
    res.redirect(`${APP_URL}/get-key?session=${session}&step=2`);
  } catch (error: any) { 
    console.error("Verify Step 1 Global Error:", error);
    res.status(500).send("Internal Error"); 
  }
});

app.post("/api/get-key/step2", async (req: any, res: any) => {
  try {
    const { sessionId } = req.body;
    const { data, error: sbError } = await supabase.from("key_sessions")
      .select("step2_token")
      .match({ id: sessionId, status: "step1_completed" })
      .single();
      
    if (sbError || !data) {
      console.error("Step 2 Fetch Error:", sbError);
      return res.status(400).json({ error: "Session not found or incomplete" });
    }

    const targetUrl = `${APP_URL}/api/get-key/verify-step2?token=${data.step2_token}&session=${sessionId}`;
    
    try {
      const response = await axios.post(EARNPASTE_API_URL, 
        { targetUrl, timer: 15 }, 
        { headers: { "X-API-Key": EARNPASTE_API_KEY } }
      );
      res.json({ earnPasteUrl: response.data.url });
    } catch (axiosError: any) {
      console.error("EarnPaste API Error (Step 2):", axiosError.response?.data || axiosError.message);
      res.status(500).json({ error: "External API error (EarnPaste)" });
    }
  } catch (error: any) { 
    console.error("Step 2 Global Error:", error);
    res.status(500).json({ error: error.message }); 
  }
});

app.get("/api/get-key/verify-step2", async (req: any, res: any) => {
  try {
    const { token, session } = req.query;
    const finalKey = `YS-${nanoid(8).toUpperCase()}-${nanoid(8).toUpperCase()}`;
    
    const { data, error: sbError } = await supabase.from("key_sessions")
      .update({ status: "completed", generated_key: finalKey, completed_at: new Date().toISOString() })
      .match({ id: session, step2_token: token, status: "step1_completed" })
      .select().single();
      
    if (sbError || !data) {
      console.error("Verify Step 2 Error:", sbError);
      return res.status(400).send("Invalid session or token");
    }

    await supabase.from("keys").insert({ key_value: finalKey, is_used: false });
    res.redirect(`${APP_URL}/get-key?session=${session}&completed=true`);
  } catch (error: any) { 
    console.error("Verify Step 2 Global Error:", error);
    res.status(500).send("Internal Error"); 
  }
});

app.get("/api/get-key/result/:sessionId", async (req: any, res: any) => {
  try {
    const { data, error } = await supabase.from("key_sessions")
      .select("generated_key")
      .match({ id: req.params.sessionId, status: "completed" })
      .single();
    
    if (error) {
      console.error("Fetch Result Error:", error);
      return res.status(404).json({ error: "Key not found" });
    }
    res.json({ key: data?.generated_key });
  } catch (error: any) { 
    console.error("Fetch Result Global Error:", error);
    res.status(500).json({ error: "Internal Error" }); 
  }
});

app.post("/api/redeem", async (req: any, res: any) => {
  try {
    const { data, error: sbError } = await supabase.from("keys")
      .select("*")
      .match({ key_value: req.body.key, is_used: false })
      .single();
      
    if (sbError || !data) {
      return res.status(400).json({ error: "Invalid or already used key" });
    }
    
    await supabase.from("keys").update({ 
      is_used: true, 
      used_at: new Date().toISOString() 
    }).match({ key_value: req.body.key });
    
    res.json({ success: true });
  } catch (error: any) { 
    console.error("Redeem Global Error:", error);
    res.status(500).json({ error: "Internal Error" }); 
  }
});

export default app;
