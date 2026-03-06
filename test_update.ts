import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  // First, insert a mock analysis
  const { data: insertData, error: insertError } = await supabase.from('analizler').insert({
    tasarim_turu: "Kurumsal",
    isletme: "Update Test",
    genel_puan: 60,
  }).select('id').single();
  
  console.log("Inserted ID:", insertData?.id);
  console.log("Insert Error:", insertError);

  if (insertData?.id) {
    // Attempt to update it just like the frontend
    const { data: updateData, error: updateError } = await supabase.from('analizler')
      .update({ paylasim_aktif: true })
      .eq('id', insertData.id)
      .select('id, paylasim_aktif')
      .single();
      
    console.log("Updated ID:", updateData?.id, "Active:", updateData?.paylasim_aktif);
    console.log("Update Error:", updateError);
  }
}
check();
