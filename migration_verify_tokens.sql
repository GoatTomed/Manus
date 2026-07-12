-- Create verification_tokens table for one-time use tokens
CREATE TABLE IF NOT EXISTS public.verification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    session_id TEXT NOT NULL,
    step INT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON public.verification_tokens (token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON public.verification_tokens (expires_at DESC);
