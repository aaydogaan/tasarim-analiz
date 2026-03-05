import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env değişkenleri eksik. VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY .env dosyasına eklenmelidir.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
