import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  const { data, error } = await supabase.from('analizler').insert({
    tasarim_turu: "Kurumsal",
    isletme: "Test",
    genel_puan: 50,
  }).select('id').single();
  
  console.log("Insert returned ID:", data?.id);
  console.log("Insert Error:", error);
}
check();
