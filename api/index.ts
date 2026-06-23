import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();

// Enhanced CORS for Roblox and External Executors
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ALLOWED_IP = "24.49.252.230";
const DEV_MODE = process.env.NODE_ENV === "development";

// â”€â”€â”€ Middleware â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const authorizeAnalytics = (req: any, res: any, next: any) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const actualIp = typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;
  
  if (!DEV_MODE && actualIp !== ALLOWED_IP) {
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
};

// â”€â”€â”€ Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.post("/api/track-visit", async (req: any, res: any) => {
  try {
    const { path, visitorId } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "unknown";

    const ipHash = visitorId || crypto.createHash("sha256").update(String(ip)).digest("hex");

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

    const today = new Date().toISOString().split('T')[0];
    const { data: existingVisit } = await supabase
      .from("page_views")
      .select("id")
      .eq("ip_hash", ipHash)
      .eq("path", path || "/")
      .gte("created_at", today)
      .limit(1)
      .single();

    if (!existingVisit) {
      await supabase.from("page_views").insert({
        ip_hash: ipHash,
        path: path || "/",
        user_agent: userAgent,
      });
    }

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

const sessions = new Map<string, { step: number; expires: number }>();

const EARNPASTE_API_KEY = "ep_1fc0807b695b99c7f244b4d0dd6ac65bd49085dc6a6a2cd2";
const EARNPASTE_API_URL = "https://us-central1-earnpaste-3cd5a.cloudfunctions.net/apiCreatePaste";

async function createEarnPasteLink(targetUrl: string, timer: number = 15): Promise<string> {
  const response = await fetch(EARNPASTE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": EARNPASTE_API_KEY,
    },
    body: JSON.stringify({ targetUrl, timer }),
  });

  if (!response.ok) throw new Error(`EarnPaste API error: ${response.status}`);
  const data: any = await response.json();
  if (!data.url) throw new Error("No URL returned from EarnPaste API");
  return data.url;
}

