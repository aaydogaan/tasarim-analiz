import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Sparkles, MousePointer2 } from 'lucide-react';

const CHANGING_WORDS = ["Revize", "Analiz", "Tasarım", "Gelişim"];

export default function CommunityCTA() {
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % CHANGING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="w-full px-4 md:px-6 py-20 bg-[var(--color-brand-light)] overflow-hidden">
            <div className="max-w-[1440px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, scaleX: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scaleX: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-[40px] bg-[#0a0a0a] py-16 md:py-20 px-8 md:px-12 text-center shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/5"
                >
                    {/* Dynamic Moving Background Glows */}
                    <motion.div
                        animate={{
                            x: [-20, 20, -20],
                            y: [-10, 10, -10],
                            scale: [1, 1.1, 1],
                            opacity: [0.08, 0.12, 0.08]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-brand-orange)] blur-[140px] pointer-events-none"
                    />
                    <motion.div
                        animate={{
                            x: [20, -20, 20],
                            y: [10, -10, 10],
                            scale: [1, 1.2, 1],
                            opacity: [0.05, 0.1, 0.05]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 blur-[150px] pointer-events-none"
                    />

                    {/* Floating icons removed by user request (they looked like white reflections) */}

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[var(--color-brand-orange)] text-[12px] font-bold uppercase tracking-[0.3em] mb-8"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-orange)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-brand-orange)]"></span>
                            </span>
                            Topluluk Gücü
                        </motion.div>

                        <div className="flex flex-col items-center mb-10 h-[64px] md:h-[96px] lg:h-[128px] w-full">
                            <h2 className="text-[2rem] sm:text-[2.5rem] md:text-7xl lg:text-8xl font-bold text-white leading-[1] max-w-full tracking-tight font-display flex flex-nowrap justify-center gap-x-2 md:gap-x-5">
                                <span>Birlikte</span>
                                <span className="relative min-w-[100px] sm:min-w-[140px] md:min-w-[260px] lg:min-w-[340px] text-center inline-flex justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={CHANGING_WORDS[wordIndex]}
                                            initial={{ y: 20, opacity: 0, filter: 'blur(8px)' }}
                                            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                            exit={{ y: -20, opacity: 0, filter: 'blur(8px)' }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="text-[var(--color-brand-orange)] italic"
                                        >
                                            {CHANGING_WORDS[wordIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                                <span>Ediyoruz.</span>
                            </h2>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/60 text-base md:text-2xl max-w-3xl mb-12 font-medium leading-relaxed"
                        >
                            Sadece AI değil, koca bir topluluk yanında. <br className="hidden md:block" /> Discord'a katıl, tasarımlarını canlı tartış ve yeni fikirler edin.
                        </motion.p>

                        <div className="flex flex-col sm:flex-row items-center gap-8 mb-16">
                            <motion.a
                                href="#"
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 77, 0, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-4 px-12 py-5 bg-[var(--color-brand-orange)] text-white rounded-full text-xl font-bold transition-all shadow-2xl shadow-orange-500/20 group"
                            >
                                <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" fill="white" />
                                Discord'a Katıl
                            </motion.a>

                            <div className="flex items-center gap-5 px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.img
                                            whileHover={{ y: -8, zIndex: 30 }}
                                            key={i}
                                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 25}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                            className="w-12 h-12 rounded-full border-2 border-[#0a0a0a] bg-[#222] cursor-pointer"
                                            alt="Designer"
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-white font-bold text-lg">400+ Tasarımcı</span>
                                    <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Staggered Floating Text logos */}
                        <div className="w-full pt-10 border-t border-white/5">
                            <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 opacity-20 grayscale invert">
                                {['FIGMA', 'DRIBBBLE', 'BEHANCE', 'ADOBE'].map((brand, i) => (
                                    <motion.div
                                        key={brand}
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                                        className="font-display font-black text-2xl tracking-tighter"
                                    >
                                        {brand}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Glossy inner border */}
                    <div className="absolute inset-0 border border-white/10 rounded-[40px] pointer-events-none" />
                </motion.div>
            </div>
        </section>
    );
}
