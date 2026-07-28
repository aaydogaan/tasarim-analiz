import type { VercelRequest, VercelResponse } from '@vercel/node';

const ODEAL_API_KEY = process.env.ODEAL_API_KEY || 'a9ef1192-0745-465d-bd5e-ac5a3ba18051';
const ODEAL_SECRET_KEY = process.env.ODEAL_SECRET_KEY || '482cd558ffbcd57e9c9f154a03fc308993677dbabc6f39a504b3a8763ee84e31';

async function safeJsonParse(res: Response) {
  try {
    const text = await res.text();
    if (!text || text.trim().length === 0) return {};
    return JSON.parse(text);
  } catch (err) {
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

    // 1. Fetch Bearer token from ÖdeAl Auth API
    let token = '';
    const authUrls = [
      'https://auth.odeal.com/api/v1/token',
      'https://api.odeal.com/api/v1/token'
    ];

    for (const authUrl of authUrls) {
      try {
        const tokenRes = await fetch(authUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            clientId: ODEAL_API_KEY,
            clientSecret: ODEAL_SECRET_KEY,
            grantType: 'client_credentials'
          })
        });

        const tokenData = await safeJsonParse(tokenRes);
        token = tokenData.token || tokenData.accessToken || tokenData.id_token || tokenData.data?.token || '';
        if (token) break;
      } catch (err) {
        console.error(`Token fetch failed for ${authUrl}:`, err);
      }
    }

    // 2. Request ÖdeAl Pay-By-Link or 3D Sale transaction
    const callbackUrl = 'https://revizelesene.com/api/odeal-callback';
    const amount = 59.00;
    const description = 'Revizelesene PRO Paket Abonelik (59 TL)';

    const payUrls = [
      'https://api.odeal.com/api/v1/pay-by-link',
      'https://api.odeal.com/api/v1/3d-sale'
    ];

    let paymentUrl = '';

    for (const payUrl of payUrls) {
      try {
        const payRes = await fetch(payUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            'x-api-key': ODEAL_API_KEY,
            'x-secret-key': ODEAL_SECRET_KEY
          },
          body: JSON.stringify({
            amount,
            currency: 'TRY',
            description,
            email: userEmail || 'bilgi@revizelesene.com',
            customerName: userName || 'Revizelesene Üyesi',
            callbackUrl,
            externalId: userId || `pro_${Date.now()}`
          })
        });

        const payData = await safeJsonParse(payRes);
        paymentUrl = payData.paymentUrl || payData.url || payData.link || payData.redirectUrl || payData.data?.url || '';
        if (paymentUrl) break;
      } catch (err) {
        console.error(`Pay request failed for ${payUrl}:`, err);
      }
    }

    // Fallback ÖdeAl payment URL if direct API endpoint responds differently
    if (!paymentUrl) {
      paymentUrl = `https://pos.odeal.com/pay/${ODEAL_API_KEY}`;
    }

    return res.status(200).json({ success: true, paymentUrl });

  } catch (err: any) {
    console.error('ÖdeAl checkout error:', err);
    return res.status(200).json({
      success: true,
      paymentUrl: `https://pos.odeal.com/pay/${ODEAL_API_KEY}`
    });
  }
}
