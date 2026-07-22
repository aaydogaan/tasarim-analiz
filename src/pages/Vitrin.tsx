import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { Heart, Maximize2, X, Star } from "lucide-react";
import toast from "react-hot-toast";

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

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSeciliGorsel(null);
        };
        window.addEventListener("keydown", handleEsc);

        // Modal açıkken kaydırmayı engelle
        if (seciliGorsel) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [seciliGorsel]);

    const fetchVitrin = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("community_posts")
            .select(`
                id,
                user_id,
                created_at,
                likes_count,
                analizler(*)
            `)
            .order("created_at", { ascending: false });

        if (data) {
            const formatted = data.map((post: any) => {
                const rawG = post.analizler?.gorsel_url || post.gorsel_url;
                const formattedGorsel = rawG ? (rawG.startsWith('http') || rawG.startsWith('data:') ? rawG : `data:image/jpeg;base64,${rawG}`) : '';
                
                // Author name & avatar calculation
                const isCurrentUser = user && user.id === post.user_id;
                const currentUserName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0];
                const currentUserAvatar = user?.user_metadata?.avatar_url;

                let authorName = post.profiles?.display_name || (post.analizler?.user_name && post.analizler.user_name !== 'Gizli Tasarımcı' ? post.analizler.user_name : null);
                if (!authorName) {
                    authorName = isCurrentUser ? (currentUserName || 'Tasarımcı') : 'Tasarımcı';
                }

                let authorAvatar = post.profiles?.avatar_url || post.analizler?.user_avatar;
                if (!authorAvatar) {
                    authorAvatar = isCurrentUser ? currentUserAvatar : null;
                }
                if (!authorAvatar) {
                    authorAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${post.user_id || post.id}`;
                }

                const realAiPuan = post.analizler?.genel_puan ?? 75;

                return {
                    id: post.id,
                    isletme: post.analizler?.isletme || post.title || 'Genel',
                    user_name: authorName,
                    user_avatar: authorAvatar,
                    gorsel_url: formattedGorsel,
                    tasarim_turu: post.analizler?.tasarim_turu || 'Tasarım',
                    ai_puan: realAiPuan,
                    topluluk_puan: post.likes_count || 0,
                    oy_sayisi: 0,
                    created_at: post.created_at,
                    platform: ''
                };
            });
            setItems(formatted);
        }
        setLoading(false);
    };

    const vote = async (analiz_id: string, puan: number) => {
        if (!user) return toast.error("Puan vermek için giriş yapmalısınız.");

        // Check if voted already
        const { data: existing } = await supabase
            .from("begeniler")
            .select("id")
            .eq("analiz_id", analiz_id)
            .eq("user_id", user.id)
            .single();

        if (existing) {
            toast.error("Bu tasarıma zaten puan verdiniz.");
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
                <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4 drop-shadow-sm">
                    Tasarım <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange)] to-[#ff7b00]">Keşfet</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-2xl mx-auto">
                    Topluluk tarafından analiz edilen en ilham verici tasarımları keşfedin. AI değerlendirmeleri ve kullanıcı oylarıyla en iyileri bulun.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-4 border-[var(--border-primary)] border-t-[var(--color-brand-orange)] rounded-full animate-spin" />
                    <span className="text-[var(--text-secondary)] font-medium">Vitrin yükleniyor...</span>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl shadow-sm">
                    <p className="text-[var(--text-secondary)]">Henüz vitrinde sergilenen bir tasarım yok.</p>
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
                                className="relative group rounded-[20px] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-primary)] cursor-pointer shadow-sm"
                                onClick={() => setSeciliGorsel(item)}
                            >
                                <div className="relative aspect-auto">
                                    <img
                                        src={item.gorsel_url}
                                        alt={item.isletme}
                                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-[600ms] ease-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="absolute top-4 left-4 pt-1 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                                        <span className="inline-block px-3 py-1.5 bg-[var(--card-bg)]/90 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] border border-[var(--border-primary)] shadow-sm">
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
                                        className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] object-cover"
                                    />
                                    <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors text-sm font-medium leading-none">
                                        {item.user_name || "Tasarımcı"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 group cursor-help" title="AI Puanı">
                                        <Star className="w-4 h-4 text-[var(--text-secondary)]/20 group-hover:text-amber-500 group-hover:fill-amber-500 transition-colors" />
                                        <span className="text-[var(--text-secondary)]/60 text-xs font-semibold tabular-nums">{item.ai_puan}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 group cursor-help" title="Topluluk Puanı">
                                        <Heart className="w-4 h-4 text-[var(--text-secondary)]/20 group-hover:text-emerald-500 group-hover:fill-emerald-500 transition-colors" />
                                        <span className="text-[var(--text-secondary)]/60 text-xs font-semibold tabular-nums tracking-tighter">{item.topluluk_puan || 0}</span>
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
                        className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-12 overflow-y-auto overflow-x-hidden"
                    >
                        {/* Arkaplan Katmanı - Tıklanabilir alan */}
                        <div
                            className="fixed inset-0 bg-white/95 backdrop-blur-xl cursor-zoom-out"
                            onClick={() => setSeciliGorsel(null)}
                        />

                        {/* Kapatma Butonu */}
                        <button
                            onClick={() => setSeciliGorsel(null)}
                            className="fixed top-20 right-4 md:top-24 md:right-8 z-[1001] p-2.5 md:p-3 rounded-full bg-[var(--card-bg)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-lg backdrop-blur-xl transition-all hover:rotate-90"
                        >
                            <X className="w-6 h-6 md:w-7 md:h-7" />
                        </button>

                        <div
                            className="relative z-[1000] max-w-7xl w-full flex flex-col md:flex-row gap-8 items-center justify-center pointer-events-none"
                        >
                            <div className="w-full md:w-2/3 flex justify-center max-h-[80vh] pointer-events-auto">
                                <img
                                    src={seciliGorsel.gorsel_url}
                                    alt="Büyütülmüş Görsel"
                                    className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                />
                            </div>
                            <div className="w-full md:w-[400px] p-8 border border-[var(--border-primary)] bg-[var(--card-bg)] backdrop-blur-2xl rounded-[32px] h-fit flex flex-col justify-center relative overflow-hidden shadow-sm pointer-events-auto">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-orange)]/5 blur-[100px] rounded-full pointer-events-none" />

                                {/* Üst Profil Bölümü */}
                                <div className="flex items-center gap-4 mb-8 relative z-10 pb-6 border-b border-[var(--color-brand-dark)]/5">
                                    <img
                                        src={seciliGorsel.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${seciliGorsel.id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                        alt="Designer"
                                        className="w-14 h-14 rounded-full border border-[var(--border-primary)] object-cover bg-[var(--bg-secondary)]"
                                    />
                                    <div>
                                        <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight mb-1">
                                            {seciliGorsel.user_name || "Tasarımcı"}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest">
                                            <span>{seciliGorsel.tasarim_turu}</span>
                                            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/20" />
                                            <span>{new Date(seciliGorsel.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h4 className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mb-2">Marka / Şirket</h4>
                                    <h2 className="text-[var(--text-primary)] text-3xl font-black mb-8 leading-tight">{seciliGorsel.isletme}</h2>

                                    <div className="flex gap-4 mb-10">
                                        <div className="flex-1 p-5 rounded-[24px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-[var(--color-brand-orange)]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Yapay Zeka Puanı</span>
                                            <span className="text-4xl text-[var(--color-brand-orange)] font-black tracking-tighter relative z-10">{seciliGorsel.ai_puan}</span>
                                        </div>
                                        <div className="flex-1 p-5 rounded-[24px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-[#ff7b00]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Topluluk ({seciliGorsel.oy_sayisi} Oy)</span>
                                            <span className="text-4xl text-[#ff7b00] font-black tracking-tighter relative z-10">{seciliGorsel.oy_sayisi > 0 ? seciliGorsel.topluluk_puan : 0}</span>
                                        </div>
                                    </div>

                                    {/* Oylama Alanı */}
                                    <div className="space-y-4 bg-[var(--bg-secondary)] p-6 rounded-[24px] border border-[var(--border-primary)]">
                                        <p className="text-[var(--text-secondary)] text-sm text-center font-medium">Bu tasarıma siz kaç puan verirsiniz?</p>
                                        <div className="grid grid-cols-4 gap-2.5">
                                            {[70, 80, 90, 100].map(pt => (
                                                <button
                                                    key={pt}
                                                    onClick={() => vote(seciliGorsel.id, pt)}
                                                    className="py-3.5 bg-[var(--bg-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] font-bold transition-all text-base shadow-sm"
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
