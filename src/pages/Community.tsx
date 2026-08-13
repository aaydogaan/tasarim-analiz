import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Users, MessageCircle, Heart, Trophy, Zap, Share2, Crown, Star, Sparkles, ArrowRight, Award, X, Send, Loader2, ChevronDown, Flag, Pencil, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, Images, Reply } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { ProBadge } from '../components/ui/ProBadge';
import { FormattedCommentText } from '../components/ui/FormattedCommentText';
import { CommentInputWithMentions } from '../components/ui/CommentInputWithMentions';
import { sendMentionNotifications, getCleanUserTag, organizeCommentsIntoThreads } from '../lib/mentionHelper';
import {
    CORE_FOUNDERS,
    CORE_FOUNDER_COUNT,
    DESIGN_RANKS,
    FOUNDER_LIMIT,
    MEMBER_FOUNDER_LIMIT,
    getMemberFounderDisplayNumber,
    makeFounderPreview,
    normalizeCommunityProfile,
    type NormalizedCommunityProfile,
} from '../lib/communityProfile';
import ReportModal from '../components/ui/ReportModal';
import ConfirmModal from '../components/ui/ConfirmModal';

const CHANGING_WORDS = ['İlham', 'Eleştiri', 'Yaratıcılık', 'Perspektif'];

const STATS = [
    { label: 'Aktif Üye', value: '1.2k+', icon: Users, color: 'text-blue-500' },
    { label: 'Günlük Mesaj', value: '850+', icon: MessageCircle, color: 'text-[var(--color-brand-orange)]' },
    { label: 'Revize Edilen', value: '3.4k+', icon: Zap, color: 'text-amber-500' },
    { label: 'Tasarım Paylaşımı', value: '12k+', icon: Heart, color: 'text-emerald-500' }
];

const RANK_DISPLAY_MAP: Record<string, string> = {
    'stajyer': 'Stajyer Tasarımcı',
    'junior': 'Junior Tasarımcı',
    'tasarimci': 'Tasarımcı',
    'senior': 'Senior Tasarımcı',
    'art-direktor': 'Art Direktör',
    'tasarim-direktoru': 'Tasarım Direktörü'
};

type CommunityProps = {
    kullanici?: any;
    onAuthClick?: () => void;
    onProfileClick?: () => void;
    onProfileOpen?: (profile: NormalizedCommunityProfile) => void;
};

