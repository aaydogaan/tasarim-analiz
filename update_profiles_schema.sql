-- Profil tablosuna eksik sütunların eklenmesi (Eğer yoklarsa)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS social_handle TEXT,
  ADD COLUMN IF NOT EXISTS design_rank TEXT DEFAULT 'stajyer',
  ADD COLUMN IF NOT EXISTS specialty TEXT DEFAULT 'ui-ux',
  ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT '0-1',
  ADD COLUMN IF NOT EXISTS founder_number INT,
  ADD COLUMN IF NOT EXISTS public_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS behance_url TEXT,
  ADD COLUMN IF NOT EXISTS dribbble_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS featured_badge TEXT;

-- Profil tablosunda eksik olan sütunlar artık var. Profil güncelleme işlemleri sorunsuz çalışacaktır.
