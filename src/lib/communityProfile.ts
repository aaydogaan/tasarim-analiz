export const CORE_FOUNDER_COUNT = 24;
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
    designRank?: string;
    specialty?: string;
    experienceLevel?: string;
    createdAt?: string;
};

export const CORE_FOUNDERS: NormalizedCommunityProfile[] = Array.from({ length: CORE_FOUNDER_COUNT }).map((_, i) => ({
    id: `core-founder-${i}`,
    displayName: `Kurucu ${i + 1}`,
    avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=Founder${i}`,
    founderNumber: i + 1,
}));

export const DESIGN_RANKS = {};

export function getMemberFounderDisplayNumber(founderNumber: number) {
    return founderNumber;
}

export function makeFounderPreview(count: number): NormalizedCommunityProfile[] {
    return Array.from({ length: count }).map((_, i) => ({
        id: `preview-${i}`,
        displayName: `Bekleniyor...`,
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=Preview${i}`,
        founderNumber: CORE_FOUNDER_COUNT + i + 1,
    }));
}

export function normalizeCommunityProfile(_: any, profile: any): NormalizedCommunityProfile {
    return {
        id: profile.id,
        displayName: profile.display_name || 'Gizli Kullanıcı',
        avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.id}`,
        founderNumber: profile.founder_number,
        bio: profile.bio,
        website: profile.website,
        socialHandle: profile.social_handle,
        designRank: profile.design_rank,
        specialty: profile.specialty,
        experienceLevel: profile.experience_level,
        createdAt: profile.created_at
    };
}
