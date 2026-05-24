import express from "express";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import crypto from "crypto";

const app = express();
app.use(express.json());

export const maxDuration = 30;

const supabaseUrl = process.env.SUPABASE_URL || "https://dioqtcgvxqjvneqozraa.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const APP_URL = process.env.APP_URL || "https://yoursuck.vercel.app";

// Generate cryptographic hash for one-time use
function generateVerificationHash(): string {
  return crypto.randomBytes(32).toString("hex");
}

app.post("/api/get-key/start", async (req: any, res: any) => {
  try {
    const sessionId = nanoid();
    const verificationHash = generateVerificationHash();

    console.log(`Starting session: ${sessionId}`);

    const { error: sbError } = await supabase.from("key_sessions").insert({
      id: sessionId,
      step1_token: verificationHash,
      status: "step1_pending",
    });

    if (sbError) {
      console.error("Supabase Error:", sbError);
      return res.status(500).json({ error: `Database error: ${sbError.message}` });
    }

    // Return sessionId and verification hash for client-side link generation
    res.json({ sessionId, verificationHash });
  } catch (error: any) {
    console.error("Global API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generic verification endpoint - handles any verification hash
app.get("/api/v/:hash", async (req: any, res: any) => {
  try {
    const { hash } = req.params;

    // Find the session with this verification hash
    const { data, error: sbError } = await supabase
      .from("key_sessions")
      .select("*")
      .match({ step1_token: hash, status: "step1_pending" })
      .single();

    if (sbError || !data) {
      // Check if it's a step2 verification
      const { data: step2Data, error: step2Error } = await supabase
        .from("key_sessions")
        .select("*")
        .match({ step2_token: hash, status: "step1_completed" })
        .single();

      if (step2Error || !step2Data) {
        console.error("Verification Error:", sbError || step2Error);
        return res.status(400).send("Invalid or expired verification link");
      }

      // Step 2 verification - generate new hash for next step
      const newHash = generateVerificationHash();
      const finalKey = `YS-${nanoid(8).toUpperCase()}-${nanoid(8).toUpperCase()}`;

      const { error: updateError } = await supabase
        .from("key_sessions")
        .update({
          status: "completed",
          generated_key: finalKey,
          step2_token: null, // Invalidate this hash
          completed_at: new Date().toISOString(),
        })
        .match({ id: step2Data.id, step2_token: hash });

      if (updateError) {
        console.error("Update Error:", updateError);
        return res.status(500).send("Internal Error");
      }

      await supabase.from("keys").insert({ key_value: finalKey, is_used: false });

      // Redirect to result page
      return res.redirect(`${APP_URL}/get-key?session=${step2Data.id}&completed=true`);
    }

    // Step 1 verification - generate new hash for step 2
    const newHash = generateVerificationHash();

    const { error: updateError } = await supabase
      .from("key_sessions")
      .update({
        status: "step1_completed",
        step1_token: null, // Invalidate this hash
        step2_token: newHash, // Set new hash for step 2
      })
      .match({ id: data.id, step1_token: hash, status: "step1_pending" });

    if (updateError) {
      console.error("Update Error:", updateError);
      return res.status(500).send("Internal Error");
    }

    // Redirect to step 2 with session ID
    res.redirect(`${APP_URL}/get-key?session=${data.id}&step=2`);
  } catch (error: any) {
    console.error("Verification Global Error:", error);
    res.status(500).send("Internal Error");
  }
});

app.post("/api/get-key/step2", async (req: any, res: any) => {
  try {
    const { sessionId } = req.body;

    const { data, error: sbError } = await supabase
      .from("key_sessions")
      .select("step2_token")
      .match({ id: sessionId, status: "step1_completed" })
      .single();

    if (sbError || !data) {
      console.error("Step 2 Fetch Error:", sbError);
      return res.status(400).json({ error: "Session not found or incomplete" });
    }

    // Return the verification hash for step 2
    res.json({ verificationHash: data.step2_token });
  } catch (error: any) {
    console.error("Step 2 Global Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/get-key/result/:sessionId", async (req: any, res: any) => {
  try {
    const { data, error } = await supabase
      .from("key_sessions")
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
    const { data, error: sbError } = await supabase
      .from("keys")
      .select("*")
      .match({ key_value: req.body.key, is_used: false })
      .single();

    if (sbError || !data) {
      return res.status(400).json({ error: "Invalid or already used key" });
    }

    await supabase
      .from("keys")
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .match({ key_value: req.body.key });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Redeem Global Error:", error);
    res.status(500).json({ error: "Internal Error" });
  }
});

export default app;
