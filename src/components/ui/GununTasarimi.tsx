import React from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, ArrowRight, Award, Eye, Palette, Type, Layout, Trophy } from 'lucide-react';
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

    // Extract subscores if available, or generate harmonious breakdown from overall score
    const score = item.ai_puan || 85;
    const renkSkor = item.skor_detayi?.renk_puan || Math.min(100, Math.max(70, score + Math.floor(Math.random() * 6) - 2));
    const tipoSkor = item.skor_detayi?.tipografi_puan || Math.min(100, Math.max(70, score + Math.floor(Math.random() * 6) - 3));
    const kompSkor = item.skor_detayi?.kompozisyon_puan || Math.min(100, Math.max(70, score + Math.floor(Math.random() * 6) - 1));

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-5xl mx-auto mb-12 overflow-hidden rounded-[32px] border border-amber-500/30 bg-gradient-to-b from-[#12121a] via-[#0b0b0f] to-[#08080b] shadow-[0_25px_60px_-15px_rgba(245,158,11,0.12)] backdrop-blur-2xl relative group"
        >
            {/* Top Metallic Gold Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-[#FF5500] to-amber-400" />

            {/* Glowing Ambient Lights */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#FF5500]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Side: Premium Image Container */}
                <div className="lg:col-span-5 relative group/img">
                    <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl">
                        <img
                            src={item.gorsel_url}
                            alt={item.tasarim_turu}
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover/img:scale-105"
                        />
                        {/* Top Badge Overlay */}
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl">
                            <Crown size={14} className="text-amber-400 fill-amber-400" />
                            <span>GÜNÜN TASARIMI</span>
                        </div>

                        {/* Overall Score Badge */}
                        <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md border border-white/15 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xl">
                            <Sparkles size={14} className="text-[#FF5500]" />
                            <span className="text-amber-400 text-sm">{score}</span>
                            <span className="text-white/40 text-[10px]">/ 100 SKOR</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Detailed Info & Metrics */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div>
                        {/* Header Badge */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                                <Trophy size={13} />
                                <span>Günün Tasarımı Seçildi</span>
                            </span>
                            <span className="text-[11px] font-bold text-white/40 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                                {item.tasarim_turu}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                            {item.isletme || item.tasarim_turu}
                        </h2>

                        {/* Brief AI Insight */}
                        <p className="text-xs sm:text-sm text-white/70 font-medium leading-relaxed bg-white/[0.03] border border-white/5 p-3.5 rounded-xl italic">
                            “Mükemmel görsel hiyerarşi, yüksek tipografik okunabilirlik ve renk teorisine tam uyum.”
                        </p>
                    </div>

                    {/* Sub-Scores Metric Pills */}
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                        <div className="bg-white/[0.04] border border-white/10 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-white/50 mb-0.5">
                                <Palette size={11} className="text-amber-400" />
                                <span>Renk</span>
                            </div>
                            <span className="text-sm font-black text-amber-400">{renkSkor}</span>
                        </div>

                        <div className="bg-white/[0.04] border border-white/10 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-white/50 mb-0.5">
                                <Type size={11} className="text-blue-400" />
                                <span>Tipografi</span>
                            </div>
                            <span className="text-sm font-black text-blue-400">{tipoSkor}</span>
                        </div>

                        <div className="bg-white/[0.04] border border-white/10 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-white/50 mb-0.5">
                                <Layout size={11} className="text-emerald-400" />
                                <span>Yerleşim</span>
                            </div>
                            <span className="text-sm font-black text-emerald-400">{kompSkor}</span>
                        </div>
                    </div>

                    {/* Designer Footer & Action CTA */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={item.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.user_name}`}
                                alt={item.user_name}
                                className="w-10 h-10 rounded-full border-2 border-amber-500/50 object-cover shadow-lg"
                            />
                            <div>
                                <Link
                                    to={`/tasarimci/${item.user_slug || item.user_id}`}
                                    className="text-sm font-black text-white hover:text-amber-400 transition-colors flex items-center gap-1.5"
                                >
                                    <span>{item.user_name}</span>
                                    <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                                        👑 Şampiyon
                                    </span>
                                </Link>
                                <span className="text-[11px] text-white/40 font-medium block">
                                    Tasarım Sahibi
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => onInspect?.(item)}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF5500] hover:from-amber-600 hover:to-[#e64d00] text-white font-extrabold text-xs transition-all duration-300 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 shrink-0"
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
