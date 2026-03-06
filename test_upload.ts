import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  
  const { data, error } = await supabase.storage
    .from('tasarim-gorseller')
    .upload(`test_${Date.now()}.jpg`, imageBuffer, { contentType: 'image/jpeg' });
    
  console.log("Upload Data:", data);
  console.log("Upload Error:", error);
}
check();
