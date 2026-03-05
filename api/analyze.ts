import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

type TasarimTuru = "Sosyal Medya" | "Kurumsal" | "E-Ticaret" | "Baskı Materyali";

type AnalyzeRequestBody = {
  imageBase64: string;
  isletme: string;
  tasarimTuru?: TasarimTuru;
  platform?: string;
  sorular: {
    markaAdi: string;
    kurumselRenk: string;
    isYapisi: string;
    hedefKitle: string;
    slogan: string;
  };
};

const kriterBilgisi: Record<TasarimTuru, { renk: string; font: string; butunluk: string; kompozisyon: string; context: string }> = {
  "Sosyal Medya": {
    renk: "Dikkat Çekicilik — Tasarım kaydırırken durduruyor mu? Renk kullanımı göz alıyor mu?",
    font: "Mobil Okunabilirlik — Tipografi küçük ekranlarda ve hızlı bakışlarda anlaşılıyor mu?",
    butunluk: "Marka Tutarlılığı — Renk, logo ve stil marka kimliğiyle örtüşüyor mu?",
    kompozisyon: "CTA Netliği — Harekete geçirici mesaj net mi? Kullanıcı ne yapması gerektiğini anlıyor mu?",
    context: "Bu bir sosyal medya tasarımı. Platform algoritmalarına, mobil görüntülemeye ve kullanıcı kaydırma davranışlarına göre değerlendir.",
  },
  "Kurumsal": {
    renk: "Profesyonel Çekicilik — Renk paleti kurumsal, güvenilir ve sektöre uygun mu?",
    font: "Tipografi — Font seçimleri profesyonel, hiyerarşik ve okunabilir mi?",
    butunluk: "Marka Uyumu — Kurumsal kimlik öğeleri (logo, renkler, ton) tutarlı mı?",
    kompozisyon: "Düzen & Hiyerarşi — Bilgi akışı, beyaz alan kullanımı ve düzen profesyonel standartlarda mı?",
    context: "Bu bir kurumsal tasarım materyali. Profesyonellik, güvenilirlik ve kurumsal kimliğe uyum açısından değerlendir.",
  },
  "E-Ticaret": {
    renk: "Ürün Görünürlüğü — Ürün öne çıkıyor mu? Arka plan ve renkler ürünü destekliyor mu?",
    font: "Okunabilirlik — Fiyat, başlık ve açıklama metinleri hızlı okunabiliyor mu?",
    butunluk: "Güven Sinyalleri — Tasarım güvenilir, kaliteli ve alışveriş yapmaya teşvik edici mi?",
    kompozisyon: "CTA & Dönüşüm — Satın alma düğmesi, fiyat ve aksiyonlar doğru konumlandırılmış mı?",
    context: "Bu bir e-ticaret tasarımı. Satış dönüşümü, ürün vurgusu ve güven yaratma açısından değerlendir.",
  },
  "Baskı Materyali": {
    renk: "Renk & Baskı Uyumu — Renkler CMYK baskıya uygun mu? Baskıda sorun çıkabilecek renkler var mı?",
    font: "Tipografi — Baskı boyutunda okunabilirlik ve font ağırlıkları uygun mu?",
    butunluk: "Tasarım Bütünlüğü — Tüm materyalin genel düzeni ve görsel bütünlüğü iyi mi?",
    kompozisyon: "Baskı Hazırlığı — Kenar boşlukları, taşma alanı (bleed) ve güvenli alan kullanımı doğru mu?",
    context: "Bu bir baskı materyali. CMYK renk uyumu, baskı teknik gereksinimleri ve fiziksel üretim kalitesi açısından da değerlendir.",
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY on server.' });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as AnalyzeRequestBody;
  if (!body?.imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64.' });
  }

  const { imageBase64, isletme, tasarimTuru = "Kurumsal", platform, sorular } = body;
  const kriterler = kriterBilgisi[tasarimTuru];
  const platformBilgisi = tasarimTuru === "Sosyal Medya" && platform ? `Platform: ${platform}` : "";

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Sen uzman bir grafik tasarım değerlendirme yapay zekasısın.

Tasarım Bağlamı:
- Tasarım Türü: ${tasarimTuru}
${platformBilgisi}
- Sektör: ${isletme}
- Marka Adı: ${sorular?.markaAdi || 'Belirtilmedi'}
- Kurumsal Renkler: ${sorular?.kurumselRenk || 'Belirtilmedi'}
- İş Yapısı: ${sorular?.isYapisi || 'Belirtilmedi'}
- Hedef Kitle: ${sorular?.hedefKitle || 'Belirtilmedi'}
- Slogan: ${sorular?.slogan || 'Belirtilmedi'}

${kriterler.context}

Bu tasarımı aşağıdaki 4 kritere göre değerlendir (her biri 0-25 puan):
1. RENK kriteri → ${kriterler.renk}
2. FONT kriteri → ${kriterler.font}
3. BÜTÜNLÜK kriteri → ${kriterler.butunluk}
4. KOMPOZİSYON kriteri → ${kriterler.kompozisyon}

Ayrıca 0-100 arası bağımsız genel puan ver.

Ek olarak:
- Baskın renkleri hex kodu olarak tespit et (en fazla 6, # ile başlayan).
- Teknik özellik tahmini: baskın renk sayısı, detay yoğunluğu % (0-100 tam sayı), negatif alan oranı % (0-100 tam sayı).
- genelDegerlendirme: "Mükemmel", "Harika", "İyi", "Orta" veya "Geliştirilebilir" seçeneklerinden biri.
- gucluYon: Tasarımın en güçlü özelliği, kısa bir cümle.
- zayifYon: En kritik zayıf nokta, kısa bir cümle.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            renk: {
              type: Type.OBJECT,
              properties: {
                puan: { type: Type.INTEGER },
                aciklama: { type: Type.STRING },
              },
              required: ['puan', 'aciklama'],
            },
            font: {
              type: Type.OBJECT,
              properties: {
                puan: { type: Type.INTEGER },
                aciklama: { type: Type.STRING },
              },
              required: ['puan', 'aciklama'],
            },
            butunluk: {
              type: Type.OBJECT,
              properties: {
                puan: { type: Type.INTEGER },
                aciklama: { type: Type.STRING },
              },
              required: ['puan', 'aciklama'],
            },
            kompozisyon: {
              type: Type.OBJECT,
              properties: {
                puan: { type: Type.INTEGER },
                aciklama: { type: Type.STRING },
              },
              required: ['puan', 'aciklama'],
            },
            genelPuan: { type: Type.INTEGER },
            genelYorum: { type: Type.STRING },
            oneri: { type: Type.STRING },
            genelDegerlendirme: { type: Type.STRING },
            gucluYon: { type: Type.STRING },
            zayifYon: { type: Type.STRING },
            renkPaleti: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            teknikOzet: {
              type: Type.OBJECT,
              properties: {
                baskınRenkSayisi: { type: Type.INTEGER },
                detayYogunlugu: { type: Type.INTEGER },
                negatifAlanOrani: { type: Type.INTEGER },
              },
              required: ['baskınRenkSayisi', 'detayYogunlugu', 'negatifAlanOrani'],
            },
          },
          required: [
            'renk', 'font', 'butunluk', 'kompozisyon',
            'genelPuan', 'genelYorum', 'oneri',
            'genelDegerlendirme', 'gucluYon', 'zayifYon',
            'renkPaleti', 'teknikOzet',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      return res.status(502).json({ error: 'Gemini API boş yanıt döndürdü. Lütfen tekrar deneyin.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('JSON parse hatası. Raw text:', rawText);
      return res.status(502).json({ error: 'Gemini API geçersiz yanıt döndürdü. Lütfen tekrar deneyin.' });
    }

    // Supabase'e kaydet (hata olursa sessizce devam et)
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: dbData } = await supabase.from('analizler').insert({
          tasarim_turu: tasarimTuru,
          platform: platform || null,
          isletme,
          marka_adi: sorular?.markaAdi || null,
          genel_puan: parsed.genelPuan,
          renk_puan: parsed.renk?.puan,
          font_puan: parsed.font?.puan,
          butunluk_puan: parsed.butunluk?.puan,
          kompozisyon_puan: parsed.kompozisyon?.puan,
          genel_yorum: parsed.genelYorum,
          oneri: parsed.oneri,
          genel_degerlendirme: parsed.genelDegerlendirme,
          guclu_yon: parsed.gucluYon,
          zayif_yon: parsed.zayifYon,
          teknik_ozet: parsed.teknikOzet || null,
          renk_paleti: parsed.renkPaleti || null,
        }).select('id').single();

        // Analiz ID'sini sonuca ekle (paylaşım için)
        if (dbData?.id) {
          parsed._analiz_id = dbData.id;
        }
      }
    } catch (dbErr) {
      console.error('Supabase kayıt hatası (analiz yine de döndürüldü):', dbErr);
    }

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Analyze API hatası:', err);
    const message = err?.message || 'Bilinmeyen hata oluştu';
    const status = typeof err?.status === 'number' ? err.status : 500;
    return res.status(status).json({ error: message });
  }
}
