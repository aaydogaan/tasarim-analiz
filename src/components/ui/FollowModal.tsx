import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserCheck, UserPlus, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { VerifiedBadge } from './VerifiedBadge';
import { getDesignRankById } from '../../lib/communityProfile';

interface FollowUser {
    id: string;
    display_name: string;
    avatar_url: string;
    slug?: string;
    design_rank?: string;
    verification_badge?: string;
}

interface FollowModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: string;
    targetUserName: string;
    initialTab?: 'followers' | 'following';
    currentUser?: any;
    onFollowChange?: () => void;
}

export default function FollowModal({
    isOpen,
    onClose,
    targetUserId,
    targetUserName,
    initialTab = 'followers',
    currentUser,
    onFollowChange,
}: FollowModalProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [myFollowingIds, setMyFollowingIds] = useState<Set<string>>(new Set());
    const [actionLoadingMap, setActionLoadingMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setSearchQuery('');
            loadData();
        }
    }, [isOpen, targetUserId, initialTab]);

    const loadData = async () => {
        if (!targetUserId) return;
        setLoading(true);

        try {
            // Fetch followers
            const { data: followerRows } = await supabase
                .from('user_follows')
                .select('follower_id, profiles:follower_id(id, display_name, avatar_url, slug, design_rank, verification_badge)')
                .eq('following_id', targetUserId);

            // Fetch following
            const { data: followingRows } = await supabase
                .from('user_follows')
                .select('following_id, profiles:following_id(id, display_name, avatar_url, slug, design_rank, verification_badge)')
                .eq('follower_id', targetUserId);

            const parsedFollowers = (followerRows || []).map((r: any) => r.profiles).filter(Boolean);
            const parsedFollowing = (followingRows || []).map((r: any) => r.profiles).filter(Boolean);

            setFollowers(parsedFollowers);
            setFollowing(parsedFollowing);

            // If current user logged in, fetch their own following list to show follow buttons correctly
            if (currentUser?.id) {
                const { data: myFollows } = await supabase
                    .from('user_follows')
                    .select('following_id')
                    .eq('follower_id', currentUser.id);

                const ids = new Set((myFollows || []).map((f: any) => f.following_id));
                setMyFollowingIds(ids);
            }
        } catch (err) {
            console.error('FollowModal load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFollowUser = async (userId: string) => {
        if (!currentUser?.id) {
            navigate('/auth?mode=kayit');
            return;
        }

        setActionLoadingMap(prev => ({ ...prev, [userId]: true }));
        const isCurrentlyFollowing = myFollowingIds.has(userId);

        try {
            if (isCurrentlyFollowing) {
                await supabase
                    .from('user_follows')
                    .delete()
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', userId);

                setMyFollowingIds(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            } else {
                await supabase
                    .from('user_follows')
                    .insert({
                        follower_id: currentUser.id,
                        following_id: userId,
                        notify_posts: true,
                    });

                setMyFollowingIds(prev => {
                    const next = new Set(prev);
                    next.add(userId);
                    return next;
                });
            }
            onFollowChange?.();
        } catch (err) {
            console.error('Toggle follow error:', err);
        } finally {
            setActionLoadingMap(prev => ({ ...prev, [userId]: false }));
        }
    };

    if (!isOpen) return null;

    const currentList = activeTab === 'followers' ? followers : following;
    const filteredList = currentList.filter(u =>
        (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-white dark:bg-[#16181c] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-10 flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                            {targetUserName}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Instagram Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                        <button
                            onClick={() => setActiveTab('followers')}
                            className={`flex-1 py-3 text-xs md:text-sm font-bold transition-all relative flex items-center justify-center gap-1.5 ${
                                activeTab === 'followers'
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            <span>Takipçiler</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                activeTab === 'followers'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                            }`}>
                                {followers.length}
                            </span>
                            {activeTab === 'followers' && (
                                <motion.div
                                    layoutId="followTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                                />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('following')}
                            className={`flex-1 py-3 text-xs md:text-sm font-bold transition-all relative flex items-center justify-center gap-1.5 ${
                                activeTab === 'following'
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            <span>Takip Edilenler</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                activeTab === 'following'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                            }`}>
                                {following.length}
                            </span>
                            {activeTab === 'following' && (
                                <motion.div
                                    layoutId="followTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                                />
                            )}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-100 dark:border-white/5">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Kullanıcı ara..."
                                className="w-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-orange-500/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* List Content */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar min-h-[260px] max-h-[380px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                <span className="text-xs font-semibold">Yükleniyor...</span>
                            </div>
                        ) : filteredList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 gap-2">
                                <Users className="w-10 h-10 stroke-[1.5] text-gray-300 dark:text-gray-600" />
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {searchQuery
                                        ? 'Aramaya uygun kullanıcı bulunamadı.'
                                        : activeTab === 'followers'
                                        ? 'Henüz takipçisi yok.'
                                        : 'Henüz kimseyi takip etmiyor.'}
                                </p>
                            </div>
                        ) : (
                            filteredList.map((user) => {
                                const isSelf = currentUser?.id === user.id;
                                const isFollowingThisUser = myFollowingIds.has(user.id);
                                const isBtnLoading = actionLoadingMap[user.id];
                                const rankTitle = getDesignRankById(user.design_rank).title;

                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        {/* Avatar + Info */}
                                        <div
                                            onClick={() => {
                                                onClose();
                                                navigate(`/${user.slug || user.id}`);
                                            }}
                                            className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 pr-2"
                                        >
                                            <img
                                                src={user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`}
                                                alt={user.display_name}
                                                className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-white/10 group-hover:border-orange-500 transition-colors shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-extrabold text-xs md:text-sm text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors truncate flex items-center gap-1.5">
                                                    <span>{user.display_name || 'Tasarımcı'}</span>
                                                    <VerifiedBadge badge={user.verification_badge} size="xs" />
                                                </p>
                                                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                                    {rankTitle}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {!isSelf && (
                                            <button
                                                onClick={() => handleToggleFollowUser(user.id)}
                                                disabled={isBtnLoading}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm ${
                                                    isFollowingThisUser
                                                        ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-gray-200 dark:border-white/10'
                                                        : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md'
                                                } disabled:opacity-50`}
                                            >
                                                {isBtnLoading ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : isFollowingThisUser ? (
                                                    <>
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                        <span>Takipte</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                        <span>Takip Et</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
