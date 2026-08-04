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

    let domainOrigin = 'https://www.behance.net';
    try {
      domainOrigin = new URL(url).origin;
    } catch (_) {}

    // Direct Image Check
    const lowerUrl = url.toLowerCase();
    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(lowerUrl);

    if (isDirectImage) {
      try {
        const imgRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Referer': domainOrigin
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!pageRes.ok) {
      return res.status(400).json({ success: false, error: 'Bağlantı adresine erişilemedi. Lütfen bağlantıyı kontrol edin.' });
    }

    const html = await pageRes.text();

    let extractedImage = '';

    // 1. Behance specific high-res project modules extraction
    const behanceModules = html.match(/https:\/\/mir-s3-cdn-cf\.behance\.net\/project_modules\/[^\s"'>\\]+/gi);
    if (behanceModules && behanceModules.length > 0) {
      const hdModule = behanceModules.find(m => m.includes('max_1200') || m.includes('1400') || m.includes('disp')) || behanceModules[0];
      extractedImage = hdModule;
    }

    // 1b. Behance projects fallback
    if (!extractedImage) {
      const behanceProjects = html.match(/https:\/\/mir-s3-cdn-cf\.behance\.net\/projects\/[^\s"'>\\]+/gi);
      if (behanceProjects && behanceProjects.length > 0) {
        extractedImage = behanceProjects[0];
      }
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

    // 4. JSON-LD image search
    if (!extractedImage) {
      const jsonLdMatch = html.match(/"contentUrl"\s*:\s*"([^"]+)"/i) || html.match(/"image"\s*:\s*\[?\s*"([^"]+)"/i);
      if (jsonLdMatch && jsonLdMatch[1]) {
        extractedImage = jsonLdMatch[1];
      }
    }

    // 5. Fallback: Dribbble / Pinterest / General image links
    if (!extractedImage) {
      const generalMatch = html.match(/https:\/\/cdn\.dribbble\.com\/userupload\/[^\s"'>\\]+/i) ||
                           html.match(/https:\/\/i\.pinimg\.com\/originals\/[^\s"'>\\]+/i) ||
                           html.match(/<img[^>]+src=["'](https:\/\/[^"']+\.(jpg|jpeg|png|webp))["']/i);
      if (generalMatch) {
        extractedImage = generalMatch[1] || generalMatch[0];
      }
    }

    if (!extractedImage) {
      return res.status(400).json({
        success: false,
        error: 'Bu bağlantıdan görsel çekilemedi. Lütfen doğrudan görsel bağlantısı veya geçerli Behance / Dribbble / Pinterest sayfa linki girin.'
      });
    }

    // Clean up escaped backslashes or html entities like &amp; or \/
    extractedImage = extractedImage.replace(/\\/g, '').replace(/&amp;/g, '&');

    // Fetch extracted image to convert to Base64 with Referer header!
    try {
      const imgOrigin = new URL(extractedImage).origin;
      const fetchedImg = await fetch(extractedImage, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': domainOrigin || imgOrigin || 'https://www.behance.net/'
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
