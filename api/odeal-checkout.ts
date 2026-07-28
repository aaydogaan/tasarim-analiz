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
    const { userEmail, userId, userName } = req.body || {};

    // 1. Fetch Auth Token from ÖdeAl Auth API (Prioritize Stage/Sandbox URL)
    let token = '';
    const authEndpoints = [
      'https://auth-sandbox.odeal.com/api/v1/token',
      'https://auth.odeal.com/api/v1/token',
      'https://api-stg.odeal.com/api/v1/token',
      'https://api.odeal.com/api/v1/token'
    ];

    for (const authUrl of authEndpoints) {
      try {
        const tokenRes = await fetch(authUrl, {
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
        console.log(`Auth result from ${authUrl}:`, tokenData);

        token = tokenData.token || tokenData.accessToken || tokenData.id_token || tokenData.data?.token || tokenData.result?.token || '';
        if (token) break;
      } catch (err) {
        console.error(`Token fetch failed for ${authUrl}:`, err);
      }
    }

    // 2. Initialize ÖdeAl 3D Payment (/vpos/init-3d)
    const returnUrl = 'https://revizelesene.com/api/odeal-callback';
    const amount = 59.00;
    const description = 'Revizelesene PRO Paket Abonelik (59 TL)';

    const vposEndpoints = [
      'https://api-stg.odeal.com/vpos/init-3d',
      'https://api.odeal.com/vpos/init-3d',
      'https://api-stg.odeal.com/api/v1/pay-by-link',
      'https://api.odeal.com/api/v1/pay-by-link'
    ];

    let threeDFormHtml = '';
    let paymentUrl = '';
    let lastError = '';

    for (const vposUrl of vposEndpoints) {
      try {
        const vposRes = await fetch(vposUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            amount,
            currency: 'TRY',
            description,
            email: userEmail || 'bilgi@revizelesene.com',
            customerName: userName || 'Revizelesene Üyesi',
            returnUrl,
            callbackUrl: returnUrl,
            successRedirectUrl: 'https://revizelesene.com/profile?payment=success',
            failureRedirectUrl: 'https://revizelesene.com/profile?payment=error',
            externalId: userId || `pro_${Date.now()}`
          })
        });

        const vposData = await safeJsonParse(vposRes);
        console.log(`VPOS result from ${vposUrl}:`, vposData);

        threeDFormHtml = vposData.threeDFormHtml || vposData.result?.threeDFormHtml || vposData.data?.threeDFormHtml || '';
        paymentUrl = vposData.paymentUrl || vposData.url || vposData.link || vposData.redirectUrl || vposData.data?.url || '';

        if (vposData.message || vposData.error) {
          lastError = vposData.message || vposData.error;
        }

        if (threeDFormHtml || paymentUrl) break;
      } catch (err) {
        console.error(`VPOS request failed for ${vposUrl}:`, err);
      }
    }

    if (threeDFormHtml) {
      return res.status(200).json({ success: true, threeDFormHtml });
    }

    if (paymentUrl) {
      return res.status(200).json({ success: true, paymentUrl });
    }

    return res.status(200).json({
      success: false,
      error: lastError || 'ÖdeAl Stage (Test) ortamı API yanıtı bekleniyor. Lütfen ÖdeAl paneli test tamamlamasını kontrol edin.'
    });

  } catch (err: any) {
    console.error('ÖdeAl checkout error:', err);
    return res.status(200).json({
      success: false,
      error: err.message || 'ÖdeAl ödeme servisi hatası'
    });
  }
}
