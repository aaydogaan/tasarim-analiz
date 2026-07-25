const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';
const FROM_EMAIL = import.meta.env.VITE_RESEND_FROM_EMAIL || 'Revizelesene <onboarding@resend.dev>';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn('Resend API key missing.');
    return { success: false, error: 'Resend API Key bulunamadı.' };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipients,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return { success: false, error: data.message || 'E-posta gönderilemedi.' };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Resend Exception:', err);
    return { success: false, error: err.message || 'Bağlantı hatası' };
  }
}

// 1. HOŞ GELDİN E-POSTASI ŞABLONU
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const name = userName || 'Tasarımcı';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Revizelesene'ye Hoş Geldin!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f4f4f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #18181b; border-radius: 20px; overflow: hidden; border: 1px solid #27272a;">
        
        <!-- Header Banner -->
        <tr>
          <td style="padding: 36px 40px; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); text-align: center; border-bottom: 1px solid #27272a;">
            <h1 style="margin: 0; color: #FF5500; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">
              Revizelesene
            </h1>
            <p style="margin: 6px 0 0 0; color: #a1a1aa; font-size: 13px; font-weight: 600;">
              Geri Bildirim, Yeniden Tanımlandı.
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 40px;">
            <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 22px; font-weight: 800;">
              Aramıza Hoş Geldin, ${name}! 👋
            </h2>
            
            <p style="margin: 0 0 20px 0; color: #d4d4d8; font-size: 15px; line-height: 1.6;">
              Revizelesene topluluğuna katıldığın için çok heyecanlıyız. Artık tasarımlarını profesyonel yapay zeka kriterleriyle analiz ettirebilir, topluluktan geri bildirim alabilir ve ödüllü tasarım yarışmalarına katılabilirsin!
            </p>

            <!-- Feature Cards Grid -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
              <tr>
                <td style="padding: 16px; background-color: #27272a; border-radius: 14px; margin-bottom: 12px;">
                  <h4 style="margin: 0 0 6px 0; color: #FF5500; font-size: 14px; font-weight: 800;">
                    🎨 Profesyonel Tasarım Analizi
                  </h4>
                  <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                    Renk paleti, tipografi, hiyerarşi ve marka uyumunu anında ölçümle.
                  </p>
                </td>
              </tr>
              <tr><td style="height: 10px;"></td></tr>
              <tr>
                <td style="padding: 16px; background-color: #27272a; border-radius: 14px;">
                  <h4 style="margin: 0 0 6px 0; color: #FF5500; font-size: 14px; font-weight: 800;">
                    🏆 Ödüllü Tasarım Yarışmaları
                  </h4>
                  <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                    Topluluk yarışmalarına katıl, tasarımlarını jüriye sun ve ödüller kazan.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Call to Action Button -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://revizelesene.com" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #FF5500; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; border-radius: 12px; shadow: 0 4px 12px rgba(255,85,0,0.3);">
                Hemen İlk Analizini Yap →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 40px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              © ${new Date().getFullYear()} Revizelesene. Tüm hakları saklıdır.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `🚀 Revizelesene'ye Hoş Geldin, ${name}!`,
    html,
  });
}

// 2. YARIŞMA & BÜLTEN DUYURU E-POSTASI ŞABLONU
export async function sendContestNewsletterEmail({
  to,
  contestTitle,
  contestDescription,
  contestSlug,
  rewardTitle,
}: {
  to: string | string[];
  contestTitle: string;
  contestDescription: string;
  contestSlug: string;
  rewardTitle?: string;
}) {
  const contestUrl = `https://revizelesene.com/yarisma/${contestSlug}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Yeni Tasarım Yarışması Başladı!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f4f4f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #18181b; border-radius: 20px; overflow: hidden; border: 1px solid #27272a;">
        
        <!-- Header Banner -->
        <tr>
          <td style="padding: 36px 40px; background: linear-gradient(135deg, #FF5500 0%, #d94400 100%); text-align: center; color: #ffffff;">
            <span style="background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
              Yeni Yarışma Duyurusu
            </span>
            <h1 style="margin: 12px 0 4px 0; font-size: 26px; font-weight: 900;">
              ${contestTitle}
            </h1>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 40px;">
            <p style="margin: 0 0 20px 0; color: #d4d4d8; font-size: 15px; line-height: 1.6;">
              Revizelesene'de yeni bir tasarım yarışması yayında! Yaratıcılığını sergilemek ve topluluğun öne çıkan tasarımcıları arasına girmek için harika bir fırsat.
            </p>

            <div style="padding: 20px; background-color: #27272a; border-radius: 14px; margin-bottom: 24px; border-left: 4px solid #FF5500;">
              <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 800;">
                Yarışma Hakkında
              </h3>
              <p style="margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.5;">
                ${contestDescription}
              </p>

              ${rewardTitle ? `
                <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #3f3f46;">
                  <span style="color: #FF5500; font-size: 12px; font-weight: 800; text-transform: uppercase;">🏆 Yarışma Ödülü:</span>
                  <strong style="color: #ffffff; font-size: 14px; display: block; margin-top: 2px;">${rewardTitle}</strong>
                </div>
              ` : ''}
            </div>

            <!-- Call to Action Button -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="${contestUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #FF5500; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; border-radius: 12px; shadow: 0 4px 12px rgba(255,85,0,0.3);">
                Yarışmayı İncele ve Katıl →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 40px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              Bu e-posta Revizelesene bülten abonesi veya üyesi olduğunuz için gönderilmiştir.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `🏆 Yeni Yarışma Başladı: ${contestTitle}`,
    html,
  });
}
