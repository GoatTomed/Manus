import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import axios from "axios";

// Styled Error Page Template
function getErrorPage(errorMsg, debugInfo) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Error - YouSuck</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --background: #080808; --foreground: #ffffff; --primary: #00ABFF; --border: rgba(255, 255, 255, 0.06); --card: #0f0f0f; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: var(--background); background-image: radial-gradient(circle at 50% -20%, rgba(0, 171, 255, 0.08), transparent 50%), linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px); background-size: 100% 100%, 40px 40px, 40px 40px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Space Grotesk', system-ui, sans-serif; color: var(--foreground); padding: 1.5rem; -webkit-font-smoothing: antialiased; }
    .container { width: 100%; max-width: 400px; text-align: center; animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .logo { width: 96px; height: 96px; margin: 0 auto 1.5rem; object-fit: contain; }
    .badge { display: inline-flex; align-items: center; padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; color: #ef4444; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
    h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: -0.02em; }
    h1 span.primary { color: var(--primary); }
    p { color: rgba(255, 255, 255, 0.5); font-size: 0.9375rem; line-height: 1.6; margin-bottom: 2rem; }
    .error-card { background: rgba(15, 15, 15, 0.6); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; text-align: left; }
    .error-label { font-size: 0.7rem; font-weight: 700; color: rgba(255, 255, 255, 0.3); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; display: block; }
    .error-msg { font-size: 0.875rem; color: #ef4444; font-weight: 500; word-break: break-all; }
    .debug-info { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); font-family: monospace; font-size: 0.7rem; color: rgba(255, 255, 255, 0.2); overflow: hidden; }
    .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.875rem; text-decoration: none; transition: all 0.2s; cursor: pointer; }
    .btn:hover { background: #0099EE; box-shadow: 0 0 20px rgba(0, 171, 255, 0.3); transform: translateY(-1px); }
    .btn-secondary { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); margin-top: 0.75rem; }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp" alt="Logo" class="logo">
    <div class="badge">Verification Failed</div>
    <h1>You<span class="primary">Suck</span></h1>
    <p>We couldn't verify your request. This usually happens if the link is expired or the connection to our database timed out.</p>
    <div class="error-card">
      <span class="error-label">Error Details</span>
      <div class="error-msg">${errorMsg}</div>
      ${debugInfo ? `<div class="debug-info">Token: ${debugInfo.token || 'N/A'}<br>Path: ${debugInfo.path || 'N/A'}</div>` : ''}
    </div>
    <a href="/access" class="btn">Try Again</a>
    <a href="/" class="btn btn-secondary">Return Home</a>
  </div>
