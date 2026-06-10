-- Run this in your Supabase SQL Editor to fix the schema cache issue
-- and ensure the 'generated_by' column exists in the 'keys' table.

ALTER TABLE keys ADD COLUMN IF NOT EXISTS generated_by TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_keys_generated_by ON keys(generated_by);

-- Refresh PostgREST schema cache (optional but recommended)
NOTIFY pgrst, 'reload schema';
