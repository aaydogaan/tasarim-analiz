import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { Heart, Maximize2, X, Star, Loader2, Search, ChevronDown, Filter, Sparkles, Trophy, Flame } from "lucide-react";
import toast from "react-hot-toast";

interface VitrinItem {
    id: string;
    analiz_id?: string;
    user_id?: string;
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
    user_vote: number | null;
}

export function Vitrin() {
    const [items, setItems] = useState<VitrinItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [seciliGorsel, setSeciliGorsel] = useState<VitrinItem | null>(null);
    const [user, setUser] = useState<any>(null);

    // Modal Comments State
    const [modalComments, setModalComments] = useState<any[]>([]);
    const [modalCommentsLoading, setModalCommentsLoading] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Filter & Sort State
    const [kategoriFiltre, setKategoriFiltre] = useState<string>('Tümü');
    const [siralama, setSiralama] = useState<'yeni' | 'topluluk' | 'ai' | 'oy'>('yeni');
    const [aramaMetni, setAramaMetni] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        fetchVitrin();
    }, []);

    useEffect(() => {
        // Oturum değiştiğinde (login olduğunda) verileri tekrar çek ki puanlar güncellensin
        if (user) {
            fetchVitrin();
        }
    }, [user]);

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
                analizler(*, begeniler(puan, user_id))
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
                
                const begeniler = post.analizler?.begeniler || [];
                const oySayisi = begeniler.length;
                let toplulukPuan = 0;
                let user_vote = null;
                
                if (oySayisi > 0) {
                    toplulukPuan = Math.round(begeniler.reduce((sum: number, b: any) => sum + b.puan, 0) / oySayisi);
                    if (user) {
                        const myVoteObj = begeniler.find((b: any) => b.user_id === user.id);
                        if (myVoteObj) {
                            user_vote = myVoteObj.puan;
                        }
                    }
                }

                return {
                    id: post.id,
                    analiz_id: post.analizler?.id,
                    user_id: post.user_id,
                    isletme: post.analizler?.isletme || post.title || 'Genel',
                    user_name: authorName,
                    user_avatar: authorAvatar,
                    user_vote,
                    gorsel_url: formattedGorsel,
                    tasarim_turu: post.analizler?.tasarim_turu || 'Tasarım',
                    ai_puan: realAiPuan,
                    topluluk_puan: toplulukPuan,
                    oy_sayisi: oySayisi,
                    created_at: post.created_at,
                    platform: ''
                };
            });
            setItems(formatted);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!seciliGorsel) {
            setModalComments([]);
            return;
        }
        const fetchComments = async () => {
            setModalCommentsLoading(true);
            const { data } = await supabase
                .from('post_comments')
                .select('*')
                .eq('post_id', seciliGorsel.id)
                .order('created_at', { ascending: true });

            if (data && data.length > 0) {
                const userIds = [...new Set(data.map((c: any) => c.user_id).filter(Boolean))];
                let profileMap: Record<string, any> = {};
                if (userIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, display_name, avatar_url')
                        .in('id', userIds);
                    if (profilesData) {
                        profileMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
                    }
                }
                const formatted = data.map(c => ({
                    ...c,
                    user_name: profileMap[c.user_id]?.display_name || c.user_name || 'Tasarımcı',
                    user_avatar: profileMap[c.user_id]?.avatar_url || c.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${c.user_id}`
                }));
                setModalComments(formatted);
            } else {
                setModalComments([]);
            }
            setModalCommentsLoading(false);
        };
        fetchComments();
    }, [seciliGorsel?.id]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return toast.error("Yorum yapmak için giriş yapmalısınız.");
        if (!commentInput.trim() || !seciliGorsel) return;

        setSubmittingComment(true);
        const content = commentInput.trim();
        setCommentInput('');

        let finalName = 'Tasarımcı';
        let finalAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`;
        const { data: profileData } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single();
        if (profileData) {
            if (profileData.display_name) finalName = profileData.display_name;
            if (profileData.avatar_url) finalAvatar = profileData.avatar_url;
        }

        const { data, error } = await supabase.from('post_comments').insert({
            post_id: seciliGorsel.id,
            user_id: user.id,
            content
        }).select('*').single();

        if (!error && data) {
            setModalComments(prev => [...prev, {
                ...data,
                user_name: finalName,
                user_avatar: finalAvatar
            }]);
            toast.success('Yorumunuz eklendi!');
        } else {
            toast.error('Yorum eklenirken hata oluştu.');
        }
        setSubmittingComment(false);
    };

    const vote = async (analiz_id: string, puan: number) => {
        if (!user) return toast.error("Puan vermek için giriş yapmalısınız.");
        if (seciliGorsel && seciliGorsel.user_id === user.id) {
            return toast.error("Kendi tasarımınıza puan veremezsiniz.");
        }
        if (!analiz_id) return toast.error("Bu tasarımın orijinal analizi bulunamadı.");

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
            toast.success("Oyunuz başarıyla kaydedildi!");
            // Local optimistik güncelleme
            setItems((prev) =>
                prev.map((item) => {
                    // Update matching analiz_id
                    if (item.analiz_id === analiz_id || item.id === analiz_id) {
                        const yeniOySayisi = item.oy_sayisi + 1;
                        const yeniPuan = Math.round(((item.topluluk_puan * item.oy_sayisi) + puan) / yeniOySayisi);
                        return { ...item, oy_sayisi: yeniOySayisi, topluluk_puan: yeniPuan, user_vote: puan };
                    }
                    return item;
                })
            );
            if (seciliGorsel) {
                 const yeniOySayisi = seciliGorsel.oy_sayisi + 1;
                 const yeniPuan = Math.round(((seciliGorsel.topluluk_puan * seciliGorsel.oy_sayisi) + puan) / yeniOySayisi);
                 setSeciliGorsel({ ...seciliGorsel, oy_sayisi: yeniOySayisi, topluluk_puan: yeniPuan, user_vote: puan });
            }
        } else {
            console.error(error);
            toast.error("Oyunuz kaydedilirken bir hata oluştu: " + error.message);
        }
    };

    const filtrelenmisItems = items
        .filter((item) => {
            if (kategoriFiltre !== 'Tümü' && item.tasarim_turu !== kategoriFiltre) {
                return false;
            }
            if (aramaMetni.trim()) {
                const query = aramaMetni.toLowerCase().trim();
                const isletmeMatch = item.isletme.toLowerCase().includes(query);
                const userMatch = item.user_name?.toLowerCase().includes(query) || false;
                const turMatch = item.tasarim_turu.toLowerCase().includes(query);
                return isletmeMatch || userMatch || turMatch;
            }
            return true;
        })
        .sort((a, b) => {
            if (siralama === 'topluluk') {
                return b.topluluk_puan - a.topluluk_puan;
            } else if (siralama === 'ai') {
                return b.ai_puan - a.ai_puan;
            } else if (siralama === 'oy') {
                return b.oy_sayisi - a.oy_sayisi;
            } else {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

    return (
        <div className="w-full relative z-10 pt-4 pb-12">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3 drop-shadow-sm">
                    Tasarım <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange)] to-[#ff7b00]">Keşfet</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-2xl mx-auto">
                    Topluluk tarafından analiz edilen en ilham verici tasarımları keşfedin. AI değerlendirmeleri ve kullanıcı oylarıyla en iyileri süzün.
                </p>
            </div>

            {/* Filter & Search Control Bar */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                    
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
                        {['Tümü', 'Sosyal Medya', 'Kurumsal', 'E-Ticaret', 'Baskı Materyali'].map((kat) => (
                            <button
                                key={kat}
                                onClick={() => setKategoriFiltre(kat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    kategoriFiltre === kat
                                        ? 'bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/20'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)]'
                                }`}
                            >
                                {kat}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort Controls */}
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-1 lg:w-60">
                            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={aramaMetni}
                                onChange={(e) => setAramaMetni(e.target.value)}
                                placeholder="Tasarım veya kişi ara..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[#FF5500] transition-colors"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative shrink-0">
                            <select
                                value={siralama}
                                onChange={(e: any) => setSiralama(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 text-xs font-bold rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] outline-none focus:border-[#FF5500] cursor-pointer transition-colors"
                            >
                                <option value="yeni">🕒 En Yeni</option>
                                <option value="topluluk">🔥 En Yüksek Topluluk Oyu</option>
                                <option value="ai">⚡ En Yüksek AI Puanı</option>
                                <option value="oy">🏆 En Çok Oy Alan</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-4 border-[var(--border-primary)] border-t-[var(--color-brand-orange)] rounded-full animate-spin" />
                    <span className="text-[var(--text-secondary)] font-medium">Vitrin yükleniyor...</span>
                </div>
            ) : filtrelenmisItems.length === 0 ? (
                <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl shadow-sm space-y-2">
                    <p className="text-[var(--text-primary)] font-bold text-base">Aradığınız kriterlere uygun tasarım bulunamadı.</p>
                    <p className="text-[var(--text-secondary)] text-xs">Filtreleri veya arama kelimenizi değiştirmeyi deneyebilirsiniz.</p>
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4">
                    {filtrelenmisItems.map((item, idx) => (
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
                            <div className="flex justify-between items-start mt-3 px-1.5 min-w-0 gap-2">
                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                    <img
                                        src={item.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                        alt="Designer"
                                        className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] object-cover shrink-0 mt-0.5"
                                    />
                                    <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors text-sm font-medium leading-snug">
                                        {item.user_name || "Tasarımcı"}
                                    </span>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <div className="flex items-center gap-1.5 group cursor-help" title="AI Puanı">
                                        <Star className="w-3.5 h-3.5 text-[var(--text-secondary)]/20 group-hover:text-amber-500 group-hover:fill-amber-500 transition-colors" />
                                        <span className="text-[var(--text-secondary)]/80 text-xs font-semibold tabular-nums">{item.ai_puan}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 group cursor-help" title="Topluluk Puanı">
                                        <Heart className="w-3.5 h-3.5 text-[var(--text-secondary)]/20 group-hover:text-emerald-500 group-hover:fill-emerald-500 transition-colors" />
                                        <span className="text-[var(--text-secondary)]/80 text-xs font-semibold tabular-nums tracking-tighter">{item.topluluk_puan || 0}</span>
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
                        className="fixed inset-0 z-[999] flex flex-col items-center justify-start p-4 pt-24 pb-12 md:p-12 overflow-y-auto overflow-x-hidden"
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
                            className="relative z-[1000] max-w-7xl w-full flex flex-col md:flex-row gap-8 items-center md:items-start justify-center pointer-events-none my-auto"
                        >
                            <div className="w-full md:w-2/3 flex justify-center pointer-events-auto">
                                <img
                                    src={seciliGorsel.gorsel_url}
                                    alt="Büyütülmüş Görsel"
                                    className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
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

                                    {/* Oylama Alanı veya Kendi Tasarımın Uyarısı */}
                                    {user && seciliGorsel.user_id === user.id ? (
                                        <div className="p-4 bg-[var(--bg-secondary)] rounded-[24px] border border-[var(--border-primary)] text-center">
                                            <p className="text-xs font-bold text-[var(--color-brand-orange)]">Kendi tasarımınıza puan veremezsiniz</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 bg-[var(--bg-secondary)] p-6 rounded-[24px] border border-[var(--border-primary)]">
                                            <p className="text-[var(--text-secondary)] text-sm text-center font-medium">Bu tasarıma siz kaç puan verirsiniz?</p>
                                            <div className="grid grid-cols-4 gap-2.5">
                                                {[70, 80, 90, 100].map(pt => (
                                                    <button
                                                        key={pt}
                                                        onClick={() => vote(seciliGorsel.analiz_id || seciliGorsel.id, pt)}
                                                        disabled={seciliGorsel.user_vote != null}
                                                        className={`py-3.5 border rounded-xl font-bold transition-all text-base shadow-sm ${
                                                            seciliGorsel.user_vote === pt
                                                                ? 'bg-[var(--color-brand-orange)] text-white border-[var(--color-brand-orange)] scale-[1.02]'
                                                                : 'bg-[var(--bg-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-primary)] disabled:opacity-50 disabled:hover:bg-[var(--bg-primary)] disabled:hover:text-[var(--text-primary)] disabled:cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {pt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Yorumlar Bölümü */}
                                    <div className="mt-6 pt-6 border-t border-[var(--border-primary)] space-y-4">
                                        <h4 className="text-[var(--text-primary)] text-xs font-black uppercase tracking-wider flex items-center justify-between">
                                            <span>Yorumlar ({modalComments.length})</span>
                                        </h4>

                                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                            {modalCommentsLoading ? (
                                                <p className="text-xs text-[var(--text-secondary)] text-center py-2">Yorumlar yükleniyor...</p>
                                            ) : modalComments.length === 0 ? (
                                                <p className="text-xs text-[var(--text-secondary)] italic text-center py-2">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                                            ) : (
                                                modalComments.map((c) => (
                                                    <div key={c.id || c.created_at} className="flex gap-2.5 items-start bg-[var(--bg-secondary)] p-2.5 rounded-xl border border-[var(--border-primary)]">
                                                        <img src={c.user_avatar} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" alt={c.user_name} />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">{c.user_name}</span>
                                                                <span className="text-[9px] text-[var(--text-secondary)] shrink-0">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
                                                            </div>
                                                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed break-words">{c.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {user ? (
                                            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                                                <input
                                                    type="text"
                                                    value={commentInput}
                                                    onChange={(e) => setCommentInput(e.target.value)}
                                                    placeholder="Yorumunuzu yazın..."
                                                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--color-brand-orange)]"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={submittingComment || !commentInput.trim()}
                                                    className="px-3.5 py-2 bg-[var(--color-brand-orange)] text-white text-xs font-bold rounded-xl hover:bg-[#e64500] transition-colors disabled:opacity-50 shrink-0"
                                                >
                                                    {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Gönder'}
                                                </button>
                                            </form>
                                        ) : (
                                            <p className="text-[10px] text-[var(--text-secondary)] text-center">Yorum yapmak için giriş yapmalısınız.</p>
                                        )}
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
