const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL="([^"]+)"/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY="([^"]+)"/)[1];
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from('community_posts')
    .select('id, analizler(id, genel_puan, begeniler(puan))');
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}
check();
