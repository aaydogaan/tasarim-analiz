import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Trophy, Wrench, Info, Gift, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'maintenance' | 'event' | 'contest' | 'gift';
    link_url?: string;
    link_text?: string;
    is_active: boolean;
    created_at: string;
}

const TYPE_CONFIG = {
    info: {
        icon: Info,
        gradient: 'from-blue-500/15 via-blue-400/8 to-blue-600/10',
        border: 'border-blue-400/30',
        iconBg: 'bg-blue-500/15',
        iconColor: 'text-blue-400',
        dot: 'bg-blue-400',
        badge: 'bg-blue-500/15 text-blue-400 border-blue-400/30',
        label: 'Bilgi',
    },
    warning: {
        icon: Megaphone,
        gradient: 'from-amber-500/15 via-amber-400/8 to-orange-500/10',
        border: 'border-amber-400/30',
        iconBg: 'bg-amber-500/15',
        iconColor: 'text-amber-400',
        dot: 'bg-amber-400',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-400/30',
        label: 'Duyuru',
    },
    maintenance: {
        icon: Wrench,
        gradient: 'from-slate-500/15 via-slate-400/8 to-slate-600/10',
        border: 'border-slate-400/30',
        iconBg: 'bg-slate-500/15',
        iconColor: 'text-slate-300',
        dot: 'bg-slate-400',
        badge: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
        label: 'Bakım',
    },
    event: {
        icon: Megaphone,
        gradient: 'from-purple-500/15 via-purple-400/8 to-violet-500/10',
        border: 'border-purple-400/30',
        iconBg: 'bg-purple-500/15',
        iconColor: 'text-purple-400',
        dot: 'bg-purple-400',
        badge: 'bg-purple-500/15 text-purple-400 border-purple-400/30',
        label: 'Etkinlik',
    },
    contest: {
        icon: Trophy,
        gradient: 'from-[#FF5500]/15 via-amber-500/8 to-orange-600/10',
        border: 'border-[#FF5500]/30',
        iconBg: 'bg-[#FF5500]/15',
        iconColor: 'text-[#FF5500]',
        dot: 'bg-[#FF5500]',
        badge: 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30',
        label: 'Yarışma',
    },
    gift: {
        icon: Gift,
        gradient: 'from-emerald-500/15 via-emerald-400/8 to-green-600/10',
        border: 'border-emerald-400/30',
        iconBg: 'bg-emerald-500/15',
        iconColor: 'text-emerald-400',
        dot: 'bg-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30',
        label: 'Kampanya',
    },
};

const STORAGE_KEY = 'revizelesene_dismissed_announcements';

function getDismissed(): string[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveDismissed(ids: string[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function AnnouncementWidget() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [visible, setVisible] = useState<Announcement[]>([]);
    const [current, setCurrent] = useState(0);
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchAnnouncements();
        setDismissed(getDismissed());
    }, []);

    useEffect(() => {
        if (announcements.length === 0) return;
        const d = getDismissed();
        const notDismissed = announcements.filter(a => !d.includes(a.id));
        setVisible(notDismissed);
        setHasNew(notDismissed.length > 0);
        if (notDismissed.length > 0) {
            setTimeout(() => setIsOpen(true), 1500);
        }
    }, [announcements]);

    // Auto-rotate
    useEffect(() => {
        if (visible.length <= 1) return;
        intervalRef.current = setInterval(() => {
            setCurrent(c => (c + 1) % visible.length);
        }, 5000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [visible.length]);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (data) setAnnouncements(data);
        } catch (err) {
            // Table may not exist yet
        }
    };

    const handleDismiss = (id: string) => {
        const updated = [...dismissed, id];
        setDismissed(updated);
        saveDismissed(updated);
        const newVisible = visible.filter(a => a.id !== id);
        setVisible(newVisible);
        setCurrent(0);
        if (newVisible.length === 0) {
            setIsOpen(false);
            setHasNew(false);
        }
    };

    const handleDismissAll = () => {
        const allIds = visible.map(a => a.id);
        const updated = [...dismissed, ...allIds];
        setDismissed(updated);
        saveDismissed(updated);
        setVisible([]);
        setIsOpen(false);
        setHasNew(false);
    };

    const prev = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCurrent(c => (c - 1 + visible.length) % visible.length);
    };
    const next = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCurrent(c => (c + 1) % visible.length);
    };

    if (visible.length === 0 && !isOpen) return null;

    const ann = visible[current];
    const config = ann ? TYPE_CONFIG[ann.type] || TYPE_CONFIG.info : TYPE_CONFIG.info;
    const Icon = config.icon;

    return (
        <>
            {/* Bell trigger button - sağ alt köşede */}
            <div className="fixed bottom-6 right-6 z-[900] flex flex-col items-end gap-3">
                <AnimatePresence>
                    {isOpen && ann && (
                        <motion.div
                            key={ann.id + current}
                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            className={`
                                relative w-[340px] max-w-[calc(100vw-2rem)]
                                bg-[var(--card-bg)]/95 backdrop-blur-xl
                                rounded-2xl border ${config.border}
                                shadow-2xl overflow-hidden
                                bg-gradient-to-br ${config.gradient}
                            `}
                        >
                            {/* Top accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.gradient.replace('from-', 'from-').replace('/15', '').replace('/8', '').replace('/10', '')}`} />

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}>
                                        <Icon size={14} className={config.iconColor} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badge}`}>
                                        {config.label}
                                    </span>
                                    {visible.length > 1 && (
                                        <span className="text-[10px] text-[var(--text-secondary)] font-bold ml-1">
                                            {current + 1}/{visible.length}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDismiss(ann.id)}
                                    className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-4 pb-3">
                                <h4 className="font-extrabold text-[var(--text-primary)] text-sm leading-snug mb-1">
                                    {ann.title}
                                </h4>
                                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                                    {ann.message}
                                </p>

                                {ann.link_url && ann.link_text && (
                                    <a
                                        href={ann.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-black ${config.iconColor} hover:underline`}
                                    >
                                        {ann.link_text} →
                                    </a>
                                )}
                            </div>

                            {/* Navigation dots + actions */}
                            <div className="flex items-center justify-between px-4 pb-3.5">
                                <div className="flex items-center gap-1.5">
                                    {visible.length > 1 && visible.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrent(i)}
                                            className={`rounded-full transition-all cursor-pointer ${i === current ? `w-4 h-1.5 ${config.dot}` : 'w-1.5 h-1.5 bg-[var(--border-primary)]'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {visible.length > 1 && (
                                        <>
                                            <button onClick={prev} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                                                <ChevronLeft size={13} />
                                            </button>
                                            <button onClick={next} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                                                <ChevronRight size={13} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleDismissAll}
                                        className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold cursor-pointer px-2 py-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                                    >
                                        Tümünü Kapat
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bell button */}
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(o => !o)}
                    className="relative w-12 h-12 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#FF5500]/40 transition-all cursor-pointer"
                >
                    <Bell size={19} />
                    {hasNew && visible.length > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5500] rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md shadow-[#FF5500]/30"
                        >
                            {visible.length}
                        </motion.span>
                    )}
                </motion.button>
            </div>
        </>
    );
}
