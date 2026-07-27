import React from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, ArrowRight, Award, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface GununTasarimiItem {
    id: string;
    analiz_id?: string;
    user_id?: string;
    tasarim_turu: string;
    platform?: string;
    isletme?: string;
    gorsel_url: string;
    ai_puan: number;
    topluluk_puan?: number;
    oy_sayisi?: number;
    created_at?: string;
    user_name: string;
    user_avatar?: string;
    user_slug?: string;
    skor_detayi?: any;
}

interface GununTasarimiProps {
    item: GununTasarimiItem;
    onInspect?: (item: GununTasarimiItem) => void;
}

export default function GununTasarimi({ item, onInspect }: GununTasarimiProps) {
    if (!item) return null;

    const score = item.ai_puan || 85;
    const profileSlug = item.user_slug || item.user_id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl mx-auto mb-10 overflow-hidden rounded-[28px] border border-[var(--border-primary)] bg-[var(--card-bg)] shadow-2xl relative group"
        >
            {/* Top Amber Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-[#FF5500] via-amber-500 to-[#FF5500]" />

            <div className="p-6 sm:p-8 lg:p-9 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
                {/* Left Side: Image Preview */}
                <div className="md:col-span-5 relative group/img">
                    <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-lg">
                        <img
                            src={item.gorsel_url}
                            alt={item.tasarim_turu}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover/img:scale-105"
                        />

                        {/* Top Badge */}
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                            <Crown size={14} className="text-amber-400 fill-amber-400" />
                            <span>GÜNÜN TASARIMI</span>
                        </div>

                        {/* AI Score Pill */}
                        <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md border border-white/10 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl">
                            <Sparkles size={13} className="text-[#FF5500]" />
                            <span className="text-amber-400 font-extrabold">{score}</span>
                            <span className="text-white/40 text-[10px]">/ 100 SKOR</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Clean Info & Action */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-black uppercase tracking-wider">
                                <Award size={13} />
                                <span>Günün Tasarımı Seçildi</span>
                            </span>
                            {item.tasarim_turu && (
                                <span className="text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-full border border-[var(--border-primary)]">
                                    {item.tasarim_turu}
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                            {item.isletme || item.tasarim_turu}
                        </h2>
                    </div>

                    {/* Designer Row & CTA */}
                    <div className="pt-4 border-t border-[var(--border-primary)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <Link
                            to={`/${profileSlug}`}
                            className="flex items-center gap-3 group/author"
                        >
                            <img
                                src={item.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.user_name}`}
                                alt={item.user_name}
                                className="w-10 h-10 rounded-full border border-amber-500/40 object-cover shadow-sm transition-transform group-hover/author:scale-105"
                            />
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-extrabold text-[var(--text-primary)] group-hover/author:text-[#FF5500] transition-colors">
                                        {item.user_name}
                                    </span>
                                    <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-500/20">
                                        👑 Şampiyon
                                    </span>
                                </div>
                                <span className="text-[11px] text-[var(--text-secondary)] font-medium block">
                                    Tasarım Sahibi
                                </span>
                            </div>
                        </Link>

                        <button
                            type="button"
                            onClick={() => onInspect?.(item)}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-extrabold text-xs transition-all duration-300 shadow-lg shadow-[#FF5500]/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 shrink-0"
                        >
                            <Eye size={15} />
                            <span>Tasarım Raporunu İncele</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
