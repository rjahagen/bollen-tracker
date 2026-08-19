-- Add group_id to polls so each poll belongs to a friend group
ALTER TABLE polls ADD COLUMN IF NOT EXISTS group_id TEXT REFERENCES groups(id);
