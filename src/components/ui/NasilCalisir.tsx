import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sliders, Cpu, Sparkles, CheckCircle2, FileText, MousePointer2, Search, Image as ImageIcon, Share2, Download, ArrowUpRight, ChevronRight } from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Tasarımı Yükle',
        description: 'Ekran görüntüsünü sürükle bırak veya seç.',
        icon: Upload,
        mockup: (
            <div className="relative w-full h-full bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex flex-col items-center gap-3"
                >
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-[var(--color-brand-orange)]">
                        <ImageIcon size={32} />
                    </div>
                </motion.div>
            </div>
        )
    },
    {
        number: '02',
        title: 'Detayları Belirt',
        description: 'Tür, platform ve hedef kitleni seç.',
        icon: Sliders,
        mockup: (
            <div className="w-full h-full bg-slate-50/50 rounded-2xl border border-slate-100 p-6 flex flex-col justify-center gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="w-16 h-2 bg-slate-200 rounded" />
                        <div className="w-full h-10 bg-white border border-slate-200 rounded-xl" />
                    </div>
                ))}
            </div>
        )
    },
    {
        number: '03',
        title: 'AI Analizi',
        description: 'AI saniyeler içinde tasarımını inceler.',
        icon: Cpu,
        mockup: (
            <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-4 border-dashed border-[var(--color-brand-orange)]/30 border-t-[var(--color-brand-orange)]"
                />
                <div className="space-y-2 w-1/2">
                    <div className="h-1.5 bg-white/10 rounded-full" />
                    <div className="h-1.5 bg-white/10 rounded-full w-3/4" />
                </div>
            </div>
        )
    },
    {
        number: '04',
        title: 'Sonuç & Paylaş',
        description: 'Geri bildirimleri al ve tasarımını paylaş.',
        icon: Sparkles,
        mockup: (
            <div className="w-full h-full bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <div className="w-16 h-2 bg-slate-100 rounded" />
                    </div>
                    <div className="px-2.5 py-1 bg-green-50 text-green-600 text-[9px] font-bold rounded-lg border border-green-100">PUAN: 92</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="aspect-square bg-white shadow-md border border-slate-100 rounded-xl flex items-center justify-center text-[var(--color-brand-orange)]">
                        <Download size={20} />
                    </div>
                    <div className="aspect-square bg-white shadow-md border border-slate-100 rounded-xl flex items-center justify-center text-blue-500">
                        <Share2 size={20} />
                    </div>
                </div>

                <div className="mt-2 space-y-1.5">
                    <div className="h-1.5 bg-slate-50 rounded-full w-full" />
                    <div className="h-1.5 bg-slate-50 rounded-full w-2/3" />
                </div>

                <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-2 right-12"
                >
                    <Sparkles size={12} className="text-[var(--color-brand-orange)]/40" />
                </motion.div>
            </div>
        )
    }
];

export default function NasilCalisir() {
    const [activeStep, setActiveStep] = useState(0);

    // Auto switch steps every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="nasil-calisir" className="w-full bg-[var(--color-brand-light)] py-20 overflow-hidden relative">
            {/* Grid Background */}
            <div
                className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,rgba(0,0,0,0)_1px),linear-gradient(to_bottom,var(--grid-color)_1px,rgba(0,0,0,0)_1px)] bg-[size:32px_32px] pointer-events-none"
                style={{
                    maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                }}
            />

            <div className="max-w-screen-xl mx-auto px-8 md:px-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* Left Side: Text Content */}
                    <div className="lg:col-span-5 space-y-12">
                        <div>
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="text-[var(--color-brand-orange)] font-bold text-xs uppercase tracking-[0.2em] mb-4 block"
                            >
                                SÜREÇ NASIL İŞLER?
                            </motion.span>
                            <h2 className="text-[32px] md:text-[42px] font-bold text-[var(--color-brand-dark)] leading-tight">
                                Hızlıca <span className="text-[var(--color-brand-orange)]">Kusursuzlaştır.</span>
                            </h2>
                        </div>

                        {/* Steps List */}
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveStep(index)}
                                    className={`w-full group text-left p-6 rounded-[24px] transition-all duration-500 border relative overflow-hidden ${activeStep === index
                                        ? 'bg-white border-[var(--color-brand-dark)]/5 shadow-xl shadow-black/[0.02]'
                                        : 'bg-transparent border-transparent hover:bg-white/40'
                                        }`}
                                >
                                    {/* Progress line for active step */}
                                    {activeStep === index && (
                                        <motion.div
                                            layoutId="progress-bar"
                                            className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--color-brand-orange)]"
                                        />
                                    )}

                                    <div className="flex items-start gap-4">
                                        <span className={`text-xs font-black font-display pt-1 ${activeStep === index ? 'text-[var(--color-brand-orange)]' : 'text-[var(--color-brand-dark)]/20'}`}>
                                            {step.number}
                                        </span>
                                        <div>
                                            <h3 className={`font-bold transition-colors ${activeStep === index ? 'text-[var(--color-brand-dark)]' : 'text-[var(--color-brand-dark)]/40'}`}>
                                                {step.title}
                                            </h3>
                                            <AnimatePresence mode="wait">
                                                {activeStep === index && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="text-[13px] text-[#666] leading-relaxed mt-2"
                                                    >
                                                        {step.description}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Visual Showcase */}
                    <div className="lg:col-span-7 sticky top-32">
                        <div className="relative aspect-[4/3] w-full max-w-[640px] mx-auto">
                            {/* Decorative background cards */}
                            <div className="absolute inset-0 bg-white/40 blur-3xl scale-95 translate-y-8 rounded-[40px]" />

                            <div className="relative h-full w-full bg-white rounded-[40px] border border-[var(--color-brand-dark)]/5 shadow-2xl overflow-hidden p-10 md:p-16 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 1.1, y: -20 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        className="w-full h-full flex items-center justify-center"
                                    >
                                        {steps[activeStep].mockup}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Step Indicators (Dots) for mobile */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeStep === i ? 'w-4 bg-[var(--color-brand-orange)]' : 'bg-[var(--color-brand-dark)]/10'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
