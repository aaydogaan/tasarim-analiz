import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

type AnalyzeRequestBody = {
  imageBase64: string;
  isletme: string;
  sorular: {
    markaAdi: string;
    kurumselRenk: string;
    isYapisi: string;
    hedefKitle: string;
    slogan: string;
  };
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

  const { imageBase64, isletme, sorular } = body;

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Sen uzman bir grafik tasarım değerlendirme yapay zekasısın.

Firma Bilgileri:
- İşletme Türü: ${isletme}
- Marka Adı: ${sorular?.markaAdi || 'Belirtilmedi'}
- Kurumsal Renkler: ${sorular?.kurumselRenk || 'Belirtilmedi'}
- İş Yapısı: ${sorular?.isYapisi || 'Belirtilmedi'}
- Hedef Kitle: ${sorular?.hedefKitle || 'Belirtilmedi'}
- Slogan: ${sorular?.slogan || 'Belirtilmedi'}

Bu bilgileri göz önünde bulundurarak tasarımı 4 kritere göre değerlendir (0-25 puan). Ardından bağımsız genel puan ver (0-100).

Ek olarak:
- Tasarımda gördüğün baskın renkleri hex kodu olarak tespit et (en fazla 6 renk, # ile başlayan).
- Teknik özellik tahmini:
  * baskınRenkSayisi: Tasarımda algılanan baskın renk adedi (rakam)
  * detayYogunlugu: Tasarımın detay yoğunluğu yüzdesi, 0-100 arası TAM SAYI
  * negatifAlanOrani: Tasarımdaki boş/negatif alan oranı yüzdesi, 0-100 arası TAM SAYI
- genelDegerlendirme: Şu seçeneklerden biri: "Mükemmel", "Harika", "İyi", "Orta", "Geliştirilebilir"
- gucluYon: Tasarımın en güçlü tek özelliği, kısa bir cümle.
- zayifYon: Tasarımın en kritik zayıf noktası, kısa bir cümle.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Analyze API hatası:', err);
    const message = err?.message || 'Bilinmeyen hata oluştu';
    const status = typeof err?.status === 'number' ? err.status : 500;
    return res.status(status).json({ error: message });
  }
}
