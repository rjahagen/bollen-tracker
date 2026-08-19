export function loadS(key, def) { try { const v=localStorage.getItem(key); return v?JSON.parse(v):def; } catch { return def; } }
export function saveS(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
export function slimPlayer(p) { return { id: p.id, name: p.name }; }
