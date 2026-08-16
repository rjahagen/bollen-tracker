-- ============================================================
-- Cards App – Enable RLS on all tables
-- Fixes the Supabase "rls_disabled_in_public" security warning.
-- Since the app has no user authentication, policies use the
-- anon role and allow reads + writes, but prevent arbitrary
-- deletes on game history and friend records.
-- ============================================================

-- ── friends ──────────────────────────────────────────────────
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='friends' AND policyname='Allow read') THEN
    CREATE POLICY "Allow read"   ON friends FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='friends' AND policyname='Allow insert') THEN
    CREATE POLICY "Allow insert" ON friends FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='friends' AND policyname='Allow update') THEN
    CREATE POLICY "Allow update" ON friends FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  -- No DELETE policy: friend records should not be mass-deleted from outside the app
END $$;

GRANT SELECT, INSERT, UPDATE ON friends TO anon;
GRANT SELECT, INSERT, UPDATE ON friends TO authenticated;

-- ── games ─────────────────────────────────────────────────────
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='games' AND policyname='Allow read') THEN
    CREATE POLICY "Allow read"   ON games FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='games' AND policyname='Allow insert') THEN
    CREATE POLICY "Allow insert" ON games FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='games' AND policyname='Allow update') THEN
    CREATE POLICY "Allow update" ON games FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON games TO anon;
GRANT SELECT, INSERT, UPDATE ON games TO authenticated;

-- ── game_players ──────────────────────────────────────────────
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='game_players' AND policyname='Allow read') THEN
    CREATE POLICY "Allow read"   ON game_players FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='game_players' AND policyname='Allow insert') THEN
    CREATE POLICY "Allow insert" ON game_players FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='game_players' AND policyname='Allow update') THEN
    CREATE POLICY "Allow update" ON game_players FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON game_players TO anon;
GRANT SELECT, INSERT, UPDATE ON game_players TO authenticated;

-- ── game_rounds ───────────────────────────────────────────────
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='game_rounds' AND policyname='Allow read') THEN
    CREATE POLICY "Allow read"   ON game_rounds FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='game_rounds' AND policyname='Allow insert') THEN
    CREATE POLICY "Allow insert" ON game_rounds FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='game_rounds' AND policyname='Allow update') THEN
    CREATE POLICY "Allow update" ON game_rounds FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON game_rounds TO anon;
GRANT SELECT, INSERT, UPDATE ON game_rounds TO authenticated;

-- ── polls ─────────────────────────────────────────────────────
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='polls' AND policyname='Allow read') THEN
    CREATE POLICY "Allow read"   ON polls FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='polls' AND policyname='Allow insert') THEN
    CREATE POLICY "Allow insert" ON polls FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='polls' AND policyname='Allow update') THEN
    CREATE POLICY "Allow update" ON polls FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON polls TO anon;
GRANT SELECT, INSERT, UPDATE ON polls TO authenticated;

-- ── poll_votes ────────────────────────────────────────────────
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='poll_votes' AND policyname='Allow read') THEN
    CREATE POLICY "Allow read"   ON poll_votes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='poll_votes' AND policyname='Allow insert') THEN
    CREATE POLICY "Allow insert" ON poll_votes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='poll_votes' AND policyname='Allow update') THEN
    CREATE POLICY "Allow update" ON poll_votes FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON poll_votes TO anon;
GRANT SELECT, INSERT, UPDATE ON poll_votes TO authenticated;