export default function Community({ kullanici, onAuthClick, onProfileClick, onProfileOpen }: CommunityProps) {
    const navigate = useNavigate();
    const [wordIndex, setWordIndex] = useState(0);
    const [founders, setFounders] = useState<NormalizedCommunityProfile[]>([]);
    const [founderSource, setFounderSource] = useState<'loading' | 'live' | 'preview'>('loading');
    const [activeContest, setActiveContest] = useState<any | null>(null);
    const [contestParticipantCount, setContestParticipantCount] = useState(0);
    const [contestTimeLeft, setContestTimeLeft] = useState('');
    const [trendData, setTrendData] = useState<{ type: string; count: number }[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        const fetchActiveContest = async () => {
            try {
                const { data } = await supabase
                    .from('contests')
                    .select('*')
                    .neq('status', 'draft')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    setActiveContest(data);
                    const { count } = await supabase
                        .from('contest_entries')
                        .select('id', { count: 'exact', head: true })
                        .eq('contest_id', data.id);

                    setContestParticipantCount(Math.max(data.participant_count || 0, count || 0));

                    const end = new Date(data.end_date).getTime();
                    const now = Date.now();
                    const diff = end - now;

                    if (diff <= 0 || data.status === 'ended') {
                        setContestTimeLeft('Süresi Doldu');
                    } else {
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        if (days > 0) {
                            setContestTimeLeft(`${days} Gün Kaldı`);
                        } else {
                            setContestTimeLeft(`${hours} Saat Kaldı`);
                        }
                    }
                }
            } catch (err) {
                console.error("Active contest fetch error:", err);
            }
        };

        fetchActiveContest();
    }, []);
    
    // Community Posts State
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
    const [postSort, setPostSort] = useState<'new' | 'popular'>('new');
    const [feedSource, setFeedSource] = useState<'all' | 'following'>('all');
    
    const [searchParams, setSearchParams] = useSearchParams();
    const postIdFromUrl = searchParams.get('post');

    // Inline Instagram Style Comments State
    const [openInlinePostId, setOpenInlinePostId] = useState<string | null>(postIdFromUrl || null);
    const [commentInput, setCommentInput] = useState('');
    const [inlineComments, setInlineComments] = useState<Record<string, any[]>>({});
    const [inlineLoading, setInlineLoading] = useState<Record<string, boolean>>({});
    const [inlineReplyTarget, setInlineReplyTarget] = useState<Record<string, { name: string; slug: string } | null>>({});

    // New Direct Post State
    const [yeniGonderiModalAcik, setYeniGonderiModalAcik] = useState(false);
    const [yeniGonderiBaslik, setYeniGonderiBaslik] = useState('');
    const [yeniGonderiIcerik, setYeniGonderiIcerik] = useState('');
    const [yeniGonderiGorseller, setYeniGonderiGorseller] = useState<File[]>([]);
    const [gonderiliyor, setGonderiliyor] = useState(false);

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportItem, setReportItem] = useState<{ id: string, type: 'post' | 'comment' } | null>(null);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [seciliGorsel, setSeciliGorsel] = useState<{ images: string[]; index: number } | null>(null);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    // Comment Editing State
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    const handleSaveEditComment = async (postId: string, commentId: string) => {
        if (!editingCommentText.trim()) return;
        const newContent = editingCommentText.trim();
        const { error } = await supabase
            .from('post_comments')
            .update({ content: newContent })
            .eq('id', commentId)
            .eq('user_id', kullanici?.id);

        if (!error) {
            setInlineComments(prev => ({
                ...prev,
                [postId]: (prev[postId] || []).map(c => c.id === commentId ? { ...c, content: newContent } : c)
            }));
            setEditingCommentId(null);
            setEditingCommentText('');
            toast.success('Yorum güncellendi.');
        } else {
            toast.error('Yorum güncellenirken hata oluştu.');
        }
    };

    // Delete Comment Modal State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [targetDeleteInfo, setTargetDeleteInfo] = useState<{ postId: string; commentId: string } | null>(null);

    const handleDeleteComment = (postId: string, commentId: string) => {
        setTargetDeleteInfo({ postId, commentId });
        setDeleteConfirmOpen(true);
    };

    const executeDeleteComment = async () => {
        if (!targetDeleteInfo) return;
        const { postId, commentId } = targetDeleteInfo;
        const { error } = await supabase
            .from('post_comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', kullanici?.id);

        if (!error) {
            setInlineComments(prev => ({
                ...prev,
                [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
            }));
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) - 1) } : p));
            toast.success('Yorum silindi.');
        } else {
            toast.error('Yorum silinirken hata oluştu.');
        }
        setTargetDeleteInfo(null);
    };
    const [isBadgesExpanded, setIsBadgesExpanded] = useState(false);

    // Modal açıkken arkadaki kaydırmayı kapatmak için
    useEffect(() => {
        if (seciliGorsel) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [seciliGorsel]);

    // ESC ve Klavye Sol/Sağ ok tuşları ile gezinme
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!seciliGorsel) return;
            if (event.key === "Escape") setSeciliGorsel(null);
            if (seciliGorsel.images.length > 1) {
                if (event.key === "ArrowRight") {
                    setSeciliGorsel(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
                } else if (event.key === "ArrowLeft") {
                    setSeciliGorsel(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [seciliGorsel]);

    // Scroll to and open specific post from URL
    useEffect(() => {
        if (postIdFromUrl && posts.length > 0) {
            const postExists = posts.some(p => p.id === postIdFromUrl);
            if (postExists) {
                setOpenInlinePostId(postIdFromUrl);
                if (!inlineComments[postIdFromUrl]) {
                    toggleInlineComments(postIdFromUrl);
                }
                
                setTimeout(() => {
                    const el = document.getElementById(`post-${postIdFromUrl}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-2', 'ring-[#FF5500]', 'ring-offset-2');
                        setTimeout(() => {
                            el.classList.remove('ring-2', 'ring-[#FF5500]', 'ring-offset-2');
                        }, 3500);
                    }
                }, 150);
            }
        }
    }, [posts, postIdFromUrl]);

    const toggleInlineComments = async (postId: string) => {
        if (openInlinePostId === postId) {
            setOpenInlinePostId(null);
            return;
        }
        setOpenInlinePostId(postId);
        if (!inlineComments[postId]) {
            setInlineLoading(prev => ({ ...prev, [postId]: true }));
            const { data } = await supabase
                .from('post_comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            if (data) {
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
                setInlineComments(prev => ({ ...prev, [postId]: formatted }));
            }
            setInlineLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const submitInlineComment = async (postId: string) => {
        if (!kullanici) { onAuthClick?.(); return; }
        if (!commentInput.trim()) return;
        setSubmittingComment(true);
        const content = commentInput.trim();
        setCommentInput('');

        let finalName = 'Tasarımcı';
        let finalAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${kullanici.id}`;

        const { data: profileData } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', kullanici.id).single();
        if (profileData) {
            if (profileData.display_name) finalName = profileData.display_name;
            if (profileData.avatar_url) finalAvatar = profileData.avatar_url;
        }

        const { data, error } = await supabase.from('post_comments').insert({
            post_id: postId,
            user_id: kullanici.id,
            content
        }).select('*').single();

        if (!error && data) {
            const commentObj = {
                ...data,
                user_name: finalName,
                user_avatar: finalAvatar
            };
            setInlineComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), commentObj] }));
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
            toast.success('Yorumunuz eklendi!');

            // Send mention & reply notifications
            sendMentionNotifications({
                text: content,
                actorId: kullanici.id,
                postId,
                replyAuthorId: inlineReplyTarget[postId]?.userId
            });
            setInlineReplyTarget(prev => ({ ...prev, [postId]: null }));

            // Award badge 'ilk-ses'
            try {
                await supabase.from('user_badges').insert({ user_id: kullanici.id, badge_id: 'ilk-ses' });
            } catch (_) {}
        } else if (error) {
            console.error("Yorum ekleme hatası:", error);
            toast.error('Yorum eklenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        }
        setSubmittingComment(false);
    };

    const handleReportClick = (itemId: string, type: 'post' | 'comment') => {
        if (!kullanici) {
            toast.error('Şikayet etmek için giriş yapmalısınız');
            return;
        }
        setReportItem({ id: itemId, type });
        setReportModalOpen(true);
    };

    const submitReport = async (reason: string) => {
        if (!reportItem || !kullanici) return;

        const { error } = await supabase.from('reports').insert([{
            reporter_id: kullanici.id,
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

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % CHANGING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Fetch and subscribe to community_posts
    useEffect(() => {
        let isMounted = true;
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('community_posts')
                .select(`*, analizler(id, gorsel_url, genel_puan, user_name, user_avatar, isletme), profiles:user_id(display_name, avatar_url, slug, verification_badge)`)
                .order('created_at', { ascending: false });
            if (data && !error && isMounted) {
                const userIds = [...new Set(data.map((p: any) => p.user_id).filter(Boolean))];
                if (userIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, display_name, avatar_url, founder_number, slug, verification_badge')
                        .in('id', userIds);
                    
                    if (profilesData) {
                        const profileMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
                        const enrichedData = data.map((p: any) => ({
                            ...p,
                            profiles: profileMap[p.user_id] || null
                        }));
                        setPosts(enrichedData);
                        if (isMounted) setPostsLoading(false);
                        return;
                    }
                }
                setPosts(data);
            }
            if (isMounted) setPostsLoading(false);
        };
        fetchPosts();

        const postsSubscription = supabase
            .channel('community_posts_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setPosts(current => current.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
                } else if (payload.eventType === 'INSERT') {
                    fetchPosts();
                } else if (payload.eventType === 'DELETE') {
                    setPosts(current => current.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        const commentsSubscription = supabase
            .channel('community_comments_channel')
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_comments' }, (payload) => {
                setInlineComments(prev => {
                    const next = { ...prev };
                    for (const postId in next) {
                        if (next[postId]) {
                            next[postId] = next[postId].filter(c => c.id !== payload.old.id);
                        }
                    }
                    return next;
                });
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(postsSubscription);
            supabase.removeChannel(commentsSubscription);
        };
    }, []);

    // Load liked posts and followed users for user
    useEffect(() => {
        if (!kullanici) return;
        const fetchUserData = async () => {
            const [likesRes, followsRes] = await Promise.all([
                supabase.from('post_likes').select('post_id').eq('user_id', kullanici.id),
                supabase.from('user_follows').select('following_id').eq('follower_id', kullanici.id)
            ]);
            if (likesRes.data) {
                setLikedPosts(new Set(likesRes.data.map(d => d.post_id)));
            }
            if (followsRes.data) {
                setFollowedUsers(new Set(followsRes.data.map(d => d.following_id)));
            }
        };
        fetchUserData();
    }, [kullanici]);

    const handleFollow = async (e: React.MouseEvent, targetUserId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!kullanici) return toast.error("Takip etmek için giriş yapmalısınız.");
        try {
            await supabase.from('user_follows').insert({ follower_id: kullanici.id, following_id: targetUserId });
            setFollowedUsers(prev => new Set([...prev, targetUserId]));
            await supabase.from('notifications').insert({ user_id: targetUserId, type: 'follow_user', actor_id: kullanici.id });
            toast.success("Takip edildi!");
        } catch (err) {
            console.error(err);
            toast.error("Takip edilemedi");
        }
    };

    const handleLike = async (postId: string) => {
        if (!kullanici) {
            onAuthClick?.();
            return;
        }
        const isLiked = likedPosts.has(postId);
        const newSet = new Set(likedPosts);
        if (isLiked) newSet.delete(postId);
        else newSet.add(postId);
        setLikedPosts(newSet);

        if (isLiked) {
            await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', kullanici.id);
        } else {
            await supabase.from('post_likes').insert({ post_id: postId, user_id: kullanici.id });
            try {
                await supabase.from('user_badges').insert({ user_id: kullanici.id, badge_id: 'takdir-eden' });
            } catch (_) {}
        }
    };

    const submitDirectPost = async () => {
        if (!kullanici) {
            onAuthClick?.();
            return;
        }
        if (!yeniGonderiBaslik && !yeniGonderiIcerik && yeniGonderiGorseller.length === 0) {
            toast.error('Lütfen bir içerik, başlık veya görsel ekleyin.');
            return;
        }
        setGonderiliyor(true);
        let extra_images: string[] = [];
        if (yeniGonderiGorseller.length > 0) {
            try {
                const s3Client = new S3Client({
                    region: 'auto',
                    endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                    credentials: {
                        accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
                        secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
                    },
                });

                for (const file of yeniGonderiGorseller) {
                    const fileName = `extra/${kullanici.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
                    const fileBuffer = await file.arrayBuffer();
                    
                    await s3Client.send(new PutObjectCommand({
                        Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
                        Key: fileName,
                        Body: new Uint8Array(fileBuffer),
                        ContentType: file.type,
                    }));
                    
                    extra_images.push(`${import.meta.env.VITE_R2_PUBLIC_URL.replace(/\/$/, "")}/${fileName}`);
                }
            } catch (err: any) {
                console.error("Görsel yükleme hatası:", err);
                toast.error("Görseller yüklenirken bir hata oluştu.");
                setGonderiliyor(false);
                return;
            }
        }

        // Create corresponding analizler entry first to satisfy FK references & voting
        let createdAnalizId: string | null = null;
        try {
            const { data: newAnaliz } = await supabase.from('analizler').insert({
                user_id: kullanici.id,
                user_name: kullanici.user_metadata?.display_name || kullanici.user_metadata?.full_name || 'Tasarımcı',
                user_avatar: kullanici.user_metadata?.avatar_url || null,
                tasarim_turu: 'Tasarım',
                isletme: yeniGonderiBaslik || 'Topluluk Paylaşımı',
                genel_puan: 85,
                gorsel_url: extra_images.length > 0 ? extra_images[0] : null,
                is_shared: true
            }).select('id').single();

            if (newAnaliz?.id) {
                createdAnalizId = newAnaliz.id;
            }
        } catch (_) {}

        const { error } = await supabase.from('community_posts').insert({
            user_id: kullanici.id,
            analiz_id: createdAnalizId,
            title: yeniGonderiBaslik || null,
            content: yeniGonderiIcerik || null,
            extra_images: extra_images.length > 0 ? extra_images : []
        });

        if (!error) {
            toast.success('Gönderi paylaşıldı!');
            setYeniGonderiModalAcik(false);
            setYeniGonderiBaslik('');
            setYeniGonderiIcerik('');
            setYeniGonderiGorseller([]);
        } else {
            toast.error('Bir hata oluştu.');
        }
        setGonderiliyor(false);
    };

    // Load founders and leaderboard
    useEffect(() => {
        let aktif = true;

        const loadFounders = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, slug, display_name, bio, avatar_url, website, social_handle, design_rank, specialty, experience_level, created_at, founder_number, verification_badge')
                .order('created_at', { ascending: true })
                .limit(100);

            if (!aktif) return;

            if (!error && data?.length) {
                setFounders(data.map((profile) => normalizeCommunityProfile(null, profile as any)));
                setFounderSource('live');
            } else {
                setFounderSource('preview');
            }
            
            // Sadece gerçekten en az 1 analiz yapmış aktif kullanıcıları Liderlik Tablosuna getir
            const { data: activeAnalizler } = await supabase.from('analizler').select('user_id');
            const activeUserIds = [...new Set((activeAnalizler || []).map(a => a.user_id).filter(Boolean))];

            if (activeUserIds.length > 0) {
                const { data: xpData } = await supabase
                    .from('user_xp_stats')
                    .select('*')
                    .in('id', activeUserIds)
                    .order('total_xp', { ascending: false })
                    .limit(5);
                    
                if (xpData && xpData.length > 0) {
                    const leaderIds = xpData.map(u => u.id);
                    const { data: leaderProfiles } = await supabase
                        .from('profiles')
                        .select('id, verification_badge')
                        .in('id', leaderIds);

                    const badgeMap = Object.fromEntries((leaderProfiles || []).map(p => [p.id, p.verification_badge]));
                    setLeaderboard(xpData.map(u => ({ ...u, verification_badge: badgeMap[u.id] || null })));
                } else {
                    setLeaderboard([]);
                }
            } else {
                setLeaderboard([]);
            }
        };

        loadFounders();
        return () => { aktif = false; };
    }, []);

    // Load design trends from vitrin
    useEffect(() => {
        const loadTrends = async () => {
            const { data } = await supabase
                .from('analizler')
                .select('tasarim_turu')
                .eq('paylasim_aktif', true)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
            if (data) {
                const counts: Record<string, number> = {};
                data.forEach(a => { if (a.tasarim_turu) counts[a.tasarim_turu] = (counts[a.tasarim_turu] || 0) + 1; });
                const sorted = Object.entries(counts)
                    .map(([type, count]) => ({ type, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setTrendData(sorted);
            }
        };
        loadTrends();
    }, []);

    const wallCount = Math.min(CORE_FOUNDER_COUNT + (founderSource === 'live' ? founders.length : 0), FOUNDER_LIMIT);
    const founderProgress = Math.min((wallCount / FOUNDER_LIMIT) * 100, 100);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <ReportModal 
                isOpen={reportModalOpen} 
                onClose={() => setReportModalOpen(false)} 
                onSubmit={submitReport}
            />

            {/* Wall of Fame / Kurucu Üyeler Hero Section */}
            <section className="relative w-full bg-[var(--bg-secondary)] pt-24 pb-32 md:pb-40 overflow-hidden border-b border-[var(--border-primary)]">
                {/* Background Decor */}
                <div
                    className="absolute top-0 right-0 w-2/3 h-full bg-orange-600/5 blur-[80px] md:blur-[140px] pointer-events-none"
                    style={{ transform: "translate3d(0,0,0)" }}
                />

                <div className="max-w-screen-xl mx-auto px-6 relative z-10">
                    <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start mb-16">
                        <div>

                            <h1 className="text-4xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight mb-6">
                                İlk {FOUNDER_LIMIT} Destekçimiz
                            </h1>
                            <p className="text-[var(--text-secondary)] text-base md:text-lg font-medium max-w-2xl leading-relaxed">
                                Revizelesene'nin temellerine en başında inanan ilk {FOUNDER_LIMIT} yol arkadaşımız, bu duvarda kalıcı olarak yer alacak. Bu sadece bir isim listesi değil; geleceğin tasarım standartlarını birlikte belirleyeceğimiz bu serüvenin ölümsüz bir parçası olma fırsatı. Senin de izin burada sonsuza dek parlamalı.
                            </p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-3xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 md:p-8 shadow-xl shadow-black/5"
                        >
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Doluluk</p>
                                    <p className="mt-1 text-4xl font-black text-[var(--text-primary)]">{wallCount}<span className="text-lg text-[var(--text-secondary)]">/{FOUNDER_LIMIT}</span></p>
                                </div>
                                <img src="/Revizelesene-Favicon.png" alt="Favicon" className="h-10 w-10 object-contain drop-shadow-md" />
                            </div>
                            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${founderProgress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-orange)] to-amber-500" 
                                />
                            </div>
                            <p className="mt-6 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                                {founderSource === 'live'
                                    ? 'Sıralama üyelik oluşturma tarihine göre kilitlenir.'
                                    : 'Gerçek üyeler geldikçe duvar dolacak.'}
                            </p>
                        </motion.div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {CORE_FOUNDERS.map((founder) => (
                            <div
                                key={founder.id}
                                onClick={() => onProfileOpen?.(founder)}
                                className="relative group cursor-pointer hover:scale-110 hover:z-50 transition-transform duration-300"
                                role="button"
                                tabIndex={0}
                            >
                                <div className="absolute -inset-2 rounded-full bg-[var(--color-brand-orange)]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-16 h-16 md:w-[84px] md:h-[84px] rounded-full p-[3px] bg-gradient-to-br from-orange-300 via-[var(--color-brand-orange)] to-amber-600 shadow-[0_12px_28px_rgba(255,77,0,0.2)] group-hover:shadow-[0_12px_40px_rgba(255,77,0,0.4)] transition-all">
                                    <img
                                        src={founder.avatarUrl}
                                        className="w-full h-full rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] object-cover"
                                        alt=""
                                        loading="lazy"
                                    />
                                </div>
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max bg-[#111] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center z-50">
                                    <span className="text-sm font-bold text-white">{founder.displayName}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest mt-1 text-[var(--color-brand-orange)]">
                                        Kurucu
                                    </span>
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border-r border-b border-white/10 rotate-45" />
                                </div>
                            </div>
                        ))}

                        {founderSource === 'live' && founders.map((founder) => {
                            const rank = getMemberFounderDisplayNumber(founder.founderNumber) || 0;
                            const isGold = founder.verificationBadge === 'gold';

                            return (
                                <div
                                    key={founder.id}
                                    onClick={() => {
                                        if (founder.id && !founder.id.startsWith('preview-')) {
                                            navigate(`/${founder.slug || founder.id}`);
                                        }
                                    }}
                                    className="relative group cursor-pointer hover:scale-110 hover:z-50 transition-transform duration-300 transform-gpu will-change-transform"
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="absolute -inset-2 rounded-full bg-[var(--color-brand-orange)]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative w-16 h-16 md:w-[84px] md:h-[84px] rounded-full p-[3px] bg-gradient-to-br from-orange-300 via-[var(--color-brand-orange)] to-amber-600 shadow-[0_12px_28px_rgba(255,77,0,0.2)] group-hover:shadow-[0_12px_40px_rgba(255,77,0,0.4)] transition-all">
                                        <img
                                            src={founder.avatarUrl}
                                            style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                                            className={`w-full h-full rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)] object-cover transform-gpu`}
                                            alt=""
                                        />
                                        {founder.verificationBadge && (
                                            <div className="absolute -bottom-1 -right-1 z-20 drop-shadow-md">
                                                <VerifiedBadge badge={founder.verificationBadge} size="xs" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max bg-[#111] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center z-50">
                                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                            <span>{founder.displayName || 'Gizli Tasarımcı'}</span>
                                            <VerifiedBadge badge={founder.verificationBadge} size="xs" />
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest mt-1 text-[var(--color-brand-orange)]">
                                            {isGold ? `${rank}. KURUCU` : `${rank}. DESTEKÇİ`}
                                        </span>
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border-r border-b border-white/10 rotate-45" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {!kullanici && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-16 flex flex-col items-center justify-between gap-6 rounded-[32px] border border-[var(--border-primary)] bg-[var(--card-bg)] px-8 py-6 text-center md:flex-row md:text-left shadow-lg"
                        >
                            <p className="text-base font-medium text-[var(--text-secondary)] max-w-2xl">
                                Revizelesene'nin temellerine katkıda bulun. İlk 100 üye arasında yer alarak bu duvarda ismini ölümsüzleştir.
                            </p>
                            <button
                                onClick={onAuthClick}
                                className="shrink-0 rounded-full bg-[var(--text-primary)] px-8 py-4 text-sm font-black text-[var(--bg-primary)] transition-all hover:scale-105 hover:shadow-xl"
                            >
                                Hemen Destekçi Ol
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Main Community Content */}
            <main className="max-w-screen-xl mx-auto px-6 md:px-12 py-16 md:py-24">

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Left: Latest Activity */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* New Post Input Box - Only for logged in users */}
                        {kullanici && (
                            <div 
                                onClick={() => setYeniGonderiModalAcik(true)}
                                className="w-full bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[32px] p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-text flex items-center gap-4 group mb-6"
                            >
                                <img 
                                    src={kullanici?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${kullanici?.id || 'anonymous'}`}
                                    alt="Avatar"
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[var(--border-primary)] bg-[var(--bg-secondary)]"
                                />
                                <div className="flex-1 bg-[var(--bg-secondary)] rounded-full px-6 py-3.5 sm:py-4 text-[var(--text-secondary)] font-medium flex justify-between items-center group-hover:bg-[var(--border-primary)]/50 transition-colors">
                                    <span className="text-sm sm:text-base">Bir tasarım veya düşünceni paylaş...</span>
                                    <div className="flex items-center gap-3">
                                        <ImageIcon className="w-5 h-5 opacity-60" />
                                        <Send className="w-5 h-5 opacity-60" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 md:gap-0">
                            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start w-full md:w-auto flex-1">
                                <h2 className="text-3xl font-bold tracking-tight">Topluluk Akışı</h2>
                                <div className="flex items-center gap-1 p-1 bg-[var(--card-bg)] rounded-full border border-[var(--border-primary)] shadow-sm">
                                    <button
                                        onClick={() => setFeedSource('all')}
                                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${feedSource === 'all' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                    >
                                        Genel
                                    </button>
                                    <button
                                        onClick={() => setFeedSource('following')}
                                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 ${feedSource === 'following' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                    >
                                        <span>Takip Ettiklerim</span>
                                        {followedUsers.size > 0 && (
                                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${feedSource === 'following' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]' : 'bg-gray-200 text-gray-700'}`}>
                                                {followedUsers.size}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-center">
                                <span 
                                    onClick={() => setPostSort('new')}
                                    className={`px-4 py-2 text-xs font-bold rounded-full cursor-pointer transition-colors ${postSort === 'new' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                >
                                    En Yeni
                                </span>
                                <span 
                                    onClick={() => setPostSort('popular')}
                                    className={`px-4 py-2 text-xs font-bold rounded-full cursor-pointer transition-colors ${postSort === 'popular' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                >
                                    Popüler
                                </span>
                            </div>
                        </div>

                        {postsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
                                <div className="w-8 h-8 border-4 border-[#FF5500]/30 border-t-[#FF5500] rounded-full animate-spin mb-4" />
                                Gönderiler yükleniyor...
                            </div>
                        ) : [...posts].filter(p => feedSource === 'all' || (p.user_id && followedUsers.has(p.user_id))).sort((a, b) => postSort === 'popular' ? b.likes_count - a.likes_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).length === 0 ? (
                            <div className="text-center py-20 text-[var(--text-secondary)] bg-[var(--card-bg)] rounded-[40px] border border-[var(--border-primary)] shadow-sm px-6">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-[var(--color-brand-orange)]" />
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                                    {feedSource === 'following' ? 'Takip ettiğin kişilerin henüz bir gönderisi yok' : 'Henüz gönderi yok'}
                                </h3>
                                <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                                    {feedSource === 'following' ? 'Beğendiğin tasarımcıları takip ederek aksiyonlarını buradan anlık izleyebilirsin.' : 'Toplulukta ilk paylaşan sen ol!'}
                                </p>
                            </div>
                        ) : [...posts].filter(p => feedSource === 'all' || (p.user_id && followedUsers.has(p.user_id))).sort((a, b) => postSort === 'popular' ? b.likes_count - a.likes_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((post) => {
                            const rawGorsel = post.analizler?.gorsel_url || post.gorsel_url;
                            const imageSrc = rawGorsel ? (rawGorsel.startsWith('http') || rawGorsel.startsWith('data:') ? rawGorsel : `data:image/jpeg;base64,${rawGorsel}`) : null;

                            const isAuthorCurrent = kullanici && kullanici.id === post.user_id;
                            const currentUserName = kullanici?.user_metadata?.display_name || kullanici?.user_metadata?.full_name || kullanici?.email?.split('@')[0];
                            const currentUserAvatar = kullanici?.user_metadata?.avatar_url;

                            let authorName = post.profiles?.display_name || (post.analizler?.user_name && post.analizler.user_name !== 'Gizli Tasarımcı' ? post.analizler.user_name : null);
                            if (!authorName) {
                                authorName = isAuthorCurrent ? (currentUserName || 'Tasarımcı') : 'Tasarımcı';
                            }

                            let authorAvatar = post.profiles?.avatar_url || post.analizler?.user_avatar;
                            if (!authorAvatar) {
                                authorAvatar = isAuthorCurrent ? currentUserAvatar : null;
                            }
                            if (!authorAvatar) {
                                authorAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${post.user_id || post.id}`;
                            }

                            let authorSlug = post.profiles?.slug || 'tasarimci';

                            return (
                            <motion.div
                                key={post.id}
                                id={`post-${post.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-[var(--card-bg)] p-6 md:p-8 rounded-[40px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="flex flex-col gap-4">
                                    <Link to={`/${authorSlug}`} className="flex items-center gap-4 group/profile">
                                        <img
                                            src={authorAvatar}
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] object-cover shrink-0 group-hover/profile:border-[var(--color-brand-orange)] transition-colors"
                                            alt="Avatar"
                                        />
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-bold text-base md:text-lg text-[var(--text-primary)] truncate group-hover/profile:text-[var(--color-brand-orange)] transition-colors flex items-center gap-1.5">
                                                    <span>{authorName}</span>
                                                    <VerifiedBadge badge={post.profiles?.verification_badge} size="xs" />
                                                    <ProBadge isPro={post.profiles?.is_pro} role={post.profiles?.role} size="xs" />
                                                </span>
                                                {post.user_id && kullanici && kullanici.id !== post.user_id && !followedUsers.has(post.user_id) && (
                                                    <button 
                                                        onClick={(e) => handleFollow(e, post.user_id)}
                                                        className="ml-2 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors"
                                                    >
                                                        Takip Et
                                                    </button>
                                                )}
                                                {post.is_featured && (
                                                    <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md shrink-0 flex items-center gap-1" title="Keşfette Öne Çıkan">
                                                        <Sparkles className="w-3 h-3 fill-amber-500" /> Öne Çıkan
                                                    </span>
                                                )}
                                                {post.analizler?.genel_puan && (
                                                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md shrink-0 flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-amber-500" /> {post.analizler.genel_puan} AI
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[var(--text-secondary)] text-xs">{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </Link>
                                    <div className="w-full min-w-0">
                                        {post.title && <h3 className="font-bold text-[var(--text-primary)] mb-2 break-words [word-break:break-word] [overflow-wrap:anywhere]">{post.title}</h3>}
                                        <p className="text-[var(--text-secondary)] leading-relaxed mb-6 whitespace-pre-wrap break-words [word-break:break-word] [overflow-wrap:anywhere]">
                                            {post.content ? (
                                                post.content.split(/(https?:\/\/[^\s]+)/g).map((part: string, idx: number) => {
                                                    if (part.match(/^https?:\/\//)) {
                                                        return (
                                                            <a
                                                                key={idx}
                                                                href={part}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-[#FF5500] hover:underline font-semibold break-all [word-break:break-all] [overflow-wrap:anywhere]"
                                                            >
                                                                {part}
                                                            </a>
                                                        );
                                                    }
                                                    return part;
                                                })
                                            ) : 'Bu tasarım analiz edildi.'}
                                        </p>
                                        
                                        {(() => {
                                            const postImages: string[] = [];
                                            const mainImg = post.analizler?.gorsel_url || post.gorsel_url;
                                            if (mainImg) postImages.push(mainImg);
                                            if (Array.isArray(post.extra_images)) {
                                                post.extra_images.forEach((img: string) => {
                                                    if (img && typeof img === 'string' && !postImages.includes(img)) {
                                                        postImages.push(img);
                                                    }
                                                });
                                            }

                                            if (postImages.length === 0) return null;

                                            return (
                                                <div className="relative mb-6">
                                                    {postImages.length === 1 ? (
                                                        <div 
                                                            className="relative aspect-video max-h-[420px] rounded-3xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-primary)] cursor-zoom-in group"
                                                            onClick={() => setSeciliGorsel({ images: postImages, index: 0 })}
                                                        >
                                                            <img
                                                                src={postImages[0]}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                                                alt="Post thumbnail"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    ) : postImages.length === 2 ? (
                                                        <div className="grid grid-cols-2 gap-2.5 aspect-video max-h-[380px]">
                                                            {postImages.map((img, idx) => (
                                                                <div 
                                                                    key={idx}
                                                                    className="relative rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-primary)] cursor-zoom-in group h-full"
                                                                    onClick={() => setSeciliGorsel({ images: postImages, index: idx })}
                                                                >
                                                                    <img src={img} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-3 gap-2 aspect-video max-h-[380px]">
                                                            {postImages.slice(0, 3).map((img, idx) => (
                                                                <div 
                                                                    key={idx}
                                                                    className="relative rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-primary)] cursor-zoom-in group h-full"
                                                                    onClick={() => setSeciliGorsel({ images: postImages, index: idx })}
                                                                >
                                                                    <img src={img} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                                                                    {idx === 2 && postImages.length > 3 && (
                                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-lg backdrop-blur-xs">
                                                                            +{postImages.length - 3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {postImages.length > 1 && (
                                                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md border border-white/20 pointer-events-none">
                                                            <Images size={12} className="text-[#FF5500]" />
                                                            <span>{postImages.length} Görsel</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        
                                        <div className="flex items-center justify-between mt-6">
                                            <div className="flex items-center gap-6">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                                                    className={`flex items-center gap-2 transition-colors text-sm font-bold ${likedPosts.has(post.id) ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'}`}
                                                >
                                                    <Heart size={18} className={likedPosts.has(post.id) ? 'fill-red-500' : ''} /> {post.likes_count}
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleInlineComments(post.id); }}
                                                    className={`flex items-center gap-2 transition-colors text-sm font-bold ${openInlinePostId === post.id ? 'text-[var(--color-brand-orange)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                                >
                                                    <MessageCircle size={18} /> {post.comments_count}
                                                </button>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleReportClick(post.id, 'post'); }}
                                                className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]/50 hover:text-amber-500 transition-colors"
                                            >
                                                <Flag size={14} /> Şikayet Et
                                            </button>
                                        </div>

                                        {/* Instagram Style Inline Comments Panel */}
                                        {openInlinePostId === post.id && (
                                            <div className="mt-5 pt-5 border-t border-[var(--border-primary)] space-y-4" onClick={(e) => e.stopPropagation()}>
                                                {inlineLoading[post.id] ? (
                                                    <div className="flex justify-center py-4 text-[var(--text-secondary)]">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    </div>
                                                ) : (inlineComments[post.id] || []).length === 0 ? (
                                                    <p className="text-xs text-[var(--text-secondary)] text-center py-2 italic">
                                                        Henüz yorum yapılmamış. İlk yorumu sen bırak!
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2.5">
                                                        {(() => {
                                                            const rawComments = inlineComments[post.id] || [];
                                                            const threadComments = organizeCommentsIntoThreads(rawComments);
                                                            const isExpanded = expandedComments[post.id];
                                                            const visibleComments = isExpanded ? threadComments : threadComments.slice(0, 2);

                                                            return (
                                                                <>
                                                                    {visibleComments.map((c: any) => {
                                                                        const isCAuthorCurrent = kullanici && kullanici.id === c.user_id;
                                                                        const cName = c.profiles?.display_name || c.user_name || (isCAuthorCurrent ? (kullanici.user_metadata?.display_name || 'Tasarımcı') : 'Tasarımcı');
                                                                        const cAvatar = (isCAuthorCurrent && kullanici.user_metadata?.avatar_url) ? kullanici.user_metadata.avatar_url : (c.profiles?.avatar_url || c.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${c.user_id}`);
                                                                        const cSlug = c.profiles?.slug || c.user_id;
                                                                        const isEditing = editingCommentId === c.id;

                                                                        return (
                                                                        <div key={c.id} className="bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-primary)] text-xs space-y-2.5">
                                                                            {/* Parent Comment */}
                                                                            <div className="flex gap-3">
                                                                                <Link to={`/${cSlug}`}>
                                                                                    <img src={cAvatar} className="w-7 h-7 rounded-full object-cover shrink-0 hover:opacity-80 transition-opacity" alt="" />
                                                                                </Link>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className="flex justify-between items-center mb-0.5">
                                                                                        <Link to={`/${cSlug}`} className="font-bold text-[var(--text-primary)] hover:text-[var(--color-brand-orange)] transition-colors">
                                                                                            {cName}
                                                                                        </Link>
                                                                                        <span className="text-[10px] text-[var(--text-secondary)]">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
                                                                                    </div>

                                                                                    {isEditing ? (
                                                                                        <div className="mt-1.5 space-y-2">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={editingCommentText}
                                                                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                                                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--color-brand-orange)] bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none"
                                                                                                autoFocus
                                                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditComment(post.id, c.id); }}
                                                                                            />
                                                                                            <div className="flex justify-end gap-1.5">
                                                                                                <button
                                                                                                    onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }}
                                                                                                    className="px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] rounded-lg"
                                                                                                >
                                                                                                    İptal
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleSaveEditComment(post.id, c.id)}
                                                                                                    className="px-3 py-1 text-[10px] font-bold bg-[var(--color-brand-orange)] text-white rounded-lg hover:bg-[#e64500]"
                                                                                                >
                                                                                                    Kaydet
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <>
                                                                                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                                                                                <FormattedCommentText text={c.content} />
                                                                                            </p>
                                                                                            <div className="mt-2 flex items-center justify-end gap-2.5">
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        const cleanTag = getCleanUserTag(c.profiles ? { display_name: c.profiles.display_name, slug: c.profiles.slug } : { display_name: cName, slug: cSlug });
                                                                                                        setInlineReplyTarget(prev => ({ ...prev, [post.id]: { name: cName, slug: cleanTag, userId: c.user_id } }));
                                                                                                        setCommentInput(`@${cleanTag} `);
                                                                                                    }}
                                                                                                    className="text-[10px] font-bold text-[var(--color-brand-orange)] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                                                                                                >
                                                                                                    <Reply size={10} /> Cevapla
                                                                                                </button>
                                                                                                {isCAuthorCurrent ? (
                                                                                                    <>
                                                                                                        <button
                                                                                                            onClick={(e) => { e.stopPropagation(); setEditingCommentId(c.id); setEditingCommentText(c.content); }}
                                                                                                            className="text-[10px] font-bold text-[var(--text-secondary)]/60 hover:text-[var(--color-brand-orange)] transition-colors flex items-center gap-1"
                                                                                                        >
                                                                                                            <Pencil size={10} /> Düzenle
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteComment(post.id, c.id); }}
                                                                                                            className="text-[10px] font-bold text-[var(--text-secondary)]/60 hover:text-red-500 transition-colors flex items-center gap-1"
                                                                                                        >
                                                                                                            <Trash2 size={10} /> Sil
                                                                                                        </button>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <button 
                                                                                                        onClick={(e) => { e.stopPropagation(); handleReportClick(c.id, 'comment'); }}
                                                                                                        className="text-[10px] font-bold text-[var(--text-secondary)]/40 hover:text-amber-500 transition-colors flex items-center gap-1"
                                                                                                    >
                                                                                                        <Flag size={10} /> Şikayet
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Nested Replies inside the SAME outer box */}
                                                                            {c.replies && c.replies.length > 0 && (
                                                                                <div className="pl-3 md:pl-4 border-l-2 border-[#FF5500]/40 space-y-2 mt-2 pt-2 border-t border-[var(--border-primary)]/40">
                                                                                    {c.replies.map((reply: any) => {
                                                                                        const isReplyAuthorCurrent = kullanici && kullanici.id === reply.user_id;
                                                                                        const replyName = reply.profiles?.display_name || reply.user_name || (isReplyAuthorCurrent ? (kullanici.user_metadata?.display_name || 'Tasarımcı') : 'Tasarımcı');
                                                                                        const replyAvatar = (isReplyAuthorCurrent && kullanici.user_metadata?.avatar_url) ? kullanici.user_metadata.avatar_url : (reply.profiles?.avatar_url || reply.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${reply.user_id}`);
                                                                                        const replySlug = reply.profiles?.slug || reply.user_id;
                                                                                        const isReplyEditing = editingCommentId === reply.id;

                                                                                        return (
                                                                                            <div key={reply.id} className="flex gap-2.5 bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-primary)] text-xs">
                                                                                                <Link to={`/${replySlug}`}>
                                                                                                    <img src={replyAvatar} className="w-6 h-6 rounded-full object-cover shrink-0 hover:opacity-80 transition-opacity" alt="" />
                                                                                                </Link>
                                                                                                <div className="min-w-0 flex-1">
                                                                                                    <div className="flex justify-between items-center mb-0.5">
                                                                                                        <Link to={`/${replySlug}`} className="font-bold text-[var(--text-primary)] hover:text-[var(--color-brand-orange)] transition-colors text-[11px]">
                                                                                                            {replyName}
                                                                                                        </Link>
                                                                                                        <span className="text-[9px] text-[var(--text-secondary)]">{new Date(reply.created_at).toLocaleDateString('tr-TR')}</span>
                                                                                                    </div>

                                                                                                    {isReplyEditing ? (
                                                                                                        <div className="mt-1 space-y-2">
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                value={editingCommentText}
                                                                                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                                                                                className="w-full px-2 py-1 text-xs rounded-xl border border-[var(--color-brand-orange)] bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none"
                                                                                                                autoFocus
                                                                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditComment(post.id, reply.id); }}
                                                                                                            />
                                                                                                            <div className="flex justify-end gap-1.5">
                                                                                                                <button onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }} className="px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">İptal</button>
                                                                                                                <button onClick={() => handleSaveEditComment(post.id, reply.id)} className="px-2 py-0.5 text-[10px] font-bold bg-[var(--color-brand-orange)] text-white rounded-lg">Kaydet</button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                                                                                                                <FormattedCommentText text={reply.content} />
                                                                                                            </p>
                                                                                                            <div className="mt-1.5 flex items-center justify-end gap-2.5">
                                                                                                                <button
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        const cleanTag = getCleanUserTag(reply.profiles ? { display_name: reply.profiles.display_name, slug: reply.profiles.slug } : { display_name: replyName, slug: replySlug });
                                                                                                                        setInlineReplyTarget(prev => ({ ...prev, [post.id]: { name: replyName, slug: cleanTag, userId: reply.user_id } }));
                                                                                                                        setCommentInput(`@${cleanTag} `);
                                                                                                                    }}
                                                                                                                    className="text-[10px] font-bold text-[var(--color-brand-orange)] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                                                                                                                >
                                                                                                                    <Reply size={10} /> Cevapla
                                                                                                                </button>
                                                                                                                {isReplyAuthorCurrent ? (
                                                                                                                    <>
                                                                                                                        <button onClick={(e) => { e.stopPropagation(); setEditingCommentId(reply.id); setEditingCommentText(reply.content); }} className="text-[10px] font-bold text-[var(--text-secondary)]/60 hover:text-[var(--color-brand-orange)] transition-colors flex items-center gap-1">
                                                                                                                            <Pencil size={10} /> Düzenle
                                                                                                                        </button>
                                                                                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteComment(post.id, reply.id); }} className="text-[10px] font-bold text-[var(--text-secondary)]/60 hover:text-red-500 transition-colors flex items-center gap-1">
                                                                                                                            <Trash2 size={10} /> Sil
                                                                                                                        </button>
                                                                                                                    </>
                                                                                                                ) : (
                                                                                                                    <button onClick={(e) => { e.stopPropagation(); handleReportClick(reply.id, 'comment'); }} className="text-[10px] font-bold text-[var(--text-secondary)]/40 hover:text-amber-500 transition-colors flex items-center gap-1">
                                                                                                                        <Flag size={10} /> Şikayet
                                                                                                                    </button>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        );
                                                                    })}

                                                                    {threadComments.length > 2 && (
                                                                        <button
                                                                            onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                                                                            className="text-xs font-bold text-[var(--color-brand-orange)] hover:underline pt-1 text-left block"
                                                                        >
                                                                            {isExpanded ? 'Yorumları daralt' : `Diğer ${threadComments.length - 2} konuyu daha gör...`}
                                                                        </button>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}

                                                {/* Input box with @ Mentions & Replying Banner */}
                                                <div className="pt-1">
                                                    <CommentInputWithMentions
                                                        value={commentInput}
                                                        onChange={setCommentInput}
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            submitInlineComment(post.id);
                                                            setInlineReplyTarget(prev => ({ ...prev, [post.id]: null }));
                                                        }}
                                                        submitting={submittingComment}
                                                        replyTarget={inlineReplyTarget[post.id]}
                                                        onCancelReply={() => setInlineReplyTarget(prev => ({ ...prev, [post.id]: null }))}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                            );
                        })}

                        <button className="w-full py-6 rounded-[32px] border-2 border-dashed border-[var(--border-primary)] text-[var(--text-secondary)] font-bold hover:border-[var(--color-brand-orange)] hover:text-[var(--color-brand-orange)] transition-all">
                            Daha Fazla Göster
                        </button>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-12">

                        {/* Leaderboard */}
                        <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-primary)]">
                                <Trophy className="text-[var(--color-brand-orange)] w-5 h-5" />
                                <h3 className="font-semibold text-lg text-[var(--text-primary)]">Liderlik Tablosu</h3>
                            </div>
                            <div className="space-y-3">
                                {leaderboard.length === 0 ? (
                                    <div className="py-6 px-4 text-center bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]">
                                        <Trophy className="w-8 h-8 text-[var(--text-secondary)]/30 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed">
                                            Henüz aktif liderlik sıralaması oluşmadı.<br />İlk analizi yapıp zirveye çıkan sen ol! 🚀
                                        </p>
                                    </div>
                                ) : (
                                    leaderboard.slice(0, 5).map((user, i) => {
                                        const isLeaderCurrent = kullanici && kullanici.id === user.id;

                                        return (
                                            <div key={user.id} onClick={() => navigate(`/${user.slug || user.id}`)} className="flex items-center gap-3 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                                                <div className="relative flex-shrink-0">
                                                    {user.verification_badge === 'gold' ? (
                                                        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-orange-300 via-orange-500 to-amber-500 shadow-[0_0_10px_rgba(255,120,0,0.4)]">
                                                            <div className="w-full h-full rounded-full overflow-hidden border border-[var(--card-bg)]">
                                                                <img
                                                                    src={isLeaderCurrent && kullanici?.user_metadata?.avatar_url ? kullanici.user_metadata.avatar_url : (user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`)}
                                                                    className="w-full h-full object-cover"
                                                                    alt="Avatar"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full border border-[var(--border-primary)] relative z-10 overflow-hidden shadow-sm">
                                                            <img
                                                                src={isLeaderCurrent && kullanici?.user_metadata?.avatar_url ? kullanici.user_metadata.avatar_url : (user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`)}
                                                                className="w-full h-full object-cover"
                                                                alt="Avatar"
                                                            />
                                                        </div>
                                                    )}
                                                    {i === 0 && (
                                                        <Crown className="absolute -top-2.5 -right-2 text-amber-500 w-5 h-5 drop-shadow-sm z-20" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--color-brand-orange)] transition-colors truncate flex items-center gap-1.5">
                                                        <span>{isLeaderCurrent ? (kullanici?.user_metadata?.display_name || kullanici?.user_metadata?.full_name || user.display_name || 'Tasarımcı') : (user.display_name || 'Tasarımcı')}</span>
                                                        <VerifiedBadge badge={user.verification_badge} size="xs" />
                                                    </p>
                                                    <p className="text-[11px] text-[var(--text-secondary)] font-normal truncate flex items-center gap-1">
                                                        <span>{RANK_DISPLAY_MAP[user.design_rank || ''] || user.design_rank || 'Tasarımcı'}</span>
                                                        {user.verification_badge === 'gold' && (
                                                            <span className="inline-flex items-center text-[9px] font-black text-orange-500 bg-orange-50 px-1 py-0.5 rounded-full border border-orange-200 uppercase tracking-wide">✦ Kurucu</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end flex-shrink-0">
                                                    <span className="text-sm font-semibold text-[var(--text-primary)]">#{i + 1}</span>
                                                    <span className="text-xs text-[var(--text-secondary)]">{user.total_xp?.toLocaleString('tr-TR')} XP</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    navigate('/leaderboard');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-full mt-6 py-3 px-4 bg-transparent hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[13px] font-medium text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2 group"
                            >
                                <span>Tüm Sıralamayı Gör</span>
                                <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                            </button>
                        </div>

                        {/* Badge Goals */}
                        <div className="bg-[var(--card-bg)] p-8 rounded-[32px] border border-[var(--border-primary)] shadow-sm">
                            <div className="flex items-center justify-between gap-3 mb-2 md:mb-6 cursor-pointer md:cursor-default" onClick={() => { if (window.innerWidth < 768) setIsBadgesExpanded(!isBadgesExpanded); }}>
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-[var(--color-brand-orange)] w-6 h-6" />
                                    <h3 className="font-bold text-xl tracking-tight text-[var(--text-primary)]">Kazanılabilir Rozetler</h3>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-[var(--text-secondary)] transition-transform md:hidden ${isBadgesExpanded ? 'rotate-180' : ''}`} />
                            </div>
                            <AnimatePresence initial={false}>
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }} 
                                    animate={{ height: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'auto' : (isBadgesExpanded ? 'auto' : 0), opacity: typeof window !== 'undefined' && window.innerWidth >= 768 ? 1 : (isBadgesExpanded ? 1 : 0) }} 
                                    className="overflow-hidden md:!h-auto md:!opacity-100"
                                >
                                    <div className="grid grid-cols-2 gap-3 pt-4 md:pt-0">
                                        {[
                                            { title: 'Challenge Şampiyonu', note: 'Haftanın en yüksek puanı' },
                                            { title: 'En Aktif Üye', note: 'Düzenli yorum ve paylaşım' },
                                            { title: 'Puan Ustası', note: 'En çok değerlendirme yapan' },
                                            { title: 'Davetçi', note: 'Arkadaş getiren üyeler' },
                                        ].map((badge) => (
                                            <div key={badge.title} className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
                                                <p className="text-xs font-black text-[var(--text-primary)]">{badge.title}</p>
                                                <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--text-secondary)]">{badge.note}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Weekly Challenge — Real Active Contest Data */}
                        <div className="bg-[#111] p-8 rounded-[40px] text-white overflow-hidden relative border border-white/10 shadow-xl">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-brand-orange)]/10 blur-[60px] rounded-full pointer-events-none" />
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <Crown className="text-[var(--color-brand-orange)] w-6 h-6" />
                                <h3 className="font-bold text-xl tracking-tight">Haftalık Yarışma</h3>
                            </div>

                            {activeContest ? (
                                <div className="relative z-10 space-y-4">
                                    <div 
                                        onClick={() => navigate(`/yarisma/${activeContest.slug || activeContest.id}`)}
                                        className="relative rounded-3xl overflow-hidden aspect-video bg-[#0c0c0e] group cursor-pointer border border-white/10 shadow-md"
                                    >
                                        {activeContest.cover_images && activeContest.cover_images[0] && (
                                            <img 
                                                src={activeContest.cover_images[0]} 
                                                className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500" 
                                                alt={activeContest.title} 
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                                            <span className="self-start px-3 py-1 bg-[var(--color-brand-orange)] text-white text-[10px] font-black rounded-full mb-2 uppercase tracking-widest shadow">YAYINDA</span>
                                            <h4 className="font-extrabold text-lg text-white mb-1 leading-tight group-hover:text-[var(--color-brand-orange)] transition-colors">{activeContest.title}</h4>
                                            <p className="text-white/70 text-xs font-semibold">{contestParticipantCount} Katılımcı</p>
                                        </div>
                                    </div>

                                    <p className="text-white/70 text-xs leading-relaxed line-clamp-2">{activeContest.short_description}</p>

                                    <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Kalan Süre</p>
                                            <p className="text-xs font-black text-[var(--color-brand-orange)]">{contestTimeLeft}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Yarışma Ödülü</p>
                                            <p className="text-xs font-bold text-white/90 truncate max-w-[140px]">{activeContest.reward_title || 'Ödüllü Yarışma'}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/yarisma/${activeContest.slug || activeContest.id}`)}
                                        className="w-full py-3.5 rounded-2xl text-xs font-black transition-all bg-[var(--color-brand-orange)] text-white hover:bg-[#e64500] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Yarışmaya Katıl & Detaylar →
                                    </button>
                                </div>
                            ) : (
                                <div className="relative z-10 text-center py-6">
                                    <Crown className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                    <p className="text-white/40 text-sm font-semibold">Şu an aktif yarışma yok.</p>
                                    <p className="text-white/30 text-xs mt-1">Yakında yeni bir yarışma başlayacak!</p>
                                </div>
                            )}
                        </div>


                        {/* Quick Tips */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg px-4 text-[var(--text-primary)]">Küçük İpuçları</h3>
                            {[
                                'Beyaz alanı (white space) korkmadan kullanın.',
                                'Tipografide hiyerarşi her şeydir.',
                                'Kısıtlı renk paleti her zaman daha lükstür.'
                            ].map((tip, i) => (
                                <div key={i} className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] flex gap-3">
                                    <Star className="w-5 h-5 text-[var(--color-brand-orange)] flex-shrink-0" />
                                    <p className="text-sm font-medium leading-relaxed italic text-[var(--text-secondary)]">"{tip}"</p>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </main>

            <AnimatePresence>
                {seciliGorsel && seciliGorsel.images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 bg-black/92 backdrop-blur-md select-none"
                        onClick={() => setSeciliGorsel(null)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-black/40 hover:bg-black/80 border border-white/20 rounded-full p-2.5 z-[10002] transition-all cursor-pointer shadow-xl backdrop-blur-md"
                            onClick={() => setSeciliGorsel(null)}
                            aria-label="Kapat"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Top Image Counter */}
                        {seciliGorsel.images.length > 1 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-black tracking-widest border border-white/20 z-[10002] shadow-lg flex items-center gap-1.5">
                                <Images size={14} className="text-[#FF5500]" />
                                <span>{seciliGorsel.index + 1} / {seciliGorsel.images.length}</span>
                            </div>
                        )}

                        {/* Left/Right Navigation Chevron Buttons (Desktop & Mobile) */}
                        {seciliGorsel.images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSeciliGorsel(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
                                    }}
                                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-[#FF5500] text-white shadow-2xl backdrop-blur-md border border-white/20 transition-all z-[10002] cursor-pointer active:scale-90 flex items-center justify-center"
                                    aria-label="Önceki Görsel"
                                >
                                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSeciliGorsel(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
                                    }}
                                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-[#FF5500] text-white shadow-2xl backdrop-blur-md border border-white/20 transition-all z-[10002] cursor-pointer active:scale-90 flex items-center justify-center"
                                    aria-label="Sonraki Görsel"
                                >
                                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                </button>
                            </>
                        )}

                        {/* Image Display Container with Touch Swipe Support */}
                        <div
                            className="relative z-[10000] max-w-4xl w-full flex flex-col items-center justify-center my-auto pointer-events-auto px-4"
                            onClick={(e) => e.stopPropagation()}
                            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                            onTouchEnd={(e) => {
                                if (touchStartX === null || !seciliGorsel || seciliGorsel.images.length <= 1) return;
                                const touchEndX = e.changedTouches[0].clientX;
                                const diff = touchStartX - touchEndX;
                                if (diff > 40) {
                                    setSeciliGorsel(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
                                } else if (diff < -40) {
                                    setSeciliGorsel(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
                                }
                                setTouchStartX(null);
                            }}
                        >
                            <img
                                src={seciliGorsel.images[seciliGorsel.index] || seciliGorsel.images[0]}
                                alt="Büyütülmüş Görsel"
                                className="w-auto h-auto max-w-full max-h-[68vh] sm:max-h-[74vh] object-contain rounded-2xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] transition-all duration-300 select-none"
                            />

                            {/* Bottom Thumbnails */}
                            {seciliGorsel.images.length > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4 max-w-full p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 overflow-x-auto">
                                    {seciliGorsel.images.map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSeciliGorsel(prev => prev ? { ...prev, index: idx } : null);
                                            }}
                                            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                                idx === seciliGorsel.index 
                                                    ? 'border-[#FF5500] scale-105 shadow-lg shadow-[#FF5500]/40' 
                                                    : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                                            }`}
                                        >
                                            <img src={imgUrl} alt={`Önizleme ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {yeniGonderiModalAcik && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setYeniGonderiModalAcik(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[32px] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-8 pt-8 pb-6 border-b border-[var(--border-primary)]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-[#FF5500]/10 rounded-full flex items-center justify-center text-[#FF5500]">
                                        <Pencil className="w-6 h-6" />
                                    </div>
                                    <button onClick={() => setYeniGonderiModalAcik(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="text-2xl font-black text-[var(--text-primary)]">Yeni Gönderi</h3>
                                <p className="text-[var(--text-secondary)] mt-1">Toplulukla fikirlerini veya tasarımlarını paylaş.</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Başlık (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        value={yeniGonderiBaslik}
                                        onChange={(e) => setYeniGonderiBaslik(e.target.value)}
                                        placeholder="Örn: Yeni tasarım trendleri hakkında..."
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF5500] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">İçerik</label>
                                    <textarea
                                        value={yeniGonderiIcerik}
                                        onChange={(e) => setYeniGonderiIcerik(e.target.value)}
                                        placeholder="Düşüncelerini paylaş..."
                                        rows={4}
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF5500] transition-colors resize-none"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-[var(--text-primary)]">Görseller (Opsiyonel, En Fazla 3 Adet)</label>
                                        <span className="text-xs font-semibold text-[var(--text-secondary)]">{yeniGonderiGorseller.length}/3</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        {yeniGonderiGorseller.map((file, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-primary)] group bg-[var(--bg-secondary)]">
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    alt={`Önizleme ${idx + 1}`} 
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setYeniGonderiGorseller(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-500 text-white rounded-full transition-colors shadow-md z-10"
                                                    title="Görseli Kaldır"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}

                                        {yeniGonderiGorseller.length < 3 && (
                                            <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-[var(--border-primary)] hover:border-[#FF5500] bg-[var(--bg-secondary)] hover:bg-[#FF5500]/5 transition-colors cursor-pointer text-center p-2 group">
                                                <ImageIcon className="w-6 h-6 text-[#FF5500] mb-1 group-hover:scale-110 transition-transform" />
                                                <span className="text-[11px] font-bold text-[var(--text-primary)]">Görsel Ekle</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const selectedFiles = Array.from(e.target.files || []);
                                                        if (selectedFiles.length === 0) return;
                                                        setYeniGonderiGorseller(prev => {
                                                            const combined = [...prev, ...selectedFiles];
                                                            if (combined.length > 3) {
                                                                toast.error('En fazla 3 görsel ekleyebilirsiniz.');
                                                                return combined.slice(0, 3);
                                                            }
                                                            return combined;
                                                        });
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={submitDirectPost}
                                    disabled={gonderiliyor}
                                    className="w-full py-4 bg-[#FF5500] text-white font-bold rounded-xl shadow-md shadow-[#FF5500]/20 hover:bg-[#e64d00] transition-colors flex items-center justify-center gap-2"
                                >
                                    {gonderiliyor ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                                    {gonderiliyor ? 'Gönderiliyor...' : 'Paylaş'}
                                </button>
                            </div>
                        </motion.div>
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
