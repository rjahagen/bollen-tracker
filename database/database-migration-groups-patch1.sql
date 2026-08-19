-- Patch: separate the two Jeroens
-- Run this if you already ran database-migration-groups.sql

-- Remove the shared Jeroen from Konings weekend
DELETE FROM group_members WHERE group_id = 'group_kw' AND player_id = 'preset_jeroen';

-- Add the new Jeroen (Konings weekend only) — the app will upsert him to the friends table on next load
INSERT INTO group_members (group_id, player_id) VALUES ('group_kw', 'preset_jeroen_kw')
ON CONFLICT DO NOTHING;
