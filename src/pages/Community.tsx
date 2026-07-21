import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MessageCircle, Heart, Trophy, Zap, Share2, Crown, Star, Sparkles, ArrowRight, Award } from 'lucide-react';
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

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % CHANGING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let aktif = true;

        const loadFounders = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, display_name, bio, avatar_url, website, social_handle, design_rank, specialty, experience_level, founder_number, created_at, public_visible')
                .not('founder_number', 'is', null)
                .gte('founder_number', CORE_FOUNDER_COUNT + 1)
                .eq('public_visible', true)
                .order('founder_number', { ascending: true })
                .limit(MEMBER_FOUNDER_LIMIT);

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
                <motion.div
                    animate={{
                        opacity: [0.03, 0.08, 0.03],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-2/3 h-full bg-orange-600 blur-[80px] md:blur-[140px] pointer-events-none"
                />

                <div className="max-w-screen-xl mx-auto px-6 relative z-10">
                    <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start mb-16">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-5 md:px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--color-brand-orange)] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-8"
                            >
                                <Sparkles size={12} />
                                Topluluk Duvarı
                            </motion.div>
                            <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight mb-6">
                                İlk {FOUNDER_LIMIT} Destekçimiz
                            </h1>
                            <p className="text-[var(--text-secondary)] text-base md:text-lg font-medium max-w-2xl leading-relaxed">
                                Revizele'nin temellerine en başında inanan ilk {FOUNDER_LIMIT} yol arkadaşımız, bu duvarda kalıcı olarak yer alacak. Bu sadece bir isim listesi değil; geleceğin tasarım standartlarını birlikte belirleyeceğimiz bu serüvenin ölümsüz bir parçası olma fırsatı. Senin de izin burada sonsuza dek parlamalı.
                            </p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-3xl border border-[var(--border-primary)] bg-[var(--card-bg)] backdrop-blur-xl p-6 md:p-8 shadow-xl shadow-black/5"
                        >
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Doluluk</p>
                                    <p className="mt-1 text-4xl font-black text-[var(--text-primary)]">{wallCount}<span className="text-lg text-[var(--text-secondary)]">/{FOUNDER_LIMIT}</span></p>
                                </div>
                                <Crown className="h-10 w-10 text-amber-500" />
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
                            <motion.div
                                key={founder.id}
                                whileHover={{ scale: 1.16, zIndex: 60 }}
                                onClick={() => onProfileOpen?.(founder)}
                                className="relative group cursor-pointer"
                                role="button"
                                tabIndex={0}
                            >
                                <div className="absolute -inset-2 rounded-full bg-[var(--color-brand-orange)]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-16 h-16 md:w-[84px] md:h-[84px] rounded-full p-[3px] bg-gradient-to-br from-orange-300 via-[var(--color-brand-orange)] to-amber-600 shadow-[0_12px_28px_rgba(255,77,0,0.2)] group-hover:shadow-[0_12px_40px_rgba(255,77,0,0.4)] transition-all">
                                    <img
                                        src={founder.avatarUrl}
                                        className="w-full h-full rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] object-cover"
                                        alt=""
                                    />
                                </div>
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max bg-[#111] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center z-50">
                                    <span className="text-sm font-bold text-white">{founder.displayName}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest mt-1 text-[var(--color-brand-orange)]">
                                        Kurucu
                                    </span>
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border-r border-b border-white/10 rotate-45" />
                                </div>
                            </motion.div>
                        ))}

                        {visibleFounders.map((founder) => {
                            const rank = getMemberFounderDisplayNumber(founder.founderNumber) || 0;

                            return (
                                <motion.div
                                    key={founder.id}
                                    whileHover={{ scale: 1.18, zIndex: 50 }}
                                    onClick={() => onProfileOpen?.(founder)}
                                    className="relative group cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full p-[2px] bg-white/10 group-hover:bg-gradient-to-br group-hover:from-[var(--color-brand-orange)] group-hover:to-orange-600 transition-all duration-300">
                                        <img
                                            src={founder.avatarUrl}
                                            className={`w-full h-full rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] object-cover ${founderSource === 'preview' ? 'saturate-0 opacity-40' : ''}`}
                                            alt=""
                                        />
                                    </div>
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max bg-[#111] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center z-50">
                                        <span className="text-sm font-bold text-white">
                                            {founderSource === 'live' ? founder.displayName : `Destekçi #${rank}`}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest mt-1 text-[var(--color-brand-orange)]">
                                            İlk 100 Destekçi
                                        </span>
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border-r border-b border-white/10 rotate-45" />
                                    </div>
                                </motion.div>
                            );
                        })}

                        {Array.from({ length: placeholderCount }).map((_, i) => (
                            <div
                                key={`empty-founder-${i}`}
                                className="group relative flex w-12 h-12 md:w-16 md:h-16 items-center justify-center rounded-full border-2 border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]/30"
                            >
                                <span className="text-sm font-black">+</span>
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl px-4 py-3 shadow-2xl z-50">
                                    <span className="text-xs font-bold text-[var(--text-secondary)]">Açık destekçi yeri</span>
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--card-bg)] border-r border-b border-[var(--border-primary)] rotate-45" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-16 flex flex-col items-center justify-between gap-6 rounded-[32px] border border-[var(--border-primary)] bg-[var(--card-bg)] backdrop-blur-md px-8 py-6 text-center md:flex-row md:text-left shadow-lg"
                    >
                        <p className="text-base font-medium text-[var(--text-secondary)] max-w-2xl">
                            {kullanici
                                ? 'Profilini tamamladığında duvarda daha gerçek bir yüz ve hikaye ile görünürsün.'
                                : 'Revizele\'nin temellerine katkıda bulun. İlk 100 üye arasında yer alarak bu duvarda ismini ölümsüzleştir.'}
                        </p>
                        <button
                            onClick={kullanici ? onProfileClick : onAuthClick}
                            className="shrink-0 rounded-full bg-[var(--text-primary)] px-8 py-4 text-sm font-black text-[var(--bg-primary)] transition-all hover:scale-105 hover:shadow-xl"
                        >
                            {kullanici ? 'Profilimi Tamamla' : 'Hemen Destekçi Ol'}
                        </button>
                    </motion.div>
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
                                <span className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold rounded-full cursor-pointer">En Yeni</span>
                                <span className="px-4 py-2 bg-[var(--card-bg)] text-[var(--text-secondary)] text-xs font-bold rounded-full border border-[var(--border-primary)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors">Popüler</span>
                            </div>
                        </div>

                        {[1, 2, 3].map((post) => (
                            <motion.div
                                key={post}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-[var(--card-bg)] p-6 md:p-8 rounded-[40px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="flex items-start gap-5">
                                    <img
                                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=User${post + 10}&backgroundColor=b6e3f4,c0aede`}
                                        className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
                                        alt="Avatar"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg text-[var(--text-primary)]">Selman A.</span>
                                            <span className="text-[var(--text-secondary)] text-xs">• 2 saat önce</span>
                                        </div>
                                        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                                            Yeni mobil uygulama tasarımım için renk paleti önerisi olan var mı? AI analizi 85 puan verdi ama hala bir şeyler eksik gibi geliyor... 🤔
                                        </p>
                                        <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 bg-[var(--bg-secondary)]">
                                            <img
                                                src={`https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=800&seed=${post}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                alt="Post thumbnail"
                                            />
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--color-brand-orange)] transition-colors text-sm font-bold">
                                                <Heart size={18} /> 42 Beğeni
                                            </button>
                                            <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-bold">
                                                <MessageCircle size={18} /> 12 Cevap
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
                                {[
                                    { name: 'Kadir Mert', points: '12,450', level: 'Kıdemli Tasarımcı', crown: true, gradient: 'from-amber-400 via-orange-500 to-red-500' },
                                    { name: 'Elif Şahin', points: '11,200', level: 'Uzman Tasarımcı', crown: false, gradient: 'from-blue-400 to-indigo-500' },
                                    { name: 'Caner Öz', points: '9,800', level: 'Kıdemli Tasarımcı', crown: false, gradient: 'from-emerald-400 to-teal-500' },
                                    { name: 'Selin Y.', points: '8,400', level: 'Junior Tasarımcı', crown: false, gradient: 'from-[var(--border-primary)] to-[var(--text-secondary)]' }
                                ].map((user, i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors">
                                        <div className="relative">
                                            {/* Level Glow */}
                                            <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${user.gradient} opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 blur-[3px]`}></div>
                                            <div className={`w-12 h-12 rounded-full p-[2px] bg-gradient-to-br ${user.gradient} relative z-10`}>
                                                <img
                                                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=User${i + 50}`}
                                                    className="w-full h-full rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] object-cover"
                                                    alt="Avatar"
                                                />
                                            </div>
                                            {user.crown && (
                                                <Crown className="absolute -top-3 -right-2 text-amber-500 fill-amber-500 w-6 h-6 drop-shadow-sm z-20 animate-bounce" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm tracking-tight leading-none mb-1 text-[var(--text-primary)] group-hover:text-[var(--color-brand-orange)] transition-colors truncate">
                                                {user.name}
                                            </p>
                                            <p className={`text-[9px] uppercase font-black tracking-widest bg-gradient-to-r ${user.gradient} bg-clip-text text-transparent truncate`}>
                                                {user.level}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0">
                                            <span className="text-lg font-black text-[var(--text-secondary)] italic">#{i + 1}</span>
                                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">{user.points} XP</span>
                                        </div>
                                    </div>
                                ))}
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
        </div>
    );
}
