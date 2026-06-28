-- Create sessions table for "earn a key" flow
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    step TEXT NOT NULL DEFAULT 'started', -- started, step1_verified, completed
    secret_token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON public.sessions (visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_secret_token ON public.sessions (secret_token);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.sessions USING (auth.role() = 'service_role');
