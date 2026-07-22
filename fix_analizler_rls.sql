-- Analizler tablosuna herkesin okuyabilmesi (Keþfet ve Vitrin'de görünmesi) için izin ver
CREATE POLICY "Analizler herkes tarafindan okunabilir" ON public.analizler FOR SELECT USING (true);

