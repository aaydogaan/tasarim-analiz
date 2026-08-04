import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 30;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = (typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : req.body) || {};
    let { url } = body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Lütfen geçerli bir URL girin.' });
    }

    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Direct Image Check
    const lowerUrl = url.toLowerCase();
    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(lowerUrl);

    if (isDirectImage) {
      try {
        const imgRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
          return res.status(200).json({ success: true, imageUrl: url, base64 });
        }
      } catch (err) {
        console.warn('Direct image fetch error:', err);
      }
    }

    // HTML Webpage Scraping (Behance, Dribbble, Pinterest, Instagram, Figma, etc.)
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!pageRes.ok) {
      return res.status(400).json({ success: false, error: 'Bağlantı adresine erişilemedi. Lütfen bağlantıyı kontrol edin.' });
    }

    const html = await pageRes.text();

    // Extract OpenGraph / Twitter / Meta image tags
    let extractedImage = '';

    // 1. Behance specific extraction
    const behanceMatch = html.match(/https:\/\/mir-s3-cdn-cf\.behance\.net\/project_modules\/[^\s"'>]+/i) ||
                         html.match(/https:\/\/mir-s3-cdn-cf\.behance\.net\/projects\/[^\s"'>]+/i);
    if (behanceMatch) {
      extractedImage = behanceMatch[0];
    }

    // 2. OpenGraph og:image
    if (!extractedImage) {
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      if (ogMatch && ogMatch[1]) {
        extractedImage = ogMatch[1];
      }
    }

    // 3. Twitter image
    if (!extractedImage) {
      const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
      if (twitterMatch && twitterMatch[1]) {
        extractedImage = twitterMatch[1];
      }
    }

    // 4. Fallback: Dribbble / Pinterest / General image links
    if (!extractedImage) {
      const generalMatch = html.match(/https:\/\/cdn\.dribbble\.com\/userupload\/[^\s"'>]+/i) ||
                           html.match(/https:\/\/i\.pinimg\.com\/originals\/[^\s"'>]+/i) ||
                           html.match(/<img[^>]+src=["'](https:\/\/[^"']+\.(jpg|jpeg|png|webp))["']/i);
      if (generalMatch) {
        extractedImage = generalMatch[1] || generalMatch[0];
      }
    }

    if (!extractedImage) {
      return res.status(400).json({
        success: false,
        error: 'Bu bağlantıdan görsel çekilemedi. Lütfen doğrudan görsel bağlantısı veya Behance / Dribbble / Pinterest sayfa linki girin.'
      });
    }

    // Clean up html entities like &amp;
    extractedImage = extractedImage.replace(/&amp;/g, '&');

    // Fetch extracted image to convert to Base64 so frontend & AI backend receive full image data!
    try {
      const fetchedImg = await fetch(extractedImage, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (fetchedImg.ok) {
        const arrayBuf = await fetchedImg.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        const contentType = fetchedImg.headers.get('content-type') || 'image/jpeg';
        const base64 = `data:${contentType};base64,${buf.toString('base64')}`;
        return res.status(200).json({ success: true, imageUrl: extractedImage, base64 });
      }
    } catch (e) {
      console.warn('Error downloading extracted image:', e);
    }

    return res.status(200).json({ success: true, imageUrl: extractedImage });
  } catch (err: any) {
    console.error('Fetch URL image error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Görsel yüklenirken sunucu hatası oluştu.' });
  }
}
