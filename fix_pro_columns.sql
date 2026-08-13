-- Profil tablosuna PRO üyelik, Rol ve E-posta sütunlarının eklenmesi
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Mevcut kullanıcıların email adreslerini auth.users tablosundan profiles tablosuna aktarma
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- RLS (Row Level Security) güncelleme izinleri
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Herkes profilleri görebilsin
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);

-- Kullanıcılar kendi profilini güncelleyebilsin
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
