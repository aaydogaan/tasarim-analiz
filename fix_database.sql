-- 1. Begeniler (Vitrin Oylama) tablosu için RLS ayarları
ALTER TABLE public.begeniler ENABLE ROW LEVEL SECURITY;

-- Herkes begenileri okuyabilir
CREATE POLICY "Begeniler herkes tarafindan okunabilir" 
ON public.begeniler 
FOR SELECT 
USING (true);

-- Giris yapmis kullanicilar oy verebilir
CREATE POLICY "Kullanicilar oy verebilir" 
ON public.begeniler 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Analizler tablosu için GÜNCELLEME yetkisi (Paylaş butonunun çalışması için)
CREATE POLICY "Kullanicilar kendi analizlerini guncelleyebilir" 
ON public.analizler 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. İlk 100 Kurucu Üye atamasını düzelten tetikleyici (Yeni kayıt olanlar için)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  next_founder INT;
BEGIN
  -- Mevcut en yüksek founder_number değerini bul, yoksa 0 kabul et ve 1 ekle
  SELECT COALESCE(MAX(founder_number), 0) + 1 INTO next_founder FROM public.profiles;

  INSERT INTO public.profiles (id, display_name, avatar_url, design_rank, specialty, experience_level, founder_number)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'design_rank', 'stajyer'),
    COALESCE(new.raw_user_meta_data->>'specialty', 'ui-ux'),
    COALESCE(new.raw_user_meta_data->>'experience_level', '0-1'),
    next_founder
  );
  RETURN new;
END;
$$;
