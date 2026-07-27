import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const merchant_id = process.env.PAYTR_MERCHANT_ID || '697409';
  const merchant_key = process.env.PAYTR_MERCHANT_KEY || '85TUU3SphbzdsUog';
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT || 'RQRE6Ed57Ume74z7';

  try {
    const authHeader = req.headers.authorization;
    let userId = 'guest';
    let userEmail = 'musteri@revizelesene.com';
    let userName = 'Revizelesene Kullanıcısı';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
          userEmail = user.email || userEmail;
          userName = user.user_metadata?.display_name || user.user_metadata?.full_name || userEmail.split('@')[0];
        }
      }
    }

    // IP address extraction
    let user_ip = (req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
    if (user_ip === '::1' || user_ip.startsWith('127.')) {
      user_ip = '176.234.0.1'; // Real TR IP for local testing
    }

    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    const merchant_oid = `REV${cleanUserId}${Date.now()}`;
    const email = userEmail;
    // 59 TL + %20 KDV = 70.80 TL -> PayTR requires payment amount in kuruş (cents): 7080
    const payment_amount = '7080';
    const currency = 'TL';
    const test_mode = '0'; // 0 = Live mode, 1 = Test mode
    const no_installment = '1'; // 1 = Taksit yok (Tek çekim)
    const max_installment = '0';

    const user_name = userName;
    const user_address = 'Türkiye';
    const user_phone = '05555555555';

    // Basket content: [[Ürün Adı, Birim Fiyat (TL), Adet]]
    const user_basket = Buffer.from(
      JSON.stringify([['Revizelesene PRO Üyelik (Aylık)', '70.80', 1]])
    ).toString('base64');

    let appUrl = process.env.APP_URL;
    if (!appUrl || !appUrl.startsWith('http')) {
      const origin = req.headers.origin;
      const host = req.headers.host || 'www.revizelesene.com';
      const proto = host.includes('localhost') ? 'http' : 'https';
      appUrl = origin || `${proto}://${host}`;
    }

    const merchant_ok_url = `${appUrl}/pricing?status=success`;
    const merchant_fail_url = `${appUrl}/pricing?status=fail`;

    const debug_on = '1';

    // Token calculation formula as defined by PayTR API docs:
    // token_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;

    const paytr_token = crypto
      .createHmac('sha256', merchant_key)
      .update(`${hash_str}${merchant_salt}`)
      .digest('base64');

    const formData = new URLSearchParams();
    formData.append('merchant_id', merchant_id);
    formData.append('user_ip', user_ip);
    formData.append('merchant_oid', merchant_oid);
    formData.append('email', email);
    formData.append('payment_amount', payment_amount);
    formData.append('paytr_token', paytr_token);
    formData.append('user_basket', user_basket);
    formData.append('debug_on', debug_on);
    formData.append('no_installment', no_installment);
    formData.append('max_installment', max_installment);
    formData.append('user_name', user_name);
    formData.append('user_address', user_address);
    formData.append('user_phone', user_phone);
    formData.append('merchant_ok_url', merchant_ok_url);
    formData.append('merchant_fail_url', merchant_fail_url);
    formData.append('timeout_limit', '30');
    formData.append('currency', currency);
    formData.append('test_mode', test_mode);

    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const paytrData: any = await paytrRes.json();

    if (paytrData.status === 'success') {
      return res.status(200).json({
        status: 'success',
        token: paytrData.token,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${paytrData.token}`,
        merchant_oid,
      });
    } else {
      console.error('PayTR token hatası:', paytrData.reason);
      return res.status(400).json({
        status: 'failed',
        reason: paytrData.reason || 'PayTR ödeme jetonu oluşturulamadı.',
      });
    }
  } catch (error: any) {
    console.error('PayTR checkout sunucu hatası:', error);
    return res.status(500).json({ error: error.message || 'Sunucu hatası oluştu.' });
  }
}

