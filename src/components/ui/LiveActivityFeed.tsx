import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Users, Zap, X, Bell } from 'lucide-react';

const ACTIVITIES = [
    { id: 1, text: "Bir tasarımcı az önce bir SaaS projesini analiz etti.", icon: Zap, color: "text-blue-500" },
    { id: 2, text: "Yeni bir e-ticaret arayüzü topluluk vitrinine eklendi.", icon: Sparkles, color: "text-amber-500" },
    { id: 3, text: "Bir mobil uygulama tasarımı 95 puan alarak haftanın birincisi oldu!", icon: Zap, color: "text-[var(--color-brand-orange)]" },
    { id: 4, text: "400+ tasarımcı şu an canlı analiz yapıyor.", icon: Users, color: "text-emerald-500" },
    { id: 5, text: "Bir kurumsal kimlik çalışması AI tarafından kusursuzlaştırıldı.", icon: Activity, color: "text-purple-500" },
];

export default function LiveActivityFeed() {
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isVisible) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % ACTIVITIES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [isVisible]);

    const current = ACTIVITIES[index];

    return (
        <div className="fixed bottom-6 left-6 z-[90] flex items-end">
            <AnimatePresence mode="wait">
                {isVisible ? (
                    <motion.div
                        key="active-feed"
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex items-center gap-3 bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--color-brand-dark)]/5 px-4 py-3 rounded-2xl shadow-2xl shadow-black/10 max-w-[280px] md:max-w-md relative"
                    >
                        {/* Close Button - Visible on hover */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--card-bg)] border border-[var(--color-brand-dark)]/5 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-primary)] text-[var(--color-brand-dark)]/40 hover:text-[var(--color-brand-dark)]"
                        >
                            <X size={12} />
                        </button>

                        <div className={`flex-shrink-0 p-2 rounded-xl bg-[var(--bg-primary)] ${current.color}`}>
                            <current.icon size={16} />
                        </div>

                        <div className="flex flex-col gap-0.5 pr-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-brand-dark)]/30">
                                    Canlı Aktivite
                                </span>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                            </div>
                            <p className="text-[12px] font-bold text-[var(--color-brand-dark)]/80 leading-tight">
                                {current.text}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        key="reopen-button"
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        onClick={() => setIsVisible(true)}
                        className="w-12 h-12 bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--color-brand-dark)]/5 rounded-2xl flex items-center justify-center shadow-xl shadow-black/5 text-[var(--color-brand-dark)]/40 hover:text-[var(--color-brand-orange)] transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Bell size={20} className="group-hover:animate-bounce" />
                        {/* Small activity dot for reopen button */}
                        <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[var(--card-bg)]"></div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
