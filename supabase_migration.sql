-- Migration: Add banned_users table and redeemed_by column to keys
-- Run this in your Supabase SQL Editor

-- 1. Add redeemed_by column to keys table (stores the visitor ID who redeemed the key)
ALTER TABLE keys ADD COLUMN IF NOT EXISTS redeemed_by TEXT DEFAULT NULL;

-- 2. Create banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT 'Banned by admin',
  banned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_banned_users_visitor_id ON banned_users(visitor_id);
CREATE INDEX IF NOT EXISTS idx_keys_redeemed_by ON keys(redeemed_by);

-- 4. Add script_id to keys table to track which script was redeemed
ALTER TABLE keys ADD COLUMN IF NOT EXISTS script_id TEXT DEFAULT NULL;
