import React from 'react';
import { motion } from 'motion/react';
import { LogOut, BarChart2 } from 'lucide-react';

interface HeaderProps {
    gorunum: 'landing' | 'app' | 'vitrin' | 'community';
    setGorunum: (v: 'landing' | 'app' | 'vitrin' | 'community') => void;
    kullanici: any;
    onStatsClick: () => void;
    onLogoutClick: () => void;
    onAuthClick: () => void;
    goHome: () => void;
}

export default function Header({
    gorunum,
    setGorunum,
    kullanici,
    onStatsClick,
    onLogoutClick,
    onAuthClick,
    goHome
}: HeaderProps) {

    const handleNavClick = (view: 'landing' | 'app' | 'vitrin' | 'community', sectionId?: string) => {
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
        <nav className="fixed top-0 w-full z-[100] flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-3 md:py-4 bg-[var(--color-brand-light)]/80 backdrop-blur-xl border-b border-[var(--color-brand-dark)]/5 gap-3 md:gap-0 transition-all duration-300">
            {/* Logo */}
            <div className="cursor-pointer" onClick={goHome}>
                <span className="text-2xl md:text-[32px] font-bold tracking-tight text-[var(--color-brand-orange)] font-display leading-none">Revize.</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-5 md:gap-10 text-[12px] md:text-[13px] font-medium text-[#666666]">
                <button
                    onClick={() => handleNavClick('landing')}
                    className={`transition-colors whitespace-nowrap ${gorunum === 'landing' ? 'text-[var(--color-brand-dark)]' : 'hover:text-[var(--color-brand-dark)]'}`}
                >
                    Anasayfa
                </button>
                <button
                    onClick={() => handleNavClick('landing', 'nasil-calisir')}
                    className="hover:text-[var(--color-brand-dark)] transition-colors whitespace-nowrap"
                >
                    Nasıl Çalışır
                </button>
                <button
                    onClick={() => handleNavClick('vitrin')}
                    className={`transition-colors whitespace-nowrap ${gorunum === 'vitrin' ? 'text-[var(--color-brand-dark)]' : 'hover:text-[var(--color-brand-dark)]'}`}
                >
                    Keşfet
                </button>
                <button
                    onClick={() => handleNavClick('community')}
                    className={`transition-colors whitespace-nowrap ${gorunum === 'community' ? 'text-[var(--color-brand-dark)]' : 'hover:text-[var(--color-brand-dark)]'}`}
                >
                    Topluluk
                </button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
                {gorunum !== 'app' && (
                    <button
                        onClick={() => setGorunum('app')}
                        className="hidden sm:block text-[var(--color-brand-orange)] font-bold text-[13px] hover:scale-105 transition-transform mr-2"
                    >
                        Yeni Analiz
                    </button>
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
                    <button
                        onClick={onAuthClick}
                        className="px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[#ebebeb] text-[12px] md:text-[13px] font-medium transition-all hover:scale-105 bg-[#4A4A4A] hover:bg-[#333] shadow-sm tracking-wide md:ml-4"
                    >
                        Giriş Yap
                    </button>
                )}
            </div>
        </nav>
    );
}
