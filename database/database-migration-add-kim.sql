-- Add Kim to friends table and JGL group
INSERT INTO friends (id, name, is_preset) VALUES ('preset_kim', 'Kim', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO group_members (group_id, player_id) VALUES ('group_jgls', 'preset_kim')
ON CONFLICT DO NOTHING;
