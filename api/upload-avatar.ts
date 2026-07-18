import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !supabaseUrl || !supabaseKey) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' });
    }

    const authClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Kullanıcı doğrulanamadı.' });
    }

    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Görsel verisi (base64) bulunamadı.' });
    }

    // Clean base64 string if it contains data URI prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Yüksek benzersizlik için UUID ve zaman damgası
    const fileName = `avatars/${user.id}_${Date.now()}.jpg`;

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
    }));

    const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
    const gorselUrl = `${r2PublicUrl}/${fileName}`;

    return res.status(200).json({ avatarUrl: gorselUrl });

  } catch (error: any) {
    console.error('Avatar yükleme hatası:', error);
    return res.status(500).json({ error: error.message || 'Avatar yüklenirken bir hata oluştu.' });
  }
}
