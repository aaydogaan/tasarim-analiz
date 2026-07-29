import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Trophy, Calendar, Link as LinkIcon, Briefcase, Award, Star, Activity, ArrowLeft, X, Bell, BellOff, Users, Sparkles, Clock } from 'lucide-react';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import FollowModal from '../components/ui/FollowModal';
import DesignDetailModal from '../components/ui/DesignDetailModal';
import { getDesignRankById, DESIGN_RANKS, DESIGN_SPECIALTIES, EXPERIENCE_LEVELS } from '../lib/communityProfile';

const BehanceIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 7h-7V5h7v2zm-1.7 5.2c0-1.8-1.2-3.2-3.3-3.2-2.1 0-3.6 1.5-3.6 3.7 0 2.2 1.4 3.7 3.7 3.7 1.7 0 2.8-.7 3.3-1.8h-1.9c-.3.4-.8.6-1.4.6-1 0-1.6-.6-1.7-1.6h5c0-.1 0-.3 0-.4zm-3.3-1.7c.8 0 1.3.5 1.4 1.2h-2.9c.1-.8.7-1.2 1.5-1.2zM8.7 13.3c.7 0 1.2-.4 1.2-1.1 0-.6-.4-1-1.1-1H6.3v2.1h2.4zm.2-4c.6 0 1-.3 1-.9 0-.5-.4-.8-1-.8H6.3v1.7h2.6zM3.5 6h5.6c2.2 0 3.5 1 3.5 2.3 0 1-.5 1.7-1.4 2.1 1.1.4 1.8 1.3 1.8 2.5 0 1.7-1.4 2.8-3.7 2.8H3.5V6z"/>
    </svg>
);

const DribbbleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm7.93 9.17c-.8-.16-2.58-.4-4.83.08a22.2 22.2 0 0 0-1.84-3.54A8.04 8.04 0 0 1 19.93 11.17zM12 4.07c1.7 0 3.26.56 4.5 1.51a24.1 24.1 0 0 1 1.74 3.37c-2.07-.46-4.08-.22-5.74.07a41.3 41.3 0 0 0-2.32-3.79c.58-.1 1.19-.16 1.82-.16zm-3.66.72c.8 1.25 1.63 2.58 2.37 3.86a22.9 22.9 0 0 0-5.7 1.83 8.04 8.04 0 0 1 3.33-5.69zM4.07 12c0-.28.02-.55.06-.82 2.1-.64 4.54-1.22 7.03-.89a24.8 24.8 0 0 1 .92 4.79C9.37 16 6.13 15.65 4.5 14.6A7.95 7.95 0 0 1 4.07 12zm3.17 4.14c1.84.97 4.8 1.27 7.42.47a25.5 25.5 0 0 1 1.86 4.3 8.04 8.04 0 0 1-9.28-4.77zm11.38 2.76a27.1 27.1 0 0 0-1.86-4.25c2.1-.5 3.65-.28 4.25-.13a8.03 8.03 0 0 1-2.39 4.38z"/>
    </svg>
);

const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
);

