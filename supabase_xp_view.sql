-- 1. Eksik tabloların oluşturulması (Eğer yoksa)
CREATE TABLE IF NOT EXISTS weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS challenge_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES weekly_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Revizelesene - Puanlama Sistemi (XP) Görünümü
-- Bu kod kullanıcıların gerçek hareketlerine (yorum, gönderi, analiz vs.) göre 
-- XP (Deneyim Puanı) hesaplar ve Liderlik tablosu için kullanılmasını sağlar.
CREATE OR REPLACE VIEW user_xp_stats AS
SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.design_rank,
    p.created_at,
    p.founder_number,
    (
        COALESCE((SELECT COUNT(*) FROM community_posts cp WHERE cp.user_id = p.id) * 200, 0) +
        COALESCE((SELECT COUNT(*) FROM post_comments pc WHERE pc.user_id = p.id) * 50, 0) +
        COALESCE((SELECT COUNT(*) FROM analizler a WHERE a.user_id = p.id) * 150, 0) +
        COALESCE((SELECT COUNT(*) FROM challenge_entries ce WHERE ce.user_id = p.id) * 300, 0) +
        100 -- Kayıt olma başlangıç puanı
    ) as total_xp
FROM profiles p;
