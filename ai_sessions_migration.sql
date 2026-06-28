-- Migration: Create ai_sessions table to persist Manus Task IDs
2	CREATE TABLE IF NOT EXISTS public.ai_sessions (
3	    session_id TEXT PRIMARY KEY,
4	    manus_task_id TEXT,
5	    is_roblox BOOLEAN DEFAULT false,
6	    last_activity TIMESTAMPTZ DEFAULT now(),
7	    created_at TIMESTAMPTZ DEFAULT now()
8	);
9	
10	-- Index for performance
11	CREATE INDEX IF NOT EXISTS idx_ai_sessions_last_activity ON public.ai_sessions (last_activity DESC);
12	
