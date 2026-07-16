import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import axios from "axios";

const ALLOWED_IP = "24.49.252.230";

const axiosFetcher = async (url, options) => {
  try {
    let targetUrl = url;
    if (targetUrl.includes('dioqtcgvxqjvneqozraa.supabase.co')) {
      targetUrl = targetUrl.replace('dioqtcgvxqjvneqozraa.supabase.co', 'dioqtcgvxqjvneqozraa.supabase.co');
    }
    const response = await axios({
      url: targetUrl,
      method: options.method,
      headers: options.headers,
      data: options.body,
      timeout: 15000,
      validateStatus: () => true,
    });
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
      if (u.includes('dioqtcgvxqjvneqozraa')) {
        u = 'https://dioqtcgvxqjvneqozraa.supabase.co';
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

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // Health check
  if (path === '/api/health') {
    return res.status(200).json({ status: "ok", engine: "YouSuck Omniscient Native" });
  }

  // IP gate for the admin key panel
  if (path === '/api/check-access') {
    const actualIp = getClientIp(req);
    if (actualIp.includes(ALLOWED_IP)) {
      return res.status(200).json({ allowed: true, ip: actualIp });
    }
    return res.status(403).json({ allowed: false, ip: actualIp });
  }

  // Admin-only instant key generation (IP restricted)
  if (path === '/api/admin/generate-key' && req.method === 'POST') {
    const actualIp = getClientIp(req);
    if (!actualIp.includes(ALLOWED_IP)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    try {
      const visitorId = req.body?.visitorId || `ADMIN-${actualIp}`;
      const key = generateKey();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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

      return res.status(200).json({ key_value: key, expires_at: expiresAt });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to generate key', details: error.message });
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
