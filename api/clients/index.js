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

async function fetchRobloxPlaceName(placeId) {
  if (!placeId) return null;
  try {
    const response = await fetch(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${encodeURIComponent(placeId)}`);
    if (response.ok) {
      const data = await response.json();
      return data?.data?.[0]?.name || null;
    }
  } catch (err) {
    // ignore
  }
  try {
    const response = await fetch(`https://www.roblox.com/games/${encodeURIComponent(placeId)}`, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' } });
    if (response.ok) {
      const html = await response.text();
      const m = html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']\s*\/?>/i) || html.match(/<title>([^<]+)<\/title>/i);
      if (m) return String(m[1]).replace(/\s*-\s*Roblox$/i, '').trim();
    }
  } catch (err) {}
  return null;
}

async function fetchRobloxGameIconUrl(placeId) {
  if (!placeId) return null;
  try {
    const url = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${encodeURIComponent(placeId)}&size=150x150&format=Png&isCircular=false`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.data?.[0]?.imageUrl || null;
  } catch (err) { return null; }
}

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
            // Build clients and resolve missing place names/icons
            const tmp = persisted.map(p => ({
              id: p.last_session_id || `c-${String(p.roblox_id)}`,
              robloxId: String(p.roblox_id),
              name: 'Player',
              place: p.place_name || '',
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
              rawPayload: {},
            }));

            await Promise.all(tmp.map(async (c) => {
              if (c.placeId) {
                if (!c.place || /^unknown/i.test(c.place)) {
                  const resolved = await fetchRobloxPlaceName(c.placeId);
                  c.place = resolved || `Place ${c.placeId}`;
                }
                if (!c.gameIconUrl) {
                  const icon = await fetchRobloxGameIconUrl(c.placeId);
                  c.gameIconUrl = icon || `/api/roblox-gameicon?placeId=${encodeURIComponent(c.placeId)}`;
                }
              } else {
                if (!c.place) c.place = 'Unknown Game';
              }
            }));

            activeClients = tmp;
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
          const updatePayload = {
            roblox_id: client.robloxId,
            last_session_id: client.id,
            last_session_uptime: Number(client.uptime || 0),
            last_seen: new Date(client.lastHeartbeat).toISOString(),
            online: true,
          };
          if (client.placeId) {
            updatePayload.place_id = client.placeId;
            updatePayload.place_name = client.place;
            updatePayload.game_icon_url = client.gameIconUrl;
            updatePayload.game_url = client.gameUrl;
          }
          if (client.executor && client.executor !== "Unknown") {
            updatePayload.executor = client.executor;
            updatePayload.executor_version = client.executorVersion;
          }
          await supabase.from('clients').upsert(updatePayload, { onConflict: 'roblox_id' });
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
