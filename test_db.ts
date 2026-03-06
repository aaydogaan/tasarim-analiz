import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  const v = await supabase.from('vitrin_view').select('*');
  console.log("View check:", v.error, v.data);
}
check();
