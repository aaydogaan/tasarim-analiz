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
  guestMode?: boolean;
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

  const prompt = `Sen dünya çapında ödüllü, son derece detaycı ve profesyonel bir Grafik Tasarım Analiz Yapay Zekasısın. Gönderilen görseli derinlemesine, akademik ve teknik bir dille analiz edeceksin. Lütfen cevaplarını çok detaylı, uzun ve açıklayıcı tut. Kısa ve yüzeysel yorumlardan kesinlikle kaçın! Analizlerinde font seçimlerinin psikolojik etkileri, renk teorisi, kompozisyon kuralları (altın oran, gestalt prensipleri) gibi profesyonel kavramları kullan.

Tasarım Bağlamı:
- Tasarım Türü: ${tasarimTuru}
${platformBilgisi}
- Sektör: ${isletme}
- Marka Adı: ${sorular?.markaAdi || 'Belirtilmedi'}
- Kurumsal Renkler: ${sorular?.kurumselRenk || 'Belirtilmedi'}
- Hedef Kitle: ${sorular?.hedefKitle || 'Belirtilmedi'}

${kriterler.context}

Lütfen yukarıdaki bağlamlarda tasarımı sert ama yapıcı bir dille eleştir. 4 temel kriter için 0-25 arası puan ver ve her bir kriter için derinlemesine nedenlerini açıkla:
1. RENK: ${kriterler.renk}
2. FONT: ${kriterler.font}
3. BÜTÜNLÜK: ${kriterler.butunluk}
4. KOMPOZİSYON: ${kriterler.kompozisyon}

YALNIZCA GEÇERLİ BİR JSON NESNESİ DÖNDÜR. (Markdown veya \`\`\`json ekleme, doğrudan salt JSON çıktısı ver).
JSON Formatı Şablonu:
{
  "renk": {"puan": 20, "aciklama": "(Renk teorisi, psikolojik etki ve harmoni açısından en az 3-4 cümlelik derinlemesine analiz)"},
  "font": {"puan": 18, "aciklama": "(Tipografi, okunabilirlik ve font hiyerarşisi üzerine teknik terimlerle bol detaylı açıklama)"},
  "butunluk": {"puan": 22, "aciklama": "(Marka kimliği, sektör uyumu ve hedef kitle iletişimine dair 3-4 cümlelik profesyonel inceleme)"},
  "kompozisyon": {"puan": 19, "aciklama": "(Görsel denge, boşluk kullanımı, hizalama ve gestalt prensipleriyle detaylı analiz)"},
  "genelPuan": 82,
  "genelYorum": "(Tasarımın genel karakteri, eksikleri ve nelerin parladığı hakkında en az 2-3 paragraflık derinlemesine sonuç değerlendirmesi)",
  "oneri": "(Gelişim için maddeler halinde, nokta atışı ve çok spesifik tasarım tavsiyeleri)",
  "genelDegerlendirme": "Örn: Profesyonel / Usta İşi / Geliştirilebilir",
  "gucluYon": "(Tasarımı kurtaran en temel özellikler, çok detaylı)",
  "zayifYon": "(Net ve teknik eksiklikler)",
  "renkPaleti": ["#1a1a2e","#16213e","#0f3460","#e94560","#ffffff"],
  "teknikOzet": {"baskınRenkSayisi": 4, "detayYogunlugu": 35, "negatifAlanOrani": 55}
}`;

  try {
    const models = ['meta-llama/llama-4-scout-17b-16e-instruct'];
    let rawText = '';
    let secilenModel = '';

    for (const mod of models) {
      try {
        const response = await groq.chat.completions.create({
          model: mod,
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
          temperature: 0.25,
          max_tokens: 4000,
        });

        rawText = response.choices[0]?.message?.content || '';
        if (rawText.trim()) {
          secilenModel = mod;
          break; // Başarılı, döngüyü kır
        }
      } catch (modErr: any) {
        console.warn(`Model [${mod}] hatası:`, modErr?.message);
        // Eğer denediğimiz son model de hata verdiyse fırlat
        if (mod === models[models.length - 1]) {
          throw new Error("Sunucularımız (Yapay Zeka) şu anda aşırı yoğun. Lütfen 1 dakika sonra tekrar deneyin.");
        }
      }
    }

    if (!rawText.trim()) {
      return res.status(502).json({ error: 'Yapay zeka analiz üretemedi. Lütfen tekrar deneyin.' });
    }

    // JSON'u ayıkla — model bazen açıklama metni de ekleyebilir
    let parsed: any;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('JSON bulunamadı. Raw:', rawText.substring(0, 500));
      return res.status(502).json({ error: 'AI geçersiz format döndürdü. Lütfen tekrar deneyin.' });
    }
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('JSON parse hatası:', e, 'Raw:', rawText.substring(0, 500));
      return res.status(502).json({ error: 'AI yanıtı işlenemedi. Lütfen tekrar deneyin.' });
    }

    // Supabase'e kaydet
    // Supabase'e kaydet
    const { guestMode } = body;
    if (!guestMode) {
      try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);

          // Kullanıcı token'ından user_id'yi bul
          const token = req.headers.authorization?.replace('Bearer ', '');
          let userId: string | null = null;
          if (token) {
            // Tokenı doğrudan auth API'sine gönderip doğrula
            const authClient = createClient(supabaseUrl, supabaseKey, {
              global: { headers: { Authorization: `Bearer ${token}` } }
            });
            const { data: { user }, error: userError } = await authClient.auth.getUser();
            if (!userError && user) {
              userId = user.id;
            }
          }

          // Görseli Storage'a yükle
          let gorselUrl: string | null = null;
          try {
            const fileName = `${userId || 'anon'}_${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('tasarim-gorseller')
              .upload(fileName, imageBuffer, { contentType: 'image/jpeg', upsert: false });
            if (!uploadError && uploadData) {
              const { data: urlData } = supabase.storage
                .from('tasarim-gorseller')
                .getPublicUrl(uploadData.path);
              gorselUrl = urlData?.publicUrl || null;
            }
          } catch (storageErr) {
            console.warn('Storage yükleme atlandı:', storageErr);
          }

          // DB'ye kaydet
          const { data: dbData } = await supabase.from('analizler').insert({
            user_id: userId,
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
        console.error('Supabase kayıt hatası (analiz döndürülüyor):', dbErr);
      }
    }

    return res.status(200).json(parsed);

  } catch (err: any) {
    console.error('Analyze API hatası:', err?.message || err);
    const message = err?.message || 'Bilinmeyen hata oluştu';
    return res.status(500).json({ error: message });
  }
}
