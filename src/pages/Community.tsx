import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MessageCircle, Heart, Trophy, Zap, Share2, Crown, Star, Sparkles, ArrowRight, Award, X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
    CORE_FOUNDERS,
    CORE_FOUNDER_COUNT,
    DESIGN_RANKS,
    FOUNDER_LIMIT,
    MEMBER_FOUNDER_LIMIT,
    getMemberFounderDisplayNumber,
    makeFounderPreview,
    normalizeCommunityProfile,
    type NormalizedCommunityProfile,
} from '../lib/communityProfile';

const CHANGING_WORDS = ["Revize", "Analiz", "Tasarım", "Gelişim"];

const STATS = [
    { label: 'Aktif Üye', value: '1.2k+', icon: Users, color: 'text-blue-500' },
    { label: 'Günlük Mesaj', value: '850+', icon: MessageCircle, color: 'text-[var(--color-brand-orange)]' },
    { label: 'Revize Edilen', value: '3.4k+', icon: Zap, color: 'text-amber-500' },
    { label: 'Tasarım Paylaşımı', value: '12k+', icon: Heart, color: 'text-emerald-500' }
];

type CommunityProps = {
    kullanici?: any;
    onAuthClick?: () => void;
    onProfileClick?: () => void;
    onProfileOpen?: (profile: NormalizedCommunityProfile) => void;
};

