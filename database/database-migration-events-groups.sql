-- ============================================================
-- Cards App – Events (Count Down) Groups Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Events (the Count Down feature) were never scoped to a group,
-- unlike polls. This adds the same group_id column polls already
-- has, and backfills existing events onto "Jetz Geht's Loss!!" —
-- the only group that has ever created one — so nothing disappears
-- once the app starts filtering by group.
-- ============================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS group_id TEXT REFERENCES groups(id);

UPDATE events SET group_id = 'group_jgls' WHERE group_id IS NULL;

-- Defensive: do the same for polls in case any pre-dates the groups
-- feature and was left with a NULL group_id.
UPDATE polls SET group_id = 'group_jgls' WHERE group_id IS NULL;