export default function PublicProfile() {
    const { slug } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [seciliGorsel, setSeciliGorsel] = useState<string | null>(null);
    
    // XP and Stats
    const [xpData, setXpData] = useState({ total: 0, posts: 0, comments: 0, analizler: 0, challenges: 0 });
    const [showcases, setShowcases] = useState<any[]>([]);

    // Follow system
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [notifyPosts, setNotifyPosts] = useState(true);
    const [mutualFollowers, setMutualFollowers] = useState<any[]>([]);
    const [followLoading, setFollowLoading] = useState(false);
    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');
    const [dailyWinCount, setDailyWinCount] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // Fetch profile by slug or id cleanly
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || '');
                let query = supabase.from('profiles').select('*');
                if (isUuid) {
                    query = query.or(`slug.eq.${slug},id.eq.${slug}`);
                } else {
                    query = query.eq('slug', slug);
                }

                const { data: profData, error: profErr } = await query.maybeSingle();

                if (profErr || !profData) throw new Error('Profil bulunamadı');
                setProfile(profData);

                // Set dynamic SEO Title & Meta Description for User Profile
                const designerName = profData.display_name || 'Tasarımcı';
                document.title = `${designerName} (@${profData.slug || 'profil'}) — Tasarımcı Profili | Revizelesene`;
                let descTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
                if (descTag) {
                    descTag.content = `${designerName} tasarımcı profili, XP başarıları, rozetleri ve tasarım analizleri Revizelesene'de.`;
                }

                // Fetch current user and follow status
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUser(user);
                    const { data: followData } = await supabase
                        .from('user_follows')
                        .select('id, notify_posts')
                        .eq('follower_id', user.id)
                        .eq('following_id', profData.id)
                        .maybeSingle();
                    if (followData) {
                        setIsFollowing(true);
                        setNotifyPosts(followData.notify_posts ?? true);
                    }

                    // Fetch mutual followers
                    if (user.id !== profData.id) {
                        const { data: userFollowing } = await supabase
                            .from('user_follows')
                            .select('following_id')
                            .eq('follower_id', user.id);
                        
                        if (userFollowing && userFollowing.length > 0) {
                            const followingIds = userFollowing.map(f => f.following_id);
                            const { data: mutuals } = await supabase
                                .from('user_follows')
                                .select('follower_id, profiles:follower_id(display_name, avatar_url, slug)')
                                .eq('following_id', profData.id)
                                .in('follower_id', followingIds)
                                .limit(3);
                            
                            if (mutuals) {
                                setMutualFollowers(mutuals.map((m: any) => m.profiles).filter(Boolean));
                            }
                        }
                    }
                }

                // Fetch follower counts
                const [followersRes, followingRes] = await Promise.all([
                    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', profData.id),
                    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', profData.id)
                ]);
                setFollowersCount(followersRes.count || 0);
                setFollowingCount(followingRes.count || 0);

                // Fetch XP stats
                const [postsRes, commentsRes, analizRes, challengeRes] = await Promise.all([
                    supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', profData.id),
                    supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('user_id', profData.id),
                    supabase.from('analizler').select('*', { count: 'exact', head: true }).eq('user_id', profData.id),
                    supabase.from('challenge_entries').select('*', { count: 'exact', head: true }).eq('user_id', profData.id),
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

                // Fetch showcases
                const { data: showcaseData } = await supabase
                    .from('community_posts')
                    .select('*, analizler(gorsel_url, isletme, tasarim_turu, genel_puan)')
                    .eq('user_id', profData.id)
                    .order('created_at', { ascending: false });

                // Fetch daily design win count
                const { count: winCount } = await supabase
                    .from('daily_design_winners')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', profData.id);
                setDailyWinCount(winCount || 0);
                
                const formattedShowcases = (showcaseData || []).map(post => {
                    const rawG = post.analizler?.gorsel_url || post.gorsel_url;
                    const imageSrc = rawG ? (rawG.startsWith('http') || rawG.startsWith('data:') ? rawG : `data:image/jpeg;base64,${rawG}`) : '';
                    return {
                        ...post,
                        image_url: imageSrc,
                        isletme: post.analizler?.isletme || post.title || 'Genel',
                        tasarim_turu: post.analizler?.tasarim_turu || 'Tasarım',
                        genel_puan: post.analizler?.genel_puan || 0
                    };
                });

                setShowcases(formattedShowcases);
                
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchProfile();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-brand-orange)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
                {/* Background ambient effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#FF5500]/5 to-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="relative mb-8"
                    >
                        <h1 className="text-[120px] md:text-[180px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)] opacity-10 select-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)] border border-red-500/20 backdrop-blur-sm transform -rotate-6">
                                <Activity className="w-12 h-12 text-red-500 transform rotate-6" />
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-md"
                    >
                        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tight">Sayfa Bulunamadı</h2>
                        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed text-base">
                            Aradığınız sayfa mevcut değil, silinmiş veya URL adresi değiştirilmiş olabilir. Eğer bir tasarımcı profili arıyorsanız, kullanıcı adının doğruluğundan emin olun.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                to="/vitrin" 
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold flex items-center justify-center gap-3 transition-transform hover:scale-105 hover:shadow-xl"
                            >
                                <ArrowLeft className="w-5 h-5" /> Vitrine Dön
                            </Link>
                            <Link 
                                to="/" 
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] font-bold flex items-center justify-center transition-colors hover:bg-[var(--border-primary)]"
                            >
                                Ana Sayfa
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Calculate level based on XP
    const userLevel = Math.floor(xpData.total / 1000) + 1;
    const levelTitle = getDesignRankById(profile.design_rank).title;

    const handleFollowToggle = async () => {
        if (!currentUser || followLoading) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await supabase.from('user_follows').delete().match({ follower_id: currentUser.id, following_id: profile.id });
                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
            } else {
                await supabase.from('user_follows').insert({ follower_id: currentUser.id, following_id: profile.id, notify_posts: true });
                setIsFollowing(true);
                setNotifyPosts(true);
                setFollowersCount(prev => prev + 1);
                
                await supabase.from('notifications').insert({
                    user_id: profile.id,
                    type: 'follow_user',
                    actor_id: currentUser.id
                });
            }
        } catch (error) {
            console.error("Takip işlemi hatası:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleBellToggle = async () => {
        if (!currentUser || !isFollowing) return;
        const nextVal = !notifyPosts;
        setNotifyPosts(nextVal);
        await supabase
            .from('user_follows')
            .update({ notify_posts: nextVal })
            .match({ follower_id: currentUser.id, following_id: profile.id });
        toast.success(nextVal ? "Gönderi bildirimleri açıldı!" : "Gönderi bildirimleri sessize alındı.");
    };

    return (
        <div className="min-h-screen bg-[#fafafa] pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-6">
                
                {/* Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200/60 rounded-[32px] overflow-hidden mb-8 shadow-sm"
                >
                    {/* Cover Image */}
                    <div className="h-32 md:h-48 w-full bg-gradient-to-r from-orange-100 to-amber-100 relative group overflow-hidden">
                        {profile.cover_url && profile.cover_url.trim() !== '' ? (
                            <img src={profile.cover_url} className="w-full h-full object-cover" alt="Kapak Fotoğrafı" />
                        ) : (
                            <img src="/revizelesene-kapak-gorseli.webp" className="w-full h-full object-cover" alt="Varsayılan Kapak Fotoğrafı" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                    </div>

                    <div className="px-8 pb-8 md:px-12 md:pb-12">
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative mb-6">
                            {/* Avatar */}
                            <div className="relative -mt-16 md:-mt-20 shrink-0 self-center md:self-start">
                                {profile.verification_badge === 'gold' ? (
                                    <div className="p-[3px] rounded-full bg-gradient-to-br from-orange-300 via-orange-500 to-amber-500 shadow-[0_0_24px_rgba(255,120,0,0.55)]">
                                        <div className="p-[3px] rounded-full bg-white">
                                            <img 
                                                src={profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.id}`} 
                                                alt={profile.display_name} 
                                                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <img 
                                        src={profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.id}`} 
                                        alt={profile.display_name} 
                                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-sm object-cover bg-white"
                                    />
                                )}
                                <div className="absolute bottom-2 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm border-2 border-white uppercase tracking-wider">
                                    Level {userLevel}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left pt-2 md:pt-4 pb-2 flex flex-col md:items-start justify-center gap-4 w-full">
                                
                                {/* Üst Satır: İsim ve Buton */}
                                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-6 w-full">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                                        <span>{profile.display_name}</span>
                                        <VerifiedBadge badge={profile.verification_badge} size="md" />
                                    </h1>
                                    {currentUser && currentUser.id !== profile.id && (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={handleFollowToggle}
                                                disabled={followLoading}
                                                className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex-1 sm:flex-initial ${
                                                    isFollowing 
                                                    ? 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                                } disabled:opacity-50`}
                                            >
                                                {followLoading ? 'Bekleniyor...' : isFollowing ? 'Takipten Çık' : 'Takip Et'}
                                            </button>
                                            {isFollowing && (
                                                <button
                                                    onClick={handleBellToggle}
                                                    title={notifyPosts ? "Bildirimleri kapat" : "Bildirimleri aç"}
                                                    className={`p-2.5 rounded-xl border transition-all ${
                                                        notifyPosts 
                                                        ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' 
                                                        : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {notifyPosts ? <Bell className="w-4 h-4 fill-amber-500" /> : <BellOff className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                 {/* Alt Satır: Rozet ve İstatistikler */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                        <Award className="w-4 h-4" /> {levelTitle}
                                    </span>
                                    {profile.verification_badge === 'gold' && (
                                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs font-black px-2.5 py-1 rounded-full border border-orange-200 uppercase tracking-wider">
                                            ✦ Kurucu
                                        </span>
                                    )}
                                    <div className="flex items-center gap-6">
                                        <button
                                            type="button"
                                            onClick={() => { setFollowModalTab('followers'); setIsFollowModalOpen(true); }}
                                            className="flex items-baseline gap-1.5 hover:text-orange-600 transition-colors group cursor-pointer"
                                        >
                                            <span className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{followersCount}</span>
                                            <span className="text-sm font-medium">takipçi</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setFollowModalTab('following'); setIsFollowModalOpen(true); }}
                                            className="flex items-baseline gap-1.5 hover:text-orange-600 transition-colors group cursor-pointer"
                                        >
                                            <span className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{followingCount}</span>
                                            <span className="text-sm font-medium">takip</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Biyografi Alanı */}
                        {profile.bio && (
                            <div className="mb-4 bg-gray-50/80 px-4 py-3 rounded-2xl border border-gray-200/60 max-w-2xl">
                                <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium text-center md:text-left">
                                    {profile.bio}
                                </p>
                            </div>
                        )}

                        {/* Kurumsal Deneyim & Uzmanlık Rozetleri */}
                        {(() => {
                            const rankTitle = DESIGN_RANKS.find(r => r.id === profile.design_rank)?.title || profile.design_rank;
                            const specLabel = DESIGN_SPECIALTIES.find(s => s.id === profile.specialty)?.label || profile.specialty;
                            const expLabel = EXPERIENCE_LEVELS.find(e => e.id === profile.experience_level)?.label || profile.experience_level;

                            if (!rankTitle && !specLabel && !expLabel) return null;

                            return (
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-6">
                                    {rankTitle && (
                                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold shadow-2xs">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                                            <span>{rankTitle}</span>
                                        </span>
                                    )}
                                    {specLabel && (
                                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold shadow-2xs">
                                            <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                                            <span>{specLabel}</span>
                                        </span>
                                    )}
                                    {expLabel && (
                                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold shadow-2xs">
                                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                                            <span>{expLabel} Deneyim</span>
                                        </span>
                                    )}
                                    {dailyWinCount > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold shadow-2xs">
                                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Günün Tasarımı Şampiyonu {dailyWinCount}x</span>
                                        </span>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Mutual Followers Social Proof */}
                        {mutualFollowers.length > 0 && (
                            <div className="flex items-center gap-2 mb-6 text-xs text-gray-600 bg-gray-50/80 px-3.5 py-2 rounded-xl border border-gray-200/60 w-fit">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {mutualFollowers.map((m, idx) => (
                                        <img
                                            key={idx}
                                            src={m.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.display_name}`}
                                            alt={m.display_name}
                                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                                        />
                                    ))}
                                </div>
                                <span>
                                    <strong className="text-gray-900 font-bold">{mutualFollowers[0]?.display_name}</strong>
                                    {mutualFollowers.length > 1 && `, ${mutualFollowers[1]?.display_name}`}
                                    {mutualFollowers.length > 2 ? ' ve diğer takip ettiğin kişiler' : ''} bu tasarımcıyı takip ediyor.
                                </span>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-medium text-gray-500">
                            {profile.created_at && (
                                <div className="flex items-center gap-1.5 bg-gray-100/80 px-4 py-2.5 rounded-xl">
                                    <Calendar className="w-3.5 h-3.5" /> 
                                    {new Date(profile.created_at).toLocaleDateString('tr-TR')} katıldı
                                </div>
                            )}
                            {profile.website && (
                                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors">
                                    <LinkIcon className="w-3.5 h-3.5" /> Web Sitesi
                                </a>
                            )}
                            {profile.behance_url && (
                                <a href={profile.behance_url.startsWith('http') ? profile.behance_url : `https://${profile.behance_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#053EFF] bg-[#053EFF]/10 hover:bg-[#053EFF]/20 px-4 py-2.5 rounded-xl transition-colors">
                                    <BehanceIcon className="w-3.5 h-3.5" /> Behance
                                </a>
                            )}
                            {profile.dribbble_url && (
                                <a href={profile.dribbble_url.startsWith('http') ? profile.dribbble_url : `https://${profile.dribbble_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#EA4C89] bg-[#EA4C89]/10 hover:bg-[#EA4C89]/20 px-4 py-2.5 rounded-xl transition-colors">
                                    <DribbbleIcon className="w-3.5 h-3.5" /> Dribbble
                                </a>
                            )}
                            {profile.twitter_url && (
                                <a href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://${profile.twitter_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#1DA1F2] bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 px-4 py-2.5 rounded-xl transition-colors">
                                    <TwitterIcon className="w-3.5 h-3.5" /> Twitter / X
                                </a>
                            )}
                            {profile.social_handle && (
                                <a href={profile.social_handle.startsWith('http') ? profile.social_handle : `https://${profile.social_handle}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#E4405F] bg-[#E4405F]/10 hover:bg-[#E4405F]/20 px-4 py-2.5 rounded-xl transition-colors">
                                    <InstagramIcon className="w-3.5 h-3.5" /> Instagram
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white border border-gray-200/60 rounded-[24px] p-6 text-center shadow-sm">
                        <div className="text-3xl font-black text-gray-900 mb-1">{xpData.total.toLocaleString()}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Toplam XP</div>
                    </div>
                    <div className="bg-white border border-gray-200/60 rounded-[24px] p-6 text-center shadow-sm">
                        <div className="text-3xl font-black text-gray-900 mb-1">{xpData.posts}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Vitrin Paylaşımı</div>
                    </div>
                    <div className="bg-white border border-gray-200/60 rounded-[24px] p-6 text-center shadow-sm">
                        <div className="text-3xl font-black text-gray-900 mb-1">{xpData.analizler}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Analizler</div>
                    </div>
                    <div className="bg-white border border-gray-200/60 rounded-[24px] p-6 text-center shadow-sm">
                        <div className="text-3xl font-black text-gray-900 mb-1">{userLevel}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seviye</div>
                    </div>
                </div>

                {/* Showcases */}
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Vitrin Paylaşımları
                    <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">{showcases.length}</span>
                </h2>
                {showcases.length === 0 ? (
                    <div className="bg-white border border-gray-200/60 rounded-3xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Star className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz Paylaşım Yok</h3>
                        <p className="text-gray-500 text-sm">Kullanıcı henüz Keşfet vitrininde bir tasarım paylaşmamış.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {showcases.map((post) => (
                            <div 
                                key={post.id} 
                                onClick={() => {
                                    if (post.image_url) {
                                        setSeciliGorsel({
                                            id: post.id,
                                            gorsel_url: post.image_url,
                                            isletme: post.isletme,
                                            tasarim_turu: post.tasarim_turu,
                                            ai_puan: post.genel_puan || 85,
                                            created_at: post.created_at,
                                            user_id: profile.id,
                                            user_name: profile.display_name,
                                            user_avatar: profile.avatar_url,
                                            user_slug: profile.slug,
                                            verification_badge: profile.verification_badge
                                        });
                                    }
                                }}
                                className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[24px] overflow-hidden hover:border-[#FF5500]/50 transition-all group block shadow-sm hover:shadow-md cursor-pointer"
                            >
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    {post.image_url ? (
                                        <img 
                                            src={post.image_url} 
                                            alt={post.isletme} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            Görsel Bulunamadı
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-5 border-t border-[var(--border-primary)] flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 truncate">{post.isletme}</h3>
                                        <p className="text-[var(--text-secondary)] text-sm font-medium">{post.tasarim_turu}</p>
                                    </div>
                                    {post.genel_puan > 0 && (
                                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 font-bold px-2.5 py-1 rounded-lg text-sm shrink-0 border border-amber-500/20">
                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                            {post.genel_puan}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Design Detail Modal */}
            <DesignDetailModal
                item={seciliGorsel}
                onClose={() => setSeciliGorsel(null)}
                currentUser={currentUser}
            />

            {/* FollowModal */}
            <FollowModal
                isOpen={isFollowModalOpen}
                onClose={() => setIsFollowModalOpen(false)}
                targetUserId={profile.id}
                targetUserName={profile.display_name}
                initialTab={followModalTab}
                currentUser={currentUser}
                onFollowChange={() => {
                    // Refresh followers/following counts on action
                    supabase.from('user_follows').select('id', { count: 'exact' }).eq('following_id', profile.id).then(res => setFollowersCount(res.count || 0));
                    supabase.from('user_follows').select('id', { count: 'exact' }).eq('follower_id', profile.id).then(res => setFollowingCount(res.count || 0));
                }}
            />
        </div>
    );
}
