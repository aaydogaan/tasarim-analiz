import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.VITE_RESEND_FROM_EMAIL || 'Revizelesene <bilgi@revizelesene.com>';

const resend = new Resend(RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      type,
      to,
      userName,
      contestTitle,
      contestDescription,
      contestSlug,
      rewardTitle,
    } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: 'Alıcı e-posta adresi (to) gerekli.' });
    }

    const recipients = Array.isArray(to) ? to : [to];

    // 1. WELCOME EMAIL
    if (type === 'welcome') {
      const name = userName || 'Tasarımcı';
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Revizelesene'ye Hoş Geldin!</title></head>
        <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #18181b; border-radius: 24px; overflow: hidden; border: 1px solid #27272a; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <tr>
              <td style="padding: 36px 40px; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); text-align: center; border-bottom: 1px solid #27272a;">
                <h1 style="margin: 0; color: #FF5500; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">Revizelesene</h1>
                <p style="margin: 6px 0 0 0; color: #a1a1aa; font-size: 13px; font-weight: 600;">Yapay Zeka Destekli Tasarım Topluluğu</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 22px; font-weight: 800;">Aramıza Hoş Geldin, ${name}! 🎉</h2>
                <p style="margin: 0 0 20px 0; color: #d4d4d8; font-size: 15px; line-height: 1.6;">
                  Revizelesene topluluğuna katıldığın için çok heyecanlıyız! Yapay zeka analiz motorumuzla tasarımlarını mükemmelleştirirken, diğer tasarımcılarla etkileşime geçebileceğin harika bir başlangıç yaptın.
                </p>

                <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 16px; padding: 24px; margin-bottom: 28px;">
                  <h3 style="margin: 0 0 14px 0; color: #FF5500; font-size: 16px; font-weight: 800;">🎯 Şimdi Profilini Tamamla & İlk 100 Destekçi Rozetini Kap!</h3>
                  <p style="margin: 0 0 16px 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                    Diğer tasarımcıların seni tanıması, Keşfet Vitrini'nde öne çıkman ve profil rozetlerini kazanman için profilini hemen özelleştir:
                  </p>
                  <ul style="margin: 0; padding-left: 20px; color: #d4d4d8; font-size: 14px; line-height: 1.8;">
                    <li><strong>Profil Fotoğrafı & Kapak:</strong> Kendine özgü avatarını seç veya kendi görselini yükle.</li>
                    <li><strong>Biyografi:</strong> Tasarım vizyonunu ve tarzını anlat.</li>
                    <li><strong>Portfolyo Linkleri:</strong> Behance, Dribbble, Instagram veya web siteni ekle.</li>
                    <li><strong>Uzmanlık Alanı:</strong> UI/UX, Logo, Sosyal Medya vb. branşını belirle.</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 32px 0 24px 0;">
                  <a href="https://www.revizelesene.com/profile" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #FF5500; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 900; border-radius: 14px; box-shadow: 0 10px 20px rgba(255, 85, 0, 0.3);">
                    Profilimi Şimdi Tamamla →
                  </a>
                </div>

                <p style="margin: 0; color: #71717a; font-size: 12px; text-align: center;">
                  💡 <em>İpucu: Profil bilgileri eksiksiz olan kullanıcıların gönderileri Keşfet Vitrini'nde %70 daha fazla etkileşim alıyor!</em>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 40px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 12px;">Soruların için doğrudan bu e-postaya yanıt verebilirsin.</p>
                <p style="margin: 0; color: #71717a; font-size: 12px;">© ${new Date().getFullYear()} Revizelesene. Tüm hakları saklıdır.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to: recipients,
        subject: `🚀 Revizelesene'ye Hoş Geldin! Profilini Tamamla & İlk 100 Destekçi Rozetini Kap`,
        html,
      });

      return res.status(200).json({ success: true, data: response });
    }

    // 1.5. DAY WINNER EMAIL
    if (type === 'day_winner') {
      const name = userName || 'Tasarımcı';
      const score = req.body.score || 85;
      const designTitle = contestTitle || 'Tasarımınız';
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Günün Tasarımı Seçildiniz!</title></head>
        <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #18181b; border-radius: 24px; overflow: hidden; border: 1px solid #f59e0b; box-shadow: 0 20px 40px rgba(245, 158, 11, 0.2);">
            <tr>
              <td style="padding: 36px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center; color: #ffffff;">
                <span style="background-color: rgba(0,0,0,0.3); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
                  👑 GÜNÜN TASARIMI ŞAMPİYONU
                </span>
                <h1 style="margin: 14px 0 4px 0; font-size: 28px; font-weight: 900;">Tebrikler ${name}! 🏆</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 800;">Tasarımın Günün 1. Tasarımı Seçildi!</h2>
                <p style="margin: 0 0 20px 0; color: #d4d4d8; font-size: 15px; line-height: 1.6;">
                  Revizelesene yapay zeka analiz sistemimizde yüklediğin <strong>"${designTitle}"</strong> tasarımı, <strong style="color: #f59e0b;">${score}/100 AI skoru</strong> ile günün en yüksek puan alan tasarımı seçildi ve ana sayfa vitrininde 1. sıraya yerleşti!
                </p>

                <div style="background-color: #09090b; border: 1px solid #f59e0b; border-radius: 16px; padding: 20px; text-align: center; margin: 28px 0;">
                  <span style="color: #f59e0b; font-size: 14px; font-weight: 800; display: block; margin-bottom: 4px;">👑 KAZANILAN ROZET</span>
                  <span style="color: #ffffff; font-size: 18px; font-weight: 900;">Günün Tasarımı Şampiyonu</span>
                </div>

                <div style="text-align: center; margin: 32px 0 16px 0;">
                  <a href="https://www.revizelesene.com/vitrin" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #f59e0b; color: #000000; text-decoration: none; font-size: 15px; font-weight: 900; border-radius: 14px; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);">
                    Tasarımını Vitrinde Gör →
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 40px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
                <p style="margin: 0; color: #71717a; font-size: 12px;">© ${new Date().getFullYear()} Revizelesene. Tüm hakları saklıdır.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to: recipients,
        subject: `👑 Tebrikler! Tasarımın Revizelesene'de "Günün Tasarımı" Seçildi!`,
        html,
      });

      return res.status(200).json({ success: true, data: response });
    }

    // 2. NEWSLETTER / CONTEST ANNOUNCEMENT EMAIL
    const title = contestTitle || 'Yeni Tasarım Duyurusu';
    const contestUrl = `https://revizelesene.com/yarisma/${contestSlug || 'duyuru'}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>${title}</title></head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f4f4f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #18181b; border-radius: 20px; overflow: hidden; border: 1px solid #27272a;">
          <tr>
            <td style="padding: 36px 40px; background: linear-gradient(135deg, #FF5500 0%, #d94400 100%); text-align: center; color: #ffffff;">
              <span style="background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                Yeni Duyuru
              </span>
              <h1 style="margin: 12px 0 4px 0; font-size: 26px; font-weight: 900;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #d4d4d8; font-size: 15px; line-height: 1.6;">
                ${contestDescription || 'Revizelesene tasarım platformunda yeni gelişmeler ve duyurular var!'}
              </p>
              ${rewardTitle ? `
                <div style="padding: 16px; background-color: #27272a; border-radius: 12px; border-left: 4px solid #FF5500; margin-bottom: 24px;">
                  <strong style="color: #FF5500; font-size: 12px; font-weight: 800; text-transform: uppercase;">🏆 Ödül:</strong>
                  <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 14px; font-weight: 700;">${rewardTitle}</p>
                </div>
              ` : ''}
              <div style="text-align: center; margin-top: 32px;">
                <a href="${contestUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #FF5500; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; border-radius: 12px;">
                  Detayları İncele →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">Revizelesene Bülten E-postası</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: `🏆 ${title}`,
      html,
    });

    return res.status(200).json({ success: true, data: response });
  } catch (err: any) {
    console.error('API send-email error:', err);
    return res.status(500).json({ error: err.message || 'E-posta gönderilemedi.' });
  }
}
