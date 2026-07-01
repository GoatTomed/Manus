import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const EARNPASTE_API_KEY = "ep_1fc0807b695b99c7f244b4d0dd6ac65bd49085dc6a6a2cd2";

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

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const searchParams = url.searchParams;

  try {
    // GET /api/verify?session=XXX&step=1
    if (path === '/api/verify' && req.method === 'GET') {
      const sessionId = searchParams.get('session');
      const stepParam = parseInt(searchParams.get('step'), 10);

      if (!sessionId || !stepParam) {
        return res.status(403).json({ error: 'Direct access not allowed' });
      }

      const { data: session, error } = await supabase
        .from('key_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !session) {
        return res.status(403).json({ error: 'Invalid session' });
      }

      if (new Date(session.expires_at) < new Date()) {
        return res.status(403).json({ error: 'Session expired' });
      }

      // Must be completing the step that comes right after their current recorded step
      if (stepParam !== session.step + 1) {
        return res.status(403).json({ error: 'Invalid verification step' });
      }

      // Valid — advance their step
      await supabase
        .from('key_sessions')
        .update({ step: stepParam })
        .eq('session_id', sessionId);

      if (stepParam === 1) {
        // Just completed step 1 verification, send them back to the frontend for step 2
        return res.redirect(302, `/get-key?step=2&session=${sessionId}`);
      }

      if (stepParam === 2) {
        // Completed both steps — redirect to frontend with completed=true
        return res.redirect(302, `/get-key?completed=true&session=${sessionId}`);
      }
    }

    // GET /api/get-key/check - Check if visitor already has a valid key
    if (path === '/api/get-key/check' && req.method === 'GET') {
      const visitorId = searchParams.get('visitorId');
      if (!visitorId) {
        return res.status(400).json({ error: 'Missing visitorId' });
      }

      const visitorHash = hashVisitorId(visitorId);

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

    // POST /api/get-key/start - Start the key generation process (Step 1)
    if (path === '/api/get-key/start' && req.method === 'POST') {
      const { visitorId } = req.body;
      if (!visitorId) {
        return res.status(400).json({ error: 'Missing visitorId' });
      }

      const sessionId = crypto.randomBytes(12).toString('hex');

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
          
        // Skip EarnPaste and redirect directly for testing or simple flow
        const targetUrl = `${url.origin}/api/verify?session=${sessionId}&step=1`;

        return res.status(200).json({
          sessionId,
          earnPasteUrl: targetUrl
        });
      } catch (err) {
        console.error('Error in start:', err);
        return res.status(500).json({ error: 'Failed to initialize verification' });
      }
    }

    // POST /api/get-key/step2 - Final verification step (Step 2)
    if (path === '/api/get-key/step2' && req.method === 'POST') {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }

      try {
        const targetUrl = `${url.origin}/api/verify?session=${sessionId}&step=2`;

        return res.status(200).json({
          earnPasteUrl: targetUrl
        });
      } catch (err) {
        console.error('Error in step2:', err);
        return res.status(500).json({ error: 'Failed to initialize step 2' });
      }
    }

    // GET /api/get-key/result/:sessionId - Get the final key after verification
    if (path.startsWith('/api/get-key/result/') && req.method === 'GET') {
      const sessionId = path.split('/').pop();
      const visitorId = searchParams.get('visitorId');

      if (!sessionId || !visitorId) {
        return res.status(400).json({ error: 'Missing sessionId or visitorId' });
      }

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
