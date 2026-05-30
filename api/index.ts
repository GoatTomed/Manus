import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ALLOWED_IP = "144.168.52.250";
const DEV_MODE = process.env.NODE_ENV === "development";

// ─── Middleware ───────────────────────────────────────────────────────────────

const authorizeAnalytics = (req: any, res: any, next: any) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  // If multiple IPs in x-forwarded-for, take the first one
  const actualIp = typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;
  
  if (!DEV_MODE && actualIp !== ALLOWED_IP) {
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
};

// ─── Endpoints ────────────────────────────────────────────────────────────────

app.post("/api/track-visit", async (req: any, res: any) => {
  try {
    const { path, visitorId } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "unknown";

    // Use visitorId if provided, fallback to IP hash
    const ipHash = visitorId || crypto.createHash("sha256").update(String(ip)).digest("hex");

    // Check if banned
    const { data: banRecord } = await supabase
      .from("banned_users")
      .select("*")
      .eq("visitor_id", ipHash)
      .single();

    if (banRecord) {
      return res.json({ 
        isBanned: true, 
        banRecord: {
          reason: banRecord.reason,
          banned_at: banRecord.banned_at
        } 
      });
    }

    // Record visit
    await supabase.from("page_views").insert({
      ip_hash: ipHash,
      path: path || "/",
      user_agent: userAgent,
    });

    res.json({ isBanned: false });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.get("/api/check-ban", async (req: any, res: any) => {
  try {
    const { visitorId } = req.query;
    if (!visitorId) return res.json({ isBanned: false });

    const { data: banRecord } = await supabase
      .from("banned_users")
      .select("*")
      .eq("visitor_id", String(visitorId))
      .single();

    res.json({ 
      isBanned: !!banRecord,
      banRecord: banRecord ? {
        reason: banRecord.reason,
        banned_at: banRecord.banned_at
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.post("/api/generate-key", async (req: any, res: any) => {
  try {
    const newKey = `YS-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const { data, error } = await supabase
      .from("keys")
      .insert({
        key_value: newKey,
        is_used: false,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ key: data?.key_value });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.post("/api/redeem", async (req: any, res: any) => {
  try {
    const { key, visitorId, scriptId } = req.body;

    const { data, error: sbError } = await supabase
      .from("keys")
      .select("*")
      .match({ key_value: String(key), is_used: false })
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
        script_id: scriptId || null,
      })
      .match({ key_value: String(key) });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
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

app.get("/api/analytics/users", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const { data: allViews } = await supabase
      .from('page_views')
      .select('ip_hash, created_at, path')
      .order('created_at', { ascending: false });

    const userMap = new Map<string, any>();
    if (allViews) {
      for (const v of allViews) {
        if (!userMap.has(v.ip_hash)) {
          userMap.set(v.ip_hash, {
            id: v.ip_hash,
            totalVisits: 0,
            lastSeen: v.created_at,
            firstSeen: v.created_at,
            paths: []
          });
        }
        const u = userMap.get(v.ip_hash);
        u.totalVisits++;
        u.firstSeen = v.created_at; 
        if (u.paths.length < 5) u.paths.push(v.path);
      }
    }

    const { data: redeemedKeys } = await supabase
      .from('keys')
      .select('redeemed_by')
      .eq('is_used', true);

    const keysByUser = new Map<string, number>();
    if (redeemedKeys) {
      for (const k of redeemedKeys) {
        if (k.redeemed_by) {
          keysByUser.set(k.redeemed_by, (keysByUser.get(k.redeemed_by) || 0) + 1);
        }
      }
    }

    const { data: bannedUsers } = await supabase
      .from('banned_users')
      .select('visitor_id');
    const bannedSet = new Set((bannedUsers || []).map((b: any) => b.visitor_id));

    const users = Array.from(userMap.values()).map(u => ({
      ...u,
      keysRedeemed: keysByUser.get(u.id) || 0,
      isBanned: bannedSet.has(u.id),
    }));

    users.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.get("/api/analytics/users/:userId", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const userId = decodeURIComponent(req.params.userId);

    const { data: visits } = await supabase
      .from('page_views')
      .select('path, created_at, user_agent')
      .eq('ip_hash', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: generatedKeys } = await supabase
      .from('keys')
      .select('id, key_value, is_used, used_at, created_at')
      .order('created_at', { ascending: false });

    const { data: redeemedKeys } = await supabase
      .from('keys')
      .select('id, key_value, used_at, created_at, script_id')
      .eq('redeemed_by', userId)
      .order('used_at', { ascending: false });

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

app.delete("/api/analytics/keys/:keyId", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const keyValue = decodeURIComponent(req.params.keyId);
    const { error } = await supabase.from('keys').delete().eq('key_value', keyValue);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

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

app.delete("/api/analytics/users/:userId/ban", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const userId = decodeURIComponent(req.params.userId);
    const { error } = await supabase.from('banned_users').delete().eq('visitor_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

export default app;
