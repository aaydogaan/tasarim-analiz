import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Heart, Maximize2, X, Star, Loader2, Search, ChevronDown, Filter, Sparkles, Trophy, Flame, Clock, ArrowBigUp, ArrowBigDown, Flag, Pencil, Trash2, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import toast from "react-hot-toast";
import ReportModal from '../components/ui/ReportModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import GununTasarimi from "../components/ui/GununTasarimi";
import RevizelesBanner from "../components/ui/RevizelesBanner";
import { sendDayWinnerEmail } from '../lib/resend';

interface VitrinItem {
    id: string;
    analiz_id?: string;
    user_id?: string;
    tasarim_turu: string;
    platform: string;
    isletme: string;
    gorsel_url: string;
    extra_images?: string[];
    all_images?: string[];
    ai_puan: number;
    topluluk_puan: number;
    oy_sayisi: number;
    created_at: string;
    user_name: string;
    user_avatar?: string;
    user_slug: string;
    user_vote: number | null;
    verification_badge?: boolean;
    skor_detayi: any | null;
}

export function Vitrin() {
    const [items, setItems] = useState<VitrinItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [seciliGorsel, setSeciliGorsel] = useState<VitrinItem | null>(null);
    const [seciliGorselAktifIndex, setSeciliGorselAktifIndex] = useState<number>(0);
    const [user, setUser] = useState<any>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const designIdFromUrl = searchParams.get('design');

    // Modal Comments State
    const [modalComments, setModalComments] = useState<any[]>([]);
    const [modalCommentsLoading, setModalCommentsLoading] = useState(false);
    const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
    const [commentInput, setCommentInput] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Filter & Search State
    const [kategoriFiltre, setKategoriFiltre] = useState<string>('Tümü');
    const [feedTab, setFeedTab] = useState<'all' | 'following'>('all');
    const [siralama, setSiralama] = useState<'yeni' | 'topluluk' | 'ai' | 'oy'>('yeni');
    const [siralamaAcik, setSiralamaAcik] = useState(false);
    const [aramaMetni, setAramaMetni] = useState('');

    // Comment Editing State
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    const handleSaveEditComment = async (commentId: string) => {
        if (!editingCommentText.trim()) return;
        const newContent = editingCommentText.trim();
        const { error } = await supabase
            .from('post_comments')
            .update({ content: newContent })
            .eq('id', commentId)
            .eq('user_id', user?.id);

        if (!error) {
            setModalComments(prev => prev.map(c => c.id === commentId ? { ...c, content: newContent } : c));
            setEditingCommentId(null);
            setEditingCommentText('');
            toast.success('Yorum güncellendi.');
        } else {
            toast.error('Yorum güncellenirken hata oluştu.');
        }
    };

    // Delete Comment Modal State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [targetDeleteCommentId, setTargetDeleteCommentId] = useState<string | null>(null);

    const handleDeleteComment = (commentId: string) => {
        setTargetDeleteCommentId(commentId);
        setDeleteConfirmOpen(true);
    };

    const executeDeleteComment = async () => {
        if (!targetDeleteCommentId) return;
        const commentId = targetDeleteCommentId;
        const { error } = await supabase
            .from('post_comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', user?.id);

        if (!error) {
            setModalComments(prev => prev.filter(c => c.id !== commentId));
            toast.success('Yorum silindi.');
        } else {
            toast.error('Yorum silinirken hata oluştu.');
        }
        setTargetDeleteCommentId(null);
    };

    // Report State
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportItem, setReportItem] = useState<{ id: string, type: 'post' | 'comment' } | null>(null);

    const handleReportClick = (itemId: string, type: 'post' | 'comment') => {
        if (!user) {
            toast.error('Şikayet etmek için giriş yapmalısınız');
            return;
        }
        setReportItem({ id: itemId, type });
        setReportModalOpen(true);
    };

    const submitReport = async (reason: string) => {
        if (!reportItem || !user) return;

        const { error } = await supabase.from('reports').insert([{
            reporter_id: user.id,
            reported_item_id: reportItem.id,
            item_type: reportItem.type,
            reason: reason
        }]);

        if (error) {
            toast.error('Şikayet gönderilemedi');
        } else {
            toast.success('Şikayetiniz yönetime iletildi');
        }
    };

    const siralamaSecenekleri = [
        { id: 'yeni', label: 'En Yeni', icon: <Clock className="w-4 h-4 text-[var(--text-secondary)] shrink-0" /> },
        { id: 'topluluk', label: 'En Yüksek Topluluk Oyu', icon: <Flame className="w-4 h-4 text-[var(--text-secondary)] shrink-0" /> },
        { id: 'ai', label: 'En Yüksek AI Puanı', icon: <Sparkles className="w-4 h-4 text-[var(--text-secondary)] shrink-0" /> },
        { id: 'oy', label: 'En Çok Oy Alan', icon: <Trophy className="w-4 h-4 text-[var(--text-secondary)] shrink-0" /> },
    ];

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        fetchVitrin();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                fetchVitrin();
                const { data } = await supabase.from('user_follows').select('following_id').eq('follower_id', user.id);
                if (data) setFollowedUsers(new Set(data.map(d => d.following_id)));
            }
        };
        fetchUserData();
    }, [user]);

    const handleFollow = async (e: React.MouseEvent, targetUserId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return toast.error("Takip etmek için giriş yapmalısınız.");
        try {
            await supabase.from('user_follows').insert({ follower_id: user.id, following_id: targetUserId });
            setFollowedUsers(prev => new Set([...prev, targetUserId]));
            await supabase.from('notifications').insert({ user_id: targetUserId, type: 'follow_user', actor_id: user.id });
            toast.success("Takip edildi!");
        } catch (err) {
            console.error(err);
            toast.error("Takip edilemedi");
        }
    };

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
            // Clear URL param when modal is closed
            if (designIdFromUrl) {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('design');
                setSearchParams(newParams, { replace: true });
            }
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [seciliGorsel, designIdFromUrl, searchParams, setSearchParams]);

    // Open specific design if URL has ?design=id
    useEffect(() => {
        if (designIdFromUrl && items.length > 0 && !seciliGorsel) {
            const itemToOpen = items.find(i => i.analiz_id === designIdFromUrl);
            if (itemToOpen) {
                setSeciliGorsel(itemToOpen);
            }
        }
    }, [items, designIdFromUrl, seciliGorsel]);

    const fetchVitrin = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("community_posts")
            .select(`
                id,
                user_id,
                title,
                content,
                extra_images,
                created_at,
                likes_count,
                analizler(*, begeniler(vote_type, user_id)),
                profiles:user_id(display_name, avatar_url, slug, verification_badge)
            `)
            .order("created_at", { ascending: false });

        if (data) {
            const formatted = data.map((post: any) => {
                const rawG = post.analizler?.gorsel_url || post.gorsel_url || (post.extra_images && post.extra_images[0]);
                const formattedGorsel = rawG ? (rawG.startsWith('http') || rawG.startsWith('data:') ? rawG : `data:image/jpeg;base64,${rawG}`) : '';
                
                let allImages: string[] = [];
                if (formattedGorsel) {
                    allImages.push(formattedGorsel);
                }
                if (Array.isArray(post.extra_images)) {
                    post.extra_images.forEach((img: string) => {
                        if (img) {
                            const formatted = img.startsWith('http') || img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
                            if (!allImages.includes(formatted)) {
                                allImages.push(formatted);
                            }
                        }
                    });
                }

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

                let authorSlug = post.profiles?.slug || 'tasarimci';

                const realAiPuan = post.analizler?.genel_puan ?? 75;
                
                const begeniler = post.analizler?.begeniler || [];
                const oySayisi = begeniler.length;
                let upvotes = 0;
                let toplulukPuan = 0;
                let user_vote = null;
                
                if (oySayisi > 0) {
                    begeniler.forEach((b: any) => {
                        if (b.vote_type === 1) upvotes++;
                        if (user && b.user_id === user.id) {
                            user_vote = b.vote_type;
                        }
                    });
                    toplulukPuan = Math.round((upvotes / oySayisi) * 100);
                }

                return {
                    id: post.id,
                    analiz_id: post.analizler?.id,
                    user_id: post.user_id,
                    isletme: post.analizler?.isletme || post.title || 'Genel',
                    user_name: authorName,
                    user_avatar: authorAvatar,
                    user_slug: authorSlug,
                    user_vote,
                    gorsel_url: formattedGorsel,
                    extra_images: post.extra_images || [],
                    all_images: allImages,
                    tasarim_turu: post.analizler?.tasarim_turu || 'Tasarım',
                    ai_puan: realAiPuan,
                    topluluk_puan: toplulukPuan,
                    oy_sayisi: oySayisi,
                    created_at: post.created_at,
                    platform: '',
                    verification_badge: post.profiles?.verification_badge,
                    skor_detayi: post.analizler?.skor_detayi || null
                };
            });
            setItems(formatted);

            // Automatically check and notify today's winner
            if (formatted.length > 0) {
                const winner = [...formatted].sort((a, b) => (b.ai_puan || 0) - (a.ai_puan || 0))[0];
                if (winner && winner.user_id && winner.user_id !== 'anonymous') {
                    const todayStr = new Date().toISOString().split('T')[0];
                    
                    // Atomically try to insert the daily winner. If it succeeds, it's the first time today.
                    supabase.from('daily_design_winners').insert([
                        {
                            win_date: todayStr,
                            user_id: winner.user_id,
                            post_id: winner.id,
                            isletme: winner.isletme || winner.tasarim_turu || 'Tasarım',
                            ai_puan: winner.ai_puan || 0,
                            gorsel_url: winner.gorsel_url || ''
                        }
                    ]).then(({ error }) => {
                        // Only send notification if the insert was successful (no conflict)
                        if (!error) {
                            // 1. Insert In-App Notification
                            supabase.from('user_notifications').insert([{
                                user_id: winner.user_id,
                                title: '👑 Tebrikler! Tasarımınız "Günün Tasarımı" Seçildi!',
                                message: `"${winner.isletme || winner.tasarim_turu}" tasarımınız ${winner.ai_puan}/100 AI skoru ile bugünün 1. tasarımı seçildi ve vitrinde 1. sıraya yerleşti!`,
                                type: 'winner',
                                read: false
                            }]).then(() => {});

                            // 2. Send Automated Winner Email
                            supabase.from('profiles').select('email, display_name').eq('id', winner.user_id).single().then(({ data: userProf }) => {
                                if (userProf && userProf.email) {
                                    sendDayWinnerEmail(
                                        userProf.email,
                                        userProf.display_name || winner.user_name || 'Tasarımcı',
                                        winner.isletme || winner.tasarim_turu || 'Tasarımınız',
                                        winner.ai_puan || 85
                                    ).catch(err => console.error('Winner email error:', err));
                                }
                            });
                        }
                    });
                }
            }
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

        const commentsSubscription = supabase
            .channel(`vitrin_comments_${seciliGorsel.id}`)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_comments' }, (payload) => {
                setModalComments(prev => prev.filter(c => c.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(commentsSubscription);
        };
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
            .insert({ analiz_id, user_id: user.id, vote_type: puan });

        if (!error) {
            toast.success("Oyunuz başarıyla kaydedildi!");
            // Local optimistik güncelleme
            setItems((prev) =>
                prev.map((item) => {
                    // Update matching analiz_id
                    if (item.analiz_id === analiz_id || item.id === analiz_id) {
                        const eskiUpvote = Math.round((item.topluluk_puan * item.oy_sayisi) / 100);
                        const yeniOySayisi = item.oy_sayisi + 1;
                        const yeniUpvote = eskiUpvote + (puan === 1 ? 1 : 0);
                        const yeniPuan = Math.round((yeniUpvote / yeniOySayisi) * 100);
                        return { ...item, oy_sayisi: yeniOySayisi, topluluk_puan: yeniPuan, user_vote: puan };
                    }
                    return item;
                })
            );
            if (seciliGorsel) {
                 const eskiUpvote = Math.round((seciliGorsel.topluluk_puan * seciliGorsel.oy_sayisi) / 100);
                 const yeniOySayisi = seciliGorsel.oy_sayisi + 1;
                 const yeniUpvote = eskiUpvote + (puan === 1 ? 1 : 0);
                 const yeniPuan = Math.round((yeniUpvote / yeniOySayisi) * 100);
                 setSeciliGorsel({ ...seciliGorsel, oy_sayisi: yeniOySayisi, topluluk_puan: yeniPuan, user_vote: puan });
            }
        } else {
            console.error(error);
            toast.error("Oyunuz kaydedilirken bir hata oluştu: " + error.message);
        }
    };

    // Filter items based on Category, Search & FeedTab
    const filtrelenmisTasarimlar = items.filter((item) => {
        if (feedTab === 'following' && (!item.user_id || !followedUsers.has(item.user_id))) {
            return false;
        }

        const matchesCategory =
            kategoriFiltre === 'Tümü' ||
            (item.tasarim_turu && item.tasarim_turu.toLowerCase() === kategoriFiltre.toLowerCase());

        const query = aramaMetni.toLowerCase().trim();
        const matchesSearch =
            !query ||
            (item.isletme && item.isletme.toLowerCase().includes(query)) ||
            (item.tasarim_turu && item.tasarim_turu.toLowerCase().includes(query)) ||
            (item.user_name && item.user_name.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
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

    const gununTasarimiItem = items.length > 0
        ? [...items].sort((a, b) => (b.ai_puan || 0) - (a.ai_puan || 0))[0]
        : null;

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

            {/* Günün Tasarımı Vitrin Banner */}
            {gununTasarimiItem && (
                <GununTasarimi
                    item={gununTasarimiItem}
                    onInspect={(item) => setSeciliGorsel(item as any)}
                />
            )}

            {/* Canlı Gündem Revizyonu (Revizeleş!) Banner */}
            <RevizelesBanner />

            {/* Feed Tab Switcher & Filter Control Bar */}
            <div className="mb-8 space-y-4">
                {/* Main Feed Tabs */}
                <div className="flex items-center gap-1.5 p-1.5 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] w-fit shadow-sm">
                    <button
                        onClick={() => setFeedTab('all')}
                        className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                            feedTab === 'all' 
                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm' 
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        Genel Keşfet
                    </button>
                    <button
                        onClick={() => setFeedTab('following')}
                        className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                            feedTab === 'following' 
                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm' 
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <span>Takip Ettiklerim</span>
                        {followedUsers.size > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${feedTab === 'following' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]' : 'bg-gray-200 text-gray-700'}`}>
                                {followedUsers.size}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                    
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
                        {['Tümü', 'Sosyal Medya', 'Kurumsal', 'E-Ticaret', 'Baskı Materyali'].map((kat) => (
                            <button
                                key={kat}
                                onClick={() => setKategoriFiltre(kat)}
                                className={`px-4.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
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
                        <div className="relative flex-1 lg:w-64">
                            <Search className="w-4.5 h-4.5 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={aramaMetni}
                                onChange={(e) => setAramaMetni(e.target.value)}
                                placeholder="Tasarım veya kişi ara..."
                                className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[#FF5500] transition-colors font-medium"
                            />
                        </div>

                        {/* Custom Animated Sort Dropdown */}
                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setSiralamaAcik(!siralamaAcik)}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs md:text-sm font-bold shadow-sm transition-all"
                            >
                                {siralamaSecenekleri.find(s => s.id === siralama)?.icon}
                                <span>{siralamaSecenekleri.find(s => s.id === siralama)?.label}</span>
                                <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-300 ${siralamaAcik ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {siralamaAcik && (
                                    <>
                                        {/* Overlay to dismiss */}
                                        <div 
                                            className="fixed inset-0 z-20" 
                                            onClick={() => setSiralamaAcik(false)} 
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-64 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl shadow-xl z-30 p-2 space-y-1"
                                        >
                                            {siralamaSecenekleri.map((secenek) => {
                                                const isSelected = siralama === secenek.id;
                                                return (
                                                    <button
                                                        key={secenek.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSiralama(secenek.id as any);
                                                            setSiralamaAcik(false);
                                                        }}
                                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                                                            isSelected
                                                                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] shadow-sm'
                                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 border border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {secenek.icon}
                                                            <span>{secenek.label}</span>
                                                        </div>
                                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-4 border-[var(--border-primary)] border-t-[var(--color-brand-orange)] rounded-full animate-spin" />
                    <span className="text-[var(--text-secondary)] font-medium">Vitrin yükleniyor...</span>
                </div>
            ) : filtrelenmisTasarimlar.length === 0 ? (
                <div className="py-20 text-center bg-[var(--card-bg)] rounded-3xl border border-[var(--border-primary)] my-8">
                    <Sparkles className="w-10 h-10 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {feedTab === 'following' ? 'Takip ettiğin tasarımcıların paylaşımı bulunamadı' : 'Tasarım bulunamadı'}
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                        {feedTab === 'following' 
                            ? 'Toplulukta beğendiğin tasarımcıları takip ederek akışını özelleştirebilirsin.' 
                            : 'Arama terimlerinizi veya filtrelerinizi değiştirmeyi deneyin.'}
                    </p>
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4">
                    {filtrelenmisTasarimlar.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="break-inside-avoid mb-5"
                        >
                            <div
                                className="relative group rounded-[20px] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-primary)] cursor-pointer shadow-sm"
                                onClick={() => {
                                    setSeciliGorsel(item);
                                    setSeciliGorselAktifIndex(0);
                                }}
                            >
                                <div className="relative aspect-auto">
                                    <img
                                        src={item.gorsel_url}
                                        alt={item.isletme}
                                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-[600ms] ease-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {item.all_images && item.all_images.length > 1 && (
                                        <div className="absolute top-4 right-14 pt-1 transition-all duration-300">
                                            <span className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-bold border border-white/20 shadow-sm">
                                                <Layers className="w-3.5 h-3.5 text-[#FF5500]" />
                                                {item.all_images.length} Görsel
                                            </span>
                                        </div>
                                    )}

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
                                <Link to={`/${item.user_slug}`} className="flex items-center gap-2 min-w-0 flex-1 group/profile">
                                    <img
                                        src={item.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                        alt="Designer"
                                        className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] object-cover shrink-0 group-hover/profile:border-[var(--color-brand-orange)] transition-colors"
                                    />
                                    <span className="text-[var(--text-secondary)] group-hover/profile:text-[var(--text-primary)] cursor-pointer transition-colors text-sm font-medium leading-snug truncate flex items-center gap-1">
                                        <span>{item.user_name || "Tasarımcı"}</span>
                                        <VerifiedBadge badge={item.verification_badge} size="xs" />
                                    </span>
                                </Link>

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
                            <div className="w-full md:w-2/3 flex flex-col items-center justify-center pointer-events-auto gap-4">
                                <div className="relative group flex items-center justify-center w-full">
                                    {seciliGorsel.all_images && seciliGorsel.all_images.length > 1 && seciliGorselAktifIndex > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSeciliGorselAktifIndex(prev => Math.max(0, prev - 1));
                                            }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#FF5500] text-white shadow-xl backdrop-blur-md transition-all z-20"
                                            title="Önceki Görsel"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                    )}

                                    <img
                                        src={seciliGorsel.all_images?.[seciliGorselAktifIndex] || seciliGorsel.gorsel_url}
                                        alt="Büyütülmüş Görsel"
                                        className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300"
                                    />

                                    {seciliGorsel.all_images && seciliGorsel.all_images.length > 1 && seciliGorselAktifIndex < seciliGorsel.all_images.length - 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSeciliGorselAktifIndex(prev => Math.min((seciliGorsel.all_images?.length || 1) - 1, prev + 1));
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#FF5500] text-white shadow-xl backdrop-blur-md transition-all z-20"
                                            title="Sonraki Görsel"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>

                                {seciliGorsel.all_images && seciliGorsel.all_images.length > 1 && (
                                    <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
                                        {seciliGorsel.all_images.map((imgUrl, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSeciliGorselAktifIndex(idx)}
                                                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                                                    idx === seciliGorselAktifIndex 
                                                        ? 'border-[#FF5500] scale-105 shadow-md shadow-[#FF5500]/30' 
                                                        : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                                                }`}
                                            >
                                                <img src={imgUrl} alt={`Önizleme ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div 
                                className="w-full md:w-[400px] p-6 sm:p-8 border border-[var(--border-primary)] bg-[var(--card-bg)] backdrop-blur-2xl rounded-[32px] h-fit max-h-[85vh] overflow-y-auto overscroll-contain touch-pan-y flex flex-col justify-center relative shadow-sm pointer-events-auto custom-scrollbar"
                                data-lenis-prevent="true"
                                onWheel={(e) => e.stopPropagation()}
                            >

                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-orange)]/5 blur-[100px] rounded-full pointer-events-none" />

                                {/* Üst Profil Bölümü */}
                                <div className="flex items-center justify-between gap-4 mb-8 relative z-10 pb-6 border-b border-[var(--color-brand-dark)]/5">
                                    <Link to={`/${seciliGorsel.user_slug}`} className="flex items-center gap-4 group/profile" onClick={() => setSeciliGorsel(null)}>
                                        <img
                                            src={seciliGorsel.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${seciliGorsel.id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                            alt="Designer"
                                            className="w-14 h-14 rounded-full border border-[var(--border-primary)] object-cover bg-[var(--bg-secondary)] group-hover/profile:border-[var(--color-brand-orange)] transition-colors"
                                        />
                                        <div>
                                            <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight mb-1 group-hover/profile:text-[var(--color-brand-orange)] transition-colors flex items-center gap-1.5">
                                                <span>{seciliGorsel.user_name || "Tasarımcı"}</span>
                                                <VerifiedBadge badge={seciliGorsel.verification_badge} size="xs" />
                                            </h3>
                                            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest">
                                                <span>{seciliGorsel.tasarim_turu}</span>
                                                <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/20" />
                                                <span>{new Date(seciliGorsel.created_at).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        </div>
                                    </Link>
                                    {seciliGorsel.user_id && user && user.id !== seciliGorsel.user_id && !followedUsers.has(seciliGorsel.user_id) && (
                                        <button 
                                            onClick={(e) => handleFollow(e, seciliGorsel.user_id)}
                                            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shrink-0 shadow-sm"
                                        >
                                            Takip Et
                                        </button>
                                    )}
                                </div>

                                <div className="relative z-10">
                                    <h4 className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mb-2">Marka / Şirket</h4>
                                    <h2 className="text-[var(--text-primary)] text-3xl font-black mb-8 leading-tight">{seciliGorsel.isletme}</h2>

                                    <div className="flex gap-4 mb-6">
                                        <div className="flex-1 p-5 rounded-[24px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-[var(--color-brand-orange)]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Yapay Zeka Puanı</span>
                                            <span className="text-4xl text-[var(--color-brand-orange)] font-black tracking-tighter relative z-10">{seciliGorsel.ai_puan}</span>
                                        </div>
                                        <div className="flex-1 p-5 rounded-[24px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-[#ff7b00]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Topluluk ({seciliGorsel.oy_sayisi} Oy)</span>
                                            <span className="text-4xl text-[#ff7b00] font-black tracking-tighter relative z-10">
                                                {seciliGorsel.oy_sayisi > 0 ? `%${seciliGorsel.topluluk_puan}` : 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 4 Bar AI Breakdown */}
                                    {seciliGorsel.skor_detayi && (
                                        <div className="mb-8 space-y-3 bg-[var(--bg-secondary)] p-5 rounded-[24px] border border-[var(--border-primary)]">
                                            <span className="text-[var(--text-primary)] font-bold text-xs tracking-wide block mb-2">Detaylı Kriter Analizi</span>
                                            
                                            {/* Renk */}
                                            {seciliGorsel.skor_detayi.renk && (
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[var(--text-secondary)] text-[11px] font-bold">Renk Paleti & Harmoni</span>
                                                        <span className="text-[var(--text-primary)] text-[11px] font-black">{seciliGorsel.skor_detayi.renk.puan}/25</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#FF5500] rounded-full" style={{ width: `${(seciliGorsel.skor_detayi.renk.puan / 25) * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Font */}
                                            {seciliGorsel.skor_detayi.font && (
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[var(--text-secondary)] text-[11px] font-bold">Tipografi & Okunabilirlik</span>
                                                        <span className="text-[var(--text-primary)] text-[11px] font-black">{seciliGorsel.skor_detayi.font.puan}/25</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#FF5500] rounded-full" style={{ width: `${(seciliGorsel.skor_detayi.font.puan / 25) * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Bütünlük */}
                                            {seciliGorsel.skor_detayi.butunluk && (
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[var(--text-secondary)] text-[11px] font-bold">Marka Uyumu & Bütünlük</span>
                                                        <span className="text-[var(--text-primary)] text-[11px] font-black">{seciliGorsel.skor_detayi.butunluk.puan}/25</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#FF5500] rounded-full" style={{ width: `${(seciliGorsel.skor_detayi.butunluk.puan / 25) * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Kompozisyon */}
                                            {seciliGorsel.skor_detayi.kompozisyon && (
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[var(--text-secondary)] text-[11px] font-bold">Düzen & Kompozisyon</span>
                                                        <span className="text-[var(--text-primary)] text-[11px] font-black">{seciliGorsel.skor_detayi.kompozisyon.puan}/25</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#FF5500] rounded-full" style={{ width: `${(seciliGorsel.skor_detayi.kompozisyon.puan / 25) * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Oylama Alanı veya Kendi Tasarımın Uyarısı */}
                                    {user && seciliGorsel.user_id === user.id ? (
                                        <div className="p-4 bg-[var(--bg-secondary)] rounded-[24px] border border-[var(--border-primary)] text-center">
                                            <p className="text-xs font-bold text-[var(--color-brand-orange)]">Kendi tasarımınıza puan veremezsiniz</p>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center pt-2 pb-4">
                                            <div className="inline-flex items-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow">
                                                <button
                                                    onClick={() => vote(seciliGorsel.analiz_id || seciliGorsel.id, 1)}
                                                    disabled={seciliGorsel.user_vote != null}
                                                    title="Beğendim"
                                                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                                                        seciliGorsel.user_vote === 1
                                                            ? 'bg-emerald-500 text-white shadow-md scale-105'
                                                            : 'text-emerald-500/60 hover:bg-emerald-50/50 hover:text-emerald-600 disabled:opacity-50'
                                                    }`}
                                                >
                                                    <ArrowBigUp className="w-6 h-6" fill={seciliGorsel.user_vote === 1 ? "currentColor" : "none"} />
                                                </button>
                                                
                                                <div className="w-px h-6 bg-[var(--border-primary)] mx-3" />

                                                <button
                                                    onClick={() => vote(seciliGorsel.analiz_id || seciliGorsel.id, -1)}
                                                    disabled={seciliGorsel.user_vote != null}
                                                    title="Beğenmedim"
                                                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                                                        seciliGorsel.user_vote === -1
                                                            ? 'bg-rose-500 text-white shadow-md scale-105'
                                                            : 'text-rose-500/60 hover:bg-rose-50/50 hover:text-rose-600 disabled:opacity-50'
                                                    }`}
                                                >
                                                    <ArrowBigDown className="w-6 h-6" fill={seciliGorsel.user_vote === -1 ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Yorumlar Bölümü */}
                                    <div className="mt-6 pt-6 border-t border-[var(--border-primary)] space-y-4">
                                        <h4 className="text-[var(--text-primary)] text-xs font-black uppercase tracking-wider flex items-center justify-between">
                                            <span>Yorumlar ({modalComments.length})</span>
                                            <button 
                                                onClick={() => handleReportClick(seciliGorsel.id, 'post')} 
                                                className="text-[10px] text-[var(--text-secondary)]/60 hover:text-amber-500 transition-colors flex items-center gap-1"
                                            >
                                                <Flag size={10} /> Gönderiyi Şikayet Et
                                            </button>
                                        </h4>

                                        <div 
                                            className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar overscroll-contain touch-pan-y"
                                            data-lenis-prevent="true"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            {modalCommentsLoading ? (
                                                <p className="text-xs text-[var(--text-secondary)] text-center py-2">Yorumlar yükleniyor...</p>
                                            ) : modalComments.length === 0 ? (
                                                <p className="text-xs text-[var(--text-secondary)] italic text-center py-2">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                                            ) : (
                                                modalComments.map((c) => {
                                                    const isMyComment = user && user.id === c.user_id;
                                                    const isEditing = editingCommentId === c.id;

                                                    return (
                                                        <div key={c.id || c.created_at} className="flex gap-2.5 items-start bg-[var(--bg-secondary)] p-2.5 rounded-xl border border-[var(--border-primary)]">
                                                            <Link to={`/${c.user_slug || c.user_id}`} onClick={() => setSeciliGorsel(null)}>
                                                                <img src={c.user_avatar} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 hover:opacity-80 transition-opacity" alt={c.user_name} />
                                                            </Link>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <Link to={`/${c.user_slug || c.user_id}`} onClick={() => setSeciliGorsel(null)} className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--color-brand-orange)] transition-colors truncate">
                                                                        {c.user_name}
                                                                    </Link>
                                                                    <span className="text-[9px] text-[var(--text-secondary)] shrink-0">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
                                                                </div>
                                                                
                                                                {isEditing ? (
                                                                    <div className="mt-1.5 space-y-2">
                                                                        <input
                                                                            type="text"
                                                                            value={editingCommentText}
                                                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                                                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-[var(--color-brand-orange)] bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none"
                                                                            autoFocus
                                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditComment(c.id); }}
                                                                        />
                                                                        <div className="flex justify-end gap-1.5">
                                                                            <button
                                                                                onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }}
                                                                                className="px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] rounded"
                                                                            >
                                                                                İptal
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleSaveEditComment(c.id)}
                                                                                className="px-2.5 py-0.5 text-[10px] font-bold bg-[var(--color-brand-orange)] text-white rounded hover:bg-[#e64500]"
                                                                            >
                                                                                Kaydet
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed break-words">{c.content}</p>
                                                                        <div className="mt-1.5 flex justify-end gap-2">
                                                                            {isMyComment ? (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.content); }}
                                                                                        className="text-[9px] font-bold text-[var(--text-secondary)]/60 hover:text-[var(--color-brand-orange)] transition-colors flex items-center gap-0.5"
                                                                                    >
                                                                                        <Pencil size={9} /> Düzenle
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteComment(c.id)}
                                                                                        className="text-[9px] font-bold text-[var(--text-secondary)]/60 hover:text-red-500 transition-colors flex items-center gap-0.5"
                                                                                    >
                                                                                        <Trash2 size={9} /> Sil
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <button 
                                                                                    onClick={() => handleReportClick(c.id, 'comment')} 
                                                                                    className="text-[9px] font-bold text-[var(--text-secondary)]/40 hover:text-amber-500 transition-colors flex items-center gap-1"
                                                                                >
                                                                                    <Flag size={9} /> Şikayet
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
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
            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => { setReportModalOpen(false); setReportItem(null); }}
                onSubmit={submitReport}
            />
            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={executeDeleteComment}
                title="Yorumu Sil"
                description="Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                confirmText="Evet, Sil"
                cancelText="İptal"
            />
        </div>
    );
}
