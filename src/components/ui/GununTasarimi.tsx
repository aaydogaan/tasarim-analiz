import React from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, ArrowRight, Award, Eye, Flame } from 'lucide-react';
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto mb-10 overflow-hidden rounded-[28px] border border-amber-500/30 bg-[#0c0c10]/95 shadow-2xl shadow-amber-500/5 backdrop-blur-xl relative group"
        >
            {/* Ambient Background Gradient Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF5500]/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center">
                {/* Left Column: Image Preview */}
                <div className="md:col-span-5 p-4 sm:p-6 relative">
                    <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner group/img">
                        <img
                            src={item.gorsel_url}
                            alt={item.tasarim_turu}
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover/img:scale-105"
                        />
                        {/* Overlay Score Badge */}
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                            <Crown size={14} className="text-amber-400 fill-amber-400/20" />
                            <span>Günün En Yüksek Skorlu Tasarımı</span>
                        </div>

                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg">
                            <Sparkles size={13} className="text-[#FF5500]" />
                            <span>{item.ai_puan} / 100 AI Skor</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Creator Info */}
                <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider mb-3">
                            <Award size={13} />
                            <span>Günün Tasarımı Seçildi</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                            {item.isletme || item.tasarim_turu} — {item.platform || 'Tasarım Analizi'}
                        </h2>

                        {/* Designer Info */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                            <img
                                src={item.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.user_name}`}
                                alt={item.user_name}
                                className="w-10 h-10 rounded-full border border-amber-500/40 object-cover"
                            />
                            <div>
                                <Link
                                    to={`/tasarimci/${item.user_slug || item.user_id}`}
                                    className="text-sm font-black text-white hover:text-amber-400 transition-colors flex items-center gap-1.5"
                                >
                                    <span>{item.user_name}</span>
                                    <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                                        👑 Tasarım Şampiyonu
                                    </span>
                                </Link>
                                <span className="text-xs text-white/50 font-medium block">
                                    Kategori: {item.tasarim_turu}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => onInspect?.(item)}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF5500] hover:from-amber-600 hover:to-[#e64d00] text-white font-black text-xs transition-all duration-300 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
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
