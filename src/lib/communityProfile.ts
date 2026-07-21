export const CORE_FOUNDER_COUNT = 0;
export const FOUNDER_LIMIT = 100;
export const MEMBER_FOUNDER_LIMIT = FOUNDER_LIMIT - CORE_FOUNDER_COUNT;

export type NormalizedCommunityProfile = {
    id: string;
    displayName: string;
    avatarUrl: string;
    founderNumber: number;
    bio?: string;
    website?: string;
    socialHandle?: string;
    designRankId?: string;
    specialtyId?: string;
    experienceId?: string;
    createdAt?: string;
    isCoreFounder?: boolean;
};

export type CommunityProfileRecord = {
    id: string;
    display_name: string;
    avatar_url: string;
    bio?: string;
    website?: string;
    social_handle?: string;
    design_rank?: string;
    specialty?: string;
    experience_level?: string;
    founder_number: number;
    created_at: string;
    public_visible: boolean;
    behance_url?: string;
    dribbble_url?: string;
    twitter_url?: string;
    featured_badge?: string;
};

export const CORE_FOUNDERS: NormalizedCommunityProfile[] = [];

export const DESIGN_RANKS = [
    { id: 'stajyer', title: 'Stajyer Tasarımcı' },
    { id: 'junior', title: 'Junior Tasarımcı' },
    { id: 'tasarimci', title: 'Tasarımcı' },
    { id: 'senior', title: 'Senior Tasarımcı' },
    { id: 'art-direktor', title: 'Art Direktör' },
    { id: 'tasarim-direktoru', title: 'Tasarım Direktörü' },
];

export const DESIGN_SPECIALTIES = [
    { id: 'ui-ux', label: 'UI/UX Tasarım' },
    { id: 'marka', label: 'Marka Kimliği' },
    { id: 'sosyal-medya', label: 'Sosyal Medya Tasarımı' },
    { id: 'e-ticaret', label: 'E-ticaret Tasarımı' },
    { id: 'hareketli', label: 'Hareketli Grafik' },
    { id: 'illustrasyon', label: 'İllüstrasyon' },
    { id: 'basili', label: 'Basılı Tasarım' },
];

export const EXPERIENCE_LEVELS = [
    { id: '0-1', label: '0-1 yıl' },
    { id: '1-3', label: '1-3 yıl' },
    { id: '3-5', label: '3-5 yıl' },
    { id: '5+', label: '5+ yıl' },
];

