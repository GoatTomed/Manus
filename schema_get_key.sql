-- Create keys table to store generated keys for visitors
CREATE TABLE IF NOT EXISTS public.keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_value TEXT NOT NULL UNIQUE,
    visitor_hash TEXT NOT NULL,
    visitor_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_count INT DEFAULT 0,
    last_used TIMESTAMPTZ
);

-- Create index for faster lookups by visitor hash
CREATE INDEX IF NOT EXISTS idx_keys_visitor_hash ON public.keys (visitor_hash);
CREATE INDEX IF NOT EXISTS idx_keys_expires_at ON public.keys (expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_keys_key_value ON public.keys (key_value);

-- Create key_sessions table to track verification sessions
CREATE TABLE IF NOT EXISTS public.key_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    visitor_id TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    step INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    earnpaste_session_id TEXT
);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_key_sessions_session_id ON public.key_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_key_sessions_visitor_hash ON public.key_sessions (visitor_hash);
CREATE INDEX IF NOT EXISTS idx_key_sessions_expires_at ON public.key_sessions (expires_at DESC);

-- Enable RLS (Row Level Security) - Optional but recommended
-- ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.key_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (if RLS is enabled)
-- CREATE POLICY "Allow public insert keys" ON public.keys FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public select keys" ON public.keys FOR SELECT USING (true);
-- CREATE POLICY "Allow service role all keys" ON public.keys USING (auth.role() = 'service_role');
-- CREATE POLICY "Allow public insert sessions" ON public.key_sessions FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public select sessions" ON public.key_sessions FOR SELECT USING (true);
-- CREATE POLICY "Allow service role all sessions" ON public.key_sessions USING (auth.role() = 'service_role');
