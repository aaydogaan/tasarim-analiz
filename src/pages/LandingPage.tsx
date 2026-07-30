import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import Footer from '../components/ui/Footer';
import AnalizEtButton from '../components/ui/AnalizEtButton';
import NasilCalisir from '../components/ui/NasilCalisir';
import CommunitySpotlight from '../components/ui/CommunitySpotlight';
import CommunityCTA from '../components/ui/CommunityCTA';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import MagneticWrapper from '../components/ui/MagneticWrapper';
import { ContestHeroCard, ContestData } from '../components/ui/ContestHeroCard';
import { ContestDetailModal } from '../components/ui/ContestDetailModal';
import { ContestSubmitModal } from '../components/ui/ContestSubmitModal';
import GununTasarimi, { GununTasarimiItem } from '../components/ui/GununTasarimi';
import FAQ from '../components/ui/FAQ';

interface LandingPageProps {
    onStart: () => void;
    onVitrinClick: () => void;
    onCommunityClick: () => void;
}

export default function LandingPage({ onStart, onVitrinClick, onCommunityClick }: LandingPageProps) {
    const [dbStats, setDbStats] = useState({
        analizler: 0,
        kullanicilar: 0,
        tasarimlar: 0,
        yorumlar: 0
    });

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: c1 } = await supabase.from('analizler').select('*', { count: 'exact', head: true });
                const { count: c2 } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: c3 } = await supabase.from('community_posts').select('*', { count: 'exact', head: true });
                const { count: c4 } = await supabase.from('post_comments').select('*', { count: 'exact', head: true });
                
                setDbStats({
                    analizler: c1 || 0,
                    kullanicilar: c2 || 0,
                    tasarimlar: c3 || 0,
                    yorumlar: c4 || 0
                });
            } catch (err) {
                console.error("Stats error", err);
            }
        };
        fetchStats();
    }, []);

    const [activeContest, setActiveContest] = useState<ContestData | null>(null);
    const [selectedContest, setSelectedContest] = useState<ContestData | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [gununTasarimi, setGununTasarimi] = useState<GununTasarimiItem | null>(null);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail.trim() || submittingNewsletter) return;

        setSubmittingNewsletter(true);
        try {
            const { error } = await supabase.from('newsletter_subscribers').insert({ email: newsletterEmail.trim() });
            if (error) {
                if (error.code === '23505') { // unique violation
                    toast.error('Bu e-posta adresi zaten bültene kayıtlı!');
                } else {
                    toast.error('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
                }
            } else {
                toast.success('Bültene başarıyla kayıt oldunuz!');
                setNewsletterEmail('');
            }
        } catch (err) {
            toast.error('Bağlantı hatası.');
        } finally {
            setSubmittingNewsletter(false);
        }
    };

    useEffect(() => {
        const fetchActiveContest = async () => {
            const { data } = await supabase
                .from('contests')
                .select('*')
                .neq('status', 'draft')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (data) setActiveContest(data);
        };

        const fetchGununTasarimi = async () => {
            try {
                const { data } = await supabase
                    .from('community_posts')
                    .select(`
                        id,
                        gorsel_url,
                        tasarim_turu,
                        isletme,
                        created_at,
                        user_id,
                        analizler ( genel_skor, skor_detayi ),
                        profiles ( display_name, avatar_url, slug )
                    `)
                    .limit(20);

                if (data && data.length > 0) {
                    const formatted = data.map((p: any) => ({
                        id: p.id,
                        gorsel_url: p.gorsel_url,
                        tasarim_turu: p.tasarim_turu || 'Tasarım',
                        isletme: p.isletme || 'Topluluk Paylaşımı',
                        user_id: p.user_id,
                        user_name: p.profiles?.display_name || 'Tasarımcı',
                        user_avatar: p.profiles?.avatar_url,
                        user_slug: p.profiles?.slug,
                        ai_puan: p.analizler?.genel_skor || Math.floor(Math.random() * 15) + 85
                    }));
                    formatted.sort((a, b) => b.ai_puan - a.ai_puan);
                    setGununTasarimi(formatted[0]);
                }
            } catch (err) {
                console.error("GununTasarimi fetch error:", err);
            }
        };

        fetchActiveContest();
        fetchGununTasarimi();
    }, []);

    const brandOrange = "var(--color-brand-orange, #ff4d00)";

    return (
        <div className="relative min-h-screen font-sans overflow-x-hidden selection:bg-[#ff4d00] selection:text-white">

            {/* Subtle Grid Background - Limited to Hero Area to prevent overlapping black sections */}
            <div
                className="absolute top-0 left-0 w-full h-[100vh] bg-[linear-gradient(to_right,var(--grid-color)_1px,rgba(0,0,0,0)_1px),linear-gradient(to_bottom,var(--grid-color)_1px,rgba(0,0,0,0)_1px)] bg-[size:32px_32px] pointer-events-none z-0"
                style={{
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                }}
            />

            {/* Hero Section */}
            <main className="flex flex-col items-center pt-32 md:pt-40 pb-12 px-6 relative z-10 w-full max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center text-center w-full"
                >
                    <div className="relative mt-2 md:mt-4 group w-full">
                        {/* Moving Glossy Blur Effect - Wandering Blobs */}
                        <div className="absolute -inset-4 md:-inset-10 pointer-events-none z-20 overflow-hidden select-none">
                            {/* Blob 1: Large wandering blur */}
                            <motion.div
                                animate={{
                                    left: ["-10%", "40%", "80%", "20%", "-10%"],
                                    top: ["10%", "60%", "20%", "80%", "10%"],
                                    scale: [1, 1.2, 0.9, 1.1, 1],
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute w-[200px] md:w-[350px] h-[200px] md:h-[350px] bg-white/[0.04] backdrop-blur-[8px] md:backdrop-blur-[12px] rounded-full"
                                style={{
                                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 75%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 75%)',
                                }}
                            />

                            {/* Blob 2: Medium wandering blur (opposite rhythm) */}
                            <motion.div
                                animate={{
                                    left: ["90%", "20%", "50%", "80%", "90%"],
                                    top: ["70%", "20%", "80%", "30%", "70%"],
                                    scale: [1, 0.8, 1.3, 1, 1],
                                }}
                                transition={{
                                    duration: 25,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 2
                                }}
                                className="absolute w-[150px] md:w-[300px] h-[150px] md:h-[300px] bg-white/[0.03] backdrop-blur-[6px] md:backdrop-blur-[8px] rounded-full"
                                style={{
                                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 75%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 75%)',
                                }}
                            />

                            {/* Blob 3: Faster, smaller 'highlight' blur */}
                            <motion.div
                                animate={{
                                    left: ["20%", "70%", "10%", "90%", "20%"],
                                    top: ["40%", "10%", "90%", "50%", "40%"],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute w-[100px] md:w-[200px] h-[100px] md:h-[200px] bg-white/[0.05] backdrop-blur-[4px] rounded-full"
                                style={{
                                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
                                }}
                            />

                            {/* Fast Gloss Streak remains for premium feel */}
                            <motion.div
                                animate={{
                                    left: ["-100%", "200%"],
                                }}
                                transition={{
                                    duration: 7,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 3
                                }}
                                className="absolute w-[150px] h-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent skew-x-[-20deg] blur-[30px] z-30"
                            />
                        </div>

                        <div className="text-[32px] sm:text-[42px] md:text-[64px] lg:text-[88px] font-display font-bold leading-[1.1] tracking-[-0.03em] flex flex-col items-center relative z-10 transition-all duration-700 group-hover:scale-[1.01]">
                            {/* Line 1 */}
                            <div className="flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-1 py-1">
                                <span className="text-[var(--color-brand-dark)]">Yapay Zeka</span>
                                <motion.div
                                    animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-[35px] sm:w-[45px] md:w-[80px] h-[35px] sm:h-[45px] md:h-[80px] rounded-lg md:rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(49,168,255,0.3)] bg-[#001E36] flex items-center justify-center -mb-1 md:-mb-2"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg" className="w-[85%] h-[85%] object-contain drop-shadow-md" alt="Photoshop" />
                                </motion.div>
                                <span className="text-[#FF4D00]">Destekli</span>
                            </div>

                            {/* Line 2 */}
                            <div className="flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-1 py-1">
                                <span className="text-[#7A7A7A]">Tasarım</span>
                                <motion.div
                                    animate={{ y: [0, 8, 0], rotate: [0, -2, 2, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="w-[35px] sm:w-[45px] md:w-[80px] h-[35px] sm:h-[45px] md:h-[80px] rounded-lg md:rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(255,154,0,0.3)] bg-[#330000] -mb-1 md:-mb-2 border border-[var(--color-brand-dark)]/5 flex items-center justify-center"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg" className="w-[85%] h-[85%] object-contain drop-shadow-md" alt="Illustrator" />
                                </motion.div>
                                <span className="text-[var(--color-brand-dark)]">Analizi</span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-[#7A7A7A] text-[14px] md:text-[17px] max-w-2xl mx-auto leading-relaxed font-medium px-4">
                        Revizelesene ile tasarımlarınızı analiz edin, eksikleri saniyeler içinde fark edin <br className="hidden md:block" /> ve mükemmel tasarım uyumunu yakalayın.
                    </p>

                    {/* Action button */}
                    <div className="mt-10 md:mt-12">
                        <MagneticWrapper>
                            <AnalizEtButton onClick={onStart} />
                        </MagneticWrapper>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="mt-20 md:mt-32 w-full grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-[var(--color-brand-dark)]/5 pt-12">
                        {[
                            { label: "Toplam Analiz", value: dbStats.analizler, suffix: "", prefix: "" },
                            { label: "Kayıtlı Kullanıcı", value: dbStats.kullanicilar, suffix: "", prefix: "" },
                            { label: "Yüklenen Tasarım", value: dbStats.tasarimlar, suffix: "", prefix: "" },
                            { label: "Yapılan Yorum", value: dbStats.yorumlar, suffix: "", prefix: "" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="flex flex-col items-center md:items-start"
                            >
                                <div className="text-2xl md:text-4xl text-[var(--color-brand-dark)] flex items-center">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </div>
                                <span className="text-[11px] md:text-sm font-medium text-[#7A7A7A] mt-2 tracking-wide">
                                    {stat.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                </motion.div>
            </main>

            <NasilCalisir />

            {/* Active Contest Section */}
            {activeContest && (
                <div className="max-w-6xl mx-auto px-6">
                    <ContestHeroCard
                        contest={activeContest}
                        onOpenDetail={(c) => {
                            setSelectedContest(c);
                            setIsDetailModalOpen(true);
                        }}
                        onOpenSubmit={(c) => {
                            setSelectedContest(c);
                            setIsSubmitModalOpen(true);
                        }}
                    />
                </div>
            )}

            {/* Contest Modals */}
            <ContestDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                contest={selectedContest}
                onOpenSubmit={(c) => {
                    setSelectedContest(c);
                    setIsSubmitModalOpen(true);
                }}
            />

            <ContestSubmitModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                contest={selectedContest}
                onSuccess={() => {
                    if (activeContest) {
                        setActiveContest({
                            ...activeContest,
                            participant_count: (activeContest.participant_count || 0) + 1,
                        });
                    }
                }}
            />

            {gununTasarimi && (
                <div className="w-full px-4 sm:px-6 lg:px-8 pt-12 pb-6">
                    <GununTasarimi item={gununTasarimi} onInspect={onVitrinClick} />
                </div>
            )}

            <CommunitySpotlight onExploreClick={onVitrinClick} />

            {/* Tilted Marquee Section */}
            <div className="w-full overflow-hidden py-24 md:py-32 relative flex flex-col items-center justify-center bg-[var(--color-brand-light)] mt-10">
                {/* Orange Banner */}
                <div className="absolute w-[150vw] md:w-[120vw] -left-[25vw] md:-left-[10vw] bg-[#FF4D00] py-3 md:py-5 transform rotate-[-4deg] z-10 whitespace-nowrap overflow-hidden flex shadow-2xl outline outline-2 outline-white/10">
                    <motion.div
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ duration: 200, ease: "linear", repeat: Infinity }}
                        className="flex items-center text-white text-xl md:text-3xl lg:text-4xl font-display font-black tracking-tight w-max"
                    >
                        {Array(15).fill("Arayüz Analizi ✕ Renk Uyumu ✕ Tipografi ✕ Kompozisyon ✕").map((text, i) => (
                            <span key={i} className="mx-4 md:mx-6 px-2">{text}</span>
                        ))}
                    </motion.div>
                </div>
                {/* Black Banner */}
                <div className="absolute w-[150vw] md:w-[120vw] -left-[25vw] md:-left-[10vw] bg-[#111111] py-3 md:py-5 transform rotate-[3deg] z-0 whitespace-nowrap overflow-hidden flex shadow-2xl">
                    <motion.div
                        animate={{ x: ["-50%", "0%"] }}
                        transition={{ duration: 200, ease: "linear", repeat: Infinity }}
                        className="flex items-center text-[#e0e0e0] text-lg md:text-2xl font-bold tracking-wide w-max"
                    >
                        {Array(15).fill("Hızlı Sonuçlar ✕ Profesyonel Geri Bildirim ✕ 100+ Mutlu Tasarımcı ✕").map((text, i) => (
                            <span key={i} className="mx-4 md:mx-6 px-2">{text}</span>
                        ))}
                    </motion.div>
                </div>
            </div>

            <CommunityCTA onExploreClick={onCommunityClick} />

            <FAQ />

            {/* ── Minimal Newsletter Section ── */}
            <div className="relative w-full overflow-hidden flex flex-col items-center py-24 md:py-32 bg-[var(--color-brand-light)]">
                {/* Subtle Grid Background */}
                <div
                    className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,rgba(0,0,0,0)_1px),linear-gradient(to_bottom,var(--grid-color)_1px,rgba(0,0,0,0)_1px)] bg-[size:32px_32px] pointer-events-none opacity-50"
                    style={{
                        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)'
                    }}
                />

                <div className="w-full max-w-4xl mx-auto px-6 relative z-10 text-center flex flex-col items-center gap-8">
                    <div className="flex flex-col gap-4 items-center max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF4D00]/10 text-[#FF4D00] text-xs font-bold uppercase tracking-wider mb-2">
                            Gelişmelerden Haberdar Olun
                        </div>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-[var(--color-brand-dark)] tracking-tight">
                            Bültenimize Katılın
                        </h2>
                        <p className="text-[var(--color-brand-dark)]/60 font-medium text-base md:text-lg">
                            Tasarım ipuçları, yapay zeka güncellemeleri ve ürün yenilikleri için e-posta listemize katılın. Söz veriyoruz, spam yapmıyoruz.
                        </p>
                    </div>

                    <form 
                        className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mx-auto" 
                        onSubmit={handleNewsletterSubmit}
                    >
                        <div className="relative flex-1 w-full">
                            <input
                                type="email"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                required
                                name="Email"
                                placeholder="E-posta adresiniz..."
                                className="w-full h-12 md:h-14 px-6 rounded-full border border-[var(--color-brand-dark)]/10 bg-white shadow-sm font-sans text-base text-[var(--color-brand-dark)] placeholder:text-[var(--color-brand-dark)]/40 outline-none focus:border-[#FF4D00]/50 focus:ring-2 focus:ring-[#FF4D00]/20 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submittingNewsletter}
                            className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-full bg-[#FF4D00] text-white font-sans text-base font-bold tracking-wide flex items-center justify-center transition-transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#FF4D00]/20 shrink-0 cursor-pointer disabled:opacity-70"
                        >
                            {submittingNewsletter ? 'Kaydediliyor...' : 'Katıl'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
