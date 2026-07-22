import { createClient } from "@supabase/supabase-js";

let activeClients = [];
const commandQueue = {};
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
      if (!commandQueue[robloxId]) commandQueue[robloxId] = [];
      commandQueue[robloxId].push({ type, script: script || "", ts: Date.now() });
    }
    return true;
  } catch (e) {
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
      return local;
    }
    const commands = Array.isArray(data) ? data.map(item => ({ type: item.type, script: item.script || "" })) : [];
    const ids = Array.isArray(data) ? data.map(item => item.id).filter(id => id != null) : [];
    if (ids.length > 0) {
      await supabase.from("client_commands").update({ delivered: true, delivered_at: new Date().toISOString() }).in("id", ids);
    }
    return local.concat(commands);
  } catch (e) {
    return local;
  }
}

function cleanupClients() {
  const cutoff = Date.now() - CLIENT_TIMEOUT_MS;
  for (let i = activeClients.length - 1; i >= 0; i--) {
    if (activeClients[i].lastHeartbeat < cutoff) {
      activeClients.splice(i, 1);
    }
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const data = parseRequestBody(req);

  if (req.method === "GET") {
    if (req.query && (req.query.commands || req.query.command)) {
      const robloxId = String(req.query.robloxId || req.query.userId || req.query.userid || "").trim();
      if (!robloxId) return res.status(400).json({ error: "No robloxId" });
      const cmds = await dequeueCommands(robloxId);
      return res.status(200).json({ commands: cmds });
    }

    cleanupClients();
    return res.status(200).json(activeClients);
  }

  if (req.method === "POST") {
    if (req.query && req.query.command) {
      const robloxId = String(data.robloxId || data.robloxID || data.userid || data.userId || "").trim();
      if (!robloxId) return res.status(400).json({ error: "No robloxId" });
      const type = String(data.type || "").toLowerCase().trim();
      const script = String(data.script || "");
      await enqueueCommand(robloxId, type, script);
      return res.status(200).json({ success: true });
    }

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

    if ((!placeName || /^Place\s+[0-9]+$/.test(placeName)) && placeId) {
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

    return res.status(200).json({ success: true, client });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
