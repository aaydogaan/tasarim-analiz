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
                    İlham Kaynağı <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Vitrin</span>
                </h2>
                <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto">
                    Topluluğun analiz ettiği en dikkat çekici tasarımları keşfedin. Yapay zekanın değerlendirmeleriyle insanların puanlarını karşılaştırın.
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
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="break-inside-avoid relative group rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0A0A0F]"
                        >
                            <div className="relative aspect-auto">
                                <img
                                    src={item.gorsel_url}
                                    alt={item.isletme}
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                                {/* Overlay Action */}
                                <button
                                    onClick={() => setSeciliGorsel(item)}
                                    className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white/70 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </button>

                                <div className="absolute bottom-0 w-full p-4 md:p-5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="inline-block px-2 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider text-white/70 mb-2 border border-white/10">
                                                {item.tasarim_turu}
                                            </span>
                                            <h3 className="text-white font-bold tracking-wide truncate max-w-[180px]">{item.isletme}</h3>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">AI Puanı</span>
                                                <div className="text-xl font-black text-white">{item.ai_puan}</div>
                                            </div>
                                            <div className="h-8 w-px bg-white/20 mx-1" />
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1">
                                                    Topluluk
                                                </span>
                                                <div className="text-xl font-black text-white">{item.topluluk_puan || "0"}</div>
                                            </div>
                                        </div>
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
                            <div className="w-full md:w-1/3 p-6 md:p-8 border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl h-full flex flex-col justify-center">
                                <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{seciliGorsel.tasarim_turu}</h4>
                                <h2 className="text-white text-3xl font-extrabold mb-8">{seciliGorsel.isletme}</h2>

                                <div className="flex flex-col gap-6 mb-8">
                                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center text-center">
                                        <span className="text-blue-400 text-[10px] uppercase font-bold tracking-widest mb-1">Yapay Zeka Puanı</span>
                                        <span className="text-4xl text-white font-black">{seciliGorsel.ai_puan}/100</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center text-center">
                                        <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest mb-1 block">Topluluk Puanı ({seciliGorsel.oy_sayisi} Oy)</span>
                                        <span className="text-4xl text-white font-black">{seciliGorsel.topluluk_puan || '-'}/100</span>
                                    </div>
                                </div>

                                {/* Voting Action */}
                                <div className="space-y-3">
                                    <p className="text-white/60 text-sm text-center font-medium">Bu tasarıma siz kaç puan verirsiniz?</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[70, 80, 90, 100].map(pt => (
                                            <button
                                                key={pt}
                                                onClick={() => vote(seciliGorsel.id, pt)}
                                                className="py-3 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50 border border-white/10 rounded-xl text-white font-bold transition-all text-sm"
                                            >
                                                {pt}
                                            </button>
                                        ))}
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
