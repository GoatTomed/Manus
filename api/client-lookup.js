import { createClient } from "@supabase/supabase-js";

let activeClients = [];
const userCache = new Map();
const avatarCache = new Map();
const gameIconCache = new Map();

const CLIENT_TIMEOUT_MS = 300000;
const CACHE_TTL_MS = 15 * 60 * 1000;
const ROBLOX_USER_API = "https://users.roblox.com/v1/users";
const ROBLOX_AVATAR_API = "https://thumbnails.roblox.com/v1/users/avatar-headshot";
const ROBLOX_GAMEICON_API = "https://thumbnails.roblox.com/v1/places/gameicons";

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

function cacheGet(cache, key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet(cache, key, value) {
  cache.set(key, { value, ts: Date.now() });
}

async function fetchRobloxUser(userId) {
  if (!userId) return null;
  const cached = cacheGet(userCache, userId);
  if (cached) return cached;

  try {
    const response = await fetch(`${ROBLOX_USER_API}/${encodeURIComponent(userId)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data && typeof data.name === "string") {
      cacheSet(userCache, userId, data);
      return data;
    }
  } catch (err) {
    console.warn("fetchRobloxUser failed", err?.message || err);
  }
  return null;
}

async function fetchRobloxAvatarUrl(userId) {
  if (!userId) return null;
  const cached = cacheGet(avatarCache, userId);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${ROBLOX_AVATAR_API}?userIds=${encodeURIComponent(userId)}&size=150x150&format=Png&isCircular=false`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const url = data?.data?.[0]?.imageUrl || null;
    if (url) cacheSet(avatarCache, userId, url);
    return url;
  } catch (err) {
    console.warn("fetchRobloxAvatarUrl failed", err?.message || err);
    return null;
  }
}

async function fetchRobloxGameIconUrl(placeId) {
  if (!placeId) return null;
  const cached = cacheGet(gameIconCache, placeId);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${ROBLOX_GAMEICON_API}?placeIds=${encodeURIComponent(placeId)}&size=150x150&format=Png&isCircular=false`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const url = data?.data?.[0]?.imageUrl || null;
    if (url) cacheSet(gameIconCache, placeId, url);
    return url;
  } catch (err) {
    console.warn("fetchRobloxGameIconUrl failed", err?.message || err);
    return null;
  }
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchRobloxPlaceName(placeId) {
  if (!placeId) return null;
  const cacheKey = `place-${placeId}`;
  const cached = cacheGet(userCache, cacheKey);
  if (cached) return cached;

  let name = null;
  try {
    const response = await fetch(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${encodeURIComponent(placeId)}`);
    if (response.ok) {
      const data = await response.json();
      name = data?.data?.[0]?.name || null;
    }
  } catch (err) {
    console.warn("fetchRobloxPlaceName failed", err?.message || err);
  }

  if (!name) {
    try {
      const response = await fetch(`https://www.roblox.com/games/${encodeURIComponent(placeId)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html",
        },
      });
      if (response.ok) {
        const html = await response.text();
        const match = html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']\s*\/?>/i)
          || html.match(/<title>([^<]+)<\/title>/i);
        if (match) {
          name = decodeHtmlEntities(match[1]).replace(/\s*-\s*Roblox$/i, "").trim();
        }
      }
    } catch (err) {
      console.warn("fetchRobloxPlaceName HTML fallback failed", err?.message || err);
    }
  }

  if (name) {
    cacheSet(userCache, cacheKey, name);
  }
  return name;
}

async function cleanupClients() {
  const cutoff = Date.now() - CLIENT_TIMEOUT_MS;
  for (let i = activeClients.length - 1; i >= 0; i--) {
    if (activeClients[i].lastHeartbeat < cutoff) {
      const removed = activeClients.splice(i, 1)[0];
      // Persist session uptime into persistent store if available
      try {
        if (supabase && removed && removed.robloxId) {
          // fetch existing total
          const { data: existing } = await supabase.from('clients').select('total_uptime').eq('roblox_id', removed.robloxId).single();
          const prevTotal = existing && typeof existing.total_uptime === 'number' ? Number(existing.total_uptime) : 0;
          const add = Number(removed.uptime || 0);
          const newTotal = prevTotal + add;
          await supabase.from('clients').upsert({
            roblox_id: removed.robloxId,
            total_uptime: newTotal,
            last_session_id: null,
            last_session_uptime: 0,
            last_seen: new Date(removed.lastHeartbeat).toISOString(),
            online: false,
          }, { onConflict: 'roblox_id' });
        }
      } catch (err) {
        console.warn('cleanupClients supabase persist failed', err?.message || err);
      }
    }
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // Prevent Vercel/CDN from returning cached 304 responses for this realtime endpoint
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  if (req.method === "OPTIONS") return res.status(200).end();

  const data = parseRequestBody(req);

    if (req.method === "GET") {
        // cleanupClients may persist session totals; await it to keep storage consistent
        try { await cleanupClients(); } catch (e) { /* continue */ }

        // If we have no in-memory clients but Supabase is configured, try to restore recent/online clients
        try {
          if (activeClients.length === 0 && supabase) {
            const cutoff = new Date(Date.now() - CLIENT_TIMEOUT_MS).toISOString();
            const { data: restored, error: rErr } = await supabase.from('clients').select('roblox_id,last_session_id,last_session_uptime,last_seen,online').gte('last_seen', cutoff).or('online.eq.true');
            if (!rErr && Array.isArray(restored) && restored.length > 0) {
              activeClients = restored.map(p => ({
                id: p.last_session_id || `c-${String(p.roblox_id)}`,
                robloxId: String(p.roblox_id),
                name: 'Player',
                place: 'Unknown Game',
                placeId: '',
                avatarUrl: `/api/roblox-avatar?userId=${encodeURIComponent(p.roblox_id)}`,
                gameIconUrl: '',
                profileUrl: p.roblox_id ? `https://www.roblox.com/users/${encodeURIComponent(p.roblox_id)}/profile` : '',
                gameUrl: '',
                lastHeartbeat: Date.now(),
                uptime: Number(p.last_session_uptime || 0),
                executor: 'Unknown',
                executorVersion: '',
                rawPayload: {},
              }));
            }
          }
        } catch (err) {
          console.warn('failed to restore clients from supabase', err?.message || err);
        }

        // If Supabase is available, fetch persisted totals for active clients and attach to response
        if (supabase && activeClients.length > 0) {
          try {
            const ids = activeClients.map(c => String(c.robloxId));
            const { data: persisted, error: pErr } = await supabase.from('clients').select('roblox_id,total_uptime,last_session_uptime').in('roblox_id', ids);
            if (!pErr && Array.isArray(persisted)) {
              const map = new Map(persisted.map(r => [String(r.roblox_id), r]));
              const enriched = activeClients.map(c => {
                const p = map.get(String(c.robloxId));
                return Object.assign({}, c, {
                  totalUptime: p && typeof p.total_uptime === 'number' ? Number(p.total_uptime) : 0,
                  lastSessionUptime: p && typeof p.last_session_uptime === 'number' ? Number(p.last_session_uptime) : Number(c.uptime || 0),
                });
              });
              return res.status(200).json(enriched);
            }
          } catch (err) {
            console.warn('failed to enrich clients with persisted totals', err?.message || err);
          }
        }

        return res.status(200).json(activeClients);
  }

  if (req.method === "POST") {
    if (!data.robloxId) {
      return res.status(400).json({ success: false, error: "Missing robloxId" });
    }

    const placeId = String(data.gameId || data.placeId || data.place_id || "");
    let robloxName = String(data.robloxName || data.name || "").trim();
    let placeName = String(data.gameName || data.placeName || data.place || data.place_name || "").trim();

    if ((!robloxName || robloxName === "Player" || /^[0-9]+$/.test(robloxName))) {
      const user = await fetchRobloxUser(data.robloxId);
      if (user?.name) robloxName = user.name;
    }

    if ((!placeName || /^Place\s+[0-9]+$/.test(placeName) || /^roblox$/i.test(placeName)) && placeId) {
      const resolved = await fetchRobloxPlaceName(placeId);
      if (resolved) {
        placeName = resolved;
      }
    }

    if (!placeName && placeId) {
      placeName = `Place ${placeId}`;
    }

    const avatarUrl = await fetchRobloxAvatarUrl(data.robloxId) ||
      `/api/roblox-avatar?userId=${encodeURIComponent(data.robloxId)}`;
    const gameIconUrl = placeId
      ? await fetchRobloxGameIconUrl(placeId) || `/api/roblox-gameicon?placeId=${encodeURIComponent(placeId)}`
      : null;

    const id = `c-${String(data.robloxId)}`;
    const client = {
      id,
      robloxId: String(data.robloxId),
      name: robloxName || "Player",
      place: placeName || "Unknown Game",
      placeId,
      avatarUrl,
      gameIconUrl,
      profileUrl: `https://www.roblox.com/users/${encodeURIComponent(data.robloxId)}/profile`,
      gameUrl: placeId ? `https://www.roblox.com/games/${encodeURIComponent(placeId)}` : "",
      lastHeartbeat: Date.now(),
      uptime: Number(data.uptime || 0),
      executor: String(data.executor || "Unknown"),
      executorVersion: String(data.executorVersion || ""),
      rawPayload: data,
    };

    const existingIndex = activeClients.findIndex((c) => c.id === id);
    if (existingIndex >= 0) {
      activeClients[existingIndex] = client;
    } else {
      activeClients.push(client);
    }

    // Persist live session info to Supabase so we can accumulate uptime and reliably deliver commands
    if (supabase) {
      try {
        await supabase.from('clients').upsert({
          roblox_id: client.robloxId,
          last_session_id: client.id,
          last_session_uptime: Number(client.uptime || 0),
          last_seen: new Date(client.lastHeartbeat).toISOString(),
          online: true,
        }, { onConflict: 'roblox_id' });
      } catch (err) {
        console.warn('supabase upsert client failed', err?.message || err);
      }
    }

    return res.status(200).json({ success: true, client });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
