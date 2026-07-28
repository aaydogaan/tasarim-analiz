import type { VercelRequest, VercelResponse } from '@vercel/node';

const ODEAL_API_KEY = process.env.ODEAL_API_KEY || 'a9ef1192-0745-465d-bd5e-ac5a3ba18051';
const ODEAL_SECRET_KEY = process.env.ODEAL_SECRET_KEY || '482cd558ffbcd57e9c9f154a03fc308993677dbabc6f39a504b3a8763ee84e31';

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

    // 1. Fetch Bearer token from ÖdeAl API
    let token = '';
    try {
      const tokenRes = await fetch('https://api.odeal.com/api/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          clientId: ODEAL_API_KEY,
          clientSecret: ODEAL_SECRET_KEY,
          grantType: 'client_credentials'
        })
      });

      const tokenData = await tokenRes.json();
      token = tokenData.token || tokenData.accessToken || tokenData.id_token || '';
    } catch (tokenErr) {
      console.error('ÖdeAl token error:', tokenErr);
    }

    // 2. Initialize ÖdeAl Payment Link or 3D Sale Request
    const callbackUrl = 'https://revizelesene.com/api/odeal-callback';
    const amount = 59.00;
    const description = 'Revizelesene PRO Paket Abonelik (59 TL)';

    // Request ÖdeAl Pay-By-Link or 3D Sale
    const payRes = await fetch('https://api.odeal.com/api/v1/pay-by-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : { 'x-api-key': ODEAL_API_KEY, 'x-secret-key': ODEAL_SECRET_KEY })
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

    const payData = await payRes.json();
    console.log('ÖdeAl pay response:', payData);

    const paymentUrl = payData.paymentUrl || payData.url || payData.link || payData.redirectUrl;

    if (paymentUrl) {
      return res.status(200).json({ success: true, paymentUrl });
    }

    // Fallback response with ÖdeAl pay link
    return res.status(200).json({
      success: true,
      paymentUrl: payData.paymentUrl || `https://pay.odeal.com/pay/${ODEAL_API_KEY}`
    });

  } catch (err: any) {
    console.error('ÖdeAl checkout error:', err);
    return res.status(500).json({ error: err.message || 'ÖdeAl ödeme servisi başlatılamadı.' });
  }
}
