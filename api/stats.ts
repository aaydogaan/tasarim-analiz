import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Supabase env eksik.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Toplam analiz sayısı
    const { count: toplamAnaliz } = await supabase
        .from('analizler')
        .select('*', { count: 'exact', head: true });

    // Ortalama genel puan
    const { data: puanData } = await supabase
        .from('analizler')
        .select('genel_puan, renk_puan, font_puan, butunluk_puan, kompozisyon_puan');

    const genel = puanData?.map(d => d.genel_puan).filter(Boolean) || [];
    const ortalamaGenel = genel.length
        ? Math.round(genel.reduce((a, b) => a + b, 0) / genel.length)
        : 0;

    // Tasarım türüne göre dağılım
    const { data: turData } = await supabase
        .from('analizler')
        .select('tasarim_turu');

    const turDagilim: Record<string, number> = {};
    turData?.forEach(d => {
        if (d.tasarim_turu) turDagilim[d.tasarim_turu] = (turDagilim[d.tasarim_turu] || 0) + 1;
    });

    // Sektör dağılımı
    const { data: isletmeData } = await supabase
        .from('analizler')
        .select('isletme');

    const isletmeDagilim: Record<string, number> = {};
    isletmeData?.forEach(d => {
        if (d.isletme) isletmeDagilim[d.isletme] = (isletmeDagilim[d.isletme] || 0) + 1;
    });

    const enPopulerSektor = Object.entries(isletmeDagilim)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([k, v]) => ({ isletme: k, sayi: v }));

    // Değerlendirme dağılımı
    const { data: degData } = await supabase
        .from('analizler')
        .select('genel_degerlendirme');

    const degDagilim: Record<string, number> = {};
    degData?.forEach(d => {
        if (d.genel_degerlendirme) degDagilim[d.genel_degerlendirme] = (degDagilim[d.genel_degerlendirme] || 0) + 1;
    });

    // Bu haftaki analizler
    const haftaBaslangic = new Date();
    haftaBaslangic.setDate(haftaBaslangic.getDate() - 7);
    const { count: buHafta } = await supabase
        .from('analizler')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', haftaBaslangic.toISOString());

    return res.status(200).json({
        toplamAnaliz: toplamAnaliz || 0,
        buHafta: buHafta || 0,
        ortalamaGenel,
        turDagilim,
        enPopulerSektor,
        degDagilim,
    });
}
