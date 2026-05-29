import express from "express";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import crypto from "crypto";

const app = express();
app.use(express.json());

// IP-based access control for analytics
const ALLOWED_IP = process.env.ALLOWED_IP || "144.168.52.250";

// Helper to get client IP
const getClientIp = (req: any) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
};

// Dedicated route for tracking page views from frontend
app.post("/api/track-visit", async (req: any, res: any) => {
  try {
    const { path } = req.body;
    const cleanIp = getClientIp(req);
    const ipHash = crypto.createHash('sha256').update(cleanIp).digest('hex');
    
    await supabase.from('page_views').insert({
      path: path || '/',
      ip_hash: ipHash,
      user_agent: req.headers['user-agent'] || 'unknown',
      ip_address: cleanIp 
    });
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Tracking failed" });
  }
});

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

    res.json({ sessionId, verificationHash });
  } catch (error: any) {
    console.error("Global API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/v/:hash", async (req: any, res: any) => {
  try {
    const { hash } = req.params;

    const { data, error: sbError } = await supabase
      .from("key_sessions")
      .select("*")
      .match({ step1_token: hash, status: "step1_pending" })
      .single();

    if (sbError || !data) {
      const { data: step2Data, error: step2Error } = await supabase
        .from("key_sessions")
        .select("*")
        .match({ step2_token: hash, status: "step1_completed" })
        .single();

      if (step2Error || !step2Data) {
        return res.redirect(`${APP_URL}/verification-error`);
      }

      const finalKey = `YS-${nanoid(8).toUpperCase()}-${nanoid(8).toUpperCase()}`;

      const { error: updateError } = await supabase
        .from("key_sessions")
        .update({
          status: "completed",
          generated_key: finalKey,
          completed_at: new Date().toISOString(),
        })
        .match({ id: step2Data.id, step2_token: hash, status: "step1_completed" });

      if (updateError) {
        return res.status(500).send("Internal Error");
      }

      await supabase.from("keys").insert({ key_value: finalKey, is_used: false });
      return res.redirect(`${APP_URL}/get-key?session=${step2Data.id}&completed=true`);
    }

    const newHash = generateVerificationHash();

    const { error: updateError } = await supabase
      .from("key_sessions")
      .update({
        status: "step1_completed",
        step2_token: newHash, 
      })
      .match({ id: data.id, step1_token: hash, status: "step1_pending" });

    if (updateError) {
      return res.status(500).send("Internal Error");
    }

    res.redirect(`${APP_URL}/get-key?session=${data.id}&step=2`);
  } catch (error: any) {
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
      return res.status(400).json({ error: "Session not found or incomplete" });
    }

    res.json({ verificationHash: data.step2_token });
  } catch (error: any) {
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
      return res.status(404).json({ error: "Key not found" });
    }
    res.json({ key: data?.generated_key });
  } catch (error: any) {
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
    res.status(500).json({ error: "Internal Error" });
  }
});

// Middleware for analytics authorization
const authorizeAnalytics = (req: any, res: any, next: any) => {
  const clientIp = getClientIp(req);
  if (ALLOWED_IP !== "OFF" && clientIp !== ALLOWED_IP && !process.env.DEV_MODE) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

app.post("/api/analytics/modify", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const { amount, type } = req.body;
    const count = Math.abs(parseInt(amount));

    if (type === 'add') {
      const dummyRecords = Array.from({ length: count }, () => ({
        path: '/manual/added',
        ip_hash: 'manual',
        ip_address: '0.0.0.0',
        user_agent: 'manual-bot'
      }));
      
      for (let i = 0; i < dummyRecords.length; i += 100) {
        await supabase.from('page_views').insert(dummyRecords.slice(i, i + 100));
      }
    } else if (type === 'remove') {
      const { data: recordsToDelete } = await supabase
        .from('page_views')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(count);

      if (recordsToDelete && recordsToDelete.length > 0) {
        const ids = recordsToDelete.map(r => r.id);
        await supabase.from('page_views').delete().in('id', ids);
      }
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Modification failed" });
  }
});

app.get("/api/analytics", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { count: totalViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
    const { count: totalKeys } = await supabase.from('keys').select('*', { count: 'exact', head: true });
    const { count: usedKeys } = await supabase.from('keys').select('*', { count: 'exact', head: true }).eq('is_used', true);
    
    const { data: paginatedVisits } = await supabase
      .from('page_views')
      .select('ip_address, path, created_at')
      .order('created_at', { ascending: false })
      .range(start, end);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: graphData } = await supabase
      .from('page_views')
      .select('ip_address, created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Corrected unique visitors logic: use distinct ip_address count
    const { data: uniqueIpsData } = await supabase.rpc('get_unique_visitors_count');
    let uniqueVisitors = 0;
    
    if (uniqueIpsData !== null) {
      uniqueVisitors = uniqueIpsData;
    } else {
      // Fallback if RPC is not available
      const { data: allIps } = await supabase.from('page_views').select('ip_address');
      uniqueVisitors = new Set(allIps?.map(v => v.ip_address || 'unknown')).size;
    }

    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayViews = graphData?.filter(v => v.created_at.startsWith(dateStr)) || [];
      const dayUniqueIps = new Set(dayViews.map(v => v.ip_address || 'unknown'));
      return { date: dateStr, views: dayUniqueIps.size };
    }).reverse();

    res.json({
      totalViews: totalViews || 0,
      uniqueVisitors,
      totalKeys: totalKeys || 0,
      usedKeys: usedKeys || 0,
      dailyStats,
      recentVisits: paginatedVisits || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((totalViews || 0) / pageSize),
        totalItems: totalViews || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

export default app;
