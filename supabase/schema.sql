-- Analiz sonuçlarını kaydeden tablo
create table if not exists analizler (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

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

  -- Teknik özet (JSON olarak sakla)
  teknik_ozet jsonb,
  renk_paleti text[]             -- hex kodları dizisi
);

-- Row Level Security (RLS) — isteğe bağlı olarak aktif et
-- alter table analizler enable row level security;