app.get("/api/get-key/check", async (req: any, res: any) => {
  try {
    const { visitorId } = req.query;
    if (!visitorId) return res.json({ hasKey: false });

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentKey } = await supabase
      .from("keys")
      .select("key_value, created_at")
      .eq("generated_by", String(visitorId))
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recentKey) {
      return res.json({ 
        hasKey: true, 
        key: recentKey.key_value,
        expiresAt: new Date(new Date(recentKey.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    res.json({ hasKey: false });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.post("/api/get-key/start", async (req: any, res: any) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ error: "Visitor ID required" });

    // Check 24h limit: find any key generated by this visitor in the last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentKeys } = await supabase
      .from("keys")
      .select("id")
      .eq("generated_by", visitorId)
      .gte("created_at", twentyFourHoursAgo)
      .limit(1);

    if (recentKeys && recentKeys.length > 0) {
      return res.status(403).json({ error: "You can only generate one key every 24 hours." });
    }

    const sessionId = crypto.randomBytes(16).toString("hex");
    const verificationHash = crypto.randomBytes(16).toString("hex");
    
    sessions.set(sessionId, { step: 1, expires: Date.now() + 15 * 60 * 1000 });
    
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["host"];
    const nonce = crypto.randomBytes(4).toString("hex");
    const verifyUrl = `${protocol}://${host}/api/v/${verificationHash}?session=${sessionId}&n=${nonce}`;
    const earnPasteUrl = await createEarnPasteLink(verifyUrl, 15);
    
    res.json({ sessionId, verificationHash, earnPasteUrl });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.get("/api/v/:hash", (req: any, res: any) => {
  const { session, step } = req.query;
  const s = sessions.get(String(session));
  if (!s || s.expires < Date.now()) return res.redirect("/verification-error");

  if (s.step === 1) {
    s.step = 2;
    res.redirect(`/get-key?step=2&session=${session}`);
  } else if (s.step === 2) {
    s.step = 3;
    res.redirect(`/get-key?completed=true&session=${session}`);
  } else {
    res.redirect("/verification-error");
  }
});

app.post("/api/get-key/step2", async (req: any, res: any) => {
  try {
    const { sessionId } = req.body;
    const s = sessions.get(sessionId);
    if (!s || s.step !== 2 || s.expires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired session" });
    }
    
    const verificationHash = crypto.randomBytes(16).toString("hex");
    
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["host"];
    const nonce = crypto.randomBytes(4).toString("hex");
    const verifyUrl = `${protocol}://${host}/api/v/${verificationHash}?session=${sessionId}&n=${nonce}`;
    const earnPasteUrl = await createEarnPasteLink(verifyUrl, 15);
    
    res.json({ verificationHash, earnPasteUrl });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.get("/api/get-key/result/:sessionId", async (req: any, res: any) => {
  try {
    const { sessionId } = req.params;
    const { visitorId } = req.query;
    const s = sessions.get(sessionId);
    
    if (!s || s.step !== 3 || s.expires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired session" });
    }

    if (!visitorId) return res.status(400).json({ error: "Visitor ID required" });

    // Final 24h check before actual generation
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentKeys } = await supabase
      .from("keys")
      .select("id")
      .eq("generated_by", visitorId)
      .gte("created_at", twentyFourHoursAgo)
      .limit(1);

    if (recentKeys && recentKeys.length > 0) {
      return res.status(403).json({ error: "You can only generate one key every 24 hours." });
    }

    const generatePart = () => crypto.randomBytes(3).toString("hex").slice(0, 3).toUpperCase();
    const newKey = `${generatePart()}-${generatePart()}-${generatePart()}`;
    const { data, error } = await supabase
      .from("keys")
      .insert({
        key_value: newKey,
        is_used: false,
        generated_by: visitorId,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    sessions.delete(sessionId);
    res.json({ key: data?.key_value });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// /api/redeem endpoint removed

app.get("/api/analytics", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { count: totalViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
    const { count: totalKeys } = await supabase.from('keys').select('*', { count: 'exact', head: true });
    // usedKeys calculation removed
    
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

    // Calculate trends (comparing today vs yesterday)
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayViews = dailyStats.find(s => s.date === todayStr)?.views || 0;
    const yesterdayViews = dailyStats.find(s => s.date === yesterdayStr)?.views || 0;
    const viewsTrend = yesterdayViews === 0 ? 100 : Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100);

    res.json({
      totalViews: totalViews || 0,
      uniqueVisitors,
      totalKeys: totalKeys || 0,
      // usedKeys removed
      dailyStats,
      recentVisits: paginatedVisits || [],
      trends: {
        views: viewsTrend,
        visitors: viewsTrend // Simplified for now
      },
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

app.post("/api/analytics/modify", authorizeAnalytics, async (req: any, res: any) => {
  try {
    const { type, amount } = req.body;
    const count = parseInt(amount);
    if (isNaN(count) || count <= 0) return res.status(400).json({ error: "Invalid amount" });

    if (type === 'add') {
      const fakeVisits = Array.from({ length: count }, () => ({
        ip_hash: `fake-${crypto.randomBytes(8).toString('hex')}`,
        path: "/",
        user_agent: "System Injector",
        created_at: new Date().toISOString()
      }));
      await supabase.from('page_views').insert(fakeVisits);
    } else if (type === 'remove') {
      const { data: toDelete } = await supabase
        .from('page_views')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(count);
      
      if (toDelete && toDelete.length > 0) {
        const ids = toDelete.map(d => d.id);
        await supabase.from('page_views').delete().in('id', ids);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// â”€â”€â”€ Users Management Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

    // redeemedKeys logic removed
    const keysByUser = new Map<string, number>();

    const { data: bannedUsers } = await supabase
      .from('banned_users')
      .select('visitor_id');
    const bannedSet = new Set((bannedUsers || []).map((b: any) => b.visitor_id));

    const users = Array.from(userMap.values()).map(u => ({
      ...u,
      keysGenerated: keysByUser.get(u.id) || 0,
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

    // redeemedKeys query removed

    const { data: banRecord } = await supabase
      .from('banned_users')
      .select('*')
      .eq('visitor_id', userId)
      .single();

    res.json({
      userId,
      visits: visits || [],
      generatedKeys: generatedKeys || [],
      // redeemedKeys removed
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

// â”€â”€â”€ In-Memory File Storage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Store file content in memory since Vercel serverless functions cannot persist files
let fileContent = `local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local Player = Players.LocalPlayer

local C = {
    Surface = Color3.fromRGB(15, 15, 15),
    Border = Color3.fromRGB(38, 38, 38),
    Primary = Color3.fromRGB(1, 168, 225),
    Text = Color3.fromRGB(240, 240, 240),
    TextMid = Color3.fromRGB(150, 150, 150),
    Success = Color3.fromRGB(34, 197, 94),
    Error = Color3.fromRGB(239, 68, 68),
}

local function tw(obj, goal, t, style, dir)
    TweenService:Create(obj, TweenInfo.new(t or 0.18, style or Enum.EasingStyle.Quart, dir or Enum.EasingDirection.Out), goal):Play()
end
local function corner(p, r) local c = Instance.new("UICorner", p) c.CornerRadius = UDim.new(0, r or 6) return c end
local function stroke(p, col, thick) local s = Instance.new("UIStroke", p) s.Color = col or C.Border s.Thickness = thick or 1 return s end
local function frm(parent, props)
    local f = Instance.new("Frame", parent)
    f.BorderSizePixel = 0
    for k, v in pairs(props) do f[k] = v end
    return f
end
local function lbl(parent, props)
    local l = Instance.new("TextLabel", parent)
    l.BackgroundTransparency = 1
    l.BorderSizePixel = 0
    for k, v in pairs(props) do l[k] = v end
    return l
end

local Gui = Instance.new("ScreenGui")
Gui.Name = "ToastGui"
Gui.ResetOnSpawn = false
Gui.IgnoreGuiInset = true
Gui.DisplayOrder = 999
Gui.Parent = Player:WaitForChild("PlayerGui")

local function toast(msg, col, duration)
    col = col or C.Primary; duration = duration or 3
    local T = frm(Gui, {
        Size = UDim2.new(0, 260, 0, 44),
        Position = UDim2.new(0.5, -130, 1, 10),
        BackgroundColor3 = C.Surface,
        ZIndex = 20,
    })
    corner(T, 8); stroke(T, col, 1)
    local Acc = frm(T, {Size=UDim2.new(0,3,1,-16), Position=UDim2.new(0,7,0,8), BackgroundColor3=col, ZIndex=21})
    corner(Acc, 2)
    lbl(T, {Size=UDim2.new(1,-22,1,0), Position=UDim2.new(0,18,0,0), Text=msg, TextColor3=C.Text, TextSize=12, Font=Enum.Font.GothamBold, TextXAlignment=Enum.TextXAlignment.Left, ZIndex=22})
    tw(T, {Position=UDim2.new(0.5,-130,1,-54)}, 0.35, Enum.EasingStyle.Back)
    task.delay(duration, function()
        tw(T, {Position=UDim2.new(0.5,-130,1,10), BackgroundTransparency=1}, 0.3)
        task.delay(0.35, function() T:Destroy() end)
    end)
end

if game.PlaceId == 79268393072444 then
    print("Correct Place ID! Loading script...")
    toast("Correct Game! Launching Script...", C.Success, 5)
    task.wait(1)
    loadstring(game:HttpGet("https://pastebin.com/raw/e8cVpx8u"))()
else
    print("Wrong Place ID: " .. tostring(game.PlaceId))
    toast("Wrong Game! Not Supported.", C.Error, 5)
end`;

// â”€â”€â”€ Roblox Key Verification Endpoint â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get("/api/file-content", async (req: any, res: any) => {
  try {
    const { password } = req.query;
    if (password !== "YouSuckTocson") {
      return res.status(403).json({ error: "Invalid password" });
    }
    res.json({ content: fileContent });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.post("/api/admin/generate-key", async (req: any, res: any) => {
  try {
    const { password, visitorId } = req.body;
    if (password !== "YouSuckTocson") {
      return res.status(403).json({ error: "Invalid password" });
    }
    if (!visitorId) return res.status(400).json({ error: "Visitor ID required" });

    const crypto = await import("crypto");
    const generatePart = () => crypto.randomBytes(3).toString("hex").slice(0, 3).toUpperCase();
    const newKey = `${generatePart()}-${generatePart()}-${generatePart()}`;
    
    const { data, error } = await supabase
      .from("keys")
      .insert({
        key_value: newKey,
        is_used: false,
        generated_by: visitorId,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ key: data?.key_value });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.post("/api/edit-file", async (req: any, res: any) => {
  try {
    const { password, content, append } = req.body;
    if (password !== "YouSuckTocson") {
      return res.status(403).json({ error: "Invalid password" });
    }
    
    if (append) {
      fileContent += content;
    } else {
      fileContent = content;
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});

app.post("/api/verify-key", async (req: any, res: any) => {
  try {
    const { key, robloxId } = req.body;
    
    if (!key || !robloxId) {
      return res.status(400).json({ valid: false, error: "Missing key or robloxId" });
    }

    // Trim and uppercase the key for consistency
    const normalizedKey = String(key).trim().toUpperCase();

    // Query the keys table for the key
    const { data: keyRecord, error: queryError } = await supabase
      .from("keys")
      .select("*")
      .eq("key_value", normalizedKey)
      .eq("is_used", false)
      .single();

    if (queryError || !keyRecord) {
      // Key not found or already used
      return res.json({ valid: false });
    }

    // Calculate expiration (24h after creation)
    const expiresAt = new Date(new Date(keyRecord.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString();

    // Check if key has a roblox_id already
    if (keyRecord.roblox_id) {
      // Key is already locked to a Roblox account
      if (keyRecord.roblox_id !== String(robloxId)) {
        // Roblox ID doesn't match
        return res.json({ valid: false });
      }
      // Roblox ID matches, key is valid
      return res.json({ valid: true, expiresAt });
    }

    // First time use: lock the key to this Roblox account
    const { error: updateError } = await supabase
      .from("keys")
      .update({ roblox_id: String(robloxId) })
      .eq("key_value", normalizedKey);

    if (updateError) {
      return res.status(500).json({ valid: false, error: "Failed to lock key" });
    }

    res.json({ valid: true, expiresAt });
  } catch (error: any) {
    res.status(500).json({ valid: false, error: "Internal Error" });
  }
});

// â”€â”€â”€ Heartbeat & Tracking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.post("/api/heartbeat", async (req: any, res: any) => {
  try {
    const { key, robloxId, robloxName, gameId, gameName, jobId } = req.body;
    
    if (!key || !robloxId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upsert the heartbeat record
    const { error } = await supabase
      .from("heartbeats")
      .upsert({
        key_value: key,
        roblox_id: String(robloxId),
        roblox_name: robloxName,
        game_id: gameId,
        game_name: gameName,
        job_id: jobId,
        last_heartbeat: new Date().toISOString()
      }, {
        onConflict: 'key_value, roblox_id'
      });

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error("Heartbeat error:", error);
    res.status(500).json({ error: "Internal Error" });
  }
});

app.get("/api/online-users", authorizeAnalytics, async (req: any, res: any) => {
  try {
    // Define "online" as having a heartbeat in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from("heartbeats")
      .select("*")
      .gte("last_heartbeat", twoMinutesAgo)
      .order("last_heartbeat", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Error" });
  }
});


// Roblox Proxy Routes
app.get("/api/roblox-avatar", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'No userId' });
    const response = await fetch('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + userId + '&size=150x150&format=Png&isCircular=false');
    const data = await response.json();
    res.json(data);
  } catch (e) { res.status(500).json({ error: 'Internal Error' }); }
});

app.get("/api/roblox-gameicon", async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) return res.status(400).json({ error: 'No placeId' });
    const response = await fetch('https://thumbnails.roblox.com/v1/places/gameicons?placeIds=' + placeId + '&size=150x150&format=Png&isCircular=false');
    const data = await response.json();
    res.json(data);
  } catch (e) { res.status(500).json({ error: 'Internal Error' }); }
});



app.get("/api/roblox-gameicon", async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) return res.status(400).json({ error: 'No placeId' });
    const response = await fetch('https://thumbnails.roblox.com/v1/places/gameicons?placeIds=' + placeId + '&size=150x150&format=Png&isCircular=false');
    const data = await response.json();
    res.json(data);
  } catch (e) { res.status(500).json({ error: 'Internal Error' }); }
});


export default app;




