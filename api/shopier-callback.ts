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

    const rawEmail = payload.email || payload.buyer_email || payload.customer_email || payload.email_address || payload.buyerEmail;

    if (rawEmail && typeof rawEmail === 'string') {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const targetEmail = rawEmail.trim().toLowerCase();

      console.log(`Processing Shopier PRO activation for email: ${targetEmail}`);

      // 1. Match user ID via auth.users admin API if possible
      let userId: string | null = null;
      try {
        const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
        if (!usersErr && usersData?.users) {
          const matchedUser = usersData.users.find((u: any) => u.email && typeof u.email === 'string' && u.email.trim().toLowerCase() === targetEmail);
          if (matchedUser) {
            userId = matchedUser.id;
          }
        }
      } catch (e) {
        console.warn('Error listing auth users in Shopier callback:', e);
      }

      let successCount = 0;

      // 2. Update profiles by userId if found
      if (userId) {
        const { error: errBoth } = await supabase.from('profiles').update({ is_pro: true, role: 'pro' }).eq('id', userId);
        if (!errBoth) {
          successCount++;
        } else {
          const { error: errIsPro } = await supabase.from('profiles').update({ is_pro: true }).eq('id', userId);
          const { error: errRole } = await supabase.from('profiles').update({ role: 'pro' }).eq('id', userId);
          if (!errIsPro || !errRole) successCount++;
        }
      }

      // 3. Fallback: Update profiles by email column in profiles table
      const { error: errEmailBoth } = await supabase.from('profiles').update({ is_pro: true, role: 'pro' }).ilike('email', targetEmail);
      if (!errEmailBoth) {
        successCount++;
      } else {
        const { error: errEmailIsPro } = await supabase.from('profiles').update({ is_pro: true }).ilike('email', targetEmail);
        const { error: errEmailRole } = await supabase.from('profiles').update({ role: 'pro' }).ilike('email', targetEmail);
        if (!errEmailIsPro || !errEmailRole) successCount++;
      }

      if (successCount > 0) {
        console.log(`User ${targetEmail} (ID: ${userId || 'N/A'}) successfully upgraded to PRO!`);
      } else {
        console.error(`Failed to update PRO status for user ${targetEmail}`);
      }
    } else {
      console.warn('No email found in Shopier payload:', payload);
    }

    return res.status(200).send('OK');
  } catch (err: any) {
    console.error('Shopier callback exception:', err);
    return res.status(200).send('OK');
  }
}
