import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Initialize Supabase lazily to avoid issues during module load in some environments
let supabaseClient = null;
const getSupabase = () => {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!url || !key) {
      console.error("Missing Supabase credentials!");
    }
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
  return supabaseClient;
};

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
        // Diagnostic: Check if we can even reach the Supabase URL
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const diagStart = Date.now();
        let diagResult = 'unknown';
        
        try {
          const ping = await fetch(`${supabaseUrl}/rest/v1/`, { 
            method: 'HEAD',
            headers: { 'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '' }
          });
          diagResult = `status_${ping.status}`;
        } catch (e) {
          diagResult = `error_${e.message}`;
        }

        const result = await supabase
          .from('verification_tokens')
          .select('*')
          .eq('token', token)
          .single();
        tokenRecord = result.data;
        tokenError = result.error;
      } catch (fetchErr) {
        console.error('Supabase fetch exception:', fetchErr);
        return res.status(500).json({
          error: 'Database connection failed',
          debug: {
            message: fetchErr.message,
            token: token ? (token.substring(0, 8) + '...') : 'null',
            url: (process.env.SUPABASE_URL || 'missing').substring(0, 15) + '...',
            diag: diagResult,
            envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
          }
        });
      }

      if (tokenError || !tokenRecord) {
        console.error('Token lookup error:', tokenError, 'Token:', token);
        return res.status(403).json({ 
          error: 'Invalid or expired token', 
          debug: { 
            token: token ? (token.substring(0, 8) + '...') : 'null',
            hasError: !!tokenError,
            errorMsg: tokenError?.message || (tokenError === null ? 'Token not found in database' : 'Database error'),
            path: path
          }
        });
      }

      if (tokenRecord.is_used) {
        return res.status(403).json({ error: 'Token already used' });
      }

      if (new Date(tokenRecord.expires_at) < new Date()) {
        return res.status(403).json({ error: 'Token expired' });
      }

      const sessionId = tokenRecord.session_id;
      const stepParam = tokenRecord.step;

      // Get the session
      const { data: session, error: sessionError } = await supabase
        .from('key_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (sessionError || !session) {
        return res.status(403).json({ error: 'Invalid session' });
      }

      if (new Date(session.expires_at) < new Date()) {
        return res.status(403).json({ error: 'Session expired' });
      }

      // Mark token as used
      await supabase
        .from('verification_tokens')
        .update({ is_used: true })
        .eq('token', token);

      // Advance their step
      await supabase
        .from('key_sessions')
        .update({ step: stepParam })
        .eq('session_id', sessionId);

      if (stepParam === 1) {
        // Just completed step 1 verification, send them back to the frontend for step 2
        return res.redirect(302, `/access?step=2&session=${sessionId}`);
      }

      if (stepParam === 2) {
        // Completed both steps — redirect to frontend with completed=true
        return res.redirect(302, `/access?completed=true&session=${sessionId}`);
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
        const { data, error } = await supabase
          .from('keys')
          .select('*')
          .eq('visitor_hash', visitorHash)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

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
        await supabase
          .from('key_sessions')
          .insert({
            session_id: sessionId,
            visitor_id: visitorId,
            visitor_hash: hashVisitorId(visitorId),
            step: 0,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          });
          
        // Create a unique verification token
        const verificationToken = generateVerificationToken();
        const tokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        // Create EarnPaste link that will redirect to /verify with the token
        const verifyUrl = `${origin}/verify?wt=${verificationToken}`;
        
        try {
          // Store the token in the database BEFORE calling EarnPaste
          const { error: tokenInsertError } = await supabase
            .from('verification_tokens')
            .insert({
              token: verificationToken,
              session_id: sessionId,
              step: 1,
              expires_at: tokenExpiresAt
            });
          
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
          const { error: tokenInsertError } = await supabase
            .from('verification_tokens')
            .insert({
              token: verificationToken,
              session_id: sessionId,
              step: 2,
              expires_at: tokenExpiresAt
            });
          
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
        const { data: session, error: sessionError } = await supabase
          .from('key_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();

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

        const { data: existingKey } = await supabase
          .from('keys')
          .select('*')
          .eq('visitor_hash', visitorHash)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingKey) {
          key = existingKey.key_value;
        } else {
          key = generateKey();
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

          await supabase
            .from('keys')
            .insert({
              key_value: key,
              visitor_hash: visitorHash,
              visitor_id: visitorId,
              created_at: new Date().toISOString(),
              expires_at: expiresAt
            });
        }

        const { data: keyData } = await supabase
          .from('keys')
          .select('expires_at')
          .eq('key_value', key)
          .single();

        await supabase
          .from('key_sessions')
          .update({ step: 3, completed_at: new Date().toISOString() })
          .eq('session_id', sessionId);

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
