import { createClient } from "@supabase/supabase-js";

let activeClients = [];

const SUPABASE_URL = typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined;
const SUPABASE_KEY = typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;

function parseRequestBody(req) {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    return req.body;
  }
  if (req.query && typeof req.query.body === "string" && req.query.body.trim() !== "") {
    try {
      return JSON.parse(req.query.body);
    } catch (err) {
      return { body: req.query.body };
    }
  }
  return req.body || {};
}

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
;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/clients - list clients
  if (req.method === "GET") {
    // prune stale in-memory clients
    activeClients = activeClients.filter(c => Date.now() - (c.lastHeartbeat || 0) < 300000);
    // if we have no in-memory clients but Supabase is configured, try to restore
    try {
      if (activeClients.length === 0 && supabase) {
        const cutoff = new Date(Date.now() - 300000).toISOString();
        const { data: persisted, error } = await supabase.from('clients').select('roblox_id,last_session_id,last_session_uptime,last_seen,online,place_id,place_name,game_icon_url,game_url,executor,executor_version').gte('last_seen', cutoff).or('online.eq.true');
        if (!error && Array.isArray(persisted) && persisted.length > 0) {
          activeClients = persisted.map(p => ({
            id: p.last_session_id || `c-${String(p.roblox_id)}`,
            name: 'Player',
            place: p.place_name || 'Unknown Game',
            placeId: p.place_id || '',
            av: (String(p.roblox_id || '').slice(0,2) || '??').toUpperCase(),
            avc: 'av-green',
            avatarUrl: `/api/roblox-avatar?userId=${encodeURIComponent(p.roblox_id)}`,
            gameIconUrl: p.game_icon_url || '',
            profileUrl: p.roblox_id ? `https://www.roblox.com/users/${encodeURIComponent(p.roblox_id)}/profile` : '',
            gameUrl: p.game_url || '',
            lastHeartbeat: new Date(p.last_seen || Date.now()).getTime(),
            uptime: Number(p.last_session_uptime || 0),
            executor: p.executor || 'Unknown',
            executorVersion: p.executor_version || '',
            robloxId: String(p.roblox_id),
          }));
        }
      }
    } catch (err) {
      console.warn('failed to restore clients from supabase', err?.message || err);
    }

    return res.status(200).json(activeClients);
  }

  // POST /api/clients - heartbeat
  if (req.method === "POST") {
    try {
      const data = parseRequestBody(req);
      console.log("/api/clients: heartbeat received", data && data.robloxId, data && data.gameId, data && data.body ? "(body query payload)" : "");
      const placeId = String(data.gameId || data.placeId || data.place_id || "");
      let placeName = String(data.gameName || data.placeName || data.place || data.place_name || "").trim();
      if (/^roblox$/i.test(placeName) && placeId) {
        placeName = `Place ${placeId}`;
      }
      const client = {
        id: data.robloxId ? `c-${String(data.robloxId)}` : "c-" + Math.random().toString(36).substring(2, 9),
        name: data.robloxName || data.name || "Player",
        place: placeName || "Unknown Game",
        placeId,
        av: (data.robloxName || "??").substring(0, 2).toUpperCase(),
        avc: "av-green",
        avatarUrl: `/api/roblox-avatar?userId=${encodeURIComponent(data.robloxId || "")}`,
        gameIconUrl: placeId ? `/api/roblox-gameicon?placeId=${encodeURIComponent(placeId)}` : "",
        profileUrl: data.robloxId ? `https://www.roblox.com/users/${encodeURIComponent(data.robloxId)}/profile` : "",
        gameUrl: placeId ? `https://www.roblox.com/games/${encodeURIComponent(placeId)}` : "",
        lastHeartbeat: Date.now(),
        uptime: data.uptime || 0,
        executor: data.executor || "Unknown",
        executorVersion: data.executorVersion || "",
        robloxId: data.robloxId,
      };
      const index = activeClients.findIndex(c => c.robloxId === data.robloxId);
      if (index >= 0) { activeClients[index] = client; } else { activeClients.push(client); }
      // persist live session to Supabase so it can be restored after deploys
      if (supabase) {
        try {
          await supabase.from('clients').upsert({
            roblox_id: client.robloxId,
            last_session_id: client.id,
            last_session_uptime: Number(client.uptime || 0),
            last_seen: new Date(client.lastHeartbeat).toISOString(),
            online: true,
            place_id: client.placeId,
            place_name: client.place,
            game_icon_url: client.gameIconUrl,
            game_url: client.gameUrl,
            executor: client.executor,
            executor_version: client.executorVersion,
          }, { onConflict: 'roblox_id' });
        } catch (err) {
          console.warn('supabase upsert client failed', err?.message || err);
        }
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
