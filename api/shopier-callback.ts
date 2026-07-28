import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    const payload = req.body || {};
    console.log('Shopier callback notification received:', payload);

    const email = payload.email || payload.buyer_email || payload.customer_email;
    const status = payload.status || payload.payment_status;

    if (email) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const targetEmail = email.trim();
      
      const { error: roleErr } = await supabase
        .from('profiles')
        .update({ role: 'pro' })
        .eq('email', targetEmail);

      try {
        await supabase
          .from('profiles')
          .update({ is_pro: true })
          .eq('email', targetEmail);
      } catch (_) {}

      if (roleErr) {
        console.error('Supabase profile PRO update error:', roleErr);
      } else {
        console.log(`User ${targetEmail} successfully upgraded to PRO!`);
      }
    }

    return res.status(200).send('OK');
  } catch (err: any) {
    console.error('Shopier callback exception:', err);
    return res.status(200).send('OK');
  }
}
