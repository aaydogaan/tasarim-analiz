import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
async function run() {
  const { data, error } = await supabase.from('analizler').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("LATEST ANALYSES:", JSON.stringify(data, null, 2));
  console.log("ERROR:", error);
}
run();
