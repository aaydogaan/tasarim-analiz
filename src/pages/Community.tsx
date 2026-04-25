import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MessageCircle, Heart, Trophy, Zap, Share2, Crown, Star, Sparkles, MousePointer2, ArrowRight } from 'lucide-react';

const CHANGING_WORDS = ["Revize", "Analiz", "Tasarım", "Gelişim"];

const STATS = [
    { label: 'Aktif Üye', value: '1.2k+', icon: Users, color: 'text-blue-500' },
    { label: 'Günlük Mesaj', value: '850+', icon: MessageCircle, color: 'text-[var(--color-brand-orange)]' },
    { label: 'Revize Edilen', value: '3.4k+', icon: Zap, color: 'text-amber-500' },
    { label: 'Tasarım Paylaşımı', value: '12k+', icon: Heart, color: 'text-emerald-500' }
];

export default function Community() {
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % CHANGING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Dispersed Hero Section */}
            <section className="relative w-full bg-[#050505] pt-16 md:pt-12 pb-24 md:pb-48 overflow-hidden">
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
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                        {/* Left: Content Area */}
                        <div className="lg:col-span-7 text-left w-full">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-5 md:px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--color-brand-orange)] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-8"
                            >
                                <Sparkles size={12} />
                                Tasarımcı Topluluğu
                            </motion.div>

                            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] md:leading-[0.9] tracking-tighter mb-6 md:mb-8">
                                Birlikte <br />
                                <div className="h-[1.1em] overflow-hidden inline-flex items-baseline">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={wordIndex}
                                            initial={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
                                            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                            exit={{ y: -30, opacity: 0, filter: 'blur(8px)' }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="text-[var(--color-brand-orange)] italic block"
                                        >
                                            {CHANGING_WORDS[wordIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </div> <br />
                                Kazanıyoruz.
                            </h1>

                            <p className="text-white/40 text-base md:text-xl max-w-xl font-medium leading-relaxed mb-10 md:mb-12">
                                Sadece yapay zeka değil, binlerce profesyonel tasarımcı yanınızda. Tasarımlarınızı paylaşın, öğrenin ve toplulukla beraber büyüyün.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-center">
                                <motion.a
                                    href="#"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-center gap-4 w-full sm:w-auto px-8 md:px-10 py-4 bg-white text-black rounded-full text-base md:text-lg font-bold transition-all shadow-2xl hover:shadow-white/10 group"
                                >
                                    <MessageCircle size={20} fill="black" />
                                    Discord Akışına Katıl
                                </motion.a>

                                <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-full sm:w-auto justify-center">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <img
                                                key={i}
                                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 40}`}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#050505] bg-[#222]"
                                                alt="User"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex flex-col leading-none text-left">
                                        <span className="text-white font-bold text-xs md:text-sm">400+ Online</span>
                                        <span className="text-emerald-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1 italic">Aktif Tartışma</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Dispersed Stats Area */}
                        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 relative w-full lg:mt-0">
                            {STATS.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className={`p-6 rounded-[24px] md:rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] transition-colors group ${i % 2 === 1 ? 'sm:mt-8' : 'sm:mb-8'}`}
                                >
                                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 w-max mb-5 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">{stat.value}</h3>
                                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">{stat.label}</p>

                                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={10} /> İncele
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Community Content */}
            <main className="max-w-screen-xl mx-auto px-6 md:px-12 py-24">

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Left: Latest Activity */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold tracking-tight">Topluluk Akışı</h2>
                            <div className="flex gap-2">
                                <span className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold rounded-full">En Yeni</span>
                                <span className="px-4 py-2 bg-[var(--card-bg)] text-[var(--text-secondary)] text-xs font-bold rounded-full border border-[var(--border-primary)]">Popüler</span>
                            </div>
                        </div>

                        {[1, 2, 3].map((post) => (
                            <motion.div
                                key={post}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
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
                                    { name: 'Kadir Mert', points: '12,450', crown: true },
                                    { name: 'Elif Şahin', points: '11,200', crown: false },
                                    { name: 'Caner Öz', points: '9,800', crown: false },
                                    { name: 'Selin Y.', points: '8,400', crown: false }
                                ].map((user, i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="relative">
                                            <img
                                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=User${i + 50}`}
                                                className="w-12 h-12 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)]"
                                                alt="Avatar"
                                            />
                                            {user.crown && (
                                                <Crown className="absolute -top-2 -right-2 text-amber-500 fill-amber-500 w-5 h-5 drop-shadow-sm" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm tracking-tight leading-none mb-1 text-[var(--text-primary)] group-hover:text-[var(--color-brand-orange)] transition-colors">
                                                {user.name}
                                            </p>
                                            <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest">{user.points} PUAN</p>
                                        </div>
                                        <span className="text-lg font-black text-[var(--text-secondary)] italic">#{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Challenge */}
                        <div className="bg-[#111] p-8 rounded-[40px] text-white">
                            <div className="flex items-center gap-3 mb-8">
                                <Crown className="text-[var(--color-brand-orange)] w-6 h-6" />
                                <h3 className="font-bold text-xl tracking-tight">Haftalık Challenge</h3>
                            </div>
                            <div className="relative rounded-3xl overflow-hidden aspect-video bg-white/5 mb-6">
                                <img
                                    src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400"
                                    className="w-full h-full object-cover opacity-50"
                                    alt="Challenge"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <span className="px-3 py-1 bg-[var(--color-brand-orange)] text-white text-[10px] font-bold rounded-full mb-3 uppercase tracking-widest">AKTİF</span>
                                    <h4 className="font-bold text-lg mb-2">Retro Logo Tasarımı</h4>
                                    <p className="text-white/40 text-xs font-medium">124 tasarım paylaşıldı</p>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all border border-white/5">
                                Yarışmaya Katıl
                            </button>
                        </div>

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
