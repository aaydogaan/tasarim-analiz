import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, FileText, ArrowRight, Loader2, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { VerifiedBadge } from './VerifiedBadge';

interface SearchUser {
    id: string;
    slug?: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    design_rank?: string;
    verification_badge?: string;
}

interface SearchPost {
    id: string;
    content: string;
    created_at: string;
    profiles: {
        display_name: string;
        avatar_url?: string;
        slug?: string;
    } | null;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const RANK_LABELS: Record<string, string> = {
    'stajyer': 'Stajyer Tasarimci',
    'junior': 'Junior Tasarimci',
    'tasarimci': 'Tasarimci',
    'senior': 'Senior Tasarimci',
    'art-direktor': 'Art Direktor',
    'tasarim-direktoru': 'Tasarim Direktoru',
};

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<SearchUser[]>([]);
    const [posts, setPosts] = useState<SearchPost[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const debouncedQuery = useDebounce(query.trim(), 280);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setUsers([]);
            setPosts([]);
            setSelectedIndex(-1);
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const performSearch = useCallback(async (q: string) => {
        if (!q || q.length < 2) {
            setUsers([]);
            setPosts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [userRes, postRes] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, slug, display_name, avatar_url, bio, design_rank, verification_badge')
                    .or(`display_name.ilike.%${q}%,slug.ilike.%${q}%,bio.ilike.%${q}%`)
                    .limit(6),
                supabase
                    .from('community_posts')
                    .select('id, content, created_at, profiles:user_id(display_name, avatar_url, slug)')
                    .ilike('content', `%${q}%`)
                    .order('created_at', { ascending: false })
                    .limit(4),
            ]);
            setUsers(userRes.data || []);
            setPosts((postRes.data || []) as unknown as SearchPost[]);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        performSearch(debouncedQuery);
    }, [debouncedQuery, performSearch]);

    const allResultsLength = users.length + posts.length;

    const handleSelectUser = (user: SearchUser) => {
        onClose();
        setQuery('');
        navigate(`/${user.slug || user.id}`);
    };

    const handleSelectPost = () => {
        onClose();
        setQuery('');
        navigate('/community');
    };

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, allResultsLength - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, -1));
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                if (selectedIndex < users.length) {
                    handleSelectUser(users[selectedIndex]);
                } else {
                    handleSelectPost();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, selectedIndex, allResultsLength]);

    const hasResults = users.length > 0 || posts.length > 0;
    const showEmpty = debouncedQuery.length >= 2 && !loading && !hasResults;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[900]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -20 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-[901] px-4"
                    >
                        <div className="bg-[var(--card-bg)] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] border border-[var(--border-primary)] overflow-hidden">
                            {/* Input */}
                            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-primary)]">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 text-[var(--color-brand-orange)] shrink-0 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                                )}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={e => { setQuery(e.target.value); setSelectedIndex(-1); }}
                                    placeholder="Kullanici veya paylasim ara..."
                                    className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-base outline-none font-medium"
                                />
                                {query && (
                                    <button
                                        onClick={() => { setQuery(''); setUsers([]); setPosts([]); inputRef.current?.focus(); }}
                                        className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                                    >
                                        <X className="w-4 h-4 text-[var(--text-secondary)]" />
                                    </button>
                                )}
                                <kbd className="hidden sm:flex items-center text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-1.5 py-0.5 rounded-md">
                                    ESC
                                </kbd>
                            </div>

                            {/* Results area */}
                            <div className="max-h-[60vh] overflow-y-auto">
                                {showEmpty && (
                                    <div className="py-12 text-center">
                                        <Search className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            <span className="font-bold text-[var(--text-primary)]">"{debouncedQuery}"</span> icin sonuc bulunamadi.
                                        </p>
                                    </div>
                                )}

                                {!query && (
                                    <div className="py-10 text-center">
                                        <p className="text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
                                            <Command className="w-3.5 h-3.5" />
                                            <span>kullanici adi veya paylasim icerigi yazin</span>
                                        </p>
                                    </div>
                                )}

                                {/* Users */}
                                {users.length > 0 && (
                                    <div>
                                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                                            <User className="w-3 h-3" /> Kullanicilar
                                        </p>
                                        {users.map((user, idx) => {
                                            const isSelected = selectedIndex === idx;
                                            return (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleSelectUser(user)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isSelected ? 'bg-orange-50 dark:bg-orange-900/10 border-l-2 border-[var(--color-brand-orange)]' : 'hover:bg-[var(--bg-secondary)]'}`}
                                                >
                                                    {user.verification_badge === 'gold' ? (
                                                        <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-br from-orange-300 via-orange-500 to-amber-500 shrink-0 shadow-[0_0_8px_rgba(255,120,0,0.4)]">
                                                            <div className="w-full h-full rounded-full overflow-hidden border border-white">
                                                                <img
                                                                    src={user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`}
                                                                    className="w-full h-full object-cover"
                                                                    alt={user.display_name}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`}
                                                            className="w-9 h-9 rounded-full object-cover border border-[var(--border-primary)] shrink-0"
                                                            alt={user.display_name}
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                                                            <span className="truncate">{user.display_name}</span>
                                                            <VerifiedBadge badge={user.verification_badge} size="xs" />
                                                            {user.verification_badge === 'gold' && (
                                                                <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-1 py-0.5 rounded-full border border-orange-200 uppercase shrink-0">Kurucu</span>
                                                            )}
                                                        </p>
                                                        <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                                            {user.slug ? `@${user.slug}` : ''}
                                                            {user.design_rank ? ` - ${RANK_LABELS[user.design_rank] || user.design_rank}` : ''}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-[var(--color-brand-orange)]' : 'text-[var(--text-secondary)] opacity-30'}`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Posts */}
                                {posts.length > 0 && (
                                    <div className={users.length > 0 ? 'border-t border-[var(--border-primary)]/50' : ''}>
                                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                                            <FileText className="w-3 h-3" /> Paylasimlar
                                        </p>
                                        {posts.map((post, idx) => {
                                            const globalIdx = users.length + idx;
                                            const isSelected = selectedIndex === globalIdx;
                                            return (
                                                <button
                                                    key={post.id}
                                                    onClick={handleSelectPost}
                                                    className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left ${isSelected ? 'bg-orange-50 dark:bg-orange-900/10 border-l-2 border-[var(--color-brand-orange)]' : 'hover:bg-[var(--bg-secondary)]'}`}
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center shrink-0 overflow-hidden">
                                                        {post.profiles?.avatar_url ? (
                                                            <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-[var(--text-primary)] font-medium line-clamp-2 leading-snug">
                                                            {post.content}
                                                        </p>
                                                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                                                            {post.profiles?.display_name}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isSelected ? 'text-[var(--color-brand-orange)]' : 'text-[var(--text-secondary)] opacity-30'}`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {hasResults && (
                                <div className="px-4 py-2 border-t border-[var(--border-primary)]/50 bg-[var(--bg-secondary)]/30 flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-1 py-0.5 rounded text-[9px] font-bold">up/dn</kbd> gezin
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-1 py-0.5 rounded text-[9px] font-bold">Enter</kbd> sec
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-1 py-0.5 rounded text-[9px] font-bold">ESC</kbd> kapat
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

