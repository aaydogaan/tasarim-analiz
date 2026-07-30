import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { X, ArrowBigUp, ArrowBigDown, Flag, Heart, MessageCircle, Star, CheckCircle2, AlertCircle, Trash2, Pencil, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { VerifiedBadge } from './VerifiedBadge';
import ReportModal from './ReportModal';

export interface DesignDetailItem {
    id: string;
    analiz_id?: string;
    user_id?: string;
    tasarim_turu: string;
    isletme?: string;
    gorsel_url: string;
    extra_images?: string[];
    all_images?: string[];
    ai_puan?: number | null;
    topluluk_puan?: number;
    oy_sayisi?: number;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
    user_slug?: string;
    verification_badge?: string;
    skor_detayi?: any;
    user_vote?: number | null;
}

interface DesignDetailModalProps {
    item: DesignDetailItem | null;
    onClose: () => void;
    currentUser?: any;
}

export default function DesignDetailModal({ item, onClose, currentUser }: DesignDetailModalProps) {
    const [detailItem, setDetailItem] = useState<DesignDetailItem | null>(item);
    const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState('');

    // Report modal
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportTargetId, setReportTargetId] = useState('');
    const [reportTargetType, setReportTargetType] = useState<'post' | 'comment'>('post');

    useEffect(() => {
        setDetailItem(item);
        setActiveImgIndex(0);
        if (!item) {
            setComments([]);
            return;
        }

        const fetchDetailsAndComments = async () => {
            setCommentsLoading(true);

            // Fetch comments
            const { data: commentsData } = await supabase
                .from('post_comments')
                .select('*')
                .eq('post_id', item.id)
                .order('created_at', { ascending: true });

            if (commentsData) {
                // Fetch profiles for comments
                const userIds = Array.from(new Set(commentsData.map(c => c.user_id)));
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url, slug')
                    .in('id', userIds);

                const profileMap = new Map(profiles?.map(p => [p.id, p]));

                setComments(commentsData.map(c => {
                    const prof = profileMap.get(c.user_id);
                    return {
                        ...c,
                        user_name: prof?.display_name || 'Tasarımcı',
                        user_avatar: prof?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${c.user_id}`,
                        user_slug: prof?.slug || c.user_id
                    };
                }));
            }
            setCommentsLoading(false);

            // Check current user vote
            if (currentUser) {
                const { data: voteData } = await supabase
                    .from('post_votes')
                    .select('vote_type')
                    .eq('post_id', item.id)
                    .eq('user_id', currentUser.id)
                    .maybeSingle();

                if (voteData) {
                    setDetailItem(prev => prev ? { ...prev, user_vote: voteData.vote_type } : null);
                }
            }
        };

        fetchDetailsAndComments();
    }, [item, currentUser]);

    if (!detailItem) return null;

    const vote = async (voteValue: number) => {
        if (!currentUser) {
            toast.error('Oy vermek için giriş yapmalısınız');
            return;
        }

        if (detailItem.user_id === currentUser.id) {
            toast.error('Kendi tasarımınıza oy veremezsiniz');
            return;
        }

        if (detailItem.user_vote != null) {
            toast.error('Bu tasarıma zaten oy verdiniz');
            return;
        }

        try {
            await supabase.from('post_votes').insert({
                post_id: detailItem.id,
                user_id: currentUser.id,
                vote_type: voteValue
            });

            const newOySayisi = (detailItem.oy_sayisi || 0) + 1;
            const currentPositive = Math.round(((detailItem.topluluk_puan || 0) / 100) * (detailItem.oy_sayisi || 0));
            const newPositive = voteValue === 1 ? currentPositive + 1 : currentPositive;
            const newToplulukPuan = Math.round((newPositive / newOySayisi) * 100);

            setDetailItem(prev => prev ? {
                ...prev,
                oy_sayisi: newOySayisi,
                topluluk_puan: newToplulukPuan,
                user_vote: voteValue
            } : null);

            toast.success(voteValue === 1 ? 'Beğeniniz kaydedildi! 👍' : 'Oyunuz kaydedildi');
        } catch (err: any) {
            toast.error('Oy verilirken hata oluştu');
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!currentUser) {
            toast.error('Yorum yapmak için giriş yapmalısınız');
            return;
        }

        setCommentSubmitting(true);
        try {
            const text = newComment.trim();
            const { data, error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: detailItem.id,
                    user_id: currentUser.id,
                    content: text,
                    comment: text
                })
                .select()
                .single();

            if (error) throw error;

            const { data: prof } = await supabase.from('profiles').select('display_name, avatar_url, slug').eq('id', currentUser.id).single();

            setComments(prev => [...prev, {
                ...data,
                content: text,
                comment: text,
                user_name: prof?.display_name || 'Ben',
                user_avatar: prof?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.id}`,
                user_slug: prof?.slug || currentUser.id
            }]);

            setNewComment('');
            toast.success('Yorumunuz eklendi');
        } catch (err: any) {
            toast.error(err.message || 'Yorum eklenirken hata oluştu');
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
            if (error) throw error;
            setComments(prev => prev.filter(c => c.id !== commentId));
            toast.success('Yorum silindi');
        } catch (err: any) {
            toast.error('Yorum silinemedi');
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editCommentText.trim()) return;
        const text = editCommentText.trim();
        try {
            const { error } = await supabase.from('post_comments').update({ content: text, comment: text }).eq('id', commentId);
            if (error) throw error;
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: text, comment: text } : c));
            setEditingCommentId(null);
            toast.success('Yorum güncellendi');
        } catch (err: any) {
            toast.error('Yorum güncellenemedi');
        }
    };

    const handleReportSubmit = async (reason: string) => {
        if (!currentUser) {
            toast.error('Şikayet etmek için giriş yapmalısınız');
            return;
        }
        try {
            await supabase.from('reports').insert({
                reporter_id: currentUser.id,
                target_id: reportTargetId,
                target_type: reportTargetType,
                reason
            });
            toast.success('Şikayetiniz yönetime iletildi');
        } catch (err: any) {
            toast.error('Şikayet gönderilemedi');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto"
                onClick={onClose}
            >
                <button
                    onClick={onClose}
                    className="fixed top-5 right-5 z-[10001] p-3 rounded-full bg-[var(--card-bg)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-xl backdrop-blur-xl transition-all hover:rotate-90"
                >
                    <X className="w-6 h-6" />
                </button>

                <div
                    className="relative z-[10000] max-w-6xl w-full flex flex-col md:flex-row gap-8 items-center md:items-start justify-center my-auto py-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Left: Image Preview */}
                    <div className="w-full md:w-3/5 flex flex-col items-center justify-center gap-4">
                        <div className="relative group flex items-center justify-center w-full">
                            {detailItem?.all_images && detailItem.all_images.length > 1 && activeImgIndex > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImgIndex(prev => Math.max(0, prev - 1));
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#FF5500] text-white shadow-xl backdrop-blur-md transition-all z-20"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}

                            <img
                                src={detailItem?.all_images?.[activeImgIndex] || detailItem?.gorsel_url}
                                alt={detailItem?.tasarim_turu}
                                className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-2xl border border-white/10 shadow-2xl transition-all duration-300"
                            />

                            {detailItem?.all_images && detailItem.all_images.length > 1 && activeImgIndex < detailItem.all_images.length - 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImgIndex(prev => Math.min((detailItem.all_images?.length || 1) - 1, prev + 1));
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#FF5500] text-white shadow-xl backdrop-blur-md transition-all z-20"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {detailItem?.all_images && detailItem.all_images.length > 1 && (
                            <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
                                {detailItem.all_images.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImgIndex(idx)}
                                        className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                                            idx === activeImgIndex 
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

                    {/* Right: Info Card & Scrollable Comments */}
                    <div
                        className="w-full md:w-[420px] p-6 sm:p-8 border border-[var(--border-primary)] bg-[var(--card-bg)] backdrop-blur-2xl rounded-[32px] max-h-[82vh] overflow-y-auto flex flex-col justify-between relative shadow-2xl custom-scrollbar overscroll-contain touch-pan-y"
                        data-lenis-prevent="true"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        <div>
                            {/* Profile Header */}
                            <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-[var(--border-primary)]">
                                <Link to={`/${detailItem.user_slug || detailItem.user_id}`} className="flex items-center gap-3.5 group/profile" onClick={onClose}>
                                    <img
                                        src={detailItem.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${detailItem.id}`}
                                        alt="Designer"
                                        className="w-12 h-12 rounded-full border border-[var(--border-primary)] object-cover bg-[var(--bg-secondary)] group-hover/profile:border-[#FF5500] transition-colors"
                                    />
                                    <div>
                                        <h3 className="text-[var(--text-primary)] text-base font-bold leading-tight mb-1 group-hover/profile:text-[#FF5500] transition-colors flex items-center gap-1.5">
                                            <span>{detailItem.user_name || "Tasarımcı"}</span>
                                            <VerifiedBadge badge={detailItem.verification_badge} size="xs" />
                                        </h3>
                                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest">
                                            <span>{detailItem.tasarim_turu}</span>
                                            {detailItem.created_at && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/20" />
                                                    <span>{new Date(detailItem.created_at).toLocaleDateString('tr-TR')}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Title & Scores */}
                            {detailItem.isletme && (
                                <div className="mb-5">
                                    <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mb-1 block">Marka / Şirket</span>
                                    <h2 className="text-[var(--text-primary)] text-2xl font-black leading-tight">{detailItem.isletme}</h2>
                                </div>
                            )}

                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center shadow-xs">
                                    <span className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest block mb-1">YAPAY ZEKA PUANI</span>
                                    <span className="text-3xl text-[#FF5500] font-black">{detailItem?.ai_puan != null ? detailItem.ai_puan : '-'}</span>
                                </div>
                                <div className="flex-1 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center shadow-xs">
                                    <span className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest block mb-1">TOPLULUK ({detailItem.oy_sayisi || 0} OY)</span>
                                    <span className="text-3xl text-amber-500 font-black">
                                        {(detailItem.oy_sayisi || 0) > 0 ? `%${detailItem.topluluk_puan}` : '%100'}
                                    </span>
                                </div>
                            </div>

                            {/* Upvote / Downvote Buttons */}
                            {currentUser && detailItem.user_id === currentUser.id ? (
                                <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] text-center mb-6">
                                    <p className="text-xs font-bold text-[#FF5500]">Kendi tasarımınıza oy veremezsiniz</p>
                                </div>
                            ) : (
                                <div className="flex justify-center mb-6">
                                    <div className="inline-flex items-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full p-1.5 shadow-sm">
                                        <button
                                            onClick={() => vote(1)}
                                            disabled={detailItem.user_vote != null}
                                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                                detailItem.user_vote === 1
                                                    ? 'bg-emerald-500 text-white shadow-md'
                                                    : 'text-emerald-500 hover:bg-emerald-500/10'
                                            }`}
                                        >
                                            <ArrowBigUp size={24} fill={detailItem.user_vote === 1 ? "currentColor" : "none"} />
                                        </button>
                                        <div className="w-px h-5 bg-[var(--border-primary)] mx-2" />
                                        <button
                                            onClick={() => vote(-1)}
                                            disabled={detailItem.user_vote != null}
                                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                                detailItem.user_vote === -1
                                                    ? 'bg-rose-500 text-white shadow-md'
                                                    : 'text-rose-500 hover:bg-rose-500/10'
                                            }`}
                                        >
                                            <ArrowBigDown size={24} fill={detailItem.user_vote === -1 ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Comments Section */}
                            <div className="pt-4 border-t border-[var(--border-primary)] space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">
                                        YORUMLAR ({comments.length})
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setReportTargetId(detailItem.id);
                                            setReportTargetType('post');
                                            setReportModalOpen(true);
                                        }}
                                        className="text-[10px] text-[var(--text-secondary)] hover:text-amber-500 transition-colors flex items-center gap-1 font-bold"
                                    >
                                        <Flag size={11} /> Şikayet Et
                                    </button>
                                </div>

                                {/* Comments List with Scroll Isolation */}
                                <div
                                    className="space-y-2.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar overscroll-contain touch-pan-y"
                                    data-lenis-prevent="true"
                                    onWheel={(e) => e.stopPropagation()}
                                >
                                    {commentsLoading ? (
                                        <p className="text-xs text-[var(--text-secondary)] text-center py-4">Yorumlar yükleniyor...</p>
                                    ) : comments.length === 0 ? (
                                        <p className="text-xs text-[var(--text-secondary)] italic text-center py-4">Henüz yorum yok. İlk yorumu sen yaz!</p>
                                    ) : (
                                        comments.map((c) => {
                                            const isMyComment = currentUser && currentUser.id === c.user_id;
                                            const isEditing = editingCommentId === c.id;

                                            return (
                                                <div key={c.id || c.created_at} className="flex gap-2.5 items-start bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-primary)]">
                                                    <Link to={`/${c.user_slug || c.user_id}`} onClick={onClose}>
                                                        <img src={c.user_avatar} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" alt={c.user_name} />
                                                    </Link>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-1 mb-1">
                                                            <Link to={`/${c.user_slug || c.user_id}`} onClick={onClose} className="text-xs font-bold text-[var(--text-primary)] hover:text-[#FF5500] truncate">
                                                                {c.user_name}
                                                            </Link>
                                                            <span className="text-[9px] text-[var(--text-secondary)] shrink-0">
                                                                {new Date(c.created_at).toLocaleDateString('tr-TR')}
                                                            </span>
                                                        </div>

                                                        {isEditing ? (
                                                            <div className="mt-1 space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={editCommentText}
                                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                                    className="w-full text-xs p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none"
                                                                />
                                                                <div className="flex gap-1.5 justify-end">
                                                                    <button onClick={() => setEditingCommentId(null)} className="px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)]">Vazgeç</button>
                                                                    <button onClick={() => handleUpdateComment(c.id)} className="px-2.5 py-1 text-[10px] font-bold bg-[#FF5500] text-white rounded-md">Kaydet</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-[var(--text-primary)]/90 font-medium mt-0.5 leading-relaxed break-words">{c.content || c.comment}</p>
                                                        )}

                                                        {isMyComment && !isEditing && (
                                                            <div className="flex gap-2 justify-end mt-1.5">
                                                                <button onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.content || c.comment); }} className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Düzenle</button>
                                                                <button onClick={() => handleDeleteComment(c.id)} className="text-[10px] text-red-500 hover:text-red-600">Sil</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Add Comment Input */}
                                <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
                                    <input
                                        type="text"
                                        placeholder="Yorumunuzu yazın..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[#FF5500]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={commentSubmitting || !newComment.trim()}
                                        className="px-4 py-2.5 bg-[#FF5500] hover:bg-[#e64d00] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1"
                                    >
                                        <span>Gönder</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <ReportModal
                    isOpen={reportModalOpen}
                    onClose={() => setReportModalOpen(false)}
                    onSubmit={handleReportSubmit}
                />
            </motion.div>
        </AnimatePresence>
    );
}
