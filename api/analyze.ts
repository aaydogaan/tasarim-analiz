import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export const maxDuration = 60; // Vercel hobby plan maximum timeout

type TasarimTuru = "Sosyal Medya" | "Kurumsal" | "E-Ticaret" | "Baskı Materyali" | "Logo Tasarımı" | "Arayüz (UI/UX)";

type AnalyzeRequestBody = {
  imageBase64?: string;
  imageUrl?: string;
  isletme: string;
  tasarimTuru?: TasarimTuru;
  platform?: string;
  sorular: {
    markaAdi: string;
    kurumselRenk: string;
    isYapisi: string;
    hedefKitle: string;
    slogan: string;
    yasGrubu?: string;
    kullanimYeri?: string;
    yapilisAmaci?: string;
  };
  guestMode?: boolean;
  isPro?: boolean;
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
  "Logo Tasarımı": {
    renk: "Marka Uyumu — Renkler markanın sektörüne ve hissiyatına uygun mu? Tek renkte bile çalışabilir mi?",
    font: "Özgünlük — Logotype kullanıldıysa karakterler özgün, okunaklı ve ölçeklenebilir mi?",
    butunluk: "Vektörel Denge — Sembol ve logotype orantılı mı? Ölçeklendiğinde ince detaylar kayboluyor mu?",
    kompozisyon: "Sadelik ve Etki — Logo akılda kalıcı, sade ve profesyonel standartlarda mı?",
    context: "Bu bir LOGO tasarımıdır. Logolarda 'buton', 'uzun metin', 'CTA' (harekete geçirici mesaj) gibi arayüz veya sosyal medya elemanları ARANMAZ. Odak noktan tamamen markalaşma, sadelik ve sembol/tipografi uyumu olmalıdır.",
  },
  "Arayüz (UI/UX)": {
    renk: "Erişilebilirlik — Kontrast oranları (WCAG) uygun mu? Vurgu renkleri (Action colors) doğru kullanılmış mı?",
    font: "Metin Hiyerarşisi — Başlık (H1) ile gövde metni ayrımı net mi? Okunabilirlik yüksek mi?",
    butunluk: "UI Tutarlılığı — Bileşenler (buton, kart, grid) kendi içinde görsel bir dil birliğine sahip mi?",
    kompozisyon: "UX ve Düzen — Beyaz boşluklar (whitespace), odak noktaları ve kullanıcı akışı sezgisel mi?",
    context: "Bu bir web veya mobil ARAYÜZ (UI/UX) tasarımıdır. Sadece estetiği değil, kullanılabilirliği, modern UI standartlarını ve hiyerarşiyi değerlendir.",
  }
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

  let { imageBase64, imageUrl, isletme, tasarimTuru = "Kurumsal", platform, sorular } = body;

  if (!imageBase64 && imageUrl) {
    try {
      const imgResp = await fetch(imageUrl);
      if (!imgResp.ok) throw new Error("Görsel URL'den indirilemedi.");
      const buffer = await imgResp.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString('base64');
    } catch (e: any) {
      return res.status(400).json({ error: "Görsel indirilirken hata oluştu: " + e.message });
    }
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'Görsel (base64 veya URL) gerekli.' });
  }
  const kriterler = kriterBilgisi[tasarimTuru];
  const platformBilgisi = tasarimTuru === "Sosyal Medya" && platform ? `Platform: ${platform}` : "";

  const ai = new GoogleGenAI({ apiKey });

  const isProUser = body.isPro || false;

  const roleDescription = isProUser
    ? "Sen dünya çapında ödüllü, kıdemli bir Tasarım Direktörü ve Sanat Yönetmenisin. Bu rapor bir PRO ÜYE içindir. Tasarımı en üst düzey teknik derinlik, renk teorisi, izgara (grid) hiyerarşisi, tipografik kerning/leading ve UX psikolojisi ile milimetrik analiz et."
    : "Sen dünya çapında ödüllü, son derece detaycı ama öz ve net konuşan bir Grafik Tasarım Analiz Yapay Zekasısın. Gönderilen görseli akademik ve teknik bir dille analiz edeceksin. Lütfen cevaplarını KISA, NET ve DOĞRUDAN profesyonel terimlerle ver.";

  const prompt = `${roleDescription}

ÖNEMLİ UYARI (HALÜSİNASYON ENGELLEYİCİ): Görseli DİKKATLİCE incele. Görselde OLMAYAN bir öğeyi (örneğin tasarımda buton yoksa butonun rengini, fiyat yoksa fiyat etiketini) varmış gibi eleştirme! Eğer görsel bir Logo ise ondan "harekete geçirici mesaj", "call to action", "uzun okunabilir metin" GİBİ ŞEYLER BEKLEME VE EKSİKLİĞİNİ HATA OLARAK SAYMA. SADECE gördüğün gerçek öğeler üzerinden yorum yap. Yorumların mantıklı, yapıcı ve doğrudan görselin içeriğiyle alakalı olmalı. Robotik ve jenerik cümleler yerine, deneyimli bir tasarımcı gibi DOĞAL ve GERÇEKÇİ konuş. Saçma ve alakasız yorumlardan KESİNLİKLE kaçın.

Tasarım Bağlamı:
- Tasarım Türü: ${tasarimTuru}
${platformBilgisi}
- Sektör: ${isletme} (Tasarımı, bu sektörün dinamiklerine, kullanıcı psikolojisine ve rakip standartlarına göre değerlendir)
- Marka Adı: ${sorular?.markaAdi || 'Belirtilmedi'}
- Yaş Grubu / Hedef Kitle: ${sorular?.yasGrubu || sorular?.hedefKitle || 'Belirtilmedi'}
- Kullanım Yeri: ${sorular?.kullanimYeri || 'Belirtilmedi'}
- Tasarımın Yapılış Amacı: ${sorular?.yapilisAmaci || 'Belirtilmedi'}

${kriterler.context}

Lütfen yukarıdaki bağlamlarda tasarımı sert ama yapıcı bir dille eleştir. 4 temel kriter için 0-25 arası puan ver:
1. RENK: ${kriterler.renk}
2. FONT: ${kriterler.font}
3. BÜTÜNLÜK: ${kriterler.butunluk}
4. KOMPOZİSYON: ${kriterler.kompozisyon}

YALNIZCA GEÇERLİ BİR JSON NESNESİ DÖNDÜR. (Markdown veya \`\`\`json ekleme, doğrudan salt JSON çıktısı ver).
JSON Formatı Şablonu:
{
  "renk": {"puan": 20, "aciklama": "(${isProUser ? 'Renk teorisi, kontrast oranları ve renk psikolojisine dair teknik profesyonel analiz' : 'Renk teorisi ve harmoni açısından en fazla 1-2 cümlelik kısa profesyonel analiz'})"},
  "font": {"puan": 18, "aciklama": "(${isProUser ? 'Tipografi hiyerarşisi, font ağırlıkları, okunabilirlik ve punto oranları teknik analizi' : 'Tipografi ve okunabilirlik üzerine teknik terimlerle 1-2 cümlelik net açıklama'})"},
  "butunluk": {"puan": 22, "aciklama": "(${isProUser ? 'Marka kimliği bütünlüğü, sektör standartları ve görsel dil uyumu analizi' : 'Marka kimliği ve sektör uyumuna dair kısa profesyonel inceleme'})"},
  "kompozisyon": {"puan": 19, "aciklama": "(${isProUser ? 'Hizalama, negatif alan dengesi, odak noktası ve CTA yerleşimi teknik analizi' : 'Görsel denge ve hizalama ile ilgili nokta atışı analiz'})"},
  "genelPuan": 82,
  "genelYorum": "(Tasarımın neleri başardığı ve eksikleri hakkında ${isProUser ? 'detaylı, profesyonel tasarım direktörü değerlendirmesi' : 'kısa, tek paragraflık net değerlendirme'})",
  "oneri": "(Gelişim için ${isProUser ? 'uygulanabilir 5 maddelik somut adım adım revizyon önerileri' : 'en fazla 3 maddelik kısa ve spesifik tavsiyeler'})",
  "genelDegerlendirme": "Örn: Profesyonel / Usta İşi / Geliştirilebilir",
  "gucluYon": "(Tasarımı kurtaran 1 temel özellik)",
  "zayifYon": "(En bariz teknik eksiklik)",
  "renkPaleti": ["#1a1a2e","#16213e","#0f3460","#e94560","#ffffff"],
  "teknikOzet": {"baskınRenkSayisi": 4, "detayYogunlugu": 35, "negatifAlanOrani": 55}
}`;

  try {
    const modelsToTry = ['gemini-flash-lite-latest', 'gemini-flash-latest'];
    let rawText = '';
    let secilenModel = '';
    let firstError = null;

    for (const mod of modelsToTry) {
      try {
        secilenModel = mod;
        const response = await ai.models.generateContent({
          model: mod,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
              ]
            }
          ],
          config: {
            temperature: 0.25,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
          }
        });

        rawText = response.text || '';
        if (rawText.trim()) {
          break; // Başarılı, döngüden çık
        }
      } catch (modErr: any) {
        console.warn(`Model [${mod}] hatası:`, modErr?.message);
        if (!firstError) firstError = modErr;
        // Hata durumunda döngü devam edecek ve sonraki modele geçecek
      }
    }

    // GEMINI BAŞARISIZ OLURSA GROQ API (LLAMA VISION) İLE YEDEKLEME (FALLBACK)
    if (!rawText.trim()) {
      console.warn('Tüm Gemini modelleri başarısız oldu, Groq API (Llama 3.2 Vision) deneniyor...');
      try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (groqApiKey) {
          const groq = new Groq({ apiKey: groqApiKey });
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt + '\nIMPORTANT: Return ONLY a valid JSON object matching the requested schema.' },
                  { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
                ],
              },
            ],
            model: 'llava-v1.5-7b-4096-preview',
            temperature: 0.25,
            max_tokens: 4000
          });
          
          rawText = chatCompletion.choices[0]?.message?.content || '';
          secilenModel = 'llava-v1.5-7b-4096-preview (Groq)';
          console.log('Groq API başarıyla yanıt verdi.');
        } else {
          console.error('Groq API anahtarı bulunamadı.');
        }
      } catch (groqErr: any) {
        console.error('Groq API de başarısız oldu:', groqErr?.message);
      }
    }

    if (!rawText.trim()) {
      console.error('Tüm yapay zeka sağlayıcıları (Gemini ve Groq) başarısız oldu.');
      return res.status(503).json({ error: `Yapay Zeka Hatası: Lütfen 1-2 dakika bekleyip tekrar deneyin. (Tüm sunucular çok yoğun)` });
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

    // Supabase'e kaydet ve _analiz_id üret
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Kullanıcı token'ından user_id'yi bul
        const token = req.headers.authorization?.replace('Bearer ', '');
        let userId: string | null = null;
        let userName: string | null = null;
        let userAvatar: string | null = null;

        if (token) {
          // Tokenı doğrudan auth API'sine gönderip doğrula
          const authClient = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
          });
          const { data: { user }, error: userError } = await authClient.auth.getUser();
          if (!userError && user) {
            userId = user.id;
            userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "Gizli Tasarımcı";
            userAvatar = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`;
          }
        }

        let gorselUrl: string | null = null;
        try {
          const fileName = `${userId || 'anon'}_${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
          const imageBuffer = Buffer.from(imageBase64, 'base64');
          
          const s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.VITE_R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
              accessKeyId: (process.env.VITE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID)!,
              secretAccessKey: (process.env.VITE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY)!,
            },
          });

          await s3Client.send(new PutObjectCommand({
            Bucket: process.env.VITE_R2_BUCKET_NAME || process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: imageBuffer,
            ContentType: 'image/jpeg',
          }));

          const r2PublicUrl = (process.env.VITE_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL)?.replace(/\/$/, "");
          gorselUrl = `${r2PublicUrl}/${fileName}`;
        } catch (storageErr) {
          console.warn('R2 Storage yükleme atlandı:', storageErr);
        }

        // Service role client veya fallback client ile kaydet (RLS takılmasın)
        const dbClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);

        // DB'ye kaydet
        const { data: dbData, error: dbInsertErr } = await dbClient.from('analizler').insert({
          user_id: userId,
          user_name: userName,
          user_avatar: userAvatar,
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

        if (dbInsertErr) {
          console.error('Analiz DB insert hatası:', dbInsertErr);
        }

        if (dbData?.id) {
          parsed._analiz_id = dbData.id;
          parsed._gorsel_url = gorselUrl;

          // Notify followers who enabled post notifications
          if (userId) {
            try {
              const { data: followers } = await dbClient
                .from('user_follows')
                .select('follower_id')
                .eq('following_id', userId)
                .eq('notify_posts', true);
              
              if (followers && followers.length > 0) {
                const notifications = followers.map((f: any) => ({
                  user_id: f.follower_id,
                  actor_id: userId,
                  type: 'new_post',
                  analiz_id: dbData.id
                }));
                await dbClient.from('notifications').insert(notifications);
              }
            } catch (notifErr) {
              console.error('Follower bildirim hatası:', notifErr);
            }
          }
        }
      }
    } catch (dbErr) {
      console.error('Supabase kayıt hatası (analiz döndürülüyor):', dbErr);
    }

    return res.status(200).json(parsed);

  } catch (err: any) {
    console.error('Analyze API hatası:', err?.message || err);
    const message = err?.message || 'Bilinmeyen hata oluştu';
    return res.status(500).json({ error: message });
  }
}
