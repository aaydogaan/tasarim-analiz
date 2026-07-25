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
