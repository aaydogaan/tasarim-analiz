import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY on server.' });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as AnalyzeRequestBody;
  if (!body?.imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64.' });
  }

  const { imageBase64, isletme, tasarimTuru = "Kurumsal", platform, sorular } = body;
  const kriterler = kriterBilgisi[tasarimTuru];
  const platformBilgisi = tasarimTuru === "Sosyal Medya" && platform ? `Platform: ${platform}` : "";

  const groq = new Groq({ apiKey });

  const prompt = `Sen uzman bir grafik tasarım değerlendirme yapay zekasısın. Görseli analiz et ve YALNIZCA aşağıdaki formatta bir JSON nesnesi döndür. Başka hiçbir şey yazma.

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

Bu tasarımı 4 kritere göre değerlendir (her biri 0-25 puan):
1. RENK (renk anahtarı): ${kriterler.renk}
2. FONT (font anahtarı): ${kriterler.font}
3. BÜTÜNLÜK (butunluk anahtarı): ${kriterler.butunluk}
4. KOMPOZİSYON (kompozisyon anahtarı): ${kriterler.kompozisyon}

Tam olarak şu JSON formatını döndür:
{
  "renk": {"puan": <0-25 tam sayı>, "aciklama": "<detaylı Türkçe açıklama>"},
  "font": {"puan": <0-25 tam sayı>, "aciklama": "<detaylı Türkçe açıklama>"},
  "butunluk": {"puan": <0-25 tam sayı>, "aciklama": "<detaylı Türkçe açıklama>"},
  "kompozisyon": {"puan": <0-25 tam sayı>, "aciklama": "<detaylı Türkçe açıklama>"},
  "genelPuan": <0-100 tam sayı>,
  "genelYorum": "<2-3 cümle genel Türkçe yorum>",
  "oneri": "<en önemli 2-3 iyileştirme önerisi>",
  "genelDegerlendirme": "<Mükemmel veya Harika veya İyi veya Orta veya Geliştirilebilir>",
  "gucluYon": "<tasarımın en güçlü tek özelliği, 1 cümle>",
  "zayifYon": "<en kritik zayıf nokta, 1 cümle>",
  "renkPaleti": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"],
  "teknikOzet": {
    "baskınRenkSayisi": <tam sayı>,
    "detayYogunlugu": <0-100 tam sayı yüzde>,
    "negatifAlanOrani": <0-100 tam sayı yüzde>
  }
}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const rawText = response.choices[0]?.message?.content;
    if (!rawText) {
      return res.status(502).json({ error: 'Groq API boş yanıt döndürdü. Lütfen tekrar deneyin.' });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('JSON parse hatası. Raw text:', rawText);
      return res.status(502).json({ error: 'Groq API geçersiz yanıt döndürdü. Lütfen tekrar deneyin.' });
    }

    // Supabase'e kaydet
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Görseli Storage'a yükle
        let gorselUrl: string | null = null;
        try {
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
          const imageBuffer = Buffer.from(imageBase64, 'base64');
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('tasarim-gorseller')
            .upload(fileName, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: false,
            });
          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage
              .from('tasarim-gorseller')
              .getPublicUrl(uploadData.path);
            gorselUrl = urlData?.publicUrl || null;
          }
        } catch (storageErr) {
          console.error('Storage yükleme hatası (analiz devam ediyor):', storageErr);
        }

        // 2. Analiz sonucunu DB'ye kaydet
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
          gorsel_url: gorselUrl,
        }).select('id').single();

        if (dbData?.id) {
          parsed._analiz_id = dbData.id;
          parsed._gorsel_url = gorselUrl;
        }
      }
    } catch (dbErr) {
      console.error('Supabase kayıt hatası:', dbErr);
    }

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Analyze API hatası:', err);
    const message = err?.message || 'Bilinmeyen hata oluştu';
    const status = typeof err?.status === 'number' ? err.status : 500;
    return res.status(status).json({ error: message });
  }
}
