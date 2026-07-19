/*
Migration script: replace legacy 32-char hex keys with new XXX-XXX-XXX keys.
Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env, then:
  node scripts/migrate_keys.js

The script will:
- Page through the `keys` table
- For rows where `key_value` matches /^[A-F0-9]{32}$/ (legacy), generate a new friendly key
- Update the row setting `key_value` = newKey and (if available) `legacy_key` = oldKey
- Append mapping entries to `migration_map.json` in the repo root

WARNING: This mutates production data. Back up your DB before running.
*/

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function generateFriendlyKey() {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const needed = 9; // 3 groups of 3
  const bytes = crypto.randomBytes(needed);
  let key = '';
  for (let i = 0; i < needed; i++) {
    const idx = bytes[i] % ALPHABET.length;
    key += ALPHABET[idx];
    if ((i + 1) % 3 === 0 && i < needed - 1) key += '-';
  }
  return key;
}

async function migrate() {
  const outPath = path.resolve(process.cwd(), 'migration_map.json');
  const pageSize = 500;
  let offset = 0;
  const mappings = [];

  while (true) {
    console.log('Fetching batch offset', offset);
    const { data, error } = await supabase
      .from('keys')
      .select('id, key_value')
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Failed to fetch keys:', error.message || error);
      break;
    }

    if (!data || data.length === 0) break;

    for (const row of data) {
      const oldKey = String(row.key_value || '');
      if (/^[A-F0-9]{32}$/i.test(oldKey)) {
        const newKey = generateFriendlyKey();
        console.log('Migrating', oldKey, '->', newKey);
        // attempt to update legacy_key column if exists, otherwise update only key_value
        try {
          // Try updating legacy_key as well (if column exists)
          const upd = await supabase
            .from('keys')
            .update({ key_value: newKey, legacy_key: oldKey })
            .eq('id', row.id);

          if (upd.error) {
            // fallback: update only key_value
            const upd2 = await supabase
              .from('keys')
              .update({ key_value: newKey })
              .eq('id', row.id);
            if (upd2.error) {
              console.error('Failed to update row id', row.id, upd2.error.message || upd2.error);
              continue;
            }
          }

          mappings.push({ id: row.id, old: oldKey, new: newKey });
          // append to file incrementally
          fs.writeFileSync(outPath, JSON.stringify(mappings, null, 2));
        } catch (e) {
          console.error('Exception updating key id', row.id, e.message || e);
        }
      }
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  console.log('Migration complete. Wrote mapping to', outPath);
}

migrate().catch((err) => { console.error('Migration failed:', err); process.exit(1); });