export const BADGE_DEFINITIONS = [
    { 
        id: 'ilk-destekci', 
        label: 'İlk Destekçi', 
        description: 'Revizelesene platformunun ilk 100 üyesinden biri.',
        emoji: 'Rocket', 
        bg: 'bg-[#FF5500]/10', 
        border: 'border-[#FF5500]/30', 
        color: 'text-[#FF5500]', 
        special: true,
        checkFn: (_: string[], isCore: boolean, founderNumber: number) => isCore || (founderNumber > 0 && founderNumber <= FOUNDER_LIMIT) 
    },
    { 
        id: 'topluluk-katkicisi', 
        label: 'Aktif Katkıcı', 
        description: 'Toplulukta düzenli olarak içerik paylaşıp yorum yapan aktif üyeler.',
        emoji: 'Lightbulb', 
        bg: 'bg-[#FF5500]/10', 
        border: 'border-[#FF5500]/30', 
        color: 'text-[#FF5500]', 
        checkFn: (badges: string[]) => badges.includes('topluluk-katkicisi') 
    },
    { 
        id: 'yarisma-birincisi', 
        label: 'Haftanın Galibi', 
        description: 'Haftalık tasarım yarışmalarında birinci olan yetenekli tasarımcı.',
        emoji: 'Trophy', 
        bg: 'bg-[#FF5500]/10', 
        border: 'border-[#FF5500]/30', 
        color: 'text-[#FF5500]', 
        special: true,
        checkFn: (badges: string[]) => badges.includes('yarisma-birincisi') 
    },
    { 
        id: 'analiz-ustasi', 
        label: 'Analiz Ustası', 
        description: 'Gönderilen tasarımlara derinlemesine yapay zeka analizleri sağlayan üye.',
        emoji: 'Eye', 
        bg: 'bg-[#FF5500]/10', 
        border: 'border-[#FF5500]/30', 
        color: 'text-[#FF5500]', 
        checkFn: (badges: string[]) => badges.includes('analiz-ustasi') 
    },
    { 
        id: 'populer-tasarim', 
        label: 'Popüler Tasarım', 
        description: 'Paylaştığı bir tasarım toplulukta 50\'den fazla beğeni alan üye.',
        emoji: 'Heart', 
        bg: 'bg-[#FF5500]/10', 
        border: 'border-[#FF5500]/30', 
        color: 'text-[#FF5500]', 
        checkFn: (badges: string[]) => badges.includes('populer-tasarim') 
    },
    { 
        id: 'seri-yorumcu', 
        label: 'Seri Yorumcu', 
        description: 'Tasarım analizlerine veya gönderilere 100\'den fazla yorum yapan katılımcı.',
        emoji: 'MessageSquare', 
        bg: 'bg-[#FF5500]/10', 
        border: 'border-[#FF5500]/30', 
        color: 'text-[#FF5500]', 
        checkFn: (badges: string[]) => badges.includes('seri-yorumcu') 
    },
    { 
        id: 'tasarim-elcisi', 
        label: 'Tasarım Elçisi', 
        description: 'Siteye referans linki ile en az 5 yeni tasarımcı kazandıran öncü.',
        emoji: 'Crown', 
        bg: 'bg-[#FF5500]/10', 
        border: 'border-[#FF5500]/30', 
        color: 'text-[#FF5500]', 
        checkFn: (badges: string[]) => badges.includes('tasarim-elcisi') 
    },
    { 
        id: 'mukemmeliyetci', 
        label: 'Mükemmeliyetçi', 
        description: 'Yapay zeka analizlerinden arka arkaya 5 kez %90 ve üzeri puan alan yetenek.',
        emoji: 'Star', 
        bg: 'bg-[#FF5500]/10', 
        border: 'border-[#FF5500]/30', 
        color: 'text-[#FF5500]', 
        checkFn: (badges: string[]) => badges.includes('mukemmeliyetci') 
    },
];

export function getMemberFounderDisplayNumber(founderNumber: number) {
    return founderNumber;
}

export function buildAvatarUrl(seed: string) {
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

export function getDesignRankById(id: string | undefined) {
    return DESIGN_RANKS.find(r => r.id === id) || DESIGN_RANKS[2];
}

export function getSpecialtyById(id: string | undefined) {
    return DESIGN_SPECIALTIES.find(s => s.id === id) || DESIGN_SPECIALTIES[0];
}

export function getExperienceById(id: string | undefined) {
    return EXPERIENCE_LEVELS.find(e => e.id === id) || EXPERIENCE_LEVELS[0];
}

export function getBadgeById(id: string | null) {
    if (!id) return null;
    return BADGE_DEFINITIONS.find(b => b.id === id) || null;
}

export function makeFounderPreview(count: number): NormalizedCommunityProfile[] {
    return Array.from({ length: count }).map((_, i) => ({
        id: `preview-${i}`,
        displayName: `Bekleniyor...`,
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=Preview${i}`,
        founderNumber: CORE_FOUNDER_COUNT + i + 1,
    }));
}

export function normalizeCommunityProfile(authData: any, profile: any): NormalizedCommunityProfile {
    const isCore = false;
    
    return {
        id: profile?.id || authData?.id || 'anonymous',
        displayName: profile?.display_name || authData?.user_metadata?.full_name || 'Gizli Kullanıcı',
        avatarUrl: profile?.avatar_url || authData?.user_metadata?.avatar_url || buildAvatarUrl(profile?.id || 'new'),
        founderNumber: profile?.founder_number || 0,
        bio: profile?.bio || '',
        website: profile?.website || '',
        socialHandle: profile?.social_handle || '',
        designRankId: profile?.design_rank || 'stajyer',
        specialtyId: profile?.specialty || 'ui-ux',
        experienceId: profile?.experience_level || '0-1',
        createdAt: profile?.created_at,
        isCoreFounder: isCore
    };
}
