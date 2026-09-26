// Daily Vercel Cron target (see vercel.json) that runs a trivial Supabase
// query so the project shows database activity. Supabase's free tier
// pauses a project after 7 days without any usage.
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://opgoswxkxyncmzjrzipl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_VgEKLaW-zxbdPyUxxnXoCQ_aM3tTjeT';

module.exports = async function handler(req, res) {
  // Optional: set a CRON_SECRET env var in Vercel to stop anyone else from
  // hitting this URL and triggering the query. Vercel's own cron invocations
  // automatically send it as a Bearer token when the env var is set.
  if (process.env.CRON_SECRET) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase.from('friends').select('id').limit(1);
    if (error) throw error;
    res.status(200).json({ ok: true, checkedAt: new Date().toISOString(), rows: data?.length ?? 0 });
  } catch (e) {
    console.error('[keepalive] Supabase ping failed:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
};
