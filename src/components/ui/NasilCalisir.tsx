import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sliders, Cpu, Sparkles, CheckCircle2, FileText, MousePointer2, Search, Image as ImageIcon } from 'lucide-react';

const steps = [
    {
        number: '1',
        title: 'Tasarımı Yükle',
        description: 'Analiz etmek istediğin tasarımın ekran görününtüsünü veya dosyasını sisteme yükle.',
        icon: Upload,
        mockup: (
            <div className="relative w-full h-full bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-3 z-10"
                >
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <ImageIcon size={24} className="text-[var(--color-brand-orange)]" />
                    </div>
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: ['0%', '100%', '0%'] }}
                            transition={{ duration: 3, repeat: Infinity, times: [0, 0.7, 1] }}
                            className="h-full bg-[var(--color-brand-orange)]"
                        />
                    </div>
                </motion.div>
                {/* Floating particles */}
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -40],
                            x: [0, (i % 2 === 0 ? 20 : -20)],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeOut"
                        }}
                        className="absolute w-1 h-1 bg-[var(--color-brand-orange)] rounded-full"
                        style={{ bottom: '20%', left: `${30 + i * 15}%` }}
                    />
                ))}
            </div>
        )
    },
    {
        number: '2',
        title: 'Detayları Belirt',
        description: 'Tasarımın türünü, platformunu ve hedef kitleni seçerek yapay zekayı bilgilendir.',
        icon: Sliders,
        mockup: (
            <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col justify-center gap-3">
                {[
                    { label: 'Platform', val: 'Mobil App' },
                    { label: 'Kategori', val: 'E-ticaret' }
                ].map((item, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="w-12 h-1.5 bg-slate-200 rounded" />
                        <motion.div
                            animate={{
                                borderColor: ['rgba(0,0,0,0.05)', 'rgba(255,77,0,0.2)', 'rgba(0,0,0,0.05)']
                            }}
                            transition={{ duration: 2, delay: i * 1, repeat: Infinity }}
                            className="w-full h-8 bg-white border border-slate-200 rounded-lg flex items-center px-2 justify-between"
                        >
                            <motion.span
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, delay: i * 1, repeat: Infinity }}
                                className="text-[10px] font-medium text-slate-400"
                            >
                                {item.val}
                            </motion.span>
                            <div className="w-2 h-2 bg-slate-200 rounded-full" />
                        </motion.div>
                    </div>
                ))}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="mt-1 w-full h-8 bg-[var(--color-brand-orange)] rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden"
                >
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                    <div className="w-12 h-1.5 bg-white/40 rounded" />
                </motion.div>
            </div>
        )
    },
    {
        number: '3',
        title: 'AI Analizi',
        description: 'Yapay zekamız renk, tipografi ve kompozisyon kurallarını saniyeler içinde incelesin.',
        icon: Cpu,
        mockup: (
            <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden p-4 flex flex-col justify-center gap-3 relative">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                {/* Connecting Node Animation */}
                <div className="relative z-10 flex justify-around items-center h-12">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.2, 1],
                                backgroundColor: ['#334155', '#ff4d00', '#334155'],
                                boxShadow: ['0 0 0px #ff4d00', '0 0 10px #ff4d00', '0 0 0px #ff4d00']
                            }}
                            transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                            className="w-2.5 h-2.5 rounded-full bg-slate-700"
                        />
                    ))}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <motion.path
                            d="M 30 25 L 70 25 L 110 25"
                            fill="transparent"
                            stroke="#ff4d00"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            animate={{ strokeDashoffset: [0, -8] }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </div>

                <div className="space-y-1.5 relative z-10">
                    {[70, 45, 85].map((w, i) => (
                        <div key={i} className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${w}%` }}
                                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, repeatDelay: 1 }}
                                className="h-full bg-gradient-to-r from-[#ff4d00]/50 to-[#ff4d00]"
                            />
                        </div>
                    ))}
                </div>

                {/* AI Scanner line with glow */}
                <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-[#ff4d00] shadow-[0_0_20px_#ff4d00] z-20"
                />
            </div>
        )
    },
    {
        number: '4',
        title: 'Sonuç & Revize',
        description: 'Detaylı geri bildirimlerini al ve yapay zekanın senin için hazırladığı revize tasarımını gör.',
        icon: Sparkles,
        mockup: (
            <div className="w-full h-full bg-white rounded-xl border border-slate-100 p-4 relative overflow-hidden flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1.5"
                    >
                        <CheckCircle2 size={14} className="text-green-500" />
                        <div className="w-12 h-1.5 bg-slate-100 rounded" />
                    </motion.div>
                    <div className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[8px] font-bold rounded border border-green-100 uppercase tracking-wider">
                        Tamamlandı
                    </div>
                </div>

                <div className="relative h-16 w-full rounded-lg bg-slate-50 border border-slate-100 overflow-hidden group">
                    <motion.div
                        initial={{ x: '0%' }}
                        animate={{ x: ['0%', '50%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 flex"
                    >
                        <div className="min-w-full h-full p-2">
                            <div className="w-full h-full bg-[var(--color-brand-orange)]/5 rounded border border-dashed border-[var(--color-brand-orange)]/20 flex items-center justify-center">
                                <Sparkles size={16} className="text-[var(--color-brand-orange)] opacity-30" />
                            </div>
                        </div>
                        <div className="min-w-full h-full p-2">
                            <div className="w-full h-full bg-slate-200/50 rounded" />
                        </div>
                    </motion.div>

                    {/* Magic Sparkle particles */}
                    <AnimatePresence>
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    x: [0, (i - 1) * 20],
                                    y: [0, (i - 1) * 10]
                                }}
                                transition={{ duration: 1, delay: i * 0.5, repeat: Infinity }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            >
                                <Sparkles size={8} className="text-[var(--color-brand-orange)]" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="space-y-1.5">
                    <motion.div
                        animate={{ width: ['40%', '80%', '40%'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="h-1.5 bg-slate-100 rounded"
                    />
                    <div className="w-1/2 h-1.5 bg-slate-50 rounded" />
                </div>
            </div>
        )
    }
];

export default function NasilCalisir() {
    return (
        <section id="nasil-calisir" className="w-full bg-[var(--color-brand-light)] border-t border-[var(--color-brand-dark)]/10 overflow-hidden">
            {/* Minimal Header */}
            <div className="border-b border-[var(--color-brand-dark)]/10">
                <div className="max-w-screen-xl mx-auto px-8 md:px-16 py-12 md:py-14">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[28px] md:text-[36px] font-bold tracking-tight text-[var(--color-brand-dark)] mb-3"
                    >
                        Nasıl Çalışır<span className="text-[var(--color-brand-orange)]">.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-[#666] text-[14px] md:text-[15px] max-w-lg leading-relaxed"
                    >
                        Tasarımınızı yükleyin, saniyeler içinde profesyonel analiz alın.
                    </motion.p>
                </div>
            </div>

            {/* Compact Cards Grid */}
            <div className="max-w-screen-xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-brand-dark)]/10 border-b border-[var(--color-brand-dark)]/10">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col group hover:bg-white/50 transition-colors duration-500">
                            {/* Visual Area - Square and Smaller */}
                            <div className="aspect-square p-10 relative overflow-hidden">
                                <div className="absolute top-6 left-6 w-7 h-7 rounded-full bg-[var(--color-brand-dark)] text-white flex items-center justify-center font-bold text-[11px] z-30 shadow-sm">
                                    {step.number}
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="w-full h-full relative z-10"
                                >
                                    {step.mockup}
                                </motion.div>
                            </div>

                            {/* Text Area - Compact */}
                            <div className="p-8 border-t border-[var(--color-brand-dark)]/10 flex-1">
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="text-[16px] font-bold mb-2 text-[var(--color-brand-dark)]"
                                >
                                    {step.title}
                                </motion.h3>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="text-[#666] leading-relaxed text-[13px]"
                                >
                                    {step.description}
                                </motion.p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
