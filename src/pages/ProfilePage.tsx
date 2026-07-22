import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    CheckCircle2,
    Edit2,
    ExternalLink,
    Globe,
    HeartHandshake,
    Loader2,
    Mail,
    MessageCircle,
    Sparkles,
    Star,
    User,
    X,
    Rocket,
    Lightbulb,
    Trophy,
    Eye,
    Twitter,
    Dribbble,
    Link,
    Palette,
    RefreshCw,
    Heart,
    MessageSquare,
    Crown,
    Zap,
    UserPlus,
    UploadCloud,
    Bot,
    ThumbsUp,
    TrendingUp,
    Scan,
    Target,
    Ghost,
    ChevronDown
} from 'lucide-react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { supabase } from '../lib/supabase';
import {
    buildAvatarUrl,
    BADGE_DEFINITIONS,
    getBadgeById,
    DESIGN_RANKS,
    DESIGN_SPECIALTIES,
    EXPERIENCE_LEVELS,
    FOUNDER_LIMIT,
    getDesignRankById,
    getExperienceById,
    getMemberFounderDisplayNumber,
    getSpecialtyById,
    normalizeCommunityProfile,
    type CommunityProfileRecord,
    type NormalizedCommunityProfile,
} from '../lib/communityProfile';

type ProfileProps = {
    kullanici: any;
    publicProfile?: NormalizedCommunityProfile | null;
    onAuthClick?: () => void;
    onCommunityClick?: () => void;
};

type ProfileForm = {
    displayName: string;
    bio: string;
    website: string;
    socialHandle: string;
    avatarUrl: string;
    designRank: string;
    specialty: string;
    experienceLevel: string;
    behanceUrl: string;
    dribbbleUrl: string;
    twitterUrl: string;
};

const defaultStats = {
    total: 0,
    ortalama: 0,
    buHafta: 0,
    enCokTasarimTuru: 'Henüz yok',
};

