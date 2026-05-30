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
    const { path, visitorId } = req.body;
    const cleanIp = getClientIp(req);
    
    // We use ip_hash to store the most reliable ID: visitorId if provided, otherwise cleanIp
    const trackerId = visitorId || cleanIp;
    
    // Check if banned
    const { data: banRecord } = await supabase
      .from('banned_users')
      .select('*')
      .eq('visitor_id', trackerId)
      .single();

    if (banRecord) {
      return res.json({ success: true, isBanned: true, banRecord });
    }

    await supabase.from('page_views').insert({
      path: path || '/',
      ip_hash: trackerId, 
      user_agent: req.headers['user-agent'] || 'unknown'
    });
    
    res.json({ success: true, isBanned: false });
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
    const { key, visitorId } = req.body;

    const { data, error: sbError } = await supabase
      .from("keys")
      .select("*")
      .match({ key_value: key, is_used: false })
      .single();

    if (sbError || !data) {
      return res.status(400).json({ error: "Invalid or already used key" });
    }

    await supabase
      .from("keys")
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        redeemed_by: visitorId || null,
      })
      .match({ key_value: key });

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
        ip_hash: `manual-${nanoid(5)}`,
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
      .select('ip_hash, path, created_at')
      .order('created_at', { ascending: false })
      .range(start, end);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: graphData } = await supabase
      .from('page_views')
      .select('ip_hash, created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    const { data: allIps } = await supabase.from('page_views').select('ip_hash');
    const uniqueVisitors = new Set(allIps?.map(v => v.ip_hash || 'unknown')).size;

    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayViews = graphData?.filter(v => v.created_at.startsWith(dateStr)) || [];
      const dayUniqueIps = new Set(dayViews.map(v => v.ip_hash || 'unknown'));
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

// ─── Users Management Endpoints ───────────────────────────────────────────────

// GET /api/analytics/users — list all unique users with stats
app.get("/api/analytics/users", authorizeAnalytics, async (req: any, res: any) => {
  try {
    // Get all unique visitor IDs from page_views
    const { data: allViews } = await supabase
      .from('page_views')
      .select('ip_hash, created_at, path')
      .order('created_at', { ascending: false });

    if (!allViews) return res.json({ users: [] });

    // Group by visitor ID
    const userMap = new Map<string, { id: string; totalVisits: number; lastSeen: string; firstSeen: string; paths: string[] }>();

    for (const view of allViews) {
      const id = view.ip_hash || 'unknown';
      if (!userMap.has(id)) {
        userMap.set(id, {
          id,
          totalVisits: 0,
          lastSeen: view.created_at,
          firstSeen: view.created_at,
          paths: []
        });
      }
      const user = userMap.get(id)!;
      user.totalVisits++;
      if (view.created_at > user.lastSeen) user.lastSeen = view.created_at;
      if (view.created_at < user.firstSeen) user.firstSeen = view.created_at;
      if (!user.paths.includes(view.path)) user.paths.push(view.path);
    }

    // Get keys redeemed per user
    const { data: redeemedKeys } = await supabase
      .from('keys')
      .select('key_value, redeemed_by, used_at, is_used')
      .eq('is_used', true);

    const keysByUser = new Map<string, number>();
    if (redeemedKeys) {
      for (const k of redeemedKeys) {
        if (k.redeemed_by) {
          keysByUser.set(k.redeemed_by, (keysByUser.get(k.redeemed_by) || 0) + 1);
        }
      }
    }

    // Get banned users
    const { data: bannedUsers } = await supabase
      .from('banned_users')
      .select('visitor_id');
    const bannedSet = new Set((bannedUsers || []).map((b: any) => b.visitor_id));

    const users = Array.from(userMap.values()).map(u => ({
      ...u,
      keysRedeemed: keysByUser.get(u.id) || 0,
      isBanned: bannedSet.has(u.id),
    }));

    // Sort by lastSeen desc
    users.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// GET /api/analytics/users/:userId — detailed info for one user
app.get("/api/analytics/users/:userId", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const userId = decodeURIComponent(req.params.userId);

    // Visit history
    const { data: visits } = await supabase
      .from('page_views')
      .select('path, created_at, user_agent')
      .eq('ip_hash', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Keys generated by this user (from key_sessions)
    const { data: generatedKeys } = await supabase
      .from('keys')
      .select('id, key_value, is_used, used_at, created_at')
      .order('created_at', { ascending: false });

    // Keys redeemed by this user
    const { data: redeemedKeys } = await supabase
      .from('keys')
      .select('id, key_value, used_at, created_at')
      .eq('redeemed_by', userId)
      .order('used_at', { ascending: false });

    // Check if banned
    const { data: banRecord } = await supabase
      .from('banned_users')
      .select('*')
      .eq('visitor_id', userId)
      .single();

    res.json({
      userId,
      visits: visits || [],
      generatedKeys: generatedKeys || [],
      redeemedKeys: redeemedKeys || [],
      isBanned: !!banRecord,
      banRecord: banRecord || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// DELETE /api/analytics/keys/:keyId — delete a key
app.delete("/api/analytics/keys/:keyId", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const keyValue = decodeURIComponent(req.params.keyId);
    const { error } = await supabase
      .from('keys')
      .delete()
      .eq('key_value', keyValue);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// POST /api/analytics/keys/:keyId/revoke — mark a key as used/revoked
app.post("/api/analytics/keys/:keyId/revoke", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const keyValue = decodeURIComponent(req.params.keyId);
    const { error } = await supabase
      .from('keys')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('key_value', keyValue);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// POST /api/analytics/users/:userId/ban — ban a user
app.post("/api/analytics/users/:userId/ban", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const userId = decodeURIComponent(req.params.userId);
    const { reason } = req.body;

    const { error } = await supabase
      .from('banned_users')
      .upsert({
        visitor_id: userId,
        reason: reason || 'Banned by admin',
        banned_at: new Date().toISOString(),
      });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// DELETE /api/analytics/users/:userId/ban — unban a user
app.delete("/api/analytics/users/:userId/ban", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const userId = decodeURIComponent(req.params.userId);
    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('visitor_id', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

export default app;
