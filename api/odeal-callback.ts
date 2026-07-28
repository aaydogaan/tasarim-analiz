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
    const payload = req.method === 'POST' ? req.body : req.query;
    console.log('ÖdeAl callback payload:', payload);

    const email = payload.email || payload.buyerEmail || payload.customerEmail;
    const userId = payload.externalId || payload.user_id;

    if (email || userId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      if (userId) {
        await supabase.from('profiles').update({ role: 'pro' }).eq('id', userId);
        try {
          await supabase.from('profiles').update({ is_pro: true }).eq('id', userId);
        } catch (_) {}
      }

      if (email) {
        await supabase.from('profiles').update({ role: 'pro' }).eq('email', email.trim());
        try {
          await supabase.from('profiles').update({ is_pro: true }).eq('email', email.trim());
        } catch (_) {}
      }
    }

    // Redirect to profile page with payment success query parameter
    return res.redirect(302, 'https://revizelesene.com/profile?payment=success');
  } catch (err: any) {
    console.error('ÖdeAl callback exception:', err);
    return res.redirect(302, 'https://revizelesene.com/profile?payment=error');
  }
}
