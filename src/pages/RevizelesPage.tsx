import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Flame, ThumbsUp, MessageSquare, Image as ImageIcon, Send, Sparkles, AlertCircle, Share2, UploadCloud, Loader2, ArrowLeft } from 'lucide-react';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export default function RevizelesPage() {
    const { id: routeTopicId } = useParams();
    const [topics, setTopics] = useState<any[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);

    // Form states
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [commentText, setCommentText] = useState('');
    const [redesignUrl, setRedesignUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setCurrentUser(data.session?.user || null);
        });
        fetchTopics();
    }, [routeTopicId]);

    const fetchTopics = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('revizeles_topics')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setTopics(data);
                const activeTopic = routeTopicId ? data.find(t => t.id === routeTopicId) || data[0] : data[0];
                setSelectedTopic(activeTopic);
                if (activeTopic) {
                    fetchPosts(activeTopic.id);
                }
            } else {
                setTopics([]);
                setSelectedTopic(null);
            }
        } catch (err) {
            console.error('Fetch topics error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (topicId: string) => {
        setPostsLoading(true);
        try {
            const { data } = await supabase
                .from('revizeles_posts')
                .select('*')
                .eq('topic_id', topicId)
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                // Enrich with user profiles
                const userIds = [...new Set(data.map((p: any) => p.user_id).filter(Boolean))];
                let profileMap: Record<string, any> = {};
                if (userIds.length > 0) {
                    const { data: profs } = await supabase
                        .from('profiles')
                        .select('id, display_name, avatar_url, slug, verification_badge')
                        .in('id', userIds);
                    if (profs) {
                        profileMap = Object.fromEntries(profs.map(p => [p.id, p]));
                    }
                }

                const formatted = data.map((p: any) => ({
                    ...p,
                    user_name: profileMap[p.user_id]?.display_name || 'Tasarımcı',
                    user_avatar: profileMap[p.user_id]?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${p.user_id}`,
                    user_slug: profileMap[p.user_id]?.slug || p.user_id,
                    user_badge: profileMap[p.user_id]?.verification_badge
                }));
                setPosts(formatted);
            } else {
                setPosts([]);
            }
        } catch (err) {
            console.error('Fetch posts error:', err);
        } finally {
            setPostsLoading(false);
        }
    };

    const handleRedesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const s3Client = new S3Client({
                region: 'auto',
                endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
                    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
                },
            });

            const fileName = `revizeles/user_redesign_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const fileBuffer = await file.arrayBuffer();

            await s3Client.send(new PutObjectCommand({
                Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
                Key: fileName,
                Body: new Uint8Array(fileBuffer),
                ContentType: file.type,
            }));

            const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL.replace(/\/$/, "");
            const finalUrl = `${r2PublicUrl}/${fileName}`;
            setRedesignUrl(finalUrl);
            toast.success('Revizyon logonuz yüklendi!');
        } catch (err: any) {
            toast.error('Görsel yüklenemedi: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) {
            toast.error('Lütfen bir eleştiri veya düşünce yazın.');
            return;
        }

        if (!currentUser) {
            toast.error('Eleştiri veya revizyon paylaşmak için giriş yapmalısınız.');
            return;
        }

        if (!selectedTopic) return;

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('revizeles_posts')
                .insert({
                    topic_id: selectedTopic.id,
                    user_id: currentUser.id,
                    comment: commentText.trim(),
                    redesign_image_url: redesignUrl || null,
                    likes_count: 0
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Eleştiriniz ve revizyonunuz yayınlandı! 🚀');
            setCommentText('');
            setRedesignUrl('');
            fetchPosts(selectedTopic.id);
        } catch (err: any) {
            toast.error(err.message || 'Gönderilirken bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikePost = async (postId: string, currentLikes: number) => {
        if (!currentUser) {
            toast.error('Beğenmek için giriş yapmalısınız');
            return;
        }

        const newCount = (currentLikes || 0) + 1;
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newCount } : p));

        try {
            await supabase.from('revizeles_posts').update({ likes_count: newCount }).eq('id', postId);
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Top Banner Header */}
                <div className="text-center space-y-3 mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs font-black text-[var(--text-primary)]">
                        <Flame className="w-4 h-4 text-[#FF5500]" />
                        <span>CANLI GÜNDEM TARTIŞMALARI</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        Revizeleş! ⚡
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
                        Gündemdeki logolar, marka yenilemeleri ve şehir amblemleri burada masaya yatırılıyor. Tasarımı eleştir veya kendi alternatif logosunu paylaş!
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-[#FF5500] animate-spin" />
                    </div>
                ) : !selectedTopic ? (
                    <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-12 text-center">
                        <Flame className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Henüz Aktif Bir Gündem Konusu Bulunmuyor</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Çok yakında yeni gündem logosu ile buradayız!</p>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* Topics Tab Selector (If multiple active) */}
                        {topics.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {topics.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setSelectedTopic(t); fetchPosts(t.id); }}
                                        className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
                                            selectedTopic.id === t.id
                                                ? 'bg-[#FF5500] text-white border-[#FF5500] shadow-md'
                                                : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[#FF5500]'
                                        }`}
                                    >
                                        {t.title}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Featured Topic Card */}
                        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[32px] overflow-hidden shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 items-center">
                                {/* Target Logo Image */}
                                <div className="md:col-span-1 relative group rounded-2xl overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-secondary)] aspect-square flex items-center justify-center p-4">
                                    <img
                                        src={selectedTopic.image_url}
                                        alt={selectedTopic.title}
                                        className="max-h-full max-w-full object-contain rounded-xl"
                                    />
                                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        Gündem Logosı
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="md:col-span-2 space-y-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-xs font-black uppercase tracking-wider">
                                            {selectedTopic.category || 'Gündem'}
                                        </span>
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                                            {new Date(selectedTopic.created_at).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-snug">
                                        {selectedTopic.title}
                                    </h2>

                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                        {selectedTopic.description}
                                    </p>

                                    <div className="pt-2 flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)]">
                                        <span className="flex items-center gap-1.5">
                                            <MessageSquare className="w-4 h-4 text-[#FF5500]" />
                                            {posts.length} Eleştiri / Revizyon
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Form Card */}
                        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
                            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#FF5500]" />
                                Sen Olsan Nasıl Yapardın? (Eleştir veya Revize Et)
                            </h3>

                            <form onSubmit={handleSubmitPost} className="space-y-4">
                                <textarea
                                    rows={3}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Bu logo/amblem sizce nasıl olmuş? Renk paleti, tipografisi ve sembolik anlamı hakkında eleştirini yaz veya kendi revize logonla katıl..."
                                    className="w-full p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#FF5500] resize-none"
                                />

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    {/* Upload Redesign Image */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <label className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[#FF5500] text-[var(--text-primary)] text-xs font-bold cursor-pointer flex items-center gap-2 transition-all w-full sm:w-auto justify-center">
                                            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-[#FF5500]" /> : <UploadCloud className="w-4 h-4 text-[#FF5500]" />}
                                            <span>{uploadingImage ? 'Yükleniyor...' : (redesignUrl ? '✓ Revizyon Yüklendi' : '📷 Kendi Revizyon Logonu Yükle')}</span>
                                            <input type="file" accept="image/*" onChange={handleRedesignUpload} className="hidden" />
                                        </label>
                                        {redesignUrl && (
                                            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#FF5500]">
                                                <img src={redesignUrl} alt="Revizyon" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || uploadingImage}
                                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#FF5500] hover:bg-[#e64d00] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        <span>Yayınla 🚀</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Submissions Feed */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] px-2 flex items-center justify-between">
                                <span>Topluluk Eleştirileri & Revizyonları ({posts.length})</span>
                            </h3>

                            {postsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-[#FF5500] animate-spin" />
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-8 text-center">
                                    <p className="text-xs text-[var(--text-secondary)] italic">
                                        Henüz bir eleştiri veya revizyon yazılmadı. İlk yorumu sen yap!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {posts.map((p) => (
                                        <div key={p.id} className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-xs space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Link to={`/${p.user_slug}`} className="flex items-center gap-3 group">
                                                    <img src={p.user_avatar} alt={p.user_name} className="w-10 h-10 rounded-full object-cover border border-[var(--border-primary)]" />
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#FF5500] transition-colors">
                                                                {p.user_name}
                                                            </span>
                                                            <VerifiedBadge badge={p.user_badge} size="xs" />
                                                        </div>
                                                        <span className="text-[10px] text-[var(--text-secondary)]">
                                                            {new Date(p.created_at).toLocaleDateString('tr-TR')}
                                                        </span>
                                                    </div>
                                                </Link>

                                                <button
                                                    onClick={() => handleLikePost(p.id, p.likes_count)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[#FF5500] text-xs font-bold text-[var(--text-primary)] transition-all"
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5 text-[#FF5500]" />
                                                    <span>{p.likes_count || 0}</span>
                                                </button>
                                            </div>

                                            {/* Comment Text */}
                                            <p className="text-sm text-[var(--text-primary)]/90 leading-relaxed font-medium">
                                                {p.comment}
                                            </p>

                                            {/* Redesign Image Side-by-side comparison if uploaded */}
                                            {p.redesign_image_url && (
                                                <div className="pt-2">
                                                    <span className="text-[11px] font-black uppercase text-[#FF5500] tracking-wider block mb-2">
                                                        ✨ Tasarımcının Alternatif Revizyon Logosu:
                                                    </span>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-2xl text-center">
                                                            <span className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5">Orijinal Logo</span>
                                                            <img src={selectedTopic.image_url} alt="Orijinal" className="max-h-48 mx-auto object-contain rounded-xl" />
                                                        </div>
                                                        <div className="bg-[var(--bg-secondary)] border border-[#FF5500]/30 p-3 rounded-2xl text-center">
                                                            <span className="text-[10px] font-bold text-[#FF5500] block mb-1.5">Alternatif Revizyon</span>
                                                            <img src={p.redesign_image_url} alt="Revizyon" className="max-h-48 mx-auto object-contain rounded-xl" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
