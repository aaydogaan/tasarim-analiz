import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

type ReviseRequestBody = {
  imageBase64: string;
  oneri: string;
  sorular: {
    markaAdi: string;
  };
  isletme: string;
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

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ReviseRequestBody;
  if (!body?.imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64.' });
  }

  const { imageBase64, oneri, sorular, isletme } = body;
  const ai = new GoogleGenAI({ apiKey });

  const revizePrompt = `Aşağıdaki tasarım önerilerini dikkate alarak bu görseli revize et ve yeni bir profesyonel tasarım oluştur. 
      Öneriler: ${oneri}
      Marka: ${sorular?.markaAdi || ''}
      Sektör: ${isletme}
      Lütfen modern, estetik ve önerilere tam uyumlu bir görsel üret.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            { text: revizePrompt },
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
        responseModalities: ['IMAGE'],
      },
    });

    const parts = response?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part?.inlineData?.data) {
        return res.status(200).json({ imageBase64: part.inlineData.data });
      }
    }

    return res.status(502).json({ error: 'Model tarafından görsel oluşturulamadı. Lütfen tekrar deneyin.' });
  } catch (err: any) {
    console.error('Revise API hatası:', err);
    const message = err?.message || 'Bilinmeyen hata oluştu';
    const status = typeof err?.status === 'number' ? err.status : 500;
    return res.status(status).json({ error: message });
  }
}
