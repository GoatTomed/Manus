-- Alter clients table to support game/place details and executor details tracking
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS place_id TEXT,
ADD COLUMN IF NOT EXISTS place_name TEXT,
ADD COLUMN IF NOT EXISTS game_icon_url TEXT,
ADD COLUMN IF NOT EXISTS game_url TEXT,
ADD COLUMN IF NOT EXISTS executor TEXT,
ADD COLUMN IF NOT EXISTS executor_version TEXT;
