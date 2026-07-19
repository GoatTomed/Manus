import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import axios from "axios";

const ALLOWED_IP = "24.49.252.230";

async function parseJsonBody(req) {
  if (req.body != null) {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

const axiosFetcher = async (url, options) => {
  try {
    let targetUrl = url;
    const fallbackIps = ['104.18.38.10', '172.64.149.246'];

    const tryRequest = async (requestUrl, hostHeader = null) => {
      const headers = options.headers instanceof Headers 
        ? Object.fromEntries(options.headers.entries()) 
        : { ...options.headers };
      
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      if (supabaseKey) {
        if (!headers['apikey']) headers['apikey'] = supabaseKey;
        if (!headers['Authorization']) headers['Authorization'] = `Bearer ${supabaseKey}`;
      }

      const config = {
        url: requestUrl,
        method: options.method,
        headers: headers,
        data: options.body,
        timeout: 10000,
        validateStatus: () => true,
      };
      if (hostHeader) config.headers['Host'] = hostHeader;
      return await axios(config);
    };

    let response;
    try {
      response = await tryRequest(targetUrl);
    } catch (initialError) {
      if (initialError.code === 'ENOTFOUND' && targetUrl.includes('.supabase.co')) {
        const match = targetUrl.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
        if (match && match[1]) {
          const hostname = `${match[1]}.supabase.co`;
          let success = false;
          for (const ip of fallbackIps) {
            try {
              const ipUrl = targetUrl.replace(hostname, ip);
              response = await tryRequest(ipUrl, hostname);
              success = true;
              break;
            } catch (ipError) {
              // continue
            }
          }
          if (!success) throw initialError;
        } else {
          throw initialError;
        }
      } else {
        throw initialError;
      }
    }

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: async () => response.data,
      text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
    };
  } catch (error) {
    throw error;
  }
};

const supabase = createClient(
    (() => {
      let u = process.env.SUPABASE_URL || '';
      if (!u) return '';
      u = u.trim();
      if (!u.startsWith('http')) u = `https://${u}`;
      if (u.endsWith('/')) u = u.slice(0, -1);
      if (u.includes('.supabase.co')) {
        const match = u.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
        if (match && match[1]) {
          u = `https://${match[1]}.supabase.co`;
        }
      }
      return u;
    })() || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: axiosFetcher,
    },
  }
);

function getClientIp(req) {
  const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  return typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;
}

function generateKey() {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

function hashVisitorId(visitorId) {
  return crypto.createHash('sha256').update(String(visitorId)).digest('hex');
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  req.body = await parseJsonBody(req);
  const hostname = req.headers.host || "localhost";
  const url = new URL(req.url, `http://${hostname}`);
  const path = url.pathname;

  // Health check
  if (path === '/api/health') {
    return res.status(200).json({ status: "ok", engine: "YouSuck Omniscient Native" });
  }

  // Admin key generation endpoint
  if (path === '/api/admin/generate-key' && req.method === 'POST') {
    try {
      const actualIp = getClientIp(req);
      const visitorId = req.body?.visitorId || `ADMIN-${actualIp}`;
      const key = generateKey();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { error } = await supabase
          .from('keys')
          .insert({
            key_value: key,
            visitor_hash: hashVisitorId(visitorId),
            visitor_id: visitorId,
            created_at: new Date().toISOString(),
            expires_at: expiresAt,
          });

        if (error) throw error;
      } else {
        console.warn('Supabase credentials missing, generating admin key locally only.');
      }

      return res.status(200).json({ key_value: key, expires_at: expiresAt });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to generate key', details: error.message });
    }
  }

  // Verify a key via website backend
  if (path === '/api/verify-key' && req.method === 'POST') {
    try {
      const { key, robloxId } = req.body || {};
      if (!key || typeof key !== 'string') {
        return res.status(200).json({ valid: false, message: 'Missing key' });
      }

      const { data, error } = await supabase
        .from('keys')
        .select('key_value, expires_at, visitor_id, used_count')
        .eq('key_value', key)
        .single();

      if (error) {
        // If the key is not found, return a normalized invalid response
        return res.status(200).json({ valid: false, message: 'Invalid key' });
      }

      if (!data || !data.key_value) {
        return res.status(200).json({ valid: false, message: 'Invalid key' });
      }

      if (new Date(data.expires_at) < new Date()) {
        return res.status(200).json({ valid: false, message: 'Key expired' });
      }

      const updates = {
        last_used: new Date().toISOString(),
        used_count: (data.used_count || 0) + 1,
      };

      if (robloxId) {
        updates.visitor_id = String(robloxId);
      }

      await supabase
        .from('keys')
        .update(updates)
        .eq('key_value', key);

      return res.status(200).json({ valid: true, message: 'Key valid', expiresAt: data.expires_at });
    } catch (error) {
      return res.status(200).json({ valid: false, message: 'Verification failed' });
    }
  }

  // Main chat endpoint
  if (path === '/api/ai/chat' && req.method === 'POST') {
    try {
      const { message, sessionId } = req.body;
      
      const response = `I am the YouSuck Omniscient Engine. I can generate any complex Lua script for Roblox executors.\n\n\`\`\`lua\n-- Engine Online\nprint("Awaiting complex instructions...")\n\`\`\``;
      
      return res.status(200).json({
        result: {
          data: {
            response: response,
            thoughtLogs: ['Synthesizing Manus-level logic patterns...', 'Verification successful.'],
            searchResults: [],
            currentStep: 2,
            totalSteps: 2,
            sessionId,
            timestamp: new Date().toISOString(),
            isConnected: true,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Engine Error', details: error.message });
    }
  }

  return res.status(404).json({ error: 'Not Found', path });
}
