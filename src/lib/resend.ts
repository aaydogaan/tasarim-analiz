// Resend Email Helper (Calls Vercel / Serverless API endpoint to avoid CORS issues)

interface SendWelcomeParams {
  email: string;
  name: string;
}

interface SendNewsletterParams {
  to: string | string[];
  contestTitle: string;
  contestDescription: string;
  contestSlug?: string;
  rewardTitle?: string;
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: userEmail,
        userName,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('sendWelcomeEmail failed:', data);
      return { success: false, error: data.error || 'E-posta gönderilemedi' };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('sendWelcomeEmail exception:', err);
    return { success: false, error: err.message || 'Bağlantı hatası' };
  }
}

export async function sendDayWinnerEmail(userEmail: string, userName: string, designTitle: string, score: number) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'day_winner',
        to: userEmail,
        userName,
        contestTitle: designTitle,
        score,
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (err: any) {
    console.error('sendDayWinnerEmail exception:', err);
    return { success: false, error: err.message };
  }
}

export async function sendContestNewsletterEmail({
  to,
  contestTitle,
  contestDescription,
  contestSlug,
  rewardTitle,
}: SendNewsletterParams) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'newsletter',
        to,
        contestTitle,
        contestDescription,
        contestSlug,
        rewardTitle,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('sendContestNewsletterEmail failed:', data);
      return { success: false, error: data.error || 'E-posta gönderilemedi' };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('sendContestNewsletterEmail exception:', err);
    return { success: false, error: err.message || 'Bağlantı hatası' };
  }
}

export async function sendRevizelesAnnouncementEmail({
  to,
  title,
  description,
  imageUrl,
  topicId,
}: {
  to: string | string[];
  title: string;
  description: string;
  imageUrl?: string;
  topicId?: string;
}) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'newsletter',
        to,
        contestTitle: `🔥 Gündem Revizyonu: ${title}`,
        contestDescription: description,
        contestSlug: `revizeles/${topicId || ''}`,
        rewardTitle: 'Tasarımı Eleştir & Kendi Revizyonunu Paylaş',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('sendRevizelesAnnouncementEmail failed:', data);
      return { success: false, error: data.error || 'E-posta gönderilemedi' };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('sendRevizelesAnnouncementEmail exception:', err);
    return { success: false, error: err.message || 'Bağlantı hatası' };
  }
}
