import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Supabase env eksik.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Bu verileri görmek için giriş yapmalısınız.' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user?.id) {
        return res.status(401).json({ error: 'Oturum süresi dolmuş veya geçersiz.' });
    }

    // Kullanıcının tüm analizlerini çek (Sadece ona özel RLS sayesinde gelecektir ama garantilemek için eq ekliyoruz)
    const { data: myData } = await supabase
        .from('analizler')
        .select('*')
        .eq('user_id', user.id);

    if (!myData || myData.length === 0) {
        return res.status(200).json({
            toplamAnaliz: 0,
            buHafta: 0,
            ortalamaGenel: 0,
            turDagilim: {},
            enPopulerSektor: [],
            degDagilim: {},
        });
    }

    const toplamAnaliz = myData.length;

    const gecerliPuan = myData.filter(d => typeof d.genel_puan === 'number').map(d => d.genel_puan as number);
    const ortalamaGenel = gecerliPuan.length ? Math.round(gecerliPuan.reduce((a, b) => a + b, 0) / gecerliPuan.length) : 0;

    const turDagilim: Record<string, number> = {};
    const isletmeDagilim: Record<string, number> = {};
    const degDagilim: Record<string, number> = {};

    myData.forEach(d => {
        if (d.tasarim_turu) turDagilim[d.tasarim_turu] = (turDagilim[d.tasarim_turu] || 0) + 1;
        if (d.isletme) isletmeDagilim[d.isletme] = (isletmeDagilim[d.isletme] || 0) + 1;
        if (d.genel_degerlendirme) degDagilim[d.genel_degerlendirme] = (degDagilim[d.genel_degerlendirme] || 0) + 1;
    });

    const enPopulerSektor = Object.entries(isletmeDagilim)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([k, v]) => ({ isletme: k, sayi: v }));

    const haftaBaslangic = new Date();
    haftaBaslangic.setDate(haftaBaslangic.getDate() - 7);
    const buHafta = myData.filter(d => new Date(d.created_at) >= haftaBaslangic).length;

    // Özel istatistik özeti (mevcut frontend desteklesin diye ekliyoruz)
    const enCokTasarimTuru = Object.entries(turDagilim).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Bulunamadı';
    const userStats = {
        total: toplamAnaliz,
        ortalama: ortalamaGenel,
        buHafta: buHafta,
        enCokTasarimTuru
    };

    return res.status(200).json({
        toplamAnaliz,
        buHafta,
        ortalamaGenel,
        turDagilim,
        enPopulerSektor,
        degDagilim,
        userStats,
    });
}
