import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xxmlqrahfzqictzozcqy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Static Pages
    const today = new Date().toISOString().split('T')[0];
    const staticUrls = [
      { loc: 'https://revizelesene.com/', priority: '1.0', changefreq: 'daily', lastmod: today },
      { loc: 'https://revizelesene.com/community', priority: '0.9', changefreq: 'daily', lastmod: today },
      { loc: 'https://revizelesene.com/leaderboard', priority: '0.8', changefreq: 'daily', lastmod: today },
      { loc: 'https://revizelesene.com/kvkk', priority: '0.3', changefreq: 'monthly', lastmod: today },
      { loc: 'https://revizelesene.com/gizlilik', priority: '0.3', changefreq: 'monthly', lastmod: today },
      { loc: 'https://revizelesene.com/kosullar', priority: '0.3', changefreq: 'monthly', lastmod: today },
    ];

    // 2. Fetch Contests from DB
    const { data: contests } = await supabase
      .from('contests')
      .select('id, slug, updated_at')
      .order('created_at', { ascending: false });

    const contestUrls = (contests || []).map((c) => ({
      loc: `https://revizelesene.com/yarisma/${c.slug || c.id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: c.updated_at ? new Date(c.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }));

    // 3. Fetch Public Profiles from DB
    const { data: profiles } = await supabase
      .from('profiles')
      .select('slug, updated_at')
      .not('slug', 'is', null)
      .limit(100);

    const profileUrls = (profiles || []).map((p) => ({
      loc: `https://revizelesene.com/${p.slug}`,
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }));

    const allUrls = [...staticUrls, ...contestUrls, ...profileUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).send(xml);
  } catch (err: any) {
    console.error('Sitemap generation error:', err);
    return res.status(500).send('Error generating sitemap');
  }
}
