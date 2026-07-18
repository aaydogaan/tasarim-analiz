-- 1. Analiz sonuçlarını kaydeden tablo
CREATE TABLE IF NOT EXISTS analizler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),

  -- Kullanıcı bilgileri
  user_id uuid,
  user_name text,
  user_avatar text,

  -- Tasarım bilgileri
  tasarim_turu text,             -- Sosyal Medya / Kurumsal / E-Ticaret / Baskı Materyali
  platform text,                 -- Instagram Post vb. (sadece Sosyal Medya için)
  isletme text,                  -- Sektör
  marka_adi text,

  -- Puanlar
  genel_puan int,
  renk_puan int,
  font_puan int,
  butunluk_puan int,
  kompozisyon_puan int,

  -- Yorumlar
  genel_yorum text,
  oneri text,
  genel_degerlendirme text,
  guclu_yon text,
  zayif_yon text,

  -- Teknik özet
  teknik_ozet jsonb,
  renk_paleti text[],             -- hex kodları dizisi
  
  -- Ekstra alanlar
  gorsel_url text,
  paylasim_aktif boolean DEFAULT false
);

-- 2. Vitrin oylama (beğeni) tablosu
CREATE TABLE IF NOT EXISTS begeniler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  analiz_id uuid REFERENCES analizler(id) ON DELETE CASCADE,
  user_id uuid,
  puan int
);

-- 3. Vitrin için verileri hazırlayan View (Görünüm)
CREATE OR REPLACE VIEW vitrin_view AS
SELECT 
  a.id,
  a.tasarim_turu,
  a.platform,
  a.isletme,
  a.gorsel_url,
  a.genel_puan as ai_puan,
  COALESCE(AVG(b.puan), 0)::int as topluluk_puan,
  COUNT(b.id)::int as oy_sayisi,
  a.created_at,
  a.user_name,
  a.user_avatar
FROM analizler a
LEFT JOIN begeniler b ON a.id = b.analiz_id
WHERE a.paylasim_aktif = true
GROUP BY a.id;
