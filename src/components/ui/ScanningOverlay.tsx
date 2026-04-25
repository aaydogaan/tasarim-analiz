import React from 'react';
import { motion } from 'framer-motion';

export default function ScanningOverlay() {
    return (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
            {/* Moving Laser Line */}
            <motion.div
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-brand-orange)] to-transparent shadow-[0_0_15px_var(--color-brand-orange)] z-30"
            />

            {/* Glowing Scan Effect */}
            <motion.div
                initial={{ top: "-30%" }}
                animate={{ top: "110%" }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute left-0 right-0 h-[30%] bg-gradient-to-b from-transparent via-[var(--color-brand-orange)]/10 to-transparent z-20"
            />

            {/* Matrix-like data noise (subtle) */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* Tech Corners */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--color-brand-orange)]/50 rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[var(--color-brand-orange)]/50 rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[var(--color-brand-orange)]/50 rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--color-brand-orange)]/50 rounded-br-sm" />

            {/* Scanning Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
                <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--color-brand-orange)] rounded-full animate-pulse shadow-[0_0_8px_var(--color-brand-orange)]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Yapay Zeka Analiz Ediyor...</span>
                </div>
            </div>
        </div>
    );
}
