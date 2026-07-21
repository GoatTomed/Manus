import { createClient } from "@supabase/supabase-js";

let activeClients = [];
const commandQueue = {};

const SUPABASE_URL = typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined;
const SUPABASE_KEY = typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;

function normalizeSupabaseUrl(url) {
  if (!url) return "";
  let u = String(url).trim();
  if (!u.startsWith("http")) u = `https://${u}`;
  if (u.endsWith("/")) u = u.slice(0, -1);
  if (u.includes(".supabase.co")) {
    const match = u.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
    if (match && match[1]) u = `https://${match[1]}.supabase.co`;
  }
  return u;
}

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(normalizeSupabaseUrl(SUPABASE_URL), SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

async function enqueueCommand(robloxId, type, script) {
  if (!robloxId) return false;
  if (!supabase) {
    if (!commandQueue[robloxId]) commandQueue[robloxId] = [];
    commandQueue[robloxId].push({ type, script: script || "", ts: Date.now() });
    return true;
  }

  try {
    const { error } = await supabase.from("client_commands").insert([{ roblox_id: robloxId, type, script: script || "", created_at: new Date().toISOString(), delivered: false }]);
    if (error) {
      console.warn("Supabase command insert failed, falling back to in-memory queue:", error.message || error);
      if (!commandQueue[robloxId]) commandQueue[robloxId] = [];
      commandQueue[robloxId].push({ type, script: script || "", ts: Date.now() });
    }
    return true;
  } catch (e) {
    console.warn("Supabase command enqueue exception, falling back to in-memory queue:", e);
    if (!commandQueue[robloxId]) commandQueue[robloxId] = [];
    commandQueue[robloxId].push({ type, script: script || "", ts: Date.now() });
    return true;
  }
}

async function dequeueCommands(robloxId) {
  const local = commandQueue[robloxId] || [];
  commandQueue[robloxId] = [];
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("client_commands")
      .select("id,type,script")
      .eq("roblox_id", robloxId)
      .eq("delivered", false)
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("Supabase command fetch failed, using local queue:", error.message || error);
      return local;
    }
    const commands = Array.isArray(data) ? data.map(item => ({ type: item.type, script: item.script || "" })) : [];
    const ids = Array.isArray(data) ? data.map(item => item.id).filter(id => id != null) : [];
    if (ids.length > 0) {
      const { error: updateError } = await supabase.from("client_commands").update({ delivered: true, delivered_at: new Date().toISOString() }).in("id", ids);
      if (updateError) {
        console.warn("Supabase command mark-delivered failed:", updateError.message || updateError);
      }
    }
    return local.concat(commands);
  } catch (e) {
    console.warn("Supabase command dequeue exception, using local queue:", e);
    return local;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/clients - list clients
  if (req.method === "GET" && !req.query.commands) {
    activeClients = activeClients.filter(c => Date.now() - (c.lastHeartbeat || 0) < 300000);
    return res.status(200).json(activeClients);
  }

  // GET /api/clients?commands=1&robloxId=xxx - poll commands (called by Lua)
  if (req.method === "GET" && req.query.commands) {
    const { robloxId } = req.query;
    if (!robloxId) return res.status(400).json({ error: "No robloxId" });
    const cmds = await dequeueCommands(robloxId);
    return res.status(200).json({ commands: cmds });
  }

  // POST /api/clients - heartbeat
  if (req.method === "POST" && !req.query.command) {
    try {
      const data = req.body;
      console.log("/api/clients: heartbeat received", data && data.robloxId, data && data.gameId);
      const placeId = String(data.gameId || data.placeId || data.place_id || "");
      const placeName = data.gameName || data.placeName || data.place || data.place_name || (placeId ? `Place ${placeId}` : "");
      const client = {
        id: data.robloxId ? `c-${String(data.robloxId)}` : "c-" + Math.random().toString(36).substring(2, 9),
        name: data.robloxName || data.name || "Player",
        place: placeName || "Unknown Game",
        placeId,
        av: (data.robloxName || "??").substring(0, 2).toUpperCase(),
        avc: "av-green",
        avatarUrl: `/api/roblox-avatar?userId=${encodeURIComponent(data.robloxId || "")}`,
        gameIconUrl: placeId ? `/api/roblox-gameicon?placeId=${encodeURIComponent(placeId)}` : "",
        lastHeartbeat: Date.now(),
        uptime: data.uptime || 0,
        executor: data.executor || "Unknown",
        executorVersion: data.executorVersion || "",
        robloxId: data.robloxId,
      };
      const index = activeClients.findIndex(c => c.robloxId === data.robloxId);
      if (index >= 0) { activeClients[index] = client; } else { activeClients.push(client); }
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/clients?command=1 - send command to client
  if (req.method === "POST" && req.query.command) {
    try {
      const { robloxId, type, script } = req.body;
      console.log("/api/clients: command queued", robloxId, type);
      if (!robloxId) return res.status(400).json({ error: "No robloxId" });
      await enqueueCommand(robloxId, type, script);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
