-- Add Pepijn to friends table and JGL group
INSERT INTO friends (id, name, is_preset) VALUES ('preset_pepijn', 'Pepijn', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO group_members (group_id, player_id) VALUES ('group_jgls', 'preset_pepijn')
ON CONFLICT DO NOTHING;
