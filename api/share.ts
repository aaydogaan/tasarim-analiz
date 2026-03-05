import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Supabase env eksik.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // GET: fetch a shared analysis by ID
    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'ID gerekli.' });
        }
        const { data, error } = await supabase
            .from('analizler')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Analiz bulunamadı.' });
        }

        return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed.' });
}
