import React from 'react';
import { motion } from 'motion/react';
import { LogOut, BarChart2 } from 'lucide-react';

interface NavbarProps {
    gorunum: string;
    setGorunum: (gorunum: any) => void;
    kullanici: any;
    onStart: () => void;
    onStatsClick?: () => void;
    onLogout?: () => void;
    onAuthClick?: () => void;
}

export default function Navbar({
    gorunum,
    setGorunum,
    kullanici,
    onStart,
    onStatsClick,
    onLogout,
    onAuthClick
}: NavbarProps) {

    const goHome = () => {
        setGorunum('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-[100] flex items-center justify-between px-6 md:px-16 pt-8 pb-4 bg-transparent pointer-events-none">
            {/* Logo Area */}
            <div className="flex items-center cursor-pointer pointer-events-auto" onClick={goHome}>
                <span className="text-2xl md:text-[32px] font-bold tracking-tight text-[var(--color-brand-orange)] font-display leading-none">Revize.</span>
            </div>

            {/* Center Links (Always visible except possibly on very small mobile) */}
            <div className="hidden lg:flex items-center gap-10 text-[13px] font-medium text-[#666666] bg-white/40 backdrop-blur-md px-8 py-3 rounded-full border border-black/5 shadow-sm pointer-events-auto">
                <button
                    onClick={() => {
                        if (gorunum !== 'landing') setGorunum('landing');
                        setTimeout(() => document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    className="hover:text-[var(--color-brand-dark)] transition-colors"
                >
                    Nasıl Çalışır
                </button>
                <button
                    onClick={() => {
                        setGorunum('vitrin');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`transition-colors ${gorunum === 'vitrin' ? 'text-[var(--color-brand-dark)]' : 'hover:text-[var(--color-brand-dark)]'}`}
                >
                    Keşfet
                </button>
                <button
                    onClick={() => {
                        setGorunum('community');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`transition-colors ${gorunum === 'community' ? 'text-[var(--color-brand-dark)]' : 'hover:text-[var(--color-brand-dark)]'}`}
                >
                    Topluluk
                </button>
                <a href="#" className="hover:text-[var(--color-brand-dark)] transition-colors">SSS</a>
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-4 pointer-events-auto">
                {kullanici && (
                    <div className="hidden md:flex items-center gap-3 mr-2 border-r border-black/10 pr-4">
                        <button
                            onClick={onStatsClick}
                            className="text-[#666666] hover:text-[var(--color-brand-dark)] transition-colors"
                            title="İstatistikler"
                        >
                            <BarChart2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="text-[#666666] hover:text-red-500 transition-colors"
                            title="Çıkış Yap"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <button
                    onClick={kullanici ? onStart : onAuthClick}
                    className="px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[#ebebeb] text-[12px] md:text-[13px] font-medium transition-all hover:scale-105 bg-[#4A4A4A] hover:bg-[#333] shadow-sm tracking-wide"
                >
                    {kullanici ? (gorunum === 'app' ? 'Yeni Analiz' : 'Uygulamaya Dön') : 'Hemen Başla'}
                </button>
            </div>
        </nav>
    );
}
