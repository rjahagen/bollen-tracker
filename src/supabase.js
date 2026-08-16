import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://opgoswxkxyncmzjrzipl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VgEKLaW-zxbdPyUxxnXoCQ_aM3tTjeT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);