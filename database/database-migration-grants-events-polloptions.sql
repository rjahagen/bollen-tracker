-- ============================================================
-- Cards App – Explicit grants for events & poll_options
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
--
-- These two tables were created directly in the Supabase dashboard
-- and never got an explicit GRANT recorded in a migration (unlike
-- every other table in this app). They already work today because
-- existing tables keep their current Data API access regardless —
-- but from Oct 30 2026, any table re-created from scratch (a new
-- project, a preview branch, "supabase db reset") needs an explicit
-- GRANT before the Data API can reach it. This migration closes that
-- gap so the schema is fully reproducible going forward.
-- ============================================================

-- ── events (Count Down feature) ────────────────────────────────
-- App reads, inserts and deletes events, but never updates one.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='events' AND policyname='Allow read') THEN
    CREATE POLICY "Allow read" ON events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='events' AND policyname='Allow insert') THEN
    CREATE POLICY "Allow insert" ON events FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='events' AND policyname='Allow delete') THEN
    CREATE POLICY "Allow delete" ON events FOR DELETE USING (true);
  END IF;
END $$;

GRANT SELECT, INSERT, DELETE ON events TO anon;
GRANT SELECT, INSERT, DELETE ON events TO authenticated;

-- ── poll_options (Polls feature) ───────────────────────────────
-- App reads, inserts (new poll options), updates (vote counts) and
-- deletes (when a poll is removed) poll options.
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='poll_options' AND policyname='Allow read') THEN
    CREATE POLICY "Allow read" ON poll_options FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='poll_options' AND policyname='Allow insert') THEN
    CREATE POLICY "Allow insert" ON poll_options FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='poll_options' AND policyname='Allow update') THEN
    CREATE POLICY "Allow update" ON poll_options FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='poll_options' AND policyname='Allow delete') THEN
    CREATE POLICY "Allow delete" ON poll_options FOR DELETE USING (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON poll_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON poll_options TO authenticated;
