-- 1. Ajouter les colonnes manquantes à la table 'keys'
-- On utilise ALTER TABLE pour éviter les erreurs si la table existe déjà sans ces colonnes
ALTER TABLE public.keys ADD COLUMN IF NOT EXISTS visitor_hash TEXT;
ALTER TABLE public.keys ADD COLUMN IF NOT EXISTS visitor_id TEXT;
ALTER TABLE public.keys ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0;
ALTER TABLE public.keys ADD COLUMN IF NOT EXISTS last_used TIMESTAMPTZ;

-- 2. Créer la table 'key_sessions' pour suivre le processus de vérification
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

-- 3. Créer les index pour la performance
CREATE INDEX IF NOT EXISTS idx_keys_visitor_hash ON public.keys (visitor_hash);
CREATE INDEX IF NOT EXISTS idx_key_sessions_session_id ON public.key_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_key_sessions_visitor_hash ON public.key_sessions (visitor_hash);

-- 4. (Optionnel) Accorder les permissions si nécessaire
-- GRANT ALL ON public.keys TO service_role;
-- GRANT ALL ON public.key_sessions TO service_role;
-- GRANT ALL ON public.keys TO anon;
-- GRANT ALL ON public.key_sessions TO anon;
