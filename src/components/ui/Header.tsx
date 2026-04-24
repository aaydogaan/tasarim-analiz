import React from 'react';
import { motion } from 'motion/react';
import { LogOut, BarChart2, ChevronDown, Sun, Moon } from 'lucide-react';
import LiveActivityFeed from './LiveActivityFeed';
import MagneticWrapper from './MagneticWrapper';

interface HeaderProps {
    gorunum: 'landing' | 'app' | 'vitrin' | 'community' | 'pricing' | 'about' | 'tools' | 'typography';
    setGorunum: (v: 'landing' | 'app' | 'vitrin' | 'community' | 'pricing' | 'about' | 'tools' | 'typography') => void;
    kullanici: any;
    onStatsClick: () => void;
    onLogoutClick: () => void;
    onAuthClick: () => void;
    goHome: () => void;
    darkMode: boolean;
    setDarkMode: (d: boolean) => void;
}

export default function Header({
    gorunum,
    setGorunum,
    kullanici,
    onStatsClick,
    onLogoutClick,
    onAuthClick,
    goHome,
    darkMode,
    setDarkMode
}: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isToolsDropdownOpen, setIsToolsDropdownOpen] = React.useState(false);
    const [supportsHover, setSupportsHover] = React.useState(false);
    const dropdownCloseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const toolsCloseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        setSupportsHover(window.matchMedia('(hover: hover)').matches);
    }, []);

    React.useEffect(() => {
        return () => {
            if (dropdownCloseTimeoutRef.current) clearTimeout(dropdownCloseTimeoutRef.current);
            if (toolsCloseTimeoutRef.current) clearTimeout(toolsCloseTimeoutRef.current);
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

    const handleNavClick = (view: 'landing' | 'app' | 'vitrin' | 'community' | 'pricing' | 'about' | 'tools' | 'typography', sectionId?: string) => {
        setIsDropdownOpen(false); // Close dropdown if it was open
        setIsToolsDropdownOpen(false); // Close tools dropdown
        if (gorunum !== view) {
            setGorunum(view);
            // Wait for render if moving to landing
            if (sectionId) {
                setTimeout(() => {
                    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else if (sectionId) {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <header className="absolute top-0 w-full z-[100] bg-[var(--color-brand-light)]/80 backdrop-blur-xl border-b border-[var(--color-brand-dark)]/5 transition-all duration-300">
            <nav className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-3 md:py-4 gap-3 md:gap-0">
                {/* Logo */}
                <div className="cursor-pointer" onClick={goHome}>
                    <span className="text-2xl md:text-[32px] font-bold tracking-tight text-[var(--color-brand-orange)] font-display leading-none">Revizele.</span>
                </div>

                {/* Nav Links */}
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10 text-[12px] md:text-[13px] font-medium text-[#666666]">
                    <button
                        onClick={() => handleNavClick('landing')}
                        className={`transition-colors whitespace-nowrap ${gorunum === 'landing' ? 'text-[var(--color-brand-dark)]' : 'hover:text-[var(--color-brand-dark)]'}`}
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
                            className={`flex items-center gap-1 transition-colors whitespace-nowrap ${['tools', 'typography'].includes(gorunum) ? 'text-[var(--color-brand-orange)] font-bold' : 'hover:text-[var(--color-brand-dark)] text-[#666666]'}`}
                        >
                            Araçlar ✨ <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-300 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {/* Hover & Click Dropdown Box */}
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-[opacity,transform] duration-200 ease-out ${isToolsDropdownOpen ? 'opacity-100 visible translate-y-0 pointer-events-auto' : 'opacity-0 invisible translate-y-1 pointer-events-none'}`}>
                            <div className="bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_18px_60px_rgba(0,0,0,0.14)] ring-1 ring-black/5 p-2.5 w-[280px] flex flex-col gap-1 relative before:absolute before:content-[''] before:w-4 before:h-4 before:bg-white before:border-l before:border-t before:border-[var(--color-brand-dark)]/5 before:-top-2 before:left-1/2 before:-translate-x-1/2 before:rotate-45">
                                <div className="relative z-10 bg-white rounded-xl">
                                    <button
                                        onClick={() => handleNavClick('tools')}
                                        className={`w-full text-left px-5 py-3.5 rounded-2xl hover:bg-[var(--color-brand-light)] text-[13px] font-bold transition-all ${gorunum === 'tools' ? 'text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5' : 'text-[var(--color-brand-dark)]/80 hover:text-[var(--color-brand-dark)]'}`}
                                    >
                                        Renk Atölyesi
                                        <span className="block text-[10px] text-[var(--color-brand-dark)]/40 font-medium mt-0.5">Palet ve Sentez</span>
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('typography')}
                                        className={`w-full text-left px-5 py-3.5 rounded-2xl hover:bg-[var(--color-brand-orange)]/10 text-[13px] font-bold transition-all flex justify-between items-center ${gorunum === 'typography' ? 'text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5' : 'text-[var(--color-brand-dark)]/80 hover:text-[var(--color-brand-orange)]'}`}
                                    >
                                        <div>
                                            Tipografi Lab.
                                            <span className="block text-[10px] text-[var(--color-brand-dark)]/40 font-medium mt-0.5">Yazı Tipi Uyumları</span>
                                        </div>
                                        <span className="text-[9px] bg-[var(--color-brand-orange)] text-white px-2 py-0.5 rounded-md font-black tracking-wider uppercase">YENİ</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleNavClick('vitrin')}
                        className={`transition-colors whitespace-nowrap ${gorunum === 'vitrin' ? 'text-[var(--color-brand-dark)]' : 'hover:text-[var(--color-brand-dark)]'}`}
                    >
                        Keşfet
                    </button>
                    <button
                        onClick={() => handleNavClick('community')}
                        className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${gorunum === 'community' ? 'text-[var(--color-brand-dark)] font-bold' : 'hover:text-[var(--color-brand-dark)]'}`}
                    >
                        Topluluk
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                    </button>

                    {/* Dropdown for Hakkımızda (About + Pricing) */}
                    <div
                        className="relative group"
                        onMouseEnter={supportsHover ? openDropdown : undefined}
                        onMouseLeave={supportsHover ? scheduleCloseDropdown : undefined}
                    >
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`flex items-center gap-1 transition-colors whitespace-nowrap ${['about', 'pricing'].includes(gorunum) ? 'text-[var(--color-brand-orange)] font-bold' : 'hover:text-[var(--color-brand-dark)] text-[#666666]'}`}
                        >
                            Hakkımızda <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {/* Hover & Click Dropdown Box */}
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-[opacity,transform] duration-200 ease-out ${isDropdownOpen ? 'opacity-100 visible translate-y-0 pointer-events-auto' : 'opacity-0 invisible translate-y-1 pointer-events-none'}`}>
                            <div className="bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_18px_60px_rgba(0,0,0,0.14)] ring-1 ring-black/5 p-2.5 w-[280px] flex flex-col gap-1 relative before:absolute before:content-[''] before:w-4 before:h-4 before:bg-white before:border-l before:border-t before:border-[var(--color-brand-dark)]/5 before:-top-2 before:left-1/2 before:-translate-x-1/2 before:rotate-45">
                                <div className="relative z-10 bg-white rounded-xl">
                                    <button
                                        onClick={() => handleNavClick('about')}
                                        className={`w-full text-left px-5 py-3.5 rounded-2xl hover:bg-[var(--color-brand-light)] text-[13px] font-bold transition-all ${gorunum === 'about' ? 'text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5' : 'text-[var(--color-brand-dark)]/80 hover:text-[var(--color-brand-dark)]'}`}
                                    >
                                        Proje Hakkında
                                        <span className="block text-[10px] text-[var(--color-brand-dark)]/40 font-medium mt-0.5">Motivasyon ve Amaç</span>
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('pricing')}
                                        className={`w-full text-left px-5 py-3.5 rounded-2xl hover:bg-[var(--color-brand-orange)]/10 text-[13px] font-bold transition-all flex justify-between items-center ${gorunum === 'pricing' ? 'text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5' : 'text-[var(--color-brand-dark)]/80 hover:text-[var(--color-brand-orange)]'}`}
                                    >
                                        <div>
                                            Planlar
                                            <span className="block text-[10px] text-[var(--color-brand-dark)]/40 font-medium mt-0.5">Abonelik & Özellikler</span>
                                        </div>
                                        <span className="text-[9px] bg-[var(--color-brand-orange)] text-white px-2 py-0.5 rounded-md font-black tracking-wider uppercase">Pro</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-xl hover:bg-[var(--color-brand-dark)]/5 transition-all active:scale-95 group relative mb-0.5"
                        aria-label="Karanlık Modu Değiştir"
                    >
                        <motion.div
                            animate={{ rotate: darkMode ? 0 : 90, scale: darkMode ? 0 : 1 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            transition={{ duration: 0.3 }}
                        >
                            <Sun className="w-[18px] h-[18px] text-amber-500" />
                        </motion.div>
                        <motion.div
                            animate={{ rotate: darkMode ? 0 : -90, scale: darkMode ? 1 : 0 }}
                            className="flex items-center justify-center p-0.5"
                            transition={{ duration: 0.3 }}
                        >
                            <Moon className="w-[18px] h-[18px] text-[var(--color-brand-orange)]" />
                        </motion.div>
                    </button>

                    {gorunum !== 'app' && (
                        <MagneticWrapper strength={25}>
                            <button
                                onClick={() => setGorunum('app')}
                                className="hidden sm:block text-[var(--color-brand-orange)] font-bold text-[13px] hover:scale-105 transition-transform mr-2"
                            >
                                Yeni Analiz
                            </button>
                        </MagneticWrapper>
                    )}

                    {kullanici && (
                        <button
                            onClick={onStatsClick}
                            className="flex items-center gap-1.5 text-[#666666] hover:text-[var(--color-brand-dark)] text-[13px] font-medium transition-colors"
                        >
                            <BarChart2 className="w-4 h-4" />
                            <span className="hidden md:inline">İstatistikler</span>
                        </button>
                    )}

                    {kullanici ? (
                        <div className="flex items-center gap-3 ml-1 md:ml-2 border-l border-[var(--color-brand-dark)]/10 pl-3 md:pl-5">
                            <span className="text-[#666666] text-[12px] hidden lg:block max-w-[100px] truncate">{kullanici.email}</span>
                            <button onClick={onLogoutClick} className="text-[#666666] hover:text-red-500 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <MagneticWrapper strength={20} className="md:ml-4">
                            <button
                                onClick={onAuthClick}
                                className="px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[#ebebeb] text-[12px] md:text-[13px] font-medium transition-all hover:scale-105 bg-[#4A4A4A] hover:bg-[#333] shadow-sm tracking-wide"
                            >
                                Giriş Yap
                            </button>
                        </MagneticWrapper>
                    )}
                </div>
            </nav>
        </header>
    );

}
