-- ============================================================
-- Cards App – Sandur group + poll fixes
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Fix polls: add group_id column
ALTER TABLE polls ADD COLUMN IF NOT EXISTS group_id TEXT REFERENCES groups(id);

-- 2. Fix polls: allow DELETE (needed for the delete-poll feature)
--    The previous RLS migration forgot to add this.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='polls' AND policyname='Allow delete') THEN
    CREATE POLICY "Allow delete" ON polls FOR DELETE USING (true);
  END IF;
END $$;
GRANT DELETE ON polls TO anon;
GRANT DELETE ON polls TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='poll_votes' AND policyname='Allow delete') THEN
    CREATE POLICY "Allow delete" ON poll_votes FOR DELETE USING (true);
  END IF;
END $$;
GRANT DELETE ON poll_votes TO anon;
GRANT DELETE ON poll_votes TO authenticated;

-- 3. Add new preset friends (Sandur group members)
INSERT INTO friends (id, name, photo, is_preset) VALUES
  ('preset_linda',  'Linda',  null, true),
  ('preset_barrie', 'Barrie', null, true),
  ('preset_ferry',  'Ferry',  null, true),
  ('preset_bert',   'Bert',   null, true),
  ('preset_arie',   'Arie',   null, true),
  ('preset_toke',   'Toke',   null, true),
  ('preset_damsco', 'Damsco', null, true),
  ('preset_boor',   'Boor',   null, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Create the Sandur group
INSERT INTO groups (id, name) VALUES ('group_sandur', 'Sandur')
ON CONFLICT (id) DO NOTHING;

-- 5. Add Sandur group members (Pepijn + 8 new friends)
INSERT INTO group_members (group_id, player_id) VALUES
  ('group_sandur', 'preset_pepijn'),
  ('group_sandur', 'preset_linda'),
  ('group_sandur', 'preset_barrie'),
  ('group_sandur', 'preset_ferry'),
  ('group_sandur', 'preset_bert'),
  ('group_sandur', 'preset_arie'),
  ('group_sandur', 'preset_toke'),
  ('group_sandur', 'preset_damsco'),
  ('group_sandur', 'preset_boor')
ON CONFLICT DO NOTHING;
