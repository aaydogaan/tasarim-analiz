import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { Heart, Maximize2, X, Star } from "lucide-react";

interface VitrinItem {
    id: string;
    tasarim_turu: string;
    platform: string;
    isletme: string;
    gorsel_url: string;
    ai_puan: number;
    topluluk_puan: number;
    oy_sayisi: number;
    created_at: string;
    user_name: string | null;
    user_avatar: string | null;
}

export function Vitrin() {
    const [items, setItems] = useState<VitrinItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [seciliGorsel, setSeciliGorsel] = useState<VitrinItem | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        fetchVitrin();
    }, []);

    const fetchVitrin = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("vitrin_view")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) setItems(data);
        setLoading(false);
    };

    const vote = async (analiz_id: string, puan: number) => {
        if (!user) return alert("Puan vermek için giriş yapmalısınız.");

        // Check if voted already
        const { data: existing } = await supabase
            .from("begeniler")
            .select("id")
            .eq("analiz_id", analiz_id)
            .eq("user_id", user.id)
            .single();

        if (existing) {
            alert("Bu tasarıma zaten puan verdiniz.");
            return;
        }

        const { error } = await supabase
            .from("begeniler")
            .insert({ analiz_id, user_id: user.id, puan });

        if (!error) {
            // Local optimistik güncelleme
            setItems((prev) =>
                prev.map((item) => {
                    if (item.id === analiz_id) {
                        const yeniOySayisi = item.oy_sayisi + 1;
                        const yeniPuan = Math.round(((item.topluluk_puan * item.oy_sayisi) + puan) / yeniOySayisi);
                        return { ...item, oy_sayisi: yeniOySayisi, topluluk_puan: yeniPuan };
                    }
                    return item;
                })
            );
        }
    };

    return (
        <div className="w-full relative z-10 pt-4 pb-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    Tasarım <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Keşfet</span>
                </h2>
                <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto">
                    Topluluk tarafından analiz edilen en ilham verici tasarımları keşfedin. AI değerlendirmeleri ve kullanıcı oylarıyla en iyileri bulun.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-white/40 font-medium">Vitrin yükleniyor...</span>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
                    <p className="text-white/40">Henüz vitrinde sergilenen bir tasarım yok.</p>
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="break-inside-avoid mb-5"
                        >
                            <div
                                className="relative group rounded-[20px] overflow-hidden bg-[#0A0A0F] cursor-pointer"
                                onClick={() => setSeciliGorsel(item)}
                            >
                                <div className="relative aspect-auto">
                                    <img
                                        src={item.gorsel_url}
                                        alt={item.isletme}
                                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-[600ms] ease-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="absolute top-4 left-4 pt-1 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                                        <span className="inline-block px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 shadow-xl">
                                            {item.tasarim_turu}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-4 left-4 pt-1 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                                        <h3 className="text-white font-bold tracking-wide text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pb-1">{item.isletme}</h3>
                                    </div>

                                    <button
                                        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md text-white/90 hover:text-white border border-white/20 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Dribbble Style Footer Info */}
                            <div className="flex justify-between items-center mt-3 px-1.5">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={item.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                        alt="Designer"
                                        className="w-7 h-7 rounded-full bg-white/5 object-cover"
                                    />
                                    <span className="text-white/80 hover:text-white cursor-pointer transition-colors text-sm font-medium leading-none">
                                        {item.user_name || "Gizli Tasarımcı"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 group cursor-help" title="AI Puanı">
                                        <Star className="w-4 h-4 text-white/30 group-hover:text-amber-400 group-hover:fill-amber-400 transition-colors" />
                                        <span className="text-white/60 text-xs font-semibold tabular-nums">{item.ai_puan}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 group cursor-help" title="Topluluk Puanı">
                                        <Heart className="w-4 h-4 text-white/30 group-hover:text-emerald-400 group-hover:fill-emerald-400 transition-colors" />
                                        <span className="text-white/60 text-xs font-semibold tabular-nums tracking-tighter">{item.topluluk_puan || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal - Preview & Vote */}
            <AnimatePresence>
                {seciliGorsel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
                    >
                        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3">
                            <button
                                onClick={() => setSeciliGorsel(null)}
                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8 items-center justify-center">
                            <div className="w-full md:w-2/3 flex justify-center max-h-[85vh]">
                                <img
                                    src={seciliGorsel.gorsel_url}
                                    alt="Büyütülmüş Görsel"
                                    className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-2xl shadow-blue-500/10"
                                />
                            </div>
                            <div className="w-full md:w-[400px] p-8 border border-white/10 bg-[#0A0A0F]/90 backdrop-blur-2xl rounded-[32px] h-fit md:max-h-[85vh] flex flex-col justify-center relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                                {/* Üst Profil Bölümü */}
                                <div className="flex items-center gap-4 mb-8 relative z-10 pb-6 border-b border-white/[0.08]">
                                    <img
                                        src={seciliGorsel.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${seciliGorsel.id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                        alt="Designer"
                                        className="w-14 h-14 rounded-full border border-white/10 object-cover bg-white/5"
                                    />
                                    <div>
                                        <h3 className="text-white text-lg font-bold leading-tight mb-1">
                                            {seciliGorsel.user_name || "Gizli Tasarımcı"}
                                        </h3>
                                        <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                            <span>{seciliGorsel.tasarim_turu}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <span>{new Date(seciliGorsel.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Marka / Şirket</h4>
                                    <h2 className="text-white text-3xl font-black mb-8 leading-tight">{seciliGorsel.isletme}</h2>

                                    <div className="flex gap-4 mb-10">
                                        <div className="flex-1 p-5 rounded-[24px] bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 flex flex-col items-center text-center shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-blue-400 text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Yapay Zeka Puanı</span>
                                            <span className="text-4xl text-white font-black tracking-tighter relative z-10">{seciliGorsel.ai_puan}</span>
                                        </div>
                                        <div className="flex-1 p-5 rounded-[24px] bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 flex flex-col items-center text-center shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-emerald-400 text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Topluluk ({seciliGorsel.oy_sayisi} Oy)</span>
                                            <span className="text-4xl text-white font-black tracking-tighter relative z-10">{seciliGorsel.topluluk_puan || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Oylama Alanı */}
                                    <div className="space-y-4 bg-white/[0.02] p-6 rounded-[24px] border border-white/[0.05]">
                                        <p className="text-white/70 text-sm text-center font-medium">Bu tasarıma siz kaç puan verirsiniz?</p>
                                        <div className="grid grid-cols-4 gap-2.5">
                                            {[70, 80, 90, 100].map(pt => (
                                                <button
                                                    key={pt}
                                                    onClick={() => vote(seciliGorsel.id, pt)}
                                                    className="py-3.5 bg-white/[0.04] hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:scale-105 active:scale-95 border border-white/10 rounded-xl text-white font-bold transition-all text-base shadow-lg hover:shadow-emerald-500/25"
                                                >
                                                    {pt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
