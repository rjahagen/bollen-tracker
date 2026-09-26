-- ============================================================
-- Cards App – Darts (Around The World) statistics
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. One row per finished darts game
CREATE TABLE IF NOT EXISTS darts_games (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mode       TEXT        NOT NULL CHECK (mode IN ('solo','team')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE darts_games ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='darts_games' AND policyname='Allow all'
  ) THEN
    CREATE POLICY "Allow all" ON darts_games FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON darts_games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON darts_games TO authenticated;

-- 2. One row per player per game (two rows per team member in team games —
-- darts thrown/missed and win/loss are always recorded per individual player,
-- even when they played as part of a team).
CREATE TABLE IF NOT EXISTS darts_players (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  darts_game_id UUID        NOT NULL REFERENCES darts_games(id) ON DELETE CASCADE,
  player_id     TEXT        NOT NULL,
  player_name   TEXT        NOT NULL,
  team_index    INT,                          -- which team (0,1,2,...) in team games, NULL for solo
  is_winner     BOOLEAN     NOT NULL DEFAULT FALSE,
  darts_thrown  INT         NOT NULL DEFAULT 0, -- successful hits (Single/Double/Triple/Bull/Bullseye presses)
  darts_missed  INT         NOT NULL DEFAULT 0, -- unused darts in a turn (3 darts/turn, whatever wasn't thrown)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE darts_players ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='darts_players' AND policyname='Allow all'
  ) THEN
    CREATE POLICY "Allow all" ON darts_players FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON darts_players TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON darts_players TO authenticated;

CREATE INDEX IF NOT EXISTS darts_players_player_id_idx ON darts_players(player_id);

-- Stats shown on a player's page are computed client-side by aggregating
-- these rows (same approach as the existing Bollen/Toepen stats):
--   games          = count(*) grouped by player_id
--   wins           = count(*) where is_winner
--   accuracy       = sum(darts_thrown) / sum(darts_thrown + darts_missed) * 100
--   avg. finish    = avg(darts_thrown + darts_missed) where is_winner
