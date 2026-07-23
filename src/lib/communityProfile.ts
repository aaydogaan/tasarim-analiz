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
    coverUrl?: string;
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
    cover_url?: string;
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
    // Başlangıç (Starter)
    { 
        id: 'aramiza-hos-geldin', 
        label: 'Aramıza Hoş Geldin', 
        description: 'Tasarım dünyasına ilk adımı attın. Profilini başarıyla oluşturdun.',
        emoji: 'UserPlus', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Common', xp: 100,
        checkFn: () => true // Everyone gets this
    },
    { 
        id: 'ilk-kivilcim', 
        label: 'İlk Kıvılcım', 
        description: 'Revizelesene platformunda ilk tasarımını paylaştın.',
        emoji: 'UploadCloud', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Common', xp: 150,
        checkFn: (badges: string[]) => badges.includes('ilk-kivilcim') 
    },
    { 
        id: 'ai-ile-tanisma', 
        label: 'Yapay Zeka ile Tanışma', 
        description: 'İlk kez bir tasarıma yapay zeka (AI) analizi aldın.',
        emoji: 'Bot', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Common', xp: 200,
        checkFn: (badges: string[]) => badges.includes('ai-ile-tanisma') 
    },
    { 
        id: 'ilk-ses', 
        label: 'İlk Ses', 
        description: 'Topluluğa ilk yorumunu bıraktın.',
        emoji: 'MessageCircle', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Common', xp: 100,
        checkFn: (badges: string[]) => badges.includes('ilk-ses') 
    },
    { 
        id: 'takdir-eden', 
        label: 'Takdir Eden', 
        description: 'İyi tasarımı ilk görüşte anlarsın. Bir tasarıma ilk beğenini bıraktın.',
        emoji: 'Heart', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Common', xp: 50,
        checkFn: (badges: string[]) => badges.includes('takdir-eden') 
    },
    // Topluluk (Community)
    { 
        id: 'destekci', 
        label: 'Destekçi', 
        description: 'Topluluğun her zaman yanında. 50 farklı gönderiyi beğendin.',
        emoji: 'ThumbsUp', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Rare', xp: 300,
        checkFn: (badges: string[]) => badges.includes('destekci') 
    },
    { 
        id: 'yorum-ustasi', 
        label: 'Yorum Ustası', 
        description: 'Analitik düşünceni paylaşıyorsun. 100 yapıcı yorum yaptın.',
        emoji: 'MessageSquare', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Epic', xp: 500,
        checkFn: (badges: string[]) => badges.includes('yorum-ustasi') 
    },
    { 
        id: 'elestirmen', 
        label: 'Eleştirmen', 
        description: 'Keskin gözlerin detayları kaçırmıyor. Yorumların diğer kullanıcılardan 500 Faydalı oyu aldı.',
        emoji: 'Eye', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        special: true, rarity: 'Legendary', xp: 1000,
        checkFn: (badges: string[]) => badges.includes('elestirmen') 
    },
    { 
        id: 'topluluk-lideri', 
        label: 'Topluluk Lideri', 
        description: 'Herkes seni takip ediyor. 1.000 takipçiye ulaştın.',
        emoji: 'Crown', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        special: true, rarity: 'Epic', xp: 800,
        checkFn: (badges: string[]) => badges.includes('topluluk-lideri') 
    },
    { 
        id: 'trend-avcisi', 
        label: 'Trend Avcısı', 
        description: 'Geleceği bugünden görüyorsun. Popüler olmadan önce 10 farklı Trend gönderiyi ilk beğenenlerden oldun.',
        emoji: 'TrendingUp', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Epic', xp: 600,
        checkFn: (badges: string[]) => badges.includes('trend-avcisi') 
    },
    // Yapay Zeka (AI)
    { 
        id: 'analiz-ustasi', 
        label: 'Analiz Ustası', 
        description: 'Yapay zekayı bir araç olarak mükemmel kullanıyorsun. 50 farklı tasarıma AI analizi istedin.',
        emoji: 'Scan', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        rarity: 'Rare', xp: 400,
        checkFn: (badges: string[]) => badges.includes('analiz-ustasi') 
    },
    { 
        id: 'mukemmeliyetci', 
        label: 'Mükemmeliyetçi', 
        description: '%100\'ün peşinde. İlk denemede AI\'dan genel skorda 95 ve üzeri puan aldın.',
        emoji: 'Target', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        special: true, rarity: 'Legendary', xp: 1000,
        checkFn: (badges: string[]) => badges.includes('mukemmeliyetci') 
    },
    // Gizli ve Kurucu
    { 
        id: 'baykusun-sirri', 
        label: 'Baykuşun Sırrı', 
        description: 'Tam saat 03:33\'te bir tasarım paylaştın. Sen hiç uyumaz mısın?',
        emoji: 'Ghost', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        special: true, rarity: 'Epic', xp: 777,
        checkFn: (badges: string[]) => badges.includes('baykusun-sirri') 
    },
    { 
        id: 'ilk-destekci', 
        label: 'İlk Destekçi', 
        description: 'Revizelesene platformunun ilk üyelerinden biri (Kurucu).',
        emoji: 'Rocket', 
        bg: 'bg-[#FF5500]/10', border: 'border-[#FF5500]/30', color: 'text-[#FF5500]', 
        special: true, rarity: 'Mythic', xp: 0,
        checkFn: (_: string[], isCore: boolean, founderNumber: number) => isCore || (founderNumber > 0 && founderNumber <= FOUNDER_LIMIT) 
    }
];

export function getMemberFounderDisplayNumber(founderNumber: number) {
    if (!founderNumber || founderNumber <= 0) return 1;
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
        isCoreFounder: isCore,
        coverUrl: profile?.cover_url || ''
    };
}
