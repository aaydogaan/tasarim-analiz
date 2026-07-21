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

-- RLS İzinleri (Eğer RLS aktifse ve update yapılamıyorsa diye)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);

-- Rozetlerin (Badges) saklanacağı tablo
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- user_badges tablosu için RLS (Güvenlik Kuralları)
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own badges" ON public.user_badges FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Profil güncelleme işlemleri sorunsuz çalışacaktır.