export default function Community({ kullanici, onAuthClick, onProfileClick, onProfileOpen }: CommunityProps) {
    const [wordIndex, setWordIndex] = useState(0);
    const [founders, setFounders] = useState<NormalizedCommunityProfile[]>(() => makeFounderPreview(24));
    const [founderSource, setFounderSource] = useState<'loading' | 'live' | 'preview'>('loading');
    const [activeChallenge, setActiveChallenge] = useState<any>(null);
    const [challengeEntryCount, setChallengeEntryCount] = useState(0);
    const [challengeTimeLeft, setChallengeTimeLeft] = useState('');
    const [userEnteredChallenge, setUserEnteredChallenge] = useState(false);
    const [joiningChallenge, setJoiningChallenge] = useState(false);
    const [trendData, setTrendData] = useState<{ type: string; count: number }[]>([]);
    
    // Community Posts State
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [postSort, setPostSort] = useState<'new' | 'popular'>('new');

    // Comments State
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [commentsModalAcik, setCommentsModalAcik] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentInput, setCommentInput] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [sendingComment, setSendingComment] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % CHANGING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Fetch and subscribe to community_posts
    useEffect(() => {
        let isMounted = true;
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('community_posts')
                .select(`*, analizler(id, gorsel_url, genel_puan, user_name, user_avatar, isletme)`)
                .order('created_at', { ascending: false });
            if (data && !error && isMounted) {
                setPosts(data);
            }
            if (isMounted) setPostsLoading(false);
        };
        fetchPosts();

        const postsSubscription = supabase
            .channel('community_posts_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setPosts(current => current.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
                } else if (payload.eventType === 'INSERT') {
                    fetchPosts();
                } else if (payload.eventType === 'DELETE') {
                    setPosts(current => current.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(postsSubscription);
        };
    }, []);

    // Load liked posts for user
    useEffect(() => {
        if (!kullanici) return;
        const fetchLikes = async () => {
            const { data } = await supabase.from('post_likes').select('post_id').eq('user_id', kullanici.id);
            if (data) {
                setLikedPosts(new Set(data.map(d => d.post_id)));
            }
        };
        fetchLikes();
    }, [kullanici]);

    const handleLike = async (postId: string) => {
        if (!kullanici) {
            onAuthClick?.();
            return;
        }
        const isLiked = likedPosts.has(postId);
        const newSet = new Set(likedPosts);
        if (isLiked) newSet.delete(postId);
        else newSet.add(postId);
        setLikedPosts(newSet);

        if (isLiked) {
            await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', kullanici.id);
        } else {
            await supabase.from('post_likes').insert({ post_id: postId, user_id: kullanici.id });
        }
    };

    const openComments = async (postId: string) => {
        setSelectedPostId(postId);
        setCommentsModalAcik(true);
        setLoadingComments(true);
        const { data } = await supabase
            .from('post_comments')
            .select(`*, profiles(display_name, avatar_url)`)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        if (data) setComments(data);
        setLoadingComments(false);
    };

    const submitComment = async () => {
        if (!selectedPostId || !commentInput.trim()) return;
        if (!kullanici) {
            onAuthClick?.();
            return;
        }

        setSendingComment(true);
        const { data, error } = await supabase
            .from('post_comments')
            .insert({ post_id: selectedPostId, user_id: kullanici.id, content: commentInput.trim() })
            .select('*, profiles(display_name, avatar_url)')
            .single();

        if (data && !error) {
            setComments(prev => [...prev, data]);
            setCommentInput('');
        }
        setSendingComment(false);
    };

    // Realtime for open comments
    useEffect(() => {
        if (!selectedPostId || !commentsModalAcik) return;
        const commentsSubscription = supabase
            .channel(`comments_${selectedPostId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments', filter: `post_id=eq.${selectedPostId}` }, async (payload) => {
                const { data } = await supabase
                    .from('post_comments')
                    .select('*, profiles(display_name, avatar_url)')
                    .eq('id', payload.new.id)
                    .single();
                
                if (data) {
                    setComments(current => {
                        if (current.find(c => c.id === data.id)) return current;
                        return [...current, data];
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(commentsSubscription);
        };
    }, [selectedPostId, commentsModalAcik]);

    useEffect(() => {
        let aktif = true;

        const loadFounders = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, display_name, bio, avatar_url, website, social_handle, design_rank, specialty, experience_level, created_at')
                .order('created_at', { ascending: true })
                .limit(100);

            if (!aktif) return;

            if (!error && data?.length) {
                setFounders(data.map((profile) => normalizeCommunityProfile(null, profile as any)));
                setFounderSource('live');
                return;
            }

            setFounderSource('preview');
        };

        loadFounders();
        return () => { aktif = false; };
    }, []);

    // Load active challenge
    useEffect(() => {
        const loadChallenge = async () => {
            const { data } = await supabase
                .from('weekly_challenges')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (data) {
                setActiveChallenge(data);
                // Get entry count
                const { count } = await supabase
                    .from('challenge_entries')
                    .select('*', { count: 'exact', head: true })
                    .eq('challenge_id', data.id);
                setChallengeEntryCount(count || 0);
                // Check if current user already entered
                if (kullanici) {
                    const { data: entry } = await supabase
                        .from('challenge_entries')
                        .select('id')
                        .eq('challenge_id', data.id)
                        .eq('user_id', kullanici.id)
                        .maybeSingle();
                    setUserEnteredChallenge(!!entry);
                }
                // Countdown
                const updateCountdown = () => {
                    const diff = new Date(data.end_date).getTime() - Date.now();
                    if (diff <= 0) { setChallengeTimeLeft('Sona erdi'); return; }
                    const d = Math.floor(diff / 86400000);
                    const h = Math.floor((diff % 86400000) / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    setChallengeTimeLeft(`${d}g ${h}s ${m}d`);
                };
                updateCountdown();
                const timer = setInterval(updateCountdown, 60000);
                return () => clearInterval(timer);
            }
        };
        loadChallenge();
    }, [kullanici]);

    // Load design trends from vitrin
    useEffect(() => {
        const loadTrends = async () => {
            const { data } = await supabase
                .from('analizler')
                .select('tasarim_turu')
                .eq('paylasim_aktif', true)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
            if (data) {
                const counts: Record<string, number> = {};
                data.forEach(a => { if (a.tasarim_turu) counts[a.tasarim_turu] = (counts[a.tasarim_turu] || 0) + 1; });
                const sorted = Object.entries(counts)
                    .map(([type, count]) => ({ type, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setTrendData(sorted);
            }
        };
        loadTrends();
    }, []);

    const joinChallenge = async () => {
        if (!kullanici) { onAuthClick?.(); return; }
        if (!activeChallenge || userEnteredChallenge) return;
        setJoiningChallenge(true);
        // Use latest analysis of user
        const { data: latestAnaliz } = await supabase
            .from('analizler')
            .select('id')
            .eq('user_id', kullanici.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (!latestAnaliz) {
            alert('Katılmak için önce bir tasarım analizi yapmış olman gerekiyor.');
            setJoiningChallenge(false);
            return;
        }
        const { error } = await supabase.from('challenge_entries').insert({
            challenge_id: activeChallenge.id,
            analiz_id: latestAnaliz.id,
            user_id: kullanici.id,
        });
        if (!error) {
            setUserEnteredChallenge(true);
            setChallengeEntryCount(prev => prev + 1);
        }
        setJoiningChallenge(false);
    };

    const liveFounderCount = founderSource === 'live' ? founders.length : 0;
    const wallCount = Math.min(CORE_FOUNDER_COUNT + liveFounderCount, FOUNDER_LIMIT);
    const visibleFounders = founderSource === 'live' ? founders.slice(0, MEMBER_FOUNDER_LIMIT) : founders.slice(0, 18);
    const placeholderCount = founderSource === 'live'
        ? Math.min(Math.max(FOUNDER_LIMIT - CORE_FOUNDER_COUNT - liveFounderCount, 0), 24)
        : 18;
    const founderProgress = Math.min((wallCount / FOUNDER_LIMIT) * 100, 100);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Wall of Fame / Kurucu Üyeler Hero Section */}
            <section className="relative w-full bg-[var(--bg-secondary)] pt-24 pb-32 md:pb-40 overflow-hidden border-b border-[var(--border-primary)]">
                {/* Background Decor */}
                <div
                    className="absolute top-0 right-0 w-2/3 h-full bg-orange-600/5 blur-[80px] md:blur-[140px] pointer-events-none"
                    style={{ transform: "translate3d(0,0,0)" }}
                />

                <div className="max-w-screen-xl mx-auto px-6 relative z-10">
                    <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start mb-16">
                        <div>

                            <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight mb-6">
                                İlk {FOUNDER_LIMIT} Destekçimiz
                            </h1>
                            <p className="text-[var(--text-secondary)] text-base md:text-lg font-medium max-w-2xl leading-relaxed">
                                Revizelesene'nin temellerine en başında inanan ilk {FOUNDER_LIMIT} yol arkadaşımız, bu duvarda kalıcı olarak yer alacak. Bu sadece bir isim listesi değil; geleceğin tasarım standartlarını birlikte belirleyeceğimiz bu serüvenin ölümsüz bir parçası olma fırsatı. Senin de izin burada sonsuza dek parlamalı.
                            </p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-3xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 md:p-8 shadow-xl shadow-black/5"
                        >
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Doluluk</p>
                                    <p className="mt-1 text-4xl font-black text-[var(--text-primary)]">{wallCount}<span className="text-lg text-[var(--text-secondary)]">/{FOUNDER_LIMIT}</span></p>
                                </div>
                                <img src="/Revizelesene-Favicon.png" alt="Favicon" className="h-10 w-10 object-contain drop-shadow-md" />
                            </div>
                            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${founderProgress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-orange)] to-amber-500" 
                                />
                            </div>
                            <p className="mt-6 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                                {founderSource === 'live'
                                    ? 'Sıralama üyelik oluşturma tarihine göre kilitlenir.'
                                    : 'Gerçek üyeler geldikçe duvar dolacak.'}
                            </p>
                        </motion.div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {CORE_FOUNDERS.map((founder) => (
                            <div
                                key={founder.id}
                                onClick={() => onProfileOpen?.(founder)}
                                className="relative group cursor-pointer hover:scale-110 hover:z-50 transition-transform duration-300"
                                role="button"
                                tabIndex={0}
                            >
                                <div className="absolute -inset-2 rounded-full bg-[var(--color-brand-orange)]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-16 h-16 md:w-[84px] md:h-[84px] rounded-full p-[3px] bg-gradient-to-br from-orange-300 via-[var(--color-brand-orange)] to-amber-600 shadow-[0_12px_28px_rgba(255,77,0,0.2)] group-hover:shadow-[0_12px_40px_rgba(255,77,0,0.4)] transition-all">
                                    <img
                                        src={founder.avatarUrl}
                                        className="w-full h-full rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] object-cover"
                                        alt=""
                                        loading="lazy"
                                    />
                                </div>
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max bg-[#111] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center z-50">
                                    <span className="text-sm font-bold text-white">{founder.displayName}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest mt-1 text-[var(--color-brand-orange)]">
                                        Kurucu
                                    </span>
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border-r border-b border-white/10 rotate-45" />
                                </div>
                            </div>
                        ))}

                        {visibleFounders.map((founder) => {
                            const rank = getMemberFounderDisplayNumber(founder.founderNumber) || 0;

                            return (
                                <div
                                    key={founder.id}
                                    onClick={() => onProfileOpen?.(founder)}
                                    className="relative group cursor-pointer hover:scale-110 hover:z-50 transition-transform duration-300"
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="absolute -inset-2 rounded-full bg-[var(--color-brand-orange)]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative w-16 h-16 md:w-[84px] md:h-[84px] rounded-full p-[3px] bg-gradient-to-br from-orange-300 via-[var(--color-brand-orange)] to-amber-600 shadow-[0_12px_28px_rgba(255,77,0,0.2)] group-hover:shadow-[0_12px_40px_rgba(255,77,0,0.4)] transition-all">
                                        <img
                                            src={founder.avatarUrl}
                                            className={`w-full h-full rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] object-cover ${founderSource === 'preview' ? 'saturate-0 opacity-40' : ''}`}
                                            alt=""
                                        />
                                    </div>
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max bg-[#111] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center z-50">
                                        <span className="text-sm font-bold text-white">
                                            {founder.displayName || 'Gizli Tasarımcı'}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest mt-1 text-[var(--color-brand-orange)]">
                                            {rank}. Destekçi
                                        </span>
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border-r border-b border-white/10 rotate-45" />
                                    </div>
                                </div>
                            );
                        })}

                        {Array.from({ length: placeholderCount }).map((_, i) => (
                            <div
                                key={`empty-founder-${i}`}
                                className="group relative flex w-16 h-16 md:w-[84px] md:h-[84px] items-center justify-center rounded-full border-2 border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]/30"
                            >
                                <span className="text-sm font-black">+</span>
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl px-4 py-3 shadow-2xl z-50">
                                    <span className="text-xs font-bold text-[var(--text-secondary)]">Açık destekçi yeri</span>
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--card-bg)] border-r border-b border-[var(--border-primary)] rotate-45" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {!kullanici && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-16 flex flex-col items-center justify-between gap-6 rounded-[32px] border border-[var(--border-primary)] bg-[var(--card-bg)] px-8 py-6 text-center md:flex-row md:text-left shadow-lg"
                        >
                            <p className="text-base font-medium text-[var(--text-secondary)] max-w-2xl">
                                Revizelesene'nin temellerine katkıda bulun. İlk 100 üye arasında yer alarak bu duvarda ismini ölümsüzleştir.
                            </p>
                            <button
                                onClick={onAuthClick}
                                className="shrink-0 rounded-full bg-[var(--text-primary)] px-8 py-4 text-sm font-black text-[var(--bg-primary)] transition-all hover:scale-105 hover:shadow-xl"
                            >
                                Hemen Destekçi Ol
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Main Community Content */}
            <main className="max-w-screen-xl mx-auto px-6 md:px-12 py-16 md:py-24">

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Left: Latest Activity */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold tracking-tight">Topluluk Akışı</h2>
                            <div className="flex gap-2">
                                <span 
                                    onClick={() => setPostSort('new')}
                                    className={`px-4 py-2 text-xs font-bold rounded-full cursor-pointer transition-colors ${postSort === 'new' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                >
                                    En Yeni
                                </span>
                                <span 
                                    onClick={() => setPostSort('popular')}
                                    className={`px-4 py-2 text-xs font-bold rounded-full cursor-pointer transition-colors ${postSort === 'popular' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                >
                                    Popüler
                                </span>
                            </div>
                        </div>

                        {postsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
                                <div className="w-8 h-8 border-4 border-[#FF5500]/30 border-t-[#FF5500] rounded-full animate-spin mb-4" />
                                Gönderiler yükleniyor...
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20 text-[var(--text-secondary)] bg-[var(--card-bg)] rounded-[40px] border border-[var(--border-primary)] shadow-sm">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Toplulukta henüz gönderi yok. İlk paylaşan sen ol!</p>
                            </div>
                        ) : [...posts].sort((a, b) => postSort === 'popular' ? b.likes_count - a.likes_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-[var(--card-bg)] p-6 md:p-8 rounded-[40px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="flex items-start gap-5">
                                    <img
                                        src={post.analizler?.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${post.user_id}&backgroundColor=b6e3f4,c0aede`}
                                        className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] object-cover shrink-0"
                                        alt="Avatar"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg text-[var(--text-primary)] truncate">{post.analizler?.user_name || 'Gizli Tasarımcı'}</span>
                                            <span className="text-[var(--text-secondary)] text-xs shrink-0">• {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                                            {post.analizler?.genel_puan && (
                                                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md shrink-0 flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-amber-500" /> {post.analizler.genel_puan} AI
                                                </span>
                                            )}
                                        </div>
                                        {post.title && <h3 className="font-bold text-[var(--text-primary)] mb-2">{post.title}</h3>}
                                        <p className="text-[var(--text-secondary)] leading-relaxed mb-6 whitespace-pre-wrap">
                                            {post.content || 'Bu tasarım analiz edildi.'}
                                        </p>
                                        
                                        {post.analizler?.gorsel_url && (
                                            <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 bg-[var(--bg-secondary)]">
                                                <img
                                                    src={post.analizler.gorsel_url}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    alt="Post thumbnail"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-6 mt-6">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                                                className={`flex items-center gap-2 transition-colors text-sm font-bold ${likedPosts.has(post.id) ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'}`}
                                            >
                                                <Heart size={18} className={likedPosts.has(post.id) ? 'fill-red-500' : ''} /> {post.likes_count}
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); openComments(post.id); }}
                                                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-bold"
                                            >
                                                <MessageCircle size={18} /> {post.comments_count}
                                            </button>
                                            <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-bold ml-auto">
                                                <Share2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <button className="w-full py-6 rounded-[32px] border-2 border-dashed border-[var(--border-primary)] text-[var(--text-secondary)] font-bold hover:border-[var(--color-brand-orange)] hover:text-[var(--color-brand-orange)] transition-all">
                            Daha Fazla Göster
                        </button>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-12">

                        {/* Leaderboard */}
                        <div className="bg-[var(--card-bg)] p-8 rounded-[40px] border border-[var(--border-primary)] shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <Trophy className="text-amber-500 w-6 h-6" />
                                <h3 className="font-bold text-xl tracking-tight text-[var(--text-primary)]">Liderlik Tablosu</h3>
                            </div>
                            <div className="space-y-6">
                                {founders.slice(0, 5).map((user, i) => {
                                    const gradient = i === 0 ? 'from-amber-400 via-orange-500 to-red-500' 
                                                   : i === 1 ? 'from-blue-400 to-indigo-500' 
                                                   : i === 2 ? 'from-emerald-400 to-teal-500' 
                                                   : 'from-[var(--border-primary)] to-[var(--text-secondary)]';
                                    
                                    // Mock points based on rank
                                    const points = 12500 - (i * 1200);

                                    return (
                                        <div key={user.id} onClick={() => onProfileOpen?.(user)} className="flex items-center gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors">
                                            <div className="relative">
                                                {/* Level Glow */}
                                                <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${gradient} opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 blur-[3px]`}></div>
                                                <div className={`w-12 h-12 rounded-full p-[2px] bg-gradient-to-br ${gradient} relative z-10`}>
                                                    <img
                                                        src={user.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`}
                                                        className="w-full h-full rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] object-cover"
                                                        alt="Avatar"
                                                    />
                                                </div>
                                                {i === 0 && (
                                                    <Crown className="absolute -top-3 -right-2 text-amber-500 fill-amber-500 w-6 h-6 drop-shadow-sm z-20 animate-bounce" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm tracking-tight leading-none mb-1 text-[var(--text-primary)] group-hover:text-[var(--color-brand-orange)] transition-colors truncate">
                                                    {user.displayName || 'Gizli Tasarımcı'}
                                                </p>
                                                <p className={`text-[9px] uppercase font-black tracking-widest bg-gradient-to-r ${gradient} bg-clip-text text-transparent truncate`}>
                                                    {user.designRank || 'Tasarımcı'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end flex-shrink-0">
                                                <span className="text-lg font-black text-[var(--text-secondary)] italic">#{i + 1}</span>
                                                <span className="text-[10px] font-bold text-[var(--text-secondary)]">{points.toLocaleString('tr-TR')} XP</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Badge Goals */}
                        <div className="bg-[var(--card-bg)] p-8 rounded-[32px] border border-[var(--border-primary)] shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="text-[var(--color-brand-orange)] w-6 h-6" />
                                <h3 className="font-bold text-xl tracking-tight text-[var(--text-primary)]">Kazanılabilir Rozetler</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { title: 'Challenge Şampiyonu', note: 'Haftanın en yüksek puanı' },
                                    { title: 'En Aktif Üye', note: 'Düzenli yorum ve paylaşım' },
                                    { title: 'Puan Ustası', note: 'En çok değerlendirme yapan' },
                                    { title: 'Davetçi', note: 'Arkadaş getiren üyeler' },
                                ].map((badge) => (
                                    <div key={badge.title} className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
                                        <p className="text-xs font-black text-[var(--text-primary)]">{badge.title}</p>
                                        <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--text-secondary)]">{badge.note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Challenge — Real Data */}
                        <div className="bg-[#111] p-8 rounded-[40px] text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-brand-orange)]/10 blur-[60px] rounded-full pointer-events-none" />
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <Crown className="text-[var(--color-brand-orange)] w-6 h-6" />
                                <h3 className="font-bold text-xl tracking-tight">Haftalık Yarışma</h3>
                            </div>

                            {activeChallenge ? (
                                <div className="relative z-10">
                                    <div className="relative rounded-3xl overflow-hidden aspect-video bg-white/5 mb-5 group">
                                        {activeChallenge.cover_url && (
                                            <img src={activeChallenge.cover_url} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" alt="Challenge" />
                                        )}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                            <span className="px-3 py-1 bg-[var(--color-brand-orange)] text-white text-[10px] font-bold rounded-full mb-3 uppercase tracking-widest">AKTİF</span>
                                            <h4 className="font-black text-lg mb-1 leading-tight">{activeChallenge.title}</h4>
                                            <p className="text-white/50 text-xs font-medium">{challengeEntryCount} katılımcı</p>
                                        </div>
                                    </div>
                                    <p className="text-white/60 text-xs leading-relaxed mb-4">{activeChallenge.description}</p>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="text-center">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Kalan Süre</p>
                                            <p className="text-sm font-black text-[var(--color-brand-orange)]">{challengeTimeLeft}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Ödül</p>
                                            <p className="text-xs font-bold text-white/80">{activeChallenge.prize_text}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={joinChallenge}
                                        disabled={joiningChallenge}
                                        className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all border ${
                                            userEnteredChallenge
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default'
                                                : 'bg-[var(--color-brand-orange)] text-white border-transparent hover:bg-[#e64500]'
                                        }`}
                                    >
                                        {userEnteredChallenge ? '✓ Katıldın!' : joiningChallenge ? 'Katılıyor...' : 'Yarışmaya Katıl'}
                                    </button>
                                </div>
                            ) : (
                                <div className="relative z-10 text-center py-6">
                                    <Crown className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                    <p className="text-white/40 text-sm">Şu an aktif yarışma yok.</p>
                                    <p className="text-white/30 text-xs mt-1">Yakında yeni bir yarışma başlayacak!</p>
                                </div>
                            )}
                        </div>

                        {/* Design Trend — Bu Ay Ne Popüler? */}
                        {trendData.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg px-1 text-[var(--text-primary)]">Bu Ay Trend</h3>
                                <div className="bg-[var(--card-bg)] p-6 rounded-[32px] border border-[var(--border-primary)]">
                                    <div className="space-y-3">
                                        {trendData.map((t, i) => (
                                            <div key={t.type} className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-[var(--text-secondary)] w-4">#{i + 1}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-xs font-bold text-[var(--text-primary)]">{t.type}</span>
                                                        <span className="text-xs text-[var(--text-secondary)]">{t.count}</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-[var(--bg-secondary)]">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-orange)] to-amber-400"
                                                            style={{ width: `${Math.min((t.count / (trendData[0]?.count || 1)) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Tips */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg px-4 text-[var(--text-primary)]">Küçük İpuçları</h3>
                            {[
                                'Beyaz alanı (white space) korkmadan kullanın.',
                                'Tipografide hiyerarşi her şeydir.',
                                'Kısıtlı renk paleti her zaman daha lükstür.'
                            ].map((tip, i) => (
                                <div key={i} className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] flex gap-3">
                                    <Star className="w-5 h-5 text-[var(--color-brand-orange)] flex-shrink-0" />
                                    <p className="text-sm font-medium leading-relaxed italic text-[var(--text-secondary)]">"{tip}"</p>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </main>

            {/* Comments Modal */}
            <AnimatePresence>
                {commentsModalAcik && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => { setCommentsModalAcik(false); setSelectedPostId(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh]"
                        >
                            <div className="px-6 py-5 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--card-bg)] shrink-0">
                                <h3 className="font-bold text-lg text-[var(--text-primary)]">Yorumlar</h3>
                                <button onClick={() => { setCommentsModalAcik(false); setSelectedPostId(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {loadingComments ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-[var(--text-secondary)]">
                                        <div className="w-6 h-6 border-2 border-[#FF5500]/30 border-t-[#FF5500] rounded-full animate-spin mb-4" />
                                        Yükleniyor...
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-10 text-[var(--text-secondary)]">
                                        <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Henüz yorum yok. İlk yorumu sen yap!</p>
                                    </div>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="flex gap-4">
                                            <img 
                                                src={c.profiles?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${c.user_id}&backgroundColor=b6e3f4,c0aede`} 
                                                alt="avatar" 
                                                className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] shrink-0 object-cover"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-[var(--text-primary)]">{c.profiles?.display_name || 'Gizli Tasarımcı'}</span>
                                                    <span className="text-[10px] text-[var(--text-secondary)]">{new Date(c.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{c.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                                        placeholder="Bir yorum yaz..."
                                        className="w-full bg-[var(--card-bg)] border border-[var(--border-primary)] text-[var(--text-primary)] px-4 py-3 pr-12 rounded-2xl focus:outline-none focus:border-[#FF5500] transition-colors text-sm"
                                    />
                                    <button 
                                        onClick={submitComment}
                                        disabled={sendingComment || !commentInput.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#FF5500] text-white rounded-xl hover:bg-[#e64d00] transition-colors disabled:opacity-50"
                                    >
                                        {sendingComment ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
