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
  let isProUser = body.isPro || false;

  // Server-side check of auth token to guarantee PRO detection even if client payload differs
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
      );
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_pro, role').eq('id', user.id).maybeSingle();
        if (profile?.is_pro || profile?.role === 'pro' || profile?.role === 'admin') {
          isProUser = true;
        }
      }
    } catch (e) {
      console.warn("Could not verify auth token in analyze API:", e);
    }
  }

  const roleDescription = isProUser
    ? "Sen dünya çapında tasarım yarışmalarında jürilik yapan, 15+ yıl deneyimli Kıdemli Sanat Yönetmeni ve Tasarım Direktörüsün. Bu rapor ÖZEL BİR PRO ÜYE İÇİNDİR. Yüzeysel genel geçer cümleler yazma! Tasarımı milimetrik teknik derinlikte; tipografik hiyerarşi ve kerning/leading, WCAG 2.1 AA/AAA renk kontrast oranları, ızgara (grid) ve mikro-boşluk hizalaması, görsel ağırlık ve kullanıcı göz hareketleri (F/Z kalıbı) açısından EN ÜST DÜZEY SANAT YÖNETMENİ DERİNLİĞİNDE analiz et."
    : "Sen dünya çapında ödüllü, son derece detaycı, yapıcı ve uzman bir Grafik Tasarım Direktörüsün. Gönderilen görseli yüzeysel geçmeden, hem teknik terimlerle hem de anlaşılır bir dille tatmin edici ve rehberlik edici derinlikte analiz et.";

  const prompt = `${roleDescription}

ÖNEMLİ PUANLAMA VE DEĞERLENDİRME KURALLARI:
1. PUAN ÇEŞİTLİLİĞİ VE GERÇEKÇİLİK: Her tasarıma ortalama 70-80 puan verme! Gerçekten zayıf, acemi veya dengesiz tasarımlara 35-65 arası düşük puan ver. Gerçekten kusursuz, profesyonel tasarımlara 85-98 arası yüksek puan ver. Puanların cesur, adil ve görselin GERÇEK kalitesini yansıtacak şekilde geniş bir yelpazede dağılmasını sağla.
2. PUAN MATEMATİĞİ: 4 alt kriterin her birine 0 ile 25 arasında tam puan ver. "genelPuan" DEĞERİ MUTLAKA BU 4 ALANIN PUANLARININ TOPLAMI OLMALIDIR (0 - 100 arası).
3. HALÜSİNASYON ENGELLEYİCİ: Görselde OLMAYAN bir öğeyi varmış gibi eleştirme! Görsel bir Logo ise "buton", "CTA", "fiyat" gibi arayüz öğeleri arama ve yokluğunu hata sayma.
4. DERİNLİK VE UZUNLUK: ${isProUser ? 'PRO analiz modundasın. Her kriter açıklamasını en az 3-4 detaylı teknik cümle olarak yaz. Genel yorumu 3 kapsamlı paragraf yap. Öneriler kısmına tam 5 maddelik somut, uygulanabilir adım adım revizyon rehberi yaz.' : 'Her kriter açıklamasını 2-3 doyurucu cümle olarak yaz.'}

Tasarım Bağlamı:
- Tasarım Türü: ${tasarimTuru}
${platformBilgisi}
- Sektör: ${isletme} (Tasarımı, bu sektörün dinamiklerine, kullanıcı psikolojisine ve rakip standartlarına göre değerlendir)
- Marka Adı: ${sorular?.markaAdi || 'Belirtilmedi'}
- Yaş Grubu / Hedef Kitle: ${sorular?.yasGrubu || sorular?.hedefKitle || 'Belirtilmedi'}
- Kullanım Yeri: ${sorular?.kullanimYeri || 'Belirtilmedi'}
- Tasarımın Yapılış Amacı: ${sorular?.yapilisAmaci || 'Belirtilmedi'}

${kriterler.context}

Lütfen 4 temel kriter için (her biri 0-25 puan arası) değerlendirme yap:
1. RENK: ${kriterler.renk}
2. FONT: ${kriterler.font}
3. BÜTÜNLÜK: ${kriterler.butunluk}
4. KOMPOZİSYON: ${kriterler.kompozisyon}

YALNIZCA GEÇERLİ BİR JSON NESNESİ DÖNDÜR. (Markdown veya \`\`\`json ekleme, doğrudan salt JSON çıktısı ver).
JSON Şablonu (Puanlar tasarıma göre 0-25 arası özgürce belirlenmeli, genelPuan bunların toplamı olmalıdır):
{
  "renk": {"puan": 0, "aciklama": "${isProUser ? 'Renk teorisi, WCAG 2.1 kontrast oranları, renk psikolojisi ve görsel dengesi üzerine 3-4 teknik detaylı cümle' : 'Renk paleti uyumu, renk psikolojisi ve görsel kontrast açısından net ve yapıcı analiz'}"},
  "font": {"puan": 0, "aciklama": "${isProUser ? 'Tipografi hiyerarşisi, font ağırlıkları, kerning/leading, punto oranları ve okunabilirlik üzerine 3-4 teknik detaylı cümle' : 'Tipografi hiyerarşisi, font seçimi uyumu ve okunabilirlik üzerine açıklayıcı analiz'}"},
  "butunluk": {"puan": 0, "aciklama": "${isProUser ? 'Marka kimliği bütünlüğü, sektör standartları, kurumsal ton ve görsel dil uyumu üzerine 3-4 teknik detaylı cümle' : 'Marka kimliği bütünlüğü ve sektör standartlarına uygunluk hakkında değerlendirme'}"},
  "kompozisyon": {"puan": 0, "aciklama": "${isProUser ? 'Grid hiyerarşisi, negatif alan dengesi, visual weight ve CTA yerleşimi üzerine 3-4 teknik detaylı cümle' : 'Hizalama, negatif alan kullanımı, odak noktası ve görsel hiyerarşi üzerine analiz'}"},
  "genelPuan": 0,
  "genelYorum": "${isProUser ? 'Tasarımın genel başarısı, güçlü ve zayıf yönleri, kullanıcı psikolojisi üzerindeki etkisi ve sektör standartları kıyaslamasını içeren 3 kapsayıcı paragraflık kıdemli tasarım direktörü raporu' : '2 paragraflık doyurucu, net ve yol gösterici genel değerlendirme'}",
  "oneri": "${isProUser ? '1. [Adım 1], 2. [Adım 2], 3. [Adım 3], 4. [Adım 4], 5. [Adım 5] formatında tasarıma özel tam 5 maddelik uygulanabilir teknik revizyon tavsiyesi' : 'Gelişim için uygulanabilir 3 maddelik net revizyon tavsiyesi'}",
  "genelDegerlendirme": "Eksik / Geliştirilebilir / Başarılı / Usta İşi",
  "gucluYon": "Tasarımı öne çıkaran 1 temel teknik özellik",
  "zayifYon": "En bariz düzeltilmesi gereken teknik eksiklik",
  "renkPaleti": ["#HEX1","#HEX2","#HEX3","#HEX4","#HEX5"],
  "teknikOzet": {"baskınRenkSayisi": 3, "detayYogunlugu": 40, "negatifAlanOrani": 50}${isProUser ? ',\n  "proDetaylar": {\n    "renkKontrast": "Renk paletinin duygu dengesi ve WCAG kontrast analizi",\n    "tipografiDengesi": "Font çifti uyumu ve hiyerarşi analizi",\n    "kompozisyonVeGrid": "Negatif alan ve grid düzeni analizi",\n    "uxVeDonusum": "Kullanıcı odak noktası ve aksiyon potansiyeli analizi"\n  }' : ''}
}`;

  try {
    const modelsToTry = isProUser 
      ? ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest'] 
      : ['gemini-flash-lite-latest', 'gemini-flash-latest'];
    const maxTokens = isProUser ? 3500 : 1800;

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
            temperature: 0.4,
            maxOutputTokens: maxTokens,
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
