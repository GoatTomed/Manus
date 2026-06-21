-- Create heartbeat table to track online users and their games
CREATE TABLE IF NOT EXISTS public.heartbeats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_value TEXT NOT NULL,
    roblox_id TEXT NOT NULL,
    roblox_name TEXT,
    game_id BIGINT,
    game_name TEXT,
    job_id TEXT,
    last_heartbeat TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Optional: link to keys table if you want strict referential integrity
    -- CONSTRAINT fk_key FOREIGN KEY (key_value) REFERENCES public.keys(key_value) ON DELETE CASCADE
    UNIQUE(key_value, roblox_id)
);

-- Index for performance on the dashboard
CREATE INDEX IF NOT EXISTS idx_heartbeats_last_seen ON public.heartbeats (last_heartbeat DESC);

-- Enable RLS (Row Level Security) - Optional but recommended
-- ALTER TABLE public.heartbeats ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read" ON public.heartbeats FOR SELECT USING (true);
-- CREATE POLICY "Allow service role all" ON public.heartbeats USING (auth.role() = 'service_role');
