-- ============================================================
-- Cards App – Database Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Live multiplayer games
-- Stores the full game state as JSONB so every device stays in sync.
CREATE TABLE IF NOT EXISTS live_games (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type      TEXT        NOT NULL CHECK (game_type IN ('bollen','toepen')),
  state          JSONB       NOT NULL DEFAULT '{}',
  controller_id  TEXT        NOT NULL,          -- friend id of who has the controls
  player_ids     TEXT[]      NOT NULL DEFAULT '{}',
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Open RLS policy (the app handles auth via friend selection)
ALTER TABLE live_games ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='live_games' AND policyname='Allow all'
  ) THEN
    CREATE POLICY "Allow all" ON live_games FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS live_games_updated_at ON live_games;
CREATE TRIGGER live_games_updated_at
  BEFORE UPDATE ON live_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Supabase Realtime for live sync
ALTER PUBLICATION supabase_realtime ADD TABLE live_games;

-- Required: full row in WAL so realtime payload contains JSONB state column
ALTER TABLE live_games REPLICA IDENTITY FULL;

-- Required: grant anon role access (tables created via SQL don't get this automatically)
GRANT SELECT, INSERT, UPDATE, DELETE ON live_games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON live_games TO authenticated;


-- 2. Poll voter tracking
-- Lets the app show which friend voted for what.
ALTER TABLE poll_votes  ADD COLUMN IF NOT EXISTS voter_id TEXT;
ALTER TABLE polls       ADD COLUMN IF NOT EXISTS created_by TEXT;
