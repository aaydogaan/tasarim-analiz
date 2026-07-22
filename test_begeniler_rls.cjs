const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL="([^"]+)"/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY="([^"]+)"/)[1];
const supabase = createClient(url, key);

async function check() {
  const { error } = await supabase.from('begeniler').insert({ analiz_id: 'c20bf77d-9b9b-42fb-807e-3b4a7d12c506', puan: 80, user_id: 'ab3d10c2-30fa-47f3-b19e-5486b1aea3b9' });
  console.log('Insert Error:', JSON.stringify(error, null, 2));
}
check();
