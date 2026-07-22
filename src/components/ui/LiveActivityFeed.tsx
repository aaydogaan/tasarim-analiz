import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Zap, X, Bell, UserPlus, UploadCloud, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Fallback demo activities if DB is empty or loading
const DEMO_ACTIVITIES = [
    { id: 'd1', text: "Bir tasarımcı az önce bir SaaS projesini analiz etti.", icon: Zap, color: "text-blue-500" },
    { id: 'd2', text: "Yeni bir e-ticaret arayüzü topluluk vitrinine eklendi.", icon: Sparkles, color: "text-amber-500" },
    { id: 'd3', text: "400+ tasarımcı şu an platformu aktif kullanıyor.", icon: Users, color: "text-emerald-500" },
];

export default function LiveActivityFeed() {
    const [activities, setActivities] = useState<any[]>([]);
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Fetch initial activities and setup realtime
    useEffect(() => {
        let isMounted = true;

        const loadActivities = async () => {
            try {
                // Fetch latest posts
                const { data: posts } = await supabase
                    .from('community_posts')
                    .select('id, title, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Fetch latest users
                const { data: users } = await supabase
                    .from('profiles')
                    .select('id, display_name, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5);

                const mixed: any[] = [];
                
                if (posts) {
                    posts.forEach(p => {
                        mixed.push({
                            id: `post-${p.id}`,
                            text: `Yeni bir tasarım paylaşıldı: "${p.title?.substring(0, 30) || 'Vitrin'}${p.title?.length > 30 ? '...' : ''}"`,
                            icon: UploadCloud,
                            color: "text-purple-500",
                            createdAt: new Date(p.created_at).getTime()
                        });
                    });
                }

                if (users) {
                    users.forEach(u => {
                        mixed.push({
                            id: `user-${u.id}`,
                            text: `${u.display_name?.substring(0, 15) || 'Yeni biri'} topluluğa katıldı!`,
                            icon: UserPlus,
                            color: "text-emerald-500",
                            createdAt: new Date(u.created_at).getTime()
                        });
                    });
                }

                mixed.sort((a, b) => b.createdAt - a.createdAt);

                if (isMounted) {
                    setActivities(mixed.length > 0 ? mixed.slice(0, 10) : DEMO_ACTIVITIES);
                }
            } catch (error) {
                console.error("Live feed error:", error);
                if (isMounted) setActivities(DEMO_ACTIVITIES);
            }
        };

        loadActivities();

        // Realtime subscriptions
        const postsSub = supabase.channel('feed_posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
                const newActivity = {
                    id: `post-${payload.new.id}`,
                    text: `Yeni bir tasarım paylaşıldı: "${payload.new.title?.substring(0, 30) || 'Vitrin'}"`,
                    icon: UploadCloud,
                    color: "text-purple-500",
                    createdAt: Date.now()
                };
                setActivities(prev => [newActivity, ...prev].slice(0, 10));
                setIndex(0); // Reset index to show newest
                setIsVisible(true); // Auto-open on new activity
            })
            .subscribe();

        const usersSub = supabase.channel('feed_users')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
                const newActivity = {
                    id: `user-${payload.new.id}`,
                    text: `${payload.new.display_name?.substring(0, 15) || 'Yeni biri'} topluluğa katıldı!`,
                    icon: UserPlus,
                    color: "text-emerald-500",
                    createdAt: Date.now()
                };
                setActivities(prev => [newActivity, ...prev].slice(0, 10));
                setIndex(0);
                setIsVisible(true);
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(postsSub);
            supabase.removeChannel(usersSub);
        };
    }, []);

    // Rotate activities
    useEffect(() => {
        if (!isVisible || activities.length === 0) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % activities.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [isVisible, activities.length]);

    const current = activities[index] || DEMO_ACTIVITIES[0];

    return (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:left-6 md:right-auto z-[90] flex items-end">
            <AnimatePresence mode="wait">
                {isVisible ? (
                    <motion.div
                        key="active-feed"
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex items-center gap-3 bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--color-brand-dark)]/5 px-4 py-3 rounded-2xl shadow-2xl shadow-black/10 max-w-[280px] md:max-w-md relative"
                    >
                        {/* Close Button - Always visible on mobile, hover on desktop */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--card-bg)] border border-[var(--color-brand-dark)]/5 rounded-full flex items-center justify-center shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-primary)] text-[var(--color-brand-dark)]/60 hover:text-[var(--color-brand-dark)] z-10"
                        >
                            <X size={12} />
                        </button>

                        <div className={`flex-shrink-0 p-2 rounded-xl bg-[var(--bg-primary)] ${current.color}`}>
                            <current.icon size={16} />
                        </div>

                        <div className="flex flex-col gap-0.5 pr-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-brand-dark)]/30">
                                    Canlı Aktivite
                                </span>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                            </div>
                            <p className="text-[12px] font-bold text-[var(--color-brand-dark)]/80 leading-tight">
                                {current.text}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        key="reopen-button"
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        onClick={() => setIsVisible(true)}
                        className="w-12 h-12 bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--color-brand-dark)]/5 rounded-2xl flex items-center justify-center shadow-xl shadow-black/5 text-[var(--color-brand-dark)]/40 hover:text-[var(--color-brand-orange)] transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Bell size={20} className="group-hover:animate-bounce" />
                        {/* Small activity dot for reopen button */}
                        <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[var(--card-bg)]"></div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
