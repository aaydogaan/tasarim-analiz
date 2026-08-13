import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Info, Settings, CreditCard, HelpCircle, ArrowRight, LayoutDashboard, Crown, LogIn, Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Check, BarChart2, Layers, ChevronDown, Sun, Moon, Bell, Heart, MessageCircle, Star, Search, Flame, Sparkles, AtSign } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import LiveActivityFeed from './LiveActivityFeed';
import MagneticWrapper from './MagneticWrapper';
import GlobalSearch from './GlobalSearch';
import { ProBadge } from './ProBadge';

interface HeaderProps {
    kullanici: any;
    onStatsClick: () => void;
    onLogoutClick: () => void;
    onAuthClick: () => void;
}

export default function Header({
    kullanici,
    onStatsClick,
    onLogoutClick,
    onAuthClick
}: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const gorunum = location.pathname.substring(1) || 'landing';
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [isToolsDropdownOpen, setIsToolsDropdownOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [supportsHover, setSupportsHover] = React.useState(false);
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [userProfile, setUserProfile] = React.useState<any>(null);

    React.useEffect(() => {
        if (!kullanici) return;
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('is_pro, role, display_name, full_name, avatar_url')
                .eq('id', kullanici.id)
                .maybeSingle();
            if (data) setUserProfile(data);
        };
        fetchProfile();
    }, [kullanici]);

    const dropdownCloseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const toolsCloseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const profileCloseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Prevent body scroll when mobile menu is open
    React.useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isMobileMenuOpen]);

    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        setSupportsHover(window.matchMedia('(hover: hover)').matches);
    }, []);

    // Ctrl/Cmd + K shortcut to open search
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(open => !open);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Fetch and subscribe to notifications
    React.useEffect(() => {
        if (!kullanici) return;

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*, actor:profiles(display_name, avatar_url, slug)')
                .eq('user_id', kullanici.id)
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (error) {
                console.error('fetchNotifications primary error:', error);
                const { data: fallbackData, error: fbErr } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', kullanici.id)
                    .order('created_at', { ascending: false })
                    .limit(20);
                if (fbErr) console.error('fetchNotifications fallback error:', fbErr);
                if (fallbackData) {
                    setNotifications(fallbackData);
                    setUnreadCount(fallbackData.filter(n => !n.is_read).length);
                }
            } else if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        };

        fetchNotifications();

        const notifSubscription = supabase
            .channel('notifications_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${kullanici.id}` }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(notifSubscription);
        };
    }, [kullanici]);

    const markAsRead = async (notification: any) => {
        if (!notification.is_read) {
            await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
        }
        setIsNotificationsOpen(false);

        const targetPostId = notification.post_id;
        const targetAnalizId = notification.analiz_id;

        if (notification.type === 'vote_design' || (targetAnalizId && !targetPostId)) {
            navigate(`/vitrin?design=${targetAnalizId || targetPostId}`);
        } else if (targetPostId || notification.type === 'like_post' || notification.type === 'comment_post' || notification.type === 'mention_user' || notification.type === 'comment_reply') {
            if (targetPostId) {
                navigate(`/community?post=${targetPostId}`);
            } else if (targetAnalizId) {
                navigate(`/vitrin?design=${targetAnalizId}`);
            } else {
                navigate('/community');
            }
        } else if (notification.type === 'follow_user') {
            const target = notification.actor?.slug || notification.actor_id;
            if (target) navigate(`/${target}`);
        } else if (notification.type === 'new_post') {
            if (targetPostId) navigate(`/community?post=${targetPostId}`);
            else if (targetAnalizId) navigate(`/vitrin?design=${targetAnalizId}`);
            else navigate('/revizeles');
        } else if (notification.type === 'revizeles') {
            navigate('/revizeles');
        }
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const nav = document.getElementById('notification-panel');
            const btn = document.getElementById('notification-button');
            const target = event.target as Node;
            if (isNotificationsOpen && nav && !nav.contains(target) && btn && !btn.contains(target)) {
                setIsNotificationsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside, { passive: true });
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            if (dropdownCloseTimeoutRef.current) clearTimeout(dropdownCloseTimeoutRef.current);
            if (toolsCloseTimeoutRef.current) clearTimeout(toolsCloseTimeoutRef.current);
            if (profileCloseTimeoutRef.current) clearTimeout(profileCloseTimeoutRef.current);
        };
    }, [isNotificationsOpen]);

    const openToolsDropdown = React.useCallback(() => {
        if (toolsCloseTimeoutRef.current) {
            clearTimeout(toolsCloseTimeoutRef.current);
            toolsCloseTimeoutRef.current = null;
        }
        setIsToolsDropdownOpen(true);
    }, []);

    const scheduleCloseToolsDropdown = React.useCallback(() => {
        if (toolsCloseTimeoutRef.current) clearTimeout(toolsCloseTimeoutRef.current);
        toolsCloseTimeoutRef.current = setTimeout(() => {
            setIsToolsDropdownOpen(false);
        }, 160);
    }, []);

    const openDropdown = React.useCallback(() => {
        if (dropdownCloseTimeoutRef.current) {
            clearTimeout(dropdownCloseTimeoutRef.current);
            dropdownCloseTimeoutRef.current = null;
        }
        setIsDropdownOpen(true);
    }, []);

    const scheduleCloseDropdown = React.useCallback(() => {
        if (dropdownCloseTimeoutRef.current) clearTimeout(dropdownCloseTimeoutRef.current);
        dropdownCloseTimeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 160);
    }, []);

    const openProfileDropdown = React.useCallback(() => {
        if (profileCloseTimeoutRef.current) {
            clearTimeout(profileCloseTimeoutRef.current);
            profileCloseTimeoutRef.current = null;
        }
        setIsProfileDropdownOpen(true);
    }, []);

    const scheduleCloseProfileDropdown = React.useCallback(() => {
        if (profileCloseTimeoutRef.current) clearTimeout(profileCloseTimeoutRef.current);
        profileCloseTimeoutRef.current = setTimeout(() => {
            setIsProfileDropdownOpen(false);
        }, 160);
    }, []);

    const handleNavClick = (view: string) => {
        if (view === 'app') {
            sessionStorage.clear();
        }
        if (gorunum !== view) {
            setIsMobileMenuOpen(false);
            setIsToolsDropdownOpen(false);
            setIsDropdownOpen(false);
            const path = view === 'landing' ? '/' : `/${view}`;
            navigate(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goHome = () => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (gorunum === 'app') return null;

    return (
        <>
        <header className="fixed top-0 w-full z-[200] bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)] transition-all duration-300">
            <nav className="w-full flex items-center justify-between px-3.5 sm:px-6 md:px-16 py-2.5 md:py-4">
                {/* Logo */}
                <div className="cursor-pointer flex-shrink-0" onClick={goHome}>
                    <img
                        src="/Revizelesene-logo.png"
                        alt="Revizelesene"
                        className="h-6.5 sm:h-8 md:h-9 w-auto object-contain"
                    />
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex flex-wrap justify-center items-center gap-6 md:gap-10 text-[14px] md:text-[15px] font-semibold text-[var(--text-primary)]/85">
                    <button
                        onClick={() => handleNavClick('landing')}
                        className={`transition-colors whitespace-nowrap ${gorunum === 'landing' ? 'text-[var(--text-primary)]' : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}
                    >
                        Anasayfa
                    </button>
                    {/* Dropdown for Araçlar (Tools + Typography) */}
                    <div
                        className="relative group"
                        onMouseEnter={supportsHover ? openToolsDropdown : undefined}
                        onMouseLeave={supportsHover ? scheduleCloseToolsDropdown : undefined}
                    >
                        <button
                            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                            className={`flex items-center gap-1 transition-colors whitespace-nowrap ${['tools', 'typography', 'glassmorphism'].includes(gorunum) ? 'text-[var(--color-brand-orange)] font-bold' : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}
                        >
                            Araçlar <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {/* Hover & Click Dropdown Box */}
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-[opacity,transform] duration-200 ease-out ${isToolsDropdownOpen ? 'opacity-100 visible translate-y-0 pointer-events-auto' : 'opacity-0 invisible translate-y-1 pointer-events-none'}`}>
                            <div className="bg-[var(--card-bg)]/95 backdrop-blur-xl rounded-[24px] shadow-[0_18px_60px_rgba(0,0,0,0.14)] ring-1 ring-black/5 p-2.5 w-[280px] flex flex-col gap-1 relative before:absolute before:content-[''] before:w-4 before:h-4 before:bg-[var(--card-bg)] before:border-l before:border-t before:border-[var(--border-primary)] before:-top-2 before:left-1/2 before:-translate-x-1/2 before:rotate-45">
                                <div className="relative z-10 bg-[var(--card-bg)] rounded-xl">
                                    <button
                                        onClick={() => handleNavClick('tools')}
                                        className={`w-full text-left px-5 py-3.5 rounded-2xl hover:bg-[var(--bg-secondary)] text-[13px] font-bold transition-all ${gorunum === 'tools' ? 'text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5' : 'text-[var(--text-primary)]/80 hover:text-[var(--text-primary)]'}`}
                                    >
                                        Renk Atölyesi
                                        <span className="block text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">Palet ve Sentez</span>
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('typography')}
                                        className={`w-full text-left px-5 py-3.5 rounded-2xl hover:bg-[var(--color-brand-orange)]/10 text-[13px] font-bold transition-all flex justify-between items-center ${gorunum === 'typography' ? 'text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5' : 'text-[var(--text-primary)]/80 hover:text-[var(--color-brand-orange)]'}`}
                                    >
                                        <div>
                                            Tipografi Lab.
                                            <span className="block text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">Yazı Tipi Uyumları</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('glassmorphism')}
                                        className={`w-full text-left px-5 py-3.5 rounded-2xl hover:bg-pink-500/10 text-[13px] font-bold transition-all flex justify-between items-center ${gorunum === 'glassmorphism' ? 'text-pink-500 bg-pink-500/5' : 'text-[var(--text-primary)]/80 hover:text-pink-500'}`}
                                    >
                                        <div>
                                            Glassmorphism
                                            <span className="block text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">Buzlu Cam Efekti</span>
                                        </div>
                                        <span className="text-[9px] bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-md font-black tracking-wider uppercase shadow-sm">YENİ</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleNavClick('vitrin')}
                        className={`transition-colors whitespace-nowrap ${gorunum === 'vitrin' ? 'text-[var(--text-primary)]' : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}
                    >
                        Keşfet
                    </button>
                    <button
                        onClick={() => handleNavClick('community')}
                        className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${gorunum === 'community' ? 'text-[var(--text-primary)] font-bold' : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}
                    >
                        Topluluk
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                    </button>
                    <button
                        onClick={() => handleNavClick('revizeles')}
                        className={`group transition-all whitespace-nowrap flex items-center gap-1.5 ${gorunum.startsWith('revizeles') ? 'text-[var(--text-primary)] font-bold' : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}
                    >
                        <span>Reviz<span className="text-[#FF4D00] group-hover:drop-shadow-[0_0_8px_rgba(255,77,0,0.5)] transition-all font-black">Eleştir</span></span>
                    </button>
                    <button
                        onClick={() => handleNavClick('leaderboard')}
                        className={`transition-colors whitespace-nowrap ${['leaderboard', 'liderlik'].includes(gorunum) ? 'text-[var(--text-primary)] font-bold' : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}
                    >
                        Liderlik Tablosu
                    </button>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-1 sm:gap-2.5">
                    {/* Yenilikler (Changelog) Button */}
                    <button
                        onClick={() => navigate('/yenilikler')}
                        title="Yenilikler & Güncelleme Notları"
                        className={`px-2.5 py-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-1.5 text-xs font-bold ${
                            gorunum === 'yenilikler' || gorunum === 'changelog' ? 'text-[var(--text-primary)] border-slate-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                        <span className="hidden sm:inline">Yenilikler</span>
                    </button>

                    {/* Search Button */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        title="Ara (Ctrl + K)"
                        className="p-1.5 sm:p-2.5 rounded-full hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2 group"
                    >
                        <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                        <kbd className="hidden lg:inline-flex text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-1.5 py-0.5 rounded-md">
                            ⌘K
                        </kbd>
                    </button>

                    {/* Dark Mode Toggle */}

                    {kullanici ? (
                        <>
                            {/* Bildirimler */}
                            <div className="relative">
                                <button
                                    id="notification-button"
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="p-1.5 sm:p-2.5 rounded-full hover:bg-[var(--bg-secondary)] transition-colors relative"
                                >
                                    <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[var(--text-secondary)]" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse border border-[var(--bg-primary)]"></span>
                                    )}
                                </button>
                                
                                <AnimatePresence>
                                    {isNotificationsOpen && (
                                        <>
                                            <motion.div
                                                id="notification-panel"
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="fixed top-[70px] left-4 right-4 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-3 w-auto sm:w-80 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-xl overflow-hidden py-1 z-50 flex flex-col max-h-[80vh] sm:max-h-[400px]"
                                            >
                                                <div className="px-4 py-3 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-secondary)]/50 shrink-0">
                                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Bildirimler</h3>
                                                    {unreadCount > 0 && <span className="text-xs font-medium text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/10 px-2 py-0.5 rounded-full">{unreadCount} yeni</span>}
                                                </div>
                                                <div
                                                    className="overflow-y-auto flex-1 overscroll-contain touch-pan-y"
                                                    data-lenis-prevent="true"
                                                    onWheel={(e) => e.stopPropagation()}
                                                >
                                                    {notifications.length === 0 ? (
                                                        <div className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">
                                                            Henüz bir bildiriminiz yok.
                                                        </div>
                                                    ) : (
                                                        notifications.map((notif) => (
                                                            <button
                                                                key={notif.id}
                                                                onClick={() => markAsRead(notif)}
                                                                className={`w-full text-left px-4 py-3 border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-secondary)] transition-colors flex items-start gap-3 ${!notif.is_read ? 'bg-[var(--color-brand-orange)]/5' : ''}`}
                                                            >
                                                                <div className="relative shrink-0">
                                                                    <img
                                                                        src={notif.actor?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${notif.actor_id}`}
                                                                        alt="Actor"
                                                                        className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] object-cover"
                                                                    />
                                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center">
                                                                        {notif.type === 'like_post' && <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />}
                                                                        {notif.type === 'comment_post' && <MessageCircle className="w-2.5 h-2.5 text-blue-500 fill-blue-500" />}
                                                                        {notif.type === 'comment_reply' && <MessageCircle className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />}
                                                                        {notif.type === 'mention_user' && <AtSign className="w-2.5 h-2.5 text-orange-500" />}
                                                                        {notif.type === 'vote_design' && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                                                                        {notif.type === 'report_resolved' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
                                                                        {notif.type === 'report_dismissed' && <AlertCircle className="w-2.5 h-2.5 text-red-500" />}
                                                                        {notif.type === 'follow_user' && <svg className="w-2.5 h-2.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
                                                                        {notif.type === 'new_post' && (notif.post_id || notif.analiz_id) && <Bell className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />}
                                                                        {(notif.type === 'revizeles' || (notif.type === 'new_post' && !notif.post_id && !notif.analiz_id)) && <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0 pt-0.5">
                                                                    <p className="text-[13px] text-[var(--text-primary)] leading-tight">
                                                                        {(notif.type === 'revizeles' || (notif.type === 'new_post' && !notif.post_id && !notif.analiz_id)) ? (
                                                                            <span className="font-bold mr-1">Revizeleştir</span>
                                                                        ) : notif.type.startsWith('report_') ? (
                                                                            <span className="font-bold mr-1">Yönetim Ekibi</span>
                                                                        ) : (
                                                                            <span className="font-bold mr-1">{notif.actor?.display_name || 'Birisi'}</span>
                                                                        )}
                                                                        <span className="text-[var(--text-secondary)]">
                                                                            {notif.type === 'like_post' && 'gönderini beğendi.'}
                                                                            {notif.type === 'comment_post' && 'gönderine yorum yaptı.'}
                                                                            {notif.type === 'comment_reply' && 'yorumuna cevap verdi.'}
                                                                            {notif.type === 'mention_user' && 'seni bir yorumda etiketledi. 💬'}
                                                                            {notif.type === 'vote_design' && 'tasarımına oy verdi.'}
                                                                            {notif.type === 'report_resolved' && 'yaptığın şikayeti inceledi ve haklı bularak gereken işlemi uyguladı.'}
                                                                            {notif.type === 'report_dismissed' && 'yaptığın şikayeti inceledi ancak kurallara aykırı bir durum bulamadı.'}
                                                                            {notif.type === 'follow_user' && 'seni takip etmeye başladı.'}
                                                                            {notif.type === 'new_post' && (notif.post_id || notif.analiz_id) && 'yeni bir tasarım paylaştı! 🔥'}
                                                                            {(notif.type === 'revizeles' || (notif.type === 'new_post' && !notif.post_id && !notif.analiz_id)) && 'gündemde yeni bir logo yayınladı! Göz at & revize et ⚡'}
                                                                        </span>
                                                                    </p>
                                                                    <span className="text-[10px] text-[var(--text-secondary)] font-medium mt-1 block">
                                                                        {new Date(notif.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)] mt-2 shrink-0" />}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                        <div
                            className="relative ml-0.5 sm:ml-2 border-l border-[var(--border-primary)] pl-2 sm:pl-4 flex items-center"
                            onMouseEnter={supportsHover ? openProfileDropdown : undefined}
                            onMouseLeave={supportsHover ? scheduleCloseProfileDropdown : undefined}
                        >
                            <button
                                onClick={() => supportsHover ? null : setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-1.5 outline-none group"
                            >
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full overflow-hidden bg-gray-50 transition-colors ${
                                    Boolean(userProfile?.is_pro || userProfile?.role === 'pro' || userProfile?.role === 'admin')
                                    ? 'p-[2px] bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 shadow-sm'
                                    : 'border-2 border-[var(--color-brand-orange)]/30 group-hover:border-[var(--color-brand-orange)]'
                                }`}>
                                    <img src={userProfile?.avatar_url || kullanici.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${kullanici.id}`} alt="Profil" className="w-full h-full object-cover rounded-full" />
                                </div>
                                <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                        className="absolute top-full right-0 mt-3 w-48 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-xl overflow-hidden py-1 z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-[var(--border-primary)] mb-1">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Oturum Açık</p>
                                                <ProBadge isPro={userProfile?.is_pro} role={userProfile?.role} size="xs" />
                                            </div>
                                            <p className="text-[13px] text-[var(--text-primary)] font-medium truncate">{kullanici.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsProfileDropdownOpen(false);
                                                handleNavClick('profile');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)]/80 hover:text-[var(--color-brand-orange)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2"
                                        >
                                            <User className="w-4 h-4 opacity-70" /> Profilim
                                        </button>
                                        <button
                                            onClick={() => { handleNavClick(''); setIsProfileDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)]/80 hover:text-[var(--color-brand-orange)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2"
                                        >
                                            <BarChart2 className="w-4 h-4 opacity-70" />
                                            Analiz Ekranı
                                        </button>
                                        <button
                                            onClick={() => { handleNavClick('app?tab=analizlerim'); setIsProfileDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)]/80 hover:text-[var(--color-brand-orange)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2"
                                        >
                                            <Layers className="w-4 h-4 opacity-70" />
                                            Analizlerim
                                        </button>
                                        
                                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent my-1" />
                                        <button
                                            onClick={() => { handleNavClick('pricing'); setIsProfileDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)]/80 hover:text-[var(--color-brand-orange)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2"
                                        >
                                            <CreditCard className="w-4 h-4 opacity-70" />
                                            Planlar
                                        </button>

                                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent my-1" />

                                        <button
                                            onClick={() => {
                                                setIsProfileDropdownOpen(false);
                                                onLogoutClick();
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50/10 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4 text-red-500/70" />
                                            Çıkış Yap
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        </>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Kayıt Ol Butonuna Tıklandı!");
                                onAuthClick();
                            }}
                            className="ml-1 md:ml-4 px-4 md:px-6 py-1.5 md:py-2.5 rounded-full text-white text-[12px] md:text-[13px] font-medium bg-[#4A4A4A] whitespace-nowrap flex-shrink-0"
                        >
                            Kayıt Ol
                        </button>
                    )}

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden ml-0.5 sm:ml-2 p-1 sm:p-1.5 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-5.5 h-5.5 sm:w-6 sm:h-6" /> : <Menu className="w-5.5 h-5.5 sm:w-6 sm:h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'calc(100dvh - 47px)' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute inset-x-0 top-full bg-[var(--bg-primary)] border-t border-[var(--border-primary)] overflow-y-auto flex flex-col"
                    >
                        <div className="flex flex-col px-6 py-8 gap-6 text-[15px] font-medium flex-1">
                            <button
                                onClick={() => handleNavClick('landing')}
                                className={`text-left transition-colors ${gorunum === 'landing' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                            >
                                Anasayfa
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/nasil-calisir');
                                    setIsMobileMenuOpen(false);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`text-left transition-colors ${gorunum === 'nasil-calisir' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                            >
                                Nasıl Çalışır?
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/yenilikler');
                                    setIsMobileMenuOpen(false);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`text-left transition-colors flex items-center gap-2 ${['yenilikler', 'changelog'].includes(gorunum) ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                            >
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                Yenilikler & Güncellemeler
                            </button>

                            <button
                                onClick={() => handleNavClick('revizeles')}
                                className={`text-left flex items-center gap-1.5 transition-colors ${gorunum.startsWith('revizeles') ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                            >
                                <span>Reviz<span className="text-[#FF4D00] font-black">Eleştir</span></span>
                            </button>
                            
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                    <span className="text-[13px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Araçlar</span>
                                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="flex flex-col gap-4 mt-5 mb-2">
                                    <button
                                        onClick={() => handleNavClick('tools')}
                                        className={`text-left pl-4 transition-colors ${gorunum === 'tools' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                                    >
                                        Renk Atölyesi
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('typography')}
                                        className={`text-left pl-4 transition-colors ${gorunum === 'typography' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                                    >
                                        Tipografi Lab.
                                    </button>
                                </div>
                            </details>

                            <button
                                onClick={() => handleNavClick('vitrin')}
                                className={`text-left transition-colors ${gorunum === 'vitrin' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                            >
                                Keşfet
                            </button>

                            <button
                                onClick={() => handleNavClick('community')}
                                className={`text-left transition-colors ${gorunum === 'community' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                            >
                                Topluluk
                            </button>

                            <button
                                onClick={() => handleNavClick('leaderboard')}
                                className={`text-left transition-colors ${['leaderboard', 'liderlik'].includes(gorunum) ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                            >
                                Liderlik Tablosu
                            </button>

                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                    <span className="text-[13px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Kurumsal</span>
                                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="flex flex-col gap-4 mt-5 mb-2">
                                    <button
                                        onClick={() => handleNavClick('about')}
                                        className={`text-left pl-4 transition-colors ${gorunum === 'about' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                                    >
                                        Hakkımızda
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('iletisim')}
                                        className={`text-left pl-4 transition-colors ${gorunum === 'iletisim' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                                    >
                                        İletişim
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('nasil-calisir')}
                                        className={`text-left pl-4 transition-colors ${gorunum === 'nasil-calisir' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                                    >
                                        SSS
                                    </button>
                                </div>
                            </details>

                            <div className="h-px bg-[var(--border-primary)] my-2" />

                            <div className="flex flex-col gap-3">
                                <span className="text-[13px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Hesap</span>
                                
                                {kullanici && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                setIsNotificationsOpen(true);
                                            }}
                                            className="text-left pl-4 flex items-center justify-between text-[var(--text-primary)] transition-colors group"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                                                Bildirimler
                                            </span>
                                            {unreadCount > 0 && (
                                                <div className="bg-[var(--color-brand-orange)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </div>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleNavClick('profile');
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="text-left pl-4 flex items-center gap-2 text-[var(--text-primary)] transition-colors group"
                                        >
                                            <Settings className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                                            Ayarlar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Sticky Profile Pill at bottom */}
                        {kullanici ? (
                            <div className="mt-auto p-4 pb-6 sticky bottom-0 bg-[var(--bg-primary)] border-t border-[var(--border-primary)]">
                                <button
                                    onClick={() => {
                                        handleNavClick('profile');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 border border-[var(--border-primary)] rounded-[20px] p-2 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${
                                            Boolean(userProfile?.is_pro || userProfile?.role === 'pro' || userProfile?.role === 'admin')
                                            ? 'p-[2px] bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 shadow-sm'
                                            : 'border border-[var(--border-primary)]'
                                        }`}>
                                            <img 
                                                src={userProfile?.avatar_url || kullanici.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${kullanici.id}`} 
                                                alt="Profil" 
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                        <div className="flex flex-col items-start truncate">
                                            <span className="text-[14px] font-bold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                                                {kullanici.user_metadata?.full_name || 'Kullanıcı'}
                                                <ProBadge isPro={userProfile?.is_pro} role={userProfile?.role} size="xs" />
                                            </span>
                                            <span className="text-[11px] text-[var(--text-secondary)] truncate">
                                                {kullanici.email}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pr-3 shrink-0">
                                        <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className="mt-auto p-4 pb-6 sticky bottom-0 bg-[var(--bg-primary)] border-t border-[var(--border-primary)]">
                                <button
                                    onClick={() => {
                                        onAuthClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-[var(--color-brand-orange)] text-white py-3.5 rounded-full font-bold text-center flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Giriş Yap / Üye Ol
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );

}
