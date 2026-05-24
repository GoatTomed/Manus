import express from "express";
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import axios from "axios";

const app = express();
app.use(express.json());

const router = Router();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || "https://dioqtcgvxqjvneqozraa.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const EARNPASTE_API_KEY = process.env.EARNPASTE_API_KEY || "ep_1fc0807b695b99c7f244b4d0dd6ac65bd49085dc6a6a2cd2";
const EARNPASTE_API_URL = "https://us-central1-earnpaste-3cd5a.cloudfunctions.net/apiCreatePaste";
const APP_URL = process.env.APP_URL || "https://yoursuck.vercel.app";

// Step 1: Create a session and get the first EarnPaste link
router.post("/get-key/start", async (req, res) => {
  try {
    const sessionId = nanoid();
    const step1Token = nanoid();
    const { error } = await supabase.from("key_sessions").insert({ id: sessionId, step1_token: step1Token, status: "step1_pending" });
    if (error) throw error;
    const targetUrl = `${APP_URL}/api/get-key/verify-step1?token=${step1Token}&session=${sessionId}`;
    const response = await axios.post(EARNPASTE_API_URL, { targetUrl, timer: 15 }, { headers: { "X-API-Key": EARNPASTE_API_KEY } });
    if (response.data.url) res.json({ sessionId, earnPasteUrl: response.data.url });
    else throw new Error(response.data.error || "Failed to create EarnPaste link");
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Step 2: Verify Step 1
router.get("/get-key/verify-step1", async (req, res) => {
  const { token, session } = req.query;
  try {
    const { data, error } = await supabase.from("key_sessions").update({ status: "step1_completed", step2_token: nanoid() }).match({ id: session, step1_token: token, status: "step1_pending" }).select().single();
    if (error || !data) return res.status(400).send("Invalid or expired session step.");
    res.redirect(`${APP_URL}/get-key?session=${session}&step=2`);
  } catch (error: any) { res.status(500).send("Server error during verification."); }
});

// Step 3: Get Step 2 link
router.post("/get-key/step2", async (req, res) => {
  const { sessionId } = req.body;
  try {
    const { data, error } = await supabase.from("key_sessions").select("step2_token").match({ id: sessionId, status: "step1_completed" }).single();
    if (error || !data) throw new Error("Invalid session state");
    const targetUrl = `${APP_URL}/api/get-key/verify-step2?token=${data.step2_token}&session=${sessionId}`;
    const response = await axios.post(EARNPASTE_API_URL, { targetUrl, timer: 15 }, { headers: { "X-API-Key": EARNPASTE_API_KEY } });
    if (response.data.url) res.json({ earnPasteUrl: response.data.url });
    else throw new Error("Failed to create Step 2 link");
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Step 4: Verify Step 2
router.get("/get-key/verify-step2", async (req, res) => {
  const { token, session } = req.query;
  try {
    const finalKey = `YS-${nanoid(8).toUpperCase()}-${nanoid(8).toUpperCase()}`;
    const { data, error } = await supabase.from("key_sessions").update({ status: "completed", generated_key: finalKey, completed_at: new Date().toISOString() }).match({ id: session, step2_token: token, status: "step1_completed" }).select().single();
    if (error || !data) return res.status(400).send("Invalid or expired session step.");
    await supabase.from("keys").insert({ key_value: finalKey, created_at: new Date().toISOString(), is_used: false });
    res.redirect(`${APP_URL}/get-key?session=${session}&completed=true`);
  } catch (error: any) { res.status(500).send("Server error during final verification."); }
});

// Result
router.get("/get-key/result/:sessionId", async (req, res) => {
  try {
    const { data, error } = await supabase.from("key_sessions").select("generated_key, status").match({ id: req.params.sessionId, status: "completed" }).single();
    if (error || !data) return res.status(404).json({ error: "Key not found" });
    res.json({ key: data.generated_key });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Redeem
router.post("/redeem", async (req, res) => {
  try {
    const { data, error } = await supabase.from("keys").select("*").match({ key_value: req.body.key, is_used: false }).single();
    if (error || !data) return res.status(400).json({ error: "Invalid or already used key" });
    await supabase.from("keys").update({ is_used: true, used_at: new Date().toISOString() }).match({ key_value: req.body.key });
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.use("/api", router);

export default app;
