const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL="([^"]+)"/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY="([^"]+)"/)[1];
const supabase = createClient(url, key);

async function testUpdate() {
  const { data, error } = await supabase.from('analizler').update({ paylasim_aktif: true }).eq('id', 'd0c3dccb-7d6e-460a-949b-340bb58848b2');
  console.log('Update Error:', JSON.stringify(error, null, 2));
}
testUpdate();
