import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, BarChart2, ChevronDown, Sun, Moon, User, Menu, X, Info, CreditCard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import LiveActivityFeed from './LiveActivityFeed';
import MagneticWrapper from './MagneticWrapper';

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
    const [isToolsDropdownOpen, setIsToolsDropdownOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [supportsHover, setSupportsHover] = React.useState(false);
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

    React.useEffect(() => {
        return () => {
            if (dropdownCloseTimeoutRef.current) clearTimeout(dropdownCloseTimeoutRef.current);
            if (toolsCloseTimeoutRef.current) clearTimeout(toolsCloseTimeoutRef.current);
            if (profileCloseTimeoutRef.current) clearTimeout(profileCloseTimeoutRef.current);
        };
    }, []);

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

    return (
        <header className="fixed top-0 w-full z-[200] bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)] transition-all duration-300">
            <nav className="w-full flex items-center justify-between px-5 md:px-16 py-3 md:py-4">
                {/* Logo */}
                <div className="cursor-pointer flex-shrink-0" onClick={goHome}>
                    <img
                        src="/Revizelesene-logo.png"
                        alt="Revizele"
                        className="h-8 md:h-9 w-auto object-contain"
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
                            className={`flex items-center gap-1 transition-colors whitespace-nowrap ${['tools', 'typography'].includes(gorunum) ? 'text-[var(--color-brand-orange)] font-bold' : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}
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
                                        <span className="text-[9px] bg-[var(--color-brand-orange)] text-white px-2 py-0.5 rounded-md font-black tracking-wider uppercase">YENİ</span>
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
                        className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${gorunum === 'community' ? 'text-[var(--text-primary)]' : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'}`}
                    >
                        Topluluk
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                    </button>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}

                    {kullanici ? (
                        <div
                            className="relative ml-1 md:ml-2 border-l border-[var(--border-primary)] pl-3 md:pl-5 flex items-center"
                            onMouseEnter={supportsHover ? openProfileDropdown : undefined}
                            onMouseLeave={supportsHover ? scheduleCloseProfileDropdown : undefined}
                        >
                            <button
                                onClick={() => supportsHover ? null : setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-2 outline-none group"
                            >
                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-[var(--color-brand-orange)]/30 overflow-hidden bg-gray-50 group-hover:border-[var(--color-brand-orange)] transition-colors">
                                    <img src={kullanici.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${kullanici.id}`} alt="Profil" className="w-full h-full object-cover" />
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
                                            <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-0.5">Oturum Açık</p>
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
                                            onClick={() => { onStatsClick(); setIsProfileDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)]/80 hover:text-[var(--color-brand-orange)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2"
                                        >
                                            <BarChart2 className="w-4 h-4 opacity-70" />
                                            Dashboard
                                        </button>
                                        
                                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent my-1" />

                                        <button
                                            onClick={() => { handleNavClick('about'); setIsProfileDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)]/80 hover:text-[var(--color-brand-orange)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2"
                                        >
                                            <Info className="w-4 h-4 opacity-70" />
                                            Proje Hakkında
                                        </button>
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
                                            <LogOut className="w-4 h-4" /> Çıkış Yap
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
                        className="md:hidden ml-2 p-1.5 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'calc(100vh - 60px)' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden fixed inset-x-0 top-[60px] bg-[var(--bg-primary)] border-t border-[var(--border-primary)] overflow-y-auto"
                    >
                        <div className="flex flex-col px-6 py-8 gap-6 text-[15px] font-medium">
                            <button
                                onClick={() => handleNavClick('landing')}
                                className={`text-left transition-colors ${gorunum === 'landing' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                            >
                                Anasayfa
                            </button>
                            
                            <div className="flex flex-col gap-3">
                                <span className="text-[13px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Araçlar</span>
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

                            <div className="flex flex-col gap-3">
                                <span className="text-[13px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Hakkımızda</span>
                                <button
                                    onClick={() => handleNavClick('about')}
                                    className={`text-left pl-4 transition-colors ${gorunum === 'about' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                                >
                                    Proje Hakkında
                                </button>
                                <button
                                    onClick={() => handleNavClick('pricing')}
                                    className={`text-left pl-4 transition-colors ${gorunum === 'pricing' ? 'text-[var(--color-brand-orange)] font-bold' : 'text-[var(--text-primary)]'}`}
                                >
                                    Planlar (Pro)
                                </button>
                            </div>

                            {gorunum !== 'app' && (
                                <button
                                    onClick={() => handleNavClick('app')}
                                    className="mt-4 w-full bg-[var(--color-brand-orange)] text-white py-3 rounded-2xl font-bold text-center"
                                >
                                    Yeni Analiz Başlat
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );

}
