import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const ROTATING_WORDS = ["Pikselin", "Kodun", "Tasarımın", "Revizyonun", "Verinin"];
import { Linkedin, Github, Layout, Zap, Camera, MoveRight } from 'lucide-react';

export default function About() {
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-[var(--bg-primary)] min-h-screen font-sans selection:bg-[var(--color-brand-orange)] selection:text-white pb-32">
            
            {/* 1. TEAM SECTION */}
            <section className="relative pt-12 md:pt-16 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
                {/* Background Grid & Glows - Lighter Grid for Light Mode */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] opacity-70 pointer-events-none" />
                <div className="absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] opacity-70 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl mx-auto mb-6 md:mb-10"
                >
                    <h1 className="text-[40px] md:text-[64px] font-black text-[#111111] tracking-tighter leading-[1.2] mb-6 flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4">
                        <div className="relative inline-flex items-center justify-center overflow-hidden h-[60px] md:h-[90px] min-w-[200px] md:min-w-[340px]">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={wordIndex}
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -40, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="relative inline-block text-[var(--text-primary)] px-4 md:px-6"
                                >
                                    {/* Highlighter Brush Stroke SVG */}
                                    <svg 
                                        className="absolute -inset-x-1 inset-y-1 w-[calc(100%+0.5rem)] h-[calc(100%-0.5rem)] -z-10 text-[var(--color-brand-orange)] opacity-[0.25]" 
                                        viewBox="0 0 100 100" 
                                        preserveAspectRatio="none"
                                    >
                                        <path d="M-2,30 Q45,20 102,32" stroke="currentColor" strokeWidth="28" strokeLinecap="round" fill="none" />
                                        <path d="M102,50 Q60,60 -2,55" stroke="currentColor" strokeWidth="28" strokeLinecap="round" fill="none" />
                                        <path d="M-2,75 Q50,65 102,80" stroke="currentColor" strokeWidth="28" strokeLinecap="round" fill="none" />
                                    </svg>
                                    <span className="relative z-10">{ROTATING_WORDS[wordIndex]}</span>
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span>Arkasındakiler.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Revizele'yi tasarlayan, kodlayan ve hayata geçiren ekip.
                    </p>
                </motion.div>

                {/* Decorative background element */}
                <div className="absolute top-24 left-10 md:left-20 text-[var(--color-brand-orange)] opacity-30 hidden md:block">
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50 0C55 20 65 35 50 50C35 35 45 20 50 0Z" />
                        <path d="M100 50C80 55 65 65 50 50C65 35 80 45 100 50Z" />
                        <path d="M50 100C45 80 35 65 50 50C65 65 55 80 50 100Z" />
                        <path d="M0 50C20 45 35 35 50 50C35 65 20 55 0 50Z" />
                        <path d="M85 15C70 25 60 40 50 50C60 40 70 55 85 85C70 70 55 60 50 50C55 40 70 30 85 15Z" opacity="0.5"/>
                    </svg>
                </div>

                {/* Staggered Team Cards - Premium Editorial Design */}
                <div className="relative z-20 flex flex-col md:flex-row justify-center items-center md:items-stretch gap-12 md:gap-16 lg:gap-24 w-full max-w-[1400px] mx-auto px-6 lg:px-12 md:mt-2">
                    
                    {/* Card 1: Recep */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="w-full md:w-1/3 flex flex-col items-center md:translate-y-12"
                    >
                        <div className="flex flex-col gap-5 w-full">
                            {/* Card Image + Overlay */}
                            <div className="relative w-full h-[420px] md:h-[480px] rounded-[32px] overflow-hidden group bg-zinc-900 border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(255,77,0,0.2)]">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" alt="Recep Aydoğan" className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                                
                                {/* Overlay inside Card */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent p-6 md:p-8 text-left opacity-90 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end h-1/2">
                                    <h3 className="text-[28px] md:text-[32px] font-black text-white mb-2 tracking-tight leading-none">
                                        Recep <br/><span className="text-[var(--color-brand-orange)]">Aydoğan</span>
                                    </h3>
                                    <p className="text-gray-300 text-[13px] md:text-sm font-medium leading-relaxed line-clamp-3">
                                        Revizele'nin sinir sistemini yazdı. Piksel tarama algoritmalarından kullanıcı akışına kadar tüm teknik katmanı sıfırdan kurdu.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Outside Badges & Socials */}
                            <div className="flex items-center justify-between px-2 w-full">
                                <div className="px-5 py-2 rounded-full border border-[var(--border-primary)] text-[13px] font-black uppercase tracking-wider text-[var(--text-primary)] bg-[var(--card-bg)] shadow-sm transition-colors hover:border-[var(--color-brand-orange)]">
                                    // Full-Stack Dev
                                </div>
                                <div className="flex gap-2">
                                    <a href="#" className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm">
                                        <Github className="w-4 h-4" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[#0a66c2] hover:border-[#0a66c2] transition-all shadow-sm">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Selman */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-1/3 flex flex-col items-center md:-translate-y-4"
                    >
                        <div className="flex flex-col gap-5 w-full">
                            {/* Card Image + Overlay */}
                            <div className="relative w-full h-[420px] md:h-[480px] rounded-[32px] overflow-hidden group bg-zinc-900 border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(255,77,0,0.3)]">
                                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80" alt="Selman Aydoğan" className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                                
                                {/* Overlay inside Card */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent p-6 md:p-8 text-left opacity-95 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end h-1/2">
                                    <h3 className="text-[28px] md:text-[32px] font-black text-white mb-2 tracking-tight leading-none">
                                        Selman <br/><span className="text-[var(--color-brand-orange)]">Aydoğan</span>
                                    </h3>
                                    <p className="text-gray-300 text-[13px] md:text-sm font-medium leading-relaxed line-clamp-3">
                                        Bir tasarım analiz aracının kendi görselliğinden taviz vermemesi gerektiğini savundu. Platformun her rengi, her boşluğu onun kararı.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Outside Badges & Socials */}
                            <div className="flex items-center justify-between px-2 w-full">
                                <div className="px-5 py-2 rounded-full border border-gray-200 text-[13px] font-black uppercase tracking-wider text-gray-800 bg-white shadow-sm transition-colors hover:border-[var(--color-brand-orange)]">
                                    ✦ UI/UX Designer
                                </div>
                                <div className="flex gap-2">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1769ff] hover:border-[#1769ff] transition-all shadow-sm font-bold text-[11px]">
                                        Be
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0a66c2] hover:border-[#0a66c2] transition-all shadow-sm">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Enes */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="w-full md:w-1/3 flex flex-col items-center md:translate-y-12"
                    >
                        <div className="flex flex-col gap-5 w-full">
                            {/* Card Image + Overlay */}
                            <div className="relative w-full h-[420px] md:h-[480px] rounded-[32px] overflow-hidden group bg-zinc-900 border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(255,77,0,0.2)]">
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" alt="Enes Umut Parlak" className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                                
                                {/* Overlay inside Card */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent p-6 md:p-8 text-left opacity-90 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end h-1/2">
                                    <h3 className="text-[28px] md:text-[32px] font-black text-white mb-2 tracking-tight leading-none">
                                        Enes Umut <br/><span className="text-[var(--color-brand-orange)]">Parlak</span>
                                    </h3>
                                    <p className="text-gray-300 text-[13px] md:text-sm font-medium leading-relaxed line-clamp-3">
                                        Kullanıcının platformda kaybolmaması için her tıklamayı, her geçişi düşündü. Revizele'yi ilk kez açan birinin ne hissedeceğini tasarladı.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Outside Badges & Socials */}
                            <div className="flex items-center justify-between px-2 w-full">
                                <div className="px-5 py-2 rounded-full border border-gray-200 text-[13px] font-black uppercase tracking-wider text-gray-800 bg-white shadow-sm transition-colors hover:border-[var(--color-brand-orange)]">
                                    ✦ UI/UX Designer
                                </div>
                                <div className="flex gap-2">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1769ff] hover:border-[#1769ff] transition-all shadow-sm font-bold text-[11px]">
                                        Be
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0a66c2] hover:border-[#0a66c2] transition-all shadow-sm">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* 2. VISION / WHY WE BUILT IT SECTION */}
            <section className="pt-32 pb-24 px-6 relative z-10 border-t border-[var(--border-primary)] mt-12 bg-[var(--bg-primary)]">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
                    {/* Left: Big Title */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-5/12 shrink-0 sticky top-32"
                    >
                        <h2 className="text-[40px] md:text-[64px] font-black text-[var(--text-primary)] leading-[1.1] tracking-tighter">
                            Tasarımcı <br />körlüğüne karşı <br />
                            <span className="text-[var(--color-brand-orange)]">bir silah.</span>
                        </h2>
                    </motion.div>

                    {/* Right: Paragraphs */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-7/12 flex flex-col gap-8 text-xl md:text-2xl text-[var(--text-secondary)] font-medium leading-relaxed tracking-tight"
                    >
                        <p>
                            Çoğu zaman günlerce üzerinde çalışılan tasarımlarda küçük ama kritik hatalar gözden kaçar. Tipografi tutarsızlıkları, kontrast sorunları, hizalama bozuklukları — bunları kendi gözünle görmek zordur. Bunu bizzat yaşadık.
                        </p>
                        <p>
                            Revizele'yi yapay zekanın tarafsız gözünü herkesin kullanabileceği bir araca dönüştürmek için geliştirdik. İçgüdüyle tasarım yapanlara akademik ve profesyonel bir perspektif kazandırmak istedik.
                        </p>
                        <p className="text-[var(--text-primary)] font-bold border-l-4 border-[var(--color-brand-orange)] pl-6 py-2 bg-[var(--color-brand-orange)]/5 rounded-r-2xl">
                            Amatör tasarımcıdan deneyimli profesyonele — estetik kaliteye veriyle ulaşmak isteyen herkes için.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 3. FEATURES SECTION */}
            <section className="py-24 px-6 bg-[#111111] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                
                <div className="max-w-6xl mx-auto relative z-10">
                    
                    {/* Connector Title */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center text-center mb-20"
                    >
                        <div className="w-px h-16 bg-gradient-to-b from-transparent to-[var(--color-brand-orange)] mb-8" />
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Bunu nasıl yapıyoruz?</h2>
                    </motion.div>

                    {/* 3 Features Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 hover:bg-white/10 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[var(--color-brand-orange)] transition-colors">
                                <Camera className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Piksel Bazlı Tarama</h3>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                Renk ve kontrast uyumsuzluklarını, okunabilirlik hatalarını piksel düzeyinde tarar ve anında raporlar.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 hover:bg-white/10 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500 transition-colors">
                                <Layout className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Mimari Düzen Kontrolü</h3>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                Gestalt algı prensiplerine göre boşlukları, görsel hiyerarşiyi ve hizalamaları denetler.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 hover:bg-white/10 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 transition-colors">
                                <Zap className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Anında Revizyon</h3>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                Hataları listelemekle kalmaz, doğrusunun nasıl olması gerektiğine dair uygulanabilir öneriler sunar.
                            </p>
                        </motion.div>

                    </div>

                </div>
            </section>

        </div>
    )
}