export default function ProfilePage({ kullanici, publicProfile, onAuthClick, onCommunityClick }: ProfileProps) {
    const isPublicProfile = Boolean(publicProfile);
    const isOwnProfile = Boolean(kullanici && !publicProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
    const [stats, setStats] = useState(defaultStats);
    const [profileRecord, setProfileRecord] = useState<CommunityProfileRecord | null>(null);
    const [userBadges, setUserBadges] = useState<string[]>([]);
    const [featuredBadge, setFeaturedBadge] = useState<string | null>(null);
    const [savingBadge, setSavingBadge] = useState(false);
    const [showBadgePicker, setShowBadgePicker] = useState(false);
    const [badgesExpanded, setBadgesExpanded] = useState(false);

    // XP Data States
    const [xpData, setXpData] = useState({ posts: 0, comments: 0, analizler: 0, challenges: 0, total: 100 });
    const [xpLoading, setXpLoading] = useState(false);

    const normalizedProfile = useMemo(
        () => publicProfile || normalizeCommunityProfile(kullanici, profileRecord),
        [kullanici, profileRecord, publicProfile]
    );

    const [profileData, setProfileData] = useState<ProfileForm>({
        displayName: normalizedProfile.displayName,
        bio: normalizedProfile.bio || '',
        website: normalizedProfile.website || '',
        socialHandle: normalizedProfile.socialHandle || '',
        avatarUrl: normalizedProfile.avatarUrl,
        designRank: normalizedProfile.designRankId || 'stajyer',
        specialty: normalizedProfile.specialtyId || 'ui-ux',
        experienceLevel: normalizedProfile.experienceId || '0-1',
        behanceUrl: '',
        dribbbleUrl: '',
        twitterUrl: '',
    });

    useEffect(() => {
        if (!isOwnProfile || !kullanici) return;

        let aktif = true;
        const loadProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', kullanici.id)
                .maybeSingle();

            if (!aktif) return;
            if (!error && data) {
                setProfileRecord(data as CommunityProfileRecord);
                setFeaturedBadge((data as any).featured_badge ?? null);
            }
            setLoading(false);
        };

        loadProfile();
        return () => {
            aktif = false;
        };
    }, [isOwnProfile, kullanici]);

    useEffect(() => {
        setProfileData({
            displayName: normalizedProfile.displayName,
            bio: normalizedProfile.bio || '',
            website: normalizedProfile.website || '',
            socialHandle: normalizedProfile.socialHandle || '',
            avatarUrl: normalizedProfile.avatarUrl,
            designRank: normalizedProfile.designRankId || 'stajyer',
            specialty: normalizedProfile.specialtyId || 'ui-ux',
            experienceLevel: normalizedProfile.experienceId || '0-1',
            behanceUrl: (profileRecord as any)?.behance_url || '',
            dribbbleUrl: (profileRecord as any)?.dribbble_url || '',
            twitterUrl: (profileRecord as any)?.twitter_url || '',
        });
        setIsEditing(false);
    }, [normalizedProfile, profileRecord]);

    useEffect(() => {
        if (!isOwnProfile || !kullanici) return;

        let aktif = true;
        const loadStats = async () => {
            // We removed the failing /api/stats fetch because it's a frontend-only app right now.
            // You can replace this with actual Supabase RPC or queries for these stats later.
            if (aktif) {
                setStats({
                    total: 0,
                    ortalama: 0,
                    buHafta: 0,
                    enCokTasarimTuru: 'Henüz yok',
                });
            }
        };

        loadStats();
        return () => {
            aktif = false;
        };
    }, [isOwnProfile, kullanici]);

    // XP calculation effect
    useEffect(() => {
        const targetUserId = normalizedProfile.id;
        if (!targetUserId || targetUserId === 'anonymous') return;

        const fetchXp = async () => {
            setXpLoading(true);
            try {
                const [postsRes, commentsRes, analizRes, challengeRes] = await Promise.all([
                    supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId),
                    supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId),
                    supabase.from('analizler').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId),
                    supabase.from('challenge_entries').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId),
                ]);

                const posts = postsRes.count || 0;
                const comments = commentsRes.count || 0;
                const analizler = analizRes.count || 0;
                const challenges = challengeRes.count || 0;

                setXpData({
                    posts,
                    comments,
                    analizler,
                    challenges,
                    total: 100 + (posts * 200) + (comments * 50) + (analizler * 150) + (challenges * 300)
                });
            } catch (error) {
                console.error("XP Fetch Error:", error);
            } finally {
                setXpLoading(false);
            }
        };
        fetchXp();
    }, [normalizedProfile.id]);

    useEffect(() => {
        if (!normalizedProfile.id || normalizedProfile.id === 'anonymous') return;
        const loadBadges = async () => {
            const { data } = await supabase
                .from('user_badges')
                .select('badge_id')
                .eq('user_id', normalizedProfile.id);
            if (data) {
                setUserBadges(data.map(b => b.badge_id));
            }
        };
        loadBadges();
    }, [normalizedProfile.id]);

    // Public profile: load featured badge
    useEffect(() => {
        if (!isPublicProfile || !normalizedProfile.id || normalizedProfile.id === 'anonymous') return;
        const loadFeatured = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('featured_badge')
                .eq('id', normalizedProfile.id)
                .maybeSingle();
            if (data) setFeaturedBadge((data as any).featured_badge ?? null);
        };
        loadFeatured();
    }, [isPublicProfile, normalizedProfile.id]);

    const handleSelectFeaturedBadge = async (badgeId: string | null) => {
        if (!isOwnProfile || !kullanici) return;
        setSavingBadge(true);
        const newVal = badgeId === featuredBadge ? null : badgeId; // toggle off
        const { error } = await supabase
            .from('profiles')
            .update({ featured_badge: newVal })
            .eq('id', kullanici.id);
        if (!error) setFeaturedBadge(newVal);
        setSavingBadge(false);
        setShowBadgePicker(false);
    };

    const founderNumber = getMemberFounderDisplayNumber(normalizedProfile.founderNumber);
    const selectedRank = getDesignRankById(profileData.designRank);
    const selectedSpecialty = getSpecialtyById(profileData.specialty);
    const selectedExperience = getExperienceById(profileData.experienceLevel);
    const founderLabel = normalizedProfile.isCoreFounder
        ? `Kurucu #${normalizedProfile.founderNumber}`
        : founderNumber
            ? `İlk Destekçi #${founderNumber}`
            : `İlk ${FOUNDER_LIMIT} destekçiden biri ol`;

    const handleAvatarRefresh = () => {
        const nextSeed = `${profileData.displayName || kullanici?.id || 'Revizele'}-${Date.now()}`;
        setProfileData((prev) => ({ ...prev, avatarUrl: buildAvatarUrl(nextSeed) }));
        setSaveState('idle');
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !kullanici) return;
        setSaveState('idle');
        try {
            const s3Client = new S3Client({
                region: 'auto',
                endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
                    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
                },
            });
            const fileName = `avatars/${kullanici.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const fileBuffer = await file.arrayBuffer();

            await s3Client.send(new PutObjectCommand({
                Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
                Key: fileName,
                Body: new Uint8Array(fileBuffer),
                ContentType: file.type,
            }));

            const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL.replace(/\/$/, "");
            const avatarUrl = `${r2PublicUrl}/${fileName}`;
            setProfileData((prev) => ({ ...prev, avatarUrl }));
        } catch (err: any) {
            console.error('Avatar yükleme hatası:', err);
        }
    };

    const handleSave = async () => {
        if (!isOwnProfile || !kullanici) return;
        setSaving(true);
        setSaveState('idle');

        const payload = {
            display_name: profileData.displayName.trim() || normalizedProfile.displayName,
            bio: profileData.bio.trim(),
            website: profileData.website.trim(),
            social_handle: profileData.socialHandle.trim(),
            design_rank: profileData.designRank,
            specialty: profileData.specialty,
            experience_level: profileData.experienceLevel,
            avatar_url: profileData.avatarUrl.trim() || buildAvatarUrl(kullanici.id),
        };

        const { error: authError } = await supabase.auth.updateUser({
            data: {
                display_name: payload.display_name,
                full_name: payload.display_name,
                bio: payload.bio,
                website: payload.website,
                social_handle: payload.social_handle,
                design_rank: payload.design_rank,
                specialty: payload.specialty,
                experience_level: payload.experience_level,
                avatar_url: payload.avatar_url,
            },
        });

        const { data, error: profileError } = await supabase
            .from('profiles')
            .update({
                display_name: payload.display_name,
                bio: payload.bio,
                website: payload.website,
                social_handle: payload.social_handle,
                design_rank: payload.design_rank,
                specialty: payload.specialty,
                experience_level: payload.experience_level,
                avatar_url: payload.avatar_url,
                public_visible: true,
                behance_url: profileData.behanceUrl.trim() || null,
                dribbble_url: profileData.dribbbleUrl.trim() || null,
                twitter_url: profileData.twitterUrl.trim() || null,
            })
            .eq('id', kullanici.id)
            .select('*')
            .maybeSingle();

        if (!authError && data) setProfileRecord(data as CommunityProfileRecord);

        setSaving(false);
        if (authError || profileError) {
            console.error("Profile save error:", authError || profileError);
            setSaveState('error');
            return;
        }

        setIsEditing(false);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2500);
    };

    if (!kullanici && !publicProfile) {
        return (
            <div className="min-h-[70vh] bg-[var(--bg-primary)] text-[var(--text-primary)] px-6 py-12">
                <div className="mx-auto flex max-w-3xl flex-col items-center text-center rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-10">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                        <User className="h-6 w-6 text-[var(--color-brand-orange)]" />
                    </div>
                    <h1 className="mb-3 text-3xl font-black tracking-tight">Profilin seni bekliyor</h1>
                    <p className="mb-6 max-w-xl text-sm font-medium leading-7 text-[var(--text-secondary)]">
                        Rozetler, ilk destekçi numarası ve tasarım kimliğin için giriş yap.
                    </p>
                    <button
                        onClick={onAuthClick}
                        className="rounded-full bg-[var(--text-primary)] px-7 py-3 text-sm font-black text-[var(--bg-primary)] transition-transform hover:scale-105"
                    >
                        Giriş yap ve profilini oluştur
                    </button>
                </div>
            </div>
        );
    }

    const earnedBadgeIds = BADGE_DEFINITIONS
        .filter(b => b.checkFn(userBadges, normalizedProfile.isCoreFounder, normalizedProfile.founderNumber))
        .map(b => b.id);

    const featuredBadgeDef = featuredBadge ? getBadgeById(featuredBadge) : null;

    const renderBadgeIcon = (iconName: string, className?: string) => {
        switch (iconName) {
            case 'Rocket': return <Rocket className={className} />;
            case 'Lightbulb': return <Lightbulb className={className} />;
            case 'Trophy': return <Trophy className={className} />;
            case 'Eye': return <Eye className={className} />;
            case 'Heart': return <Heart className={className} />;
            case 'MessageSquare': return <MessageSquare className={className} />;
            case 'Crown': return <Crown className={className} />;
            case 'UserPlus': return <UserPlus className={className} />;
            case 'UploadCloud': return <UploadCloud className={className} />;
            case 'Bot': return <Bot className={className} />;
            case 'MessageCircle': return <MessageCircle className={className} />;
            case 'ThumbsUp': return <ThumbsUp className={className} />;
            case 'TrendingUp': return <TrendingUp className={className} />;
            case 'Scan': return <Scan className={className} />;
            case 'Target': return <Target className={className} />;
            case 'Ghost': return <Ghost className={className} />;
            default: return <Star className={className} />;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-14 w-full pt-10">
            <main className="mx-auto max-w-screen-xl px-4 py-5 md:px-8 md:py-7">
                <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
                    {/* LEFT COLUMN: Avatar & Profile Info */}
                    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className={`relative h-24 w-24 shrink-0 rounded-full p-[3px] ${normalizedProfile.isCoreFounder ? 'bg-gradient-to-br from-orange-300 via-[var(--color-brand-orange)] to-amber-500' : 'bg-[var(--border-primary)]'}`}>
                                <img src={profileData.avatarUrl} className="h-full w-full rounded-full border-2 border-[var(--card-bg)] bg-[var(--bg-secondary)] object-cover" alt="Profil fotoğrafı" />
                                {/* Featured badge on avatar */}
                                {featuredBadgeDef ? (
                                    <div
                                        title={featuredBadgeDef.label}
                                        className={`absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[var(--card-bg)] ${featuredBadgeDef.bg} ${featuredBadgeDef.color} shadow-lg`}
                                    >
                                        {renderBadgeIcon(featuredBadgeDef.emoji, "w-4 h-4")}
                                    </div>
                                ) : (
                                    <div className="absolute -bottom-1 -right-1 rounded-full border-4 border-[var(--card-bg)] bg-[var(--color-brand-orange)] p-2 shadow-lg">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="mb-2 inline-flex rounded-full bg-[var(--color-brand-orange)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-orange)]">
                                    {founderLabel}
                                </p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.displayName}
                                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                        className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-xl font-black outline-none focus:border-[var(--color-brand-orange)]"
                                    />
                                ) : (
                                    <h1 className="truncate text-2xl font-black tracking-tight">{profileData.displayName}</h1>
                                )}
                                <p className="mt-1 truncate text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                    {normalizedProfile.isCoreFounder ? 'Kurucu' : selectedRank.title}
                                </p>
                                {/* Featured badge label */}
                                {featuredBadgeDef && (
                                    <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black border ${featuredBadgeDef.bg} ${featuredBadgeDef.border} ${featuredBadgeDef.color}`}>
                                        {renderBadgeIcon(featuredBadgeDef.emoji, "w-3.5 h-3.5")} {featuredBadgeDef.label}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Sıra</p>
                                <p className="mt-1 text-xl font-black">{normalizedProfile.isCoreFounder ? `#${normalizedProfile.founderNumber}` : founderNumber ? `#${founderNumber}` : '-'}</p>
                            </div>
                            <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Alan</p>
                                <p className="mt-1 truncate text-sm font-black">{selectedSpecialty.label}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-[var(--text-secondary)]">
                            {(!isPublicProfile && kullanici?.email) && (
                                <a href={`mailto:${kullanici.email}`} className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors" title={kullanici.email}>
                                    <Mail className="h-4 w-4" />
                                </a>
                            )}
                            {profileData.website && (
                                <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors" title={profileData.website}>
                                    <Globe className="h-4 w-4" />
                                </a>
                            )}
                            {profileData.twitterUrl && (
                                <a href={profileData.twitterUrl.startsWith('http') ? profileData.twitterUrl : `https://${profileData.twitterUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors" title="Twitter / X">
                                    <Twitter className="h-4 w-4" />
                                </a>
                            )}
                            {profileData.behanceUrl && (
                                <a href={profileData.behanceUrl.startsWith('http') ? profileData.behanceUrl : `https://${profileData.behanceUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors" title="Behance">
                                    <Palette className="h-4 w-4" />
                                </a>
                            )}
                            {profileData.dribbbleUrl && (
                                <a href={profileData.dribbbleUrl.startsWith('http') ? profileData.dribbbleUrl : `https://${profileData.dribbbleUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors" title="Dribbble">
                                    <Dribbble className="h-4 w-4" />
                                </a>
                            )}
                            {profileData.socialHandle && (
                                <a href={profileData.socialHandle.startsWith('http') ? profileData.socialHandle : `https://${profileData.socialHandle}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors" title="Sosyal Medya">
                                    <Link className="h-4 w-4" />
                                </a>
                            )}
                        </div>

                        {isOwnProfile && (
                            <button
                                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                                disabled={saving}
                                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition-all disabled:opacity-60 ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'}`}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <CheckCircle2 className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                {isEditing ? 'Kaydet' : 'Profili düzenle'}
                            </button>
                        )}

                        {saveState === 'saved' && <p className="mt-3 text-center text-xs font-bold text-emerald-500">Profil güncellendi.</p>}
                        {saveState === 'error' && <p className="mt-3 text-center text-xs font-bold text-red-500">Profil kaydedilirken bir sorun oluştu.</p>}
                    </div>

                    {/* RIGHT COLUMN: Bio, Edit Fields, Stats, Badges & XP */}
                    <div className="grid gap-5">
                        {/* Bio & Edit Card */}
                        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="w-full">
                                    {isEditing ? (
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            className="min-h-[96px] w-full resize-none rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 text-sm leading-7 outline-none focus:border-[var(--color-brand-orange)]"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium leading-7 text-[var(--text-secondary)]">
                                            {profileData.bio || 'Henüz bir biyografi eklenmemiş.'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Avatar URL</span>
                                        <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={profileData.avatarUrl}
                                                    onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                                                    className="min-w-0 flex-1 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none focus:border-[var(--color-brand-orange)]"
                                                />
                                                <button type="button" onClick={handleAvatarRefresh} className="rounded-xl border border-[var(--border-primary)] px-3 text-[var(--text-secondary)] hover:text-[var(--color-brand-orange)]" title="Rastgele Avatar Üret">
                                                    <RefreshCw className="h-4 w-4" />
                                                </button>
                                                <label className="rounded-xl border border-[var(--border-primary)] px-3 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--color-brand-orange)] cursor-pointer">
                                                    Yükle
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                                </label>
                                            </div>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Tasarım rütbesi</span>
                                        <select value={profileData.designRank} onChange={(e) => setProfileData({ ...profileData, designRank: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]">
                                            {DESIGN_RANKS.map((rank) => <option key={rank.id} value={rank.id}>{rank.title}</option>)}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Uzmanlık</span>
                                        <select value={profileData.specialty} onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]">
                                            {DESIGN_SPECIALTIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Deneyim</span>
                                        <select value={profileData.experienceLevel} onChange={(e) => setProfileData({ ...profileData, experienceLevel: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]">
                                            {EXPERIENCE_LEVELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                                        </select>
                                    </label>
                                    <input type="text" placeholder="Web sitesi" value={profileData.website} onChange={(e) => setProfileData({ ...profileData, website: e.target.value })} className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]" />
                                    <input type="text" placeholder="Sosyal hesap" value={profileData.socialHandle} onChange={(e) => setProfileData({ ...profileData, socialHandle: e.target.value })} className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]" />
                                    <input type="url" placeholder="Behance URL" value={profileData.behanceUrl} onChange={(e) => setProfileData({ ...profileData, behanceUrl: e.target.value })} className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]" />
                                    <input type="url" placeholder="Dribbble URL" value={profileData.dribbbleUrl} onChange={(e) => setProfileData({ ...profileData, dribbbleUrl: e.target.value })} className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]" />
                                    <input type="url" placeholder="Twitter / X URL" value={profileData.twitterUrl} onChange={(e) => setProfileData({ ...profileData, twitterUrl: e.target.value })} className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)] col-span-2" />
                                </div>
                            )}

                            {/* Portfolio Links — View Mode */}
                            {!isEditing && (profileData.behanceUrl || profileData.dribbbleUrl || profileData.twitterUrl || profileData.website) && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {profileData.behanceUrl && (
                                        <a href={profileData.behanceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[#053EFF] hover:border-[#053EFF]/30 transition-all">
                                            Behance
                                        </a>
                                    )}
                                    {profileData.dribbbleUrl && (
                                        <a href={profileData.dribbbleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[#EA4C89] hover:border-[#EA4C89]/30 transition-all">
                                            Dribbble
                                        </a>
                                    )}
                                    {profileData.twitterUrl && (
                                        <a href={profileData.twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs font-bold text-[var(--text-secondary)] transition-all">
                                            Twitter / X
                                        </a>
                                    )}
                                    {profileData.website && (
                                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-brand-orange)] hover:border-[var(--color-brand-orange)]/30 transition-all">
                                            <Globe className="w-3.5 h-3.5" /> Website
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* XP and Stats Grid */}
                        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                            
                            {/* Puan ve Başarımlar (XP) */}
                            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 shadow-sm flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-black tracking-tight">Kazanılan Puanlar (XP)</h2>
                                    <span className="bg-orange-100 text-[var(--color-brand-orange)] px-3 py-1 rounded-full text-sm font-black">
                                        {xpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${xpData.total.toLocaleString('tr-TR')} XP`}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-2 flex-1">
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-xl flex flex-col justify-center text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[var(--text-secondary)]">
                                            <User className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Kayıt Bonusu</span>
                                        <p className="font-bold text-[var(--text-primary)] text-xl">+100 <span className="text-xs text-[var(--text-secondary)]">XP</span></p>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-xl flex flex-col justify-center text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[var(--text-secondary)]">
                                            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Gönderiler</span>
                                        <p className="font-bold text-[var(--text-primary)] text-xl">+{xpData.posts * 200} <span className="text-xs text-[var(--text-secondary)]">XP</span></p>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-xl flex flex-col justify-center text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[var(--text-secondary)]">
                                            <MessageCircle className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Yorumlar</span>
                                        <p className="font-bold text-[var(--text-primary)] text-xl">+{xpData.comments * 50} <span className="text-xs text-[var(--text-secondary)]">XP</span></p>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-xl flex flex-col justify-center text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[var(--text-secondary)]">
                                            <Zap className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Analizler</span>
                                        <p className="font-bold text-[var(--text-primary)] text-xl">+{xpData.analizler * 150} <span className="text-xs text-[var(--text-secondary)]">XP</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Kısa Özet */}
                            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 shadow-sm">
                                <h2 className="mb-4 text-sm font-black tracking-tight">Kısa Özet</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Analiz', value: stats.total },
                                        { label: 'Ortalama', value: stats.ortalama },
                                        { label: 'Bu Hafta', value: stats.buHafta },
                                        { label: 'Favori Tür', value: stats.enCokTasarimTuru },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{item.label}</p>
                                            <p className="mt-1 truncate text-lg font-black">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Topluluk Rozetleri */}
                        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 pt-5 pb-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-black tracking-tight">Topluluk Rozetleri</h2>
                                    <span className="rounded-full bg-[var(--color-brand-orange)]/10 px-2 py-0.5 text-[10px] font-black text-[var(--color-brand-orange)]">
                                        {BADGE_DEFINITIONS.filter(b => b.checkFn(userBadges, normalizedProfile.isCoreFounder, normalizedProfile.founderNumber)).length}/{BADGE_DEFINITIONS.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin text-[var(--text-secondary)]" />}
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => { setShowBadgePicker(v => !v); if (!badgesExpanded) setBadgesExpanded(true); }}
                                            className="flex items-center gap-1.5 rounded-full border border-[var(--border-primary)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:border-[var(--color-brand-orange)] hover:text-[var(--color-brand-orange)] transition-all"
                                        >
                                            <Star className="h-3 w-3" />
                                            {featuredBadge ? 'Degistir' : 'Rozet sec'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {showBadgePicker && isOwnProfile && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-5 mb-3">
                                        <div className="rounded-xl border border-[var(--color-brand-orange)]/30 bg-[var(--color-brand-orange)]/5 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-orange)]">Profilinde gosterilecek rozeti sec</p>
                                                <button onClick={() => setShowBadgePicker(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X className="h-3.5 w-3.5" /></button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {BADGE_DEFINITIONS.filter(b => b.checkFn(userBadges, normalizedProfile.isCoreFounder, normalizedProfile.founderNumber)).map(badge => {
                                                    const isSelected = featuredBadge === badge.id;
                                                    return (
                                                        <button key={badge.id} disabled={savingBadge} onClick={() => handleSelectFeaturedBadge(badge.id)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black transition-all ${isSelected ? `${badge.bg} ${badge.border} ${badge.color} ring-2 ring-offset-1 ring-[var(--color-brand-orange)]/40` : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
                                                            {renderBadgeIcon(badge.emoji, "w-3.5 h-3.5")}
                                                            <span>{badge.label}</span>
                                                            {isSelected && <CheckCircle2 className="h-3 w-3" />}
                                                        </button>
                                                    );
                                                })}
                                                {featuredBadge && (<button disabled={savingBadge} onClick={() => handleSelectFeaturedBadge(null)} className="flex items-center gap-1.5 rounded-full border border-dashed border-red-400/50 px-3 py-1.5 text-xs font-black text-red-400 hover:bg-red-500/10 transition-all"><X className="h-3 w-3" /> Rozeti kaldir</button>)}
                                                {savingBadge && <Loader2 className="h-4 w-4 animate-spin text-[var(--text-secondary)] self-center" />}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="px-5 pb-5">
                                {(() => {
                                    const previewBadges = BADGE_DEFINITIONS.slice(0, 3);
                                    const restBadges = BADGE_DEFINITIONS.slice(3);
                                    const rarityColors: Record<string, string> = {
                                        Common: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                                        Rare: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                                        Epic: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                                        Legendary: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                                        Mythic: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                    };
                                    const renderCard = (badge: typeof BADGE_DEFINITIONS[0]) => {
                                        const isActive = badge.checkFn(userBadges, normalizedProfile.isCoreFounder, normalizedProfile.founderNumber);
                                        const isFeatured = featuredBadge === badge.id;
                                        const ba = badge as any;
                                        const rarity: string = ba.rarity || 'Common';
                                        const xp: number = ba.xp || 0;
                                        const rarityColor = rarityColors[rarity] || rarityColors.Common;
                                        return (
                                            <motion.div key={badge.id} whileHover={{ y: -2 }} className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${isActive ? isFeatured ? 'border-[var(--color-brand-orange)] bg-[var(--bg-secondary)] shadow-sm shadow-[var(--color-brand-orange)]/10 ring-1 ring-[var(--color-brand-orange)]/50' : 'border-[var(--border-primary)] bg-[var(--card-bg)] hover:border-[var(--border-hover)]' : 'border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]/30 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                                                <div className="mb-3 flex items-start justify-between relative z-10">
                                                    <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${isActive ? badge.bg : 'bg-gray-500/10'} ${isActive ? badge.color : 'text-gray-400'}`}>{renderBadgeIcon(badge.emoji, "w-5 h-5")}</div>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest border ${isActive ? rarityColor : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>{rarity}</span>
                                                        {xp > 0 && <span className={`text-[10px] font-black ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>+{xp} XP</span>}
                                                    </div>
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`text-sm font-black ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{badge.label}</h4>
                                                        {isFeatured && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-brand-orange)] text-[8px] text-white shadow">&#9733;</span>}
                                                    </div>
                                                    <p className="text-xs leading-5 text-[var(--text-secondary)] font-medium">{ba.description}</p>
                                                </div>
                                                {isFeatured && <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--color-brand-orange)]/10 blur-2xl z-0" />}
                                            </motion.div>
                                        );
                                    };
                                    return (
                                        <>
                                            <div className="grid gap-3 sm:grid-cols-3">{previewBadges.map(renderCard)}</div>
                                            <AnimatePresence initial={false}>
                                                {badgesExpanded && (
                                                    <motion.div key="badge-rest" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }} className="overflow-hidden">
                                                        <div className="grid gap-3 sm:grid-cols-3 mt-3">{restBadges.map(renderCard)}</div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <button onClick={() => setBadgesExpanded(v => !v)} className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-primary)] py-2.5 text-xs font-black text-[var(--text-secondary)] hover:border-[var(--color-brand-orange)] hover:text-[var(--color-brand-orange)] transition-all">
                                                <motion.div animate={{ rotate: badgesExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="h-3.5 w-3.5" /></motion.div>
                                                {badgesExpanded ? 'Daha Az Goster' : `Tumunu Gor (${restBadges.length} rozet daha)`}
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                    </div>
                </section>

                <section className="mt-5 grid gap-5 lg:grid-cols-3">
                    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 shadow-sm">
                        <HeartHandshake className="mb-4 h-6 w-6 text-[var(--color-brand-orange)]" />
                        <h3 className="mb-2 text-sm font-black">Topluluk Kimliği</h3>
                        <p className="text-xs font-medium leading-6 text-[var(--text-secondary)]">
                            İlk destekçi numarası, rütbe ve uzmanlık alanı profilin en görünür parçası olarak kalır.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 shadow-sm">
                        <MessageCircle className="mb-4 h-6 w-6 text-[var(--color-brand-orange)]" />
                        <h3 className="mb-2 text-sm font-black">Geri Bildirim Halkası</h3>
                        <p className="text-xs font-medium leading-6 text-[var(--text-secondary)]">
                            Rozet sistemi yarışma, puanlama, davet ve aktiflik üzerinden toplulukta kalmayı teşvik eder.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 shadow-sm">
                        <Sparkles className="mb-4 h-6 w-6 text-[var(--color-brand-orange)]" />
                        <h3 className="mb-2 text-sm font-black">Vitrin Geçmişi</h3>
                        <p className="text-xs font-medium leading-6 text-[var(--text-secondary)]">
                            Paylaşımlar geldikçe bu alan profilin canlı portfolyosuna dönüşecek.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
