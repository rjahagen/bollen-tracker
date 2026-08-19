-- ============================================================
-- Cards App – Groups Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Friend groups
CREATE TABLE IF NOT EXISTS groups (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='Allow all'
  ) THEN
    CREATE POLICY "Allow all" ON groups FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON groups TO authenticated;

-- 2. Group membership (many-to-many: friends can be in multiple groups)
CREATE TABLE IF NOT EXISTS group_members (
  group_id  TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  PRIMARY KEY (group_id, player_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='group_members' AND policyname='Allow all'
  ) THEN
    CREATE POLICY "Allow all" ON group_members FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_members TO authenticated;

-- 3. Seed groups
INSERT INTO groups (id, name) VALUES
  ('group_jgls', 'Jetz Geht''s Loss!!'),
  ('group_kw',   'Konings weekend')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed "Jetz Geht's Loss!!" members (all original preset friends)
INSERT INTO group_members (group_id, player_id) VALUES
  ('group_jgls', 'preset_steven'),
  ('group_jgls', 'preset_bart'),
  ('group_jgls', 'preset_thom'),
  ('group_jgls', 'preset_ivar'),
  ('group_jgls', 'preset_jeroen'),
  ('group_jgls', 'preset_wouter'),
  ('group_jgls', 'preset_ruben'),
  ('group_jgls', 'preset_job'),
  ('group_jgls', 'preset_pepijn')
ON CONFLICT DO NOTHING;

-- 5. Seed "Konings weekend" members (Ruben + Wouter from first group, plus three new)
INSERT INTO group_members (group_id, player_id) VALUES
  ('group_kw', 'preset_ruben'),
  ('group_kw', 'preset_wouter'),
  ('group_kw', 'preset_jeroen_kw'),
  ('group_kw', 'preset_ronald'),
  ('group_kw', 'preset_tijn')
ON CONFLICT DO NOTHING;
