import type { VercelRequest, VercelResponse } from '@vercel/node';

const ODEAL_API_KEY = process.env.ODEAL_API_KEY || 'a9ef1192-0745-465d-bd5e-ac5a3ba18051';
const ODEAL_SECRET_KEY = process.env.ODEAL_SECRET_KEY || '482cd558ffbcd57e9c9f154a03fc308993677dbabc6f39a504b3a8763ee84e31';

async function safeJsonParse(res: Response) {
  try {
    const text = await res.text();
    if (!text || text.trim().length === 0) return { rawText: text };
    try {
      return JSON.parse(text);
    } catch {
      return { rawText: text };
    }
  } catch {
    return {};
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const requestBody = (typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : req.body) || {};
    const { userEmail, userId, userName } = requestBody;

    // Try environments in pairs (Live Production first, then Sandbox fallback)
    const envPairs = [
      {
        authUrl: 'https://auth.odeal.com/api/v1/token',
        vposUrls: ['https://api.odeal.com/vpos/init-3d', 'https://api.odeal.com/api/v1/pay-by-link']
      },
      {
        authUrl: 'https://api.odeal.com/api/v1/token',
        vposUrls: ['https://api.odeal.com/vpos/init-3d', 'https://api.odeal.com/api/v1/pay-by-link']
      },
      {
        authUrl: 'https://auth-sandbox.odeal.com/api/v1/token',
        vposUrls: ['https://api-stg.odeal.com/vpos/init-3d', 'https://api-stg.odeal.com/api/v1/pay-by-link']
      }
    ];

    let threeDFormHtml = '';
    let paymentUrl = '';
    let lastError = '';

    for (const envItem of envPairs) {
      let token = '';
      try {
        const tokenRes = await fetch(envItem.authUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            clientId: ODEAL_API_KEY,
            clientSecret: ODEAL_SECRET_KEY,
            client_id: ODEAL_API_KEY,
            client_secret: ODEAL_SECRET_KEY,
            grantType: 'client_credentials',
            grant_type: 'client_credentials',
            scope: 'api'
          })
        });

        const tokenData = await safeJsonParse(tokenRes);
        console.log(`Auth result from ${envItem.authUrl}:`, tokenData);

        token = tokenData.token || tokenData.accessToken || tokenData.id_token || tokenData.data?.token || tokenData.result?.token || '';
        
        if (!token && (tokenData.message || tokenData.error || tokenData.description)) {
          const rawErr = tokenData.message || tokenData.error || tokenData.description;
          lastError = typeof rawErr === 'string' ? rawErr : (rawErr.message || rawErr.description || JSON.stringify(rawErr));
        }
      } catch (err: any) {
        console.error(`Token fetch failed for ${envItem.authUrl}:`, err);
        lastError = err.message || 'ÖdeAl Auth bağlantı hatası';
      }

      if (token) {
        for (const vposUrl of envItem.vposUrls) {
          try {
            const vposRes = await fetch(vposUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Api-Key': ODEAL_API_KEY,
                'X-Client-Id': ODEAL_API_KEY
              },
              body: JSON.stringify({
                amount: 59.00,
                currency: 'TRY',
                description: 'Revizelesene PRO Paket Abonelik (59 TL)',
                email: userEmail || 'bilgi@revizelesene.com',
                customerName: userName || 'Revizelesene Üyesi',
                returnUrl: 'https://revizelesene.com/api/odeal-callback',
                callbackUrl: 'https://revizelesene.com/api/odeal-callback',
                successRedirectUrl: 'https://revizelesene.com/profile?payment=success',
                failureRedirectUrl: 'https://revizelesene.com/profile?payment=error',
                externalId: userId || `pro_${Date.now()}`
              })
            });

            const vposData = await safeJsonParse(vposRes);
            console.log(`VPOS result from ${vposUrl}:`, vposData);

            threeDFormHtml = vposData.threeDFormHtml || vposData.result?.threeDFormHtml || vposData.data?.threeDFormHtml || '';
            paymentUrl = vposData.paymentUrl || vposData.url || vposData.link || vposData.redirectUrl || vposData.data?.url || '';

            if (vposData.message || vposData.error || vposData.description) {
              const rawErr = vposData.message || vposData.error || vposData.description;
              lastError = typeof rawErr === 'string' ? rawErr : (rawErr.message || rawErr.description || JSON.stringify(rawErr));
            }

            if (threeDFormHtml || paymentUrl) break;
          } catch (err: any) {
            console.error(`VPOS request failed for ${vposUrl}:`, err);
            lastError = err.message || 'ÖdeAl VPOS bağlantı hatası';
          }
        }
      }

      if (threeDFormHtml || paymentUrl) break;
    }

    if (threeDFormHtml) {
      return res.status(200).json({ success: true, threeDFormHtml });
    }

    if (paymentUrl) {
      return res.status(200).json({ success: true, paymentUrl });
    }

    let friendlyError = lastError;
    if (lastError.includes('could not be authorized') || lastError.includes('unauthorized') || lastError.includes('401')) {
      friendlyError = 'ÖdeAl Canlı API Anahtarı Doğrulaması Başarısız: Lütfen ÖdeAl üye işyeri panelinizdeki (portal.odeal.com) Canlı API Key ve Secret Key bilgilerinizle Vercel panelinizi güncelleyin.';
    }

    return res.status(200).json({
      success: false,
      error: friendlyError || 'ÖdeAl Sanal POS servisine bağlanılamadı. Lütfen API anahtarlarınızı kontrol edin.'
    });

  } catch (err: any) {
    console.error('ÖdeAl checkout error:', err);
    return res.status(200).json({
      success: false,
      error: err.message || 'ÖdeAl ödeme servisi hatası'
    });
  }
}
