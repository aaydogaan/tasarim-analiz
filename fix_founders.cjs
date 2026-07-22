const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL="([^"]+)"/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)[1];
const supabase = createClient(url, key);

async function fix() {
  const { data: profiles } = await supabase.from('profiles').select('id, founder_number').order('created_at', { ascending: true });
  let currentFounder = 1;
  for (const p of profiles) {
    if (p.founder_number === null || p.founder_number === 0) {
      await supabase.from('profiles').update({ founder_number: currentFounder }).eq('id', p.id);
    }
    currentFounder++;
  }
  
  // also fix avatar for the first user if it has user_metadata
  const { data: users } = await supabase.auth.admin.listUsers();
  for (const u of users.users) {
      if (u.user_metadata && u.user_metadata.avatar_url) {
          await supabase.from('profiles').update({ avatar_url: u.user_metadata.avatar_url }).eq('id', u.id);
      }
  }
}
fix();
