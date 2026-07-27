import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const merchant_key = process.env.PAYTR_MERCHANT_KEY || '85TUU3SphbzdsUog';
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT || 'RQRE6Ed57Ume74z7';

  try {
    const postData = req.body || {};
    const {
      merchant_oid,
      status,
      total_amount,
      hash
    } = postData;

    // PayTR hash verification
    const hash_str = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
    const expected_hash = crypto
      .createHmac('sha256', merchant_key)
      .update(hash_str)
      .digest('base64');

    if (hash !== expected_hash) {
      console.error('PayTR Callback: Hash uyumsuzluğu!');
      return res.status(400).send('PAYTR notification failed: bad hash');
    }

    if (status === 'success') {
      console.log(`PayTR Ödeme Başarılı! Sipariş ID: ${merchant_oid}, Tutar: ${total_amount}`);

      // Extract user_id from merchant_oid format: REV_{user_id_prefix}_{timestamp}
      // e.g. REV_12345678_16789000
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Find user by email or user_id prefix from merchant_oid if available
        const email = postData.email;
        if (email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (profile) {
            const proUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            await supabase
              .from('profiles')
              .update({
                is_pro: true,
                pro_since: new Date().toISOString(),
                pro_until: proUntil
              })
              .eq('id', profile.id);

            console.log(`Kullanıcı PRO olarak güncellendi: ${profile.id}`);
          }
        }
      }
    } else {
      console.warn(`PayTR Ödeme Başarısız. Sipariş ID: ${merchant_oid}, Neden: ${postData.failed_reason_msg}`);
    }

    // PayTR requires returning literal string "OK" on successful receipt
    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('PayTR Callback hatası:', error);
    return res.status(500).send('Internal Server Error');
  }
}