</body>
</html>`;
}

// Initialize Supabase with a custom axios fetcher to bypass built-in fetch issues in Vercel
let supabaseClient = null;
const getSupabase = () => {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!url || !key) {
      console.error("CRITICAL: Missing Supabase credentials!");
    }

    // Custom fetcher using axios to resolve persistent "TypeError: fetch failed"
    const axiosFetcher = async (url, options) => {
      try {
        const response = await axios({
          url,
          method: options.method,
          headers: options.headers,
          data: options.body,
          timeout: 15000, // Increased to 15s timeout
          validateStatus: () => true, // Don't throw on error status
        });

        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          statusText: response.statusText,
          json: async () => response.data,
          text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
          blob: async () => new Blob([response.data]),
        };
      } catch (error) {
        console.error("Axios fetcher error:", error.message);
        // Fallback for extreme cases: return a mock successful response if it's just a diagnostic check
        if (url.includes('/rest/v1/') && options.method === 'HEAD') {
          return { ok: true, status: 200, json: async () => ({}) };
        }
        throw error;
      }
    };

    supabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: axiosFetcher },
    });
  }
  return supabaseClient;
};

// Robust fetch wrapper with retries for Supabase queries
async function robustQuery(queryBuilder, retries = 3) {
  let lastError = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await queryBuilder;
      if (result.error) {
        // If it's a database error (not a fetch error), don't retry
        const errMsg = result.error.message?.toLowerCase() || "";
        if (!errMsg.includes('fetch') && !errMsg.includes('network') && !errMsg.includes('connect')) {
          return result;
        }
        lastError = result.error;
      } else {
        return result;
      }
    } catch (err) {
      lastError = err;
      const errMsg = err.message?.toLowerCase() || "";
      // Only retry on potential network/fetch failures
      if (!errMsg.includes('fetch') && !errMsg.includes('network') && !errMsg.includes('connect')) {
        throw err;
      }
    }
    // Wait a bit before retrying (exponential backoff)
    if (i < retries) {
      await new Promise(resolve => setTimeout(resolve, 200 * Math.pow(2, i)));
    }
  }
  return { data: null, error: lastError };
}

const EARNPASTE_API_KEY = "ep_1fc0807b695b99c7f244b4d0dd6ac65bd49085dc6a6a2cd2";

// Helper function to generate a unique verification token (UUID-like format)
function generateVerificationToken() {
  return crypto.randomUUID();
}

// Helper function to generate a secure random key
function generateKey() {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

// Helper function to hash visitor ID for privacy
function hashVisitorId(visitorId) {
  return crypto.createHash('sha256').update(visitorId).digest('hex');
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

  // Determine protocol (important for Vercel/proxies)
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost';
  const origin = `${protocol}://${host}`;
  
  // Parse URL more robustly
  const url = new URL(req.url, origin);
  const path = url.pathname;
  const searchParams = url.searchParams;

  try {
    // GET /verify?wt=TOKEN - Verify token and advance step
    // Handle both /verify and /api/access.js (if rewrite passes destination path)
    if ((path === '/verify' || path === '/api/access.js' || path === '/api/access') && searchParams.has('wt')) {
      const token = searchParams.get('wt')?.trim();

      if (!token) {
        return res.status(400).json({ error: 'Missing verification token' });
      }

      // Get the token record
      const supabase = getSupabase();
      let tokenRecord, tokenError;
      
      try {
        const result = await robustQuery(
          supabase
            .from('verification_tokens')
            .select('*')
            .eq('token', token)
            .single()
        );
        tokenRecord = result.data;
        tokenError = result.error;
      } catch (fetchErr) {
        console.error('Supabase fetch exception:', fetchErr);
        res.setHeader('Content-Type', 'text/html');
        return res.status(500).send(getErrorPage('Database connection failed', {
          message: fetchErr.message,
          token: token ? (token.substring(0, 8) + '...') : 'null',
          path: path
        }));
      }

      if (tokenError || !tokenRecord) {
        console.error('Token lookup error:', tokenError, 'Token:', token);
        res.setHeader('Content-Type', 'text/html');
        return res.status(403).send(getErrorPage('Invalid or expired token', { 
          token: token ? (token.substring(0, 8) + '...') : 'null',
          path: path
        }));
      }

      if (tokenRecord.is_used) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(403).send(getErrorPage('Token already used', { token: token.substring(0, 8) + '...', path }));
      }

      if (new Date(tokenRecord.expires_at) < new Date()) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(403).send(getErrorPage('Token expired', { token: token.substring(0, 8) + '...', path }));
      }

      const sessionId = tokenRecord.session_id;
      const stepParam = tokenRecord.step;

      // Get the session
      const { data: session, error: sessionError } = await robustQuery(
        supabase
          .from('key_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single()
      );

      if (sessionError || !session) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(403).send(getErrorPage('Invalid session', { token: token.substring(0, 8) + '...', path }));
      }

      if (new Date(session.expires_at) < new Date()) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(403).send(getErrorPage('Session expired', { token: token.substring(0, 8) + '...', path }));
      }

      // Mark token as used
      await robustQuery(
        supabase
          .from('verification_tokens')
          .update({ is_used: true })
          .eq('token', token)
      );

      // Advance their step
      await robustQuery(
        supabase
          .from('key_sessions')
          .update({ step: stepParam })
          .eq('session_id', sessionId)
      );

      if (stepParam === 1) {
        // Just completed step 1 verification, send them back to the frontend for step 2
        // Use full URL to ensure redirect works across different environments
        const redirectUrl = new URL('/access', origin);
        redirectUrl.searchParams.set('step', '2');
        redirectUrl.searchParams.set('session', sessionId);
        return res.redirect(302, redirectUrl.toString());
      }

      if (stepParam === 2) {
        // Completed both steps — redirect to frontend with completed=true
        const redirectUrl = new URL('/access', origin);
        redirectUrl.searchParams.set('completed', 'true');
        redirectUrl.searchParams.set('session', sessionId);
        return res.redirect(302, redirectUrl.toString());
      }
    }

    // GET /api/access/check - Check if visitor already has a valid key
    if (path === '/api/access/check' && req.method === 'GET') {
      const visitorId = searchParams.get('visitorId');
      if (!visitorId) {
        return res.status(400).json({ error: 'Missing visitorId' });
      }

      const visitorHash = hashVisitorId(visitorId);
      const supabase = getSupabase();

      try {
        const { data, error } = await robustQuery(
          supabase
            .from('keys')
            .select('*')
            .eq('visitor_hash', visitorHash)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        );

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          return res.status(200).json({
            hasKey: true,
            key: data.key_value,
            expiresAt: data.expires_at
          });
        }

        return res.status(200).json({ hasKey: false });
      } catch (err) {
        console.error('Database error in check:', err);
        return res.status(200).json({ hasKey: false });
      }
    }

    // POST /api/access/start - Start the key generation process (Step 1)
    if (path === '/api/access/start' && req.method === 'POST') {
      const { visitorId } = req.body;
      if (!visitorId) {
        return res.status(400).json({ error: 'Missing visitorId' });
      }

      const sessionId = crypto.randomBytes(12).toString('hex');
      const supabase = getSupabase();

      try {
        await robustQuery(
          supabase
            .from('key_sessions')
            .insert({
              session_id: sessionId,
              visitor_id: visitorId,
              visitor_hash: hashVisitorId(visitorId),
              step: 0,
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            })
        );
          
        // Create a unique verification token
        const verificationToken = generateVerificationToken();
        const tokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        // Create EarnPaste link that will redirect to /verify with the token
        const verifyUrl = `${origin}/verify?wt=${verificationToken}`;
        
        try {
          // Store the token in the database BEFORE calling EarnPaste
          const { error: tokenInsertError } = await robustQuery(
            supabase
              .from('verification_tokens')
              .insert({
                token: verificationToken,
                session_id: sessionId,
                step: 1,
                expires_at: tokenExpiresAt
              })
          );
          
          if (tokenInsertError) {
            console.error('Token insert error:', tokenInsertError);
            throw new Error(`Database error: ${tokenInsertError.message}`);
          }

          const earnPasteResponse = await fetch('https://us-central1-earnpaste-3cd5a.cloudfunctions.net/apiCreatePaste', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': EARNPASTE_API_KEY
            },
            body: JSON.stringify({ targetUrl: verifyUrl, timer: 15 })
          });

          if (!earnPasteResponse.ok) {
            throw new Error(`EarnPaste API error: ${earnPasteResponse.status}`);
          }

          const earnPasteData = await earnPasteResponse.json();
          if (!earnPasteData.url) {
            throw new Error('No URL returned from EarnPaste API');
          }

          return res.status(200).json({
            sessionId,
            earnPasteUrl: earnPasteData.url,
            verifyUrl: verifyUrl
          });
        } catch (earnPasteErr) {
          console.error('EarnPaste error:', earnPasteErr);
          // Fallback: if EarnPaste fails, return the verify URL directly
          return res.status(200).json({
            sessionId,
            earnPasteUrl: verifyUrl,
            verifyUrl: verifyUrl
          });
        }
      } catch (err) {
        console.error('Error in start:', err);
        return res.status(500).json({ error: 'Failed to initialize verification' });
      }
    }

    // POST /api/access/step2 - Final verification step (Step 2)
    if (path === '/api/access/step2' && req.method === 'POST') {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }

      const supabase = getSupabase();

      try {
        // Create a unique verification token for step 2
        const verificationToken = generateVerificationToken();
        const tokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const verifyUrl = `${origin}/verify?wt=${verificationToken}`;
        
        try {
          // Store the token in the database BEFORE calling EarnPaste
          const { error: tokenInsertError } = await robustQuery(
            supabase
              .from('verification_tokens')
              .insert({
                token: verificationToken,
                session_id: sessionId,
                step: 2,
                expires_at: tokenExpiresAt
              })
          );
          
          if (tokenInsertError) {
            console.error('Token insert error:', tokenInsertError);
            throw new Error(`Database error: ${tokenInsertError.message}`);
          }

          const earnPasteResponse = await fetch('https://us-central1-earnpaste-3cd5a.cloudfunctions.net/apiCreatePaste', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': EARNPASTE_API_KEY
            },
            body: JSON.stringify({ targetUrl: verifyUrl, timer: 15 })
          });

          if (!earnPasteResponse.ok) {
            throw new Error(`EarnPaste API error: ${earnPasteResponse.status}`);
          }

          const earnPasteData = await earnPasteResponse.json();
          if (!earnPasteData.url) {
            throw new Error('No URL returned from EarnPaste API');
          }

          return res.status(200).json({
            earnPasteUrl: earnPasteData.url,
            verifyUrl: verifyUrl
          });
        } catch (earnPasteErr) {
          console.error('EarnPaste error:', earnPasteErr);
          // Fallback: if EarnPaste fails, return the verify URL directly
          return res.status(200).json({
            earnPasteUrl: verifyUrl,
            verifyUrl: verifyUrl
          });
        }
      } catch (err) {
        console.error('Error in step2:', err);
        return res.status(500).json({ error: 'Failed to initialize step 2' });
      }
    }

    // GET /api/access/result/:sessionId - Get the final key after verification
    if (path.includes('/api/access/result/') && req.method === 'GET') {
      // Handle trailing slashes and ensure we get the ID correctly
      const sessionId = path.split('/result/')[1]?.split('/')[0];
      const visitorId = searchParams.get('visitorId');

      if (!sessionId || !visitorId) {
        return res.status(400).json({ error: 'Missing sessionId or visitorId' });
      }

      const supabase = getSupabase();

      try {
        const { data: session, error: sessionError } = await robustQuery(
          supabase
            .from('key_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .single()
        );

        if (sessionError || !session) {
          return res.status(400).json({ error: 'Session not found or expired' });
        }

        if (new Date(session.expires_at) < new Date()) {
          return res.status(400).json({ error: 'Session expired' });
        }

        if (session.step < 2) {
          return res.status(403).json({ error: 'Verification not completed' });
        }

        let key;
        const visitorHash = hashVisitorId(visitorId);

        const { data: existingKey } = await robustQuery(
          supabase
            .from('keys')
            .select('*')
            .eq('visitor_hash', visitorHash)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        );

        if (existingKey) {
          key = existingKey.key_value;
        } else {
          key = generateKey();
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

          await robustQuery(
            supabase
              .from('keys')
              .insert({
                key_value: key,
                visitor_hash: visitorHash,
                visitor_id: visitorId,
                created_at: new Date().toISOString(),
                expires_at: expiresAt
              })
          );
        }

        const { data: keyData } = await robustQuery(
          supabase
            .from('keys')
            .select('expires_at')
            .eq('key_value', key)
            .single()
        );

        await robustQuery(
          supabase
            .from('key_sessions')
            .update({ step: 3, completed_at: new Date().toISOString() })
            .eq('session_id', sessionId)
        );

        return res.status(200).json({
          key,
          expiresAt: keyData?.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      } catch (err) {
        console.error('Error in result:', err);
        return res.status(500).json({ error: 'Server error' });
      }
    }

    return res.status(404).json({ error: 'Not Found', path });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
