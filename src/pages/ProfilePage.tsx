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
    ChevronDown,
    Trash2,
    ShieldCheck,
    KeyRound,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
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

    // Password Change Modal States
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Şifre en az 6 karakter olmalıdır.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor.');
            return;
        }
        setChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success('Şifreniz başarıyla güncellendi!');
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            toast.error(err.message || 'Şifre güncellenirken hata oluştu.');
        } finally {
            setChangingPassword(false);
        }
    };

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
        if (!isEditing) {
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
        }
    }, [normalizedProfile, profileRecord, isEditing]);

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

    // User Posts & Deletion State
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [userPostsLoading, setUserPostsLoading] = useState(true);
    const [deletePostId, setDeletePostId] = useState<string | null>(null);
    const [deletingPost, setDeletingPost] = useState(false);

    useEffect(() => {
        const targetUserId = normalizedProfile.id;
        if (!targetUserId || targetUserId === 'anonymous') return;
        const fetchUserPosts = async () => {
            setUserPostsLoading(true);
            const { data } = await supabase
                .from('community_posts')
                .select(`*, analizler(*)`)
                .eq('user_id', targetUserId)
                .order('created_at', { ascending: false });
            if (data) setUserPosts(data);
            setUserPostsLoading(false);
        };
        fetchUserPosts();
    }, [normalizedProfile.id]);

    const handleConfirmDeletePost = async () => {
        if (!deletePostId || !isOwnProfile) return;
        setDeletingPost(true);
        try {
            const targetPost = userPosts.find(p => p.id === deletePostId);
            await supabase.from('community_posts').delete().eq('id', deletePostId);
            if (targetPost?.analiz_id) {
                await supabase.from('analizler').delete().eq('id', targetPost.analiz_id);
            }
            setUserPosts(prev => prev.filter(p => p.id !== deletePostId));
            setDeletePostId(null);
            setXpData(prev => ({
                ...prev,
                posts: Math.max(0, prev.posts - 1),
                total: Math.max(0, prev.total - 200)
            }));
        } catch (err) {
            console.error("Silme hatası:", err);
        } finally {
            setDeletingPost(false);
        }
    };

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

            let existingBadges = data ? data.map(b => b.badge_id) : [];
            const toAdd: string[] = [];

            // 1. 'aramiza-hos-geldin'
            if (!existingBadges.includes('aramiza-hos-geldin')) {
                toAdd.push('aramiza-hos-geldin');
            }

            // 2. 'ai-ile-tanisma'
            if (!existingBadges.includes('ai-ile-tanisma')) {
                const { count: analysisCount } = await supabase
                    .from('analizler')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', normalizedProfile.id);
                if (analysisCount && analysisCount > 0) {
                    toAdd.push('ai-ile-tanisma');
                }
            }

            // 3. 'ilk-kivilcim'
            if (!existingBadges.includes('ilk-kivilcim')) {
                const { count: postCount } = await supabase
                    .from('community_posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', normalizedProfile.id);
                if (postCount && postCount > 0) {
                    toAdd.push('ilk-kivilcim');
                }
            }

            // 4. 'ilk-ses'
            if (!existingBadges.includes('ilk-ses')) {
                const { count: commentCount } = await supabase
                    .from('post_comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', normalizedProfile.id);
                if (commentCount && commentCount > 0) {
                    toAdd.push('ilk-ses');
                }
            }

            // Save to DB
            if (toAdd.length > 0) {
                for (const badgeId of toAdd) {
                    try {
                        await supabase.from('user_badges').insert({
                            user_id: normalizedProfile.id,
                            badge_id: badgeId
                        });
                    } catch (_) {}
                }
                existingBadges = [...existingBadges, ...toAdd];
            }

            setUserBadges(existingBadges);
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

                        {/* Avatar + Name centered */}
                        <div className="flex flex-col items-center text-center gap-3 pb-5 border-b border-[var(--border-primary)]">
                            <div className={`relative h-20 w-20 shrink-0 rounded-full p-[3px] ${normalizedProfile.isCoreFounder ? 'bg-gradient-to-br from-orange-300 via-[var(--color-brand-orange)] to-amber-500' : 'bg-[var(--border-primary)]'}`}>
                                <div className="h-full w-full rounded-full border-2 border-[var(--card-bg)] bg-[var(--bg-secondary)] overflow-hidden"><img src={profileData.avatarUrl} className="h-full w-full object-cover" alt="Profil fotografi" /></div>
                                {featuredBadgeDef ? (
                                    <div title={featuredBadgeDef.label} className={`absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[var(--card-bg)] ${featuredBadgeDef.bg} ${featuredBadgeDef.color} shadow-lg`}>
                                        {renderBadgeIcon(featuredBadgeDef.emoji, "w-3.5 h-3.5")}
                                    </div>
                                ) : (
                                    <div className="absolute -bottom-1 -right-1 rounded-full border-4 border-[var(--card-bg)] bg-[var(--color-brand-orange)] p-1.5 shadow-lg">
                                        <Sparkles className="h-3.5 w-3.5 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 w-full">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.displayName}
                                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                        className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-lg font-black outline-none focus:border-[var(--color-brand-orange)] text-center"
                                    />
                                ) : (
                                    <h1 className="truncate text-xl font-black tracking-tight">{profileData.displayName}</h1>
                                )}
                                <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                                    {normalizedProfile.isCoreFounder ? 'Kurucu Üye' : selectedRank.title}
                                    {normalizedProfile.founderNumber ? ` · #${normalizedProfile.founderNumber}` : ''}
                                </p>
                                {featuredBadgeDef && (
                                    <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black border ${featuredBadgeDef.bg} ${featuredBadgeDef.border} ${featuredBadgeDef.color}`}>
                                        {renderBadgeIcon(featuredBadgeDef.emoji, "w-3 h-3")} {featuredBadgeDef.label}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info grid */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3">
                                <p className="text-[10px] font-semibold text-[var(--text-secondary)]">Uzmanlık</p>
                                <p className="mt-1 truncate text-sm font-black">{selectedSpecialty.label}</p>
                            </div>
                            <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3">
                                <p className="text-[10px] font-semibold text-[var(--text-secondary)]">Deneyim</p>
                                <p className="mt-1 text-sm font-black">{selectedExperience?.label || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3">
                                <p className="text-[10px] font-semibold text-[var(--text-secondary)]">Sıradaki Yeri</p>
                                <p className="mt-1 text-xl font-black">{normalizedProfile.founderNumber ? `#${normalizedProfile.founderNumber}` : '-'}</p>
                            </div>
                            <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3">
                                <p className="text-[10px] font-semibold text-[var(--text-secondary)]">Analiz Sayısı</p>
                                <p className="mt-1 text-xl font-black">{stats.total}</p>
                            </div>
                        </div>

                        {/* Social links */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {(!isPublicProfile && kullanici?.email) && (
                                <a href={`mailto:${kullanici.email}`} className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors text-[var(--text-secondary)]" title={kullanici.email}><Mail className="h-4 w-4" /></a>
                            )}
                            {profileData.website && (
                                <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors text-[var(--text-secondary)]" title={profileData.website}><Globe className="h-4 w-4" /></a>
                            )}
                            {profileData.twitterUrl && (
                                <a href={profileData.twitterUrl.startsWith('http') ? profileData.twitterUrl : `https://${profileData.twitterUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors text-[var(--text-secondary)]" title="Twitter"><Twitter className="h-4 w-4" /></a>
                            )}
                            {profileData.behanceUrl && (
                                <a href={profileData.behanceUrl.startsWith('http') ? profileData.behanceUrl : `https://${profileData.behanceUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors text-[var(--text-secondary)]" title="Behance"><Palette className="h-4 w-4" /></a>
                            )}
                            {profileData.dribbbleUrl && (
                                <a href={profileData.dribbbleUrl.startsWith('http') ? profileData.dribbbleUrl : `https://${profileData.dribbbleUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors text-[var(--text-secondary)]" title="Dribbble"><Dribbble className="h-4 w-4" /></a>
                            )}
                            {profileData.socialHandle && (
                                <a href={profileData.socialHandle.startsWith('http') ? profileData.socialHandle : `https://${profileData.socialHandle}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] p-2 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors text-[var(--text-secondary)]" title="Sosyal Medya"><Link className="h-4 w-4" /></a>
                            )}
                        </div>

                        {isOwnProfile && (
                            <button
                                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                                disabled={saving}
                                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition-all disabled:opacity-60 ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'}`}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <CheckCircle2 className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                {isEditing ? 'Kaydet' : 'Profili Düzenle'}
                            </button>
                        )}
                        {saveState === 'saved' && <p className="mt-3 text-center text-xs font-bold text-emerald-500">Profil güncellendi.</p>}
                        {saveState === 'error' && <p className="mt-3 text-center text-xs font-bold text-red-500">Kaydedilirken hata oluştu.</p>}

                        {/* Tercihler & Güvenlik */}
                        {isOwnProfile && (
                            <div className="mt-5 pt-4 border-t border-[var(--border-primary)] space-y-3">
                                <div>
                                    <h3 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                        Tercihler
                                    </h3>
                                    <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                                        Hesap ve uygulama ayarlarınızı yönetin.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--color-brand-orange)] hover:text-[var(--color-brand-orange)] transition-all text-xs font-bold text-[var(--text-primary)] group"
                                    >
                                        <span className="flex items-center gap-2">
                                            <KeyRound className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--color-brand-orange)]" />
                                            Şifre Değiştir
                                        </span>
                                        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                                    </button>
                                </div>
                            </div>
                        )}
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
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-full overflow-hidden">
                                    <label className="block col-span-1 md:col-span-2">
                                        <span className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">Avatar URL</span>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                value={profileData.avatarUrl}
                                                onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                                                className="min-w-0 flex-1 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-xs outline-none focus:border-[var(--color-brand-orange)]"
                                            />
                                            <div className="flex gap-2 shrink-0">
                                                <button type="button" onClick={handleAvatarRefresh} className="flex-1 sm:flex-initial rounded-xl border border-[var(--border-primary)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--color-brand-orange)] flex items-center justify-center gap-1.5" title="Rastgele Avatar Üret">
                                                    <RefreshCw className="h-3.5 w-3.5" /> Rastgele
                                                </button>
                                                <label className="flex-1 sm:flex-initial rounded-xl border border-[var(--border-primary)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--color-brand-orange)] cursor-pointer flex items-center justify-center">
                                                    Yükle
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                                </label>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">Tasarım Rütbesi</span>
                                        <select value={profileData.designRank} onChange={(e) => setProfileData({ ...profileData, designRank: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]">
                                            {DESIGN_RANKS.map((rank) => <option key={rank.id} value={rank.id}>{rank.title}</option>)}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">Uzmanlık</span>
                                        <select value={profileData.specialty} onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]">
                                            {DESIGN_SPECIALTIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                                        </select>
                                    </label>
                                    <label className="block col-span-1 md:col-span-2">
                                        <span className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">Deneyim</span>
                                        <select value={profileData.experienceLevel} onChange={(e) => setProfileData({ ...profileData, experienceLevel: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]">
                                            {EXPERIENCE_LEVELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                                        </select>
                                    </label>
                                    <input type="text" placeholder="Web sitesi" value={profileData.website} onChange={(e) => setProfileData({ ...profileData, website: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]" />
                                    <input type="text" placeholder="Sosyal hesap" value={profileData.socialHandle} onChange={(e) => setProfileData({ ...profileData, socialHandle: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]" />
                                    <input type="url" placeholder="Behance URL" value={profileData.behanceUrl} onChange={(e) => setProfileData({ ...profileData, behanceUrl: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]" />
                                    <input type="url" placeholder="Dribbble URL" value={profileData.dribbbleUrl} onChange={(e) => setProfileData({ ...profileData, dribbbleUrl: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)]" />
                                    <input type="url" placeholder="Twitter / X URL" value={profileData.twitterUrl} onChange={(e) => setProfileData({ ...profileData, twitterUrl: e.target.value })} className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-orange)] col-span-1 md:col-span-2" />
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
                                        <span className="text-xs font-semibold text-[var(--text-secondary)] mb-0.5">Kayıt Bonusu</span>
                                        <p className="font-bold text-[var(--text-primary)] text-xl">+100 <span className="text-xs text-[var(--text-secondary)]">XP</span></p>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-xl flex flex-col justify-center text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[var(--text-secondary)]">
                                            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                        </div>
                                        <span className="text-xs font-semibold text-[var(--text-secondary)] mb-0.5">Gönderiler</span>
                                        <p className="font-bold text-[var(--text-primary)] text-xl">+{xpData.posts * 200} <span className="text-xs text-[var(--text-secondary)]">XP</span></p>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-xl flex flex-col justify-center text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[var(--text-secondary)]">
                                            <MessageCircle className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                        </div>
                                        <span className="text-xs font-semibold text-[var(--text-secondary)] mb-0.5">Yorumlar</span>
                                        <p className="font-bold text-[var(--text-primary)] text-xl">+{xpData.comments * 50} <span className="text-xs text-[var(--text-secondary)]">XP</span></p>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-xl flex flex-col justify-center text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[var(--text-secondary)]">
                                            <Zap className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                        </div>
                                        <span className="text-xs font-semibold text-[var(--text-secondary)] mb-0.5">Analizler</span>
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
                                            <p className="text-xs font-semibold text-[var(--text-secondary)] mb-0.5">{item.label}</p>
                                            <p className="mt-1 truncate text-lg font-black">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Paylaşılan Tasarımlar & Silme Alanı */}
                        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black tracking-tight">
                                    Paylaşılan Tasarımlar ({userPosts.length})
                                </h2>
                            </div>

                            {userPostsLoading ? (
                                <div className="flex justify-center py-8 text-[var(--text-secondary)]">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            ) : userPosts.length === 0 ? (
                                <div className="text-center py-8 text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] text-xs font-medium">
                                    Henüz paylaşılan bir tasarım bulunmuyor.
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar">
                                    {userPosts.map((post) => {
                                        const rawG = post.analizler?.gorsel_url;
                                        const thumbSrc = rawG ? (rawG.startsWith('http') || rawG.startsWith('data:') ? rawG : `data:image/jpeg;base64,${rawG}`) : null;

                                        return (
                                            <div key={post.id} className="relative rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden p-3.5 flex flex-col justify-between group">
                                                {thumbSrc ? (
                                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black/5">
                                                        <img src={thumbSrc} className="w-full h-full object-cover" alt="Tasarım" />
                                                    </div>
                                                ) : (
                                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[var(--card-bg)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)]/40">
                                                        <UploadCloud className="w-8 h-8" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{post.title || 'Tasarım Analizi'}</h3>
                                                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{new Date(post.created_at).toLocaleDateString('tr-TR')}</p>
                                                </div>

                                                {isOwnProfile && (
                                                    <button
                                                        onClick={() => setDeletePostId(post.id)}
                                                        className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold w-full"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Sil
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Delete Confirmation Modal */}
                        {deletePostId && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeletePostId(null)}>
                                <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] p-6 rounded-3xl max-w-sm w-full shadow-2xl text-center space-y-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                                        <Trash2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-lg text-[var(--text-primary)]">Tasarımı Sil</h3>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                        Bu tasarımı ve analiz kaydını silmek istediğinize emin misiniz? Puanlarınız buna göre güncellenecektir.
                                    </p>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setDeletePostId(null)}
                                            className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                                        >
                                            Vazgeç
                                        </button>
                                        <button
                                            onClick={handleConfirmDeletePost}
                                            disabled={deletingPost}
                                            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-50"
                                        >
                                            {deletingPost ? 'Siliniyor...' : 'Evet, Sil'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                            {featuredBadge ? 'Değiştir' : 'Rozet Seç'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {showBadgePicker && isOwnProfile && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-5 mb-3">
                                        <div className="rounded-xl border border-[var(--color-brand-orange)]/30 bg-[var(--color-brand-orange)]/5 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-orange)]">Profilinde gösterilecek rozeti seç</p>
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
                                                {featuredBadge && (<button disabled={savingBadge} onClick={() => handleSelectFeaturedBadge(null)} className="flex items-center gap-1.5 rounded-full border border-dashed border-red-400/50 px-3 py-1.5 text-xs font-black text-red-400 hover:bg-red-500/10 transition-all"><X className="h-3 w-3" /> Rozeti Kaldır</button>)}
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
                                                {badgesExpanded ? 'Daha Az Göster' : `Tümünü Gör (${restBadges.length} rozet daha)`}
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

                {/* Şifre Değiştirme Modalı */}
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}>
                        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] flex items-center justify-center">
                                        <KeyRound className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm text-[var(--text-primary)]">Şifre Değiştir</h3>
                                        <p className="text-[10px] text-[var(--text-secondary)] font-medium">Yeni şifrenizi belirleyin.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPasswordModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-3 pt-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="En az 6 karakter"
                                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--color-brand-orange)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Şifreyi tekrar yazın"
                                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--color-brand-orange)]"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={changingPassword || !newPassword || newPassword !== confirmPassword}
                                        className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-orange)] text-white text-xs font-bold hover:bg-[#e64500] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Şifreyi Güncelle'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
