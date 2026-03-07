import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, Coffee, Github, Linkedin, ExternalLink, Sparkles, Layout, Zap, Camera, MoveRight, ArrowRight } from 'lucide-react';

export default function About() {
    return (
        <div className="w-full bg-[#f8f9fa] min-h-screen font-sans selection:bg-[var(--color-brand-orange)] selection:text-white">

            {/* 1. HERO SECTION (Framer Like) */}
            <section className="relative pt-32 pb-40 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
                {/* Subtle Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-70 pointer-events-none" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-orange-100/60 rounded-full blur-[100px] opacity-70 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-orange)]" /> RevizeAI Hikayesi
                    </div>

                    <h1 className="text-[56px] md:text-[80px] lg:text-[96px] font-black text-[#111111] tracking-tighter leading-[1.05] mb-8">
                        Tasarımı doğrudan <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">
                            geleceğe bağla.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        Hiçbir tasarım yalnız gelişmez; her zaman bir revizyona ihtiyaç vardır.
                        İçgüdüleriyle tasarım yapanlara akademik ve profesyonel bir göz sağlıyoruz.
                    </p>

                    <button className="bg-[#111111] hover:bg-[#222222] text-white px-8 py-4 rounded-full font-semibold text-lg transition-transform hover:scale-105 inline-flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
                        Hikayeyi Keşfet <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Floating Mockup Element below hero */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mt-20 w-full max-w-5xl mx-auto z-20"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] to-transparent z-10 h-32 bottom-0 w-full" />

                    <div className="bg-white/80 backdrop-blur-3xl border border-white p-6 rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.07)] grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
                        {/* Decoration Lines */}
                        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent hidden md:block" />
                        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent hidden md:block" />

                        <div className="p-6">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                                <Camera className="w-6 h-6 text-gray-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Gelişmiş Görüntü İşleme</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">Piksel bazlı tarama algoritmalarıyla tasarımdaki renk ve kontrast hatalarını saniyeler içinde analiz eder.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-12 h-12 bg-[var(--color-brand-orange)]/10 rounded-2xl flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-[var(--color-brand-orange)]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Anında Revizyon</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">Kullanıcının yaptığı hataları sadece söylemekle kalmaz, doğrusunun nasıl olması gerektiğini gösterir.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                <Layout className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Mimari Düzen Kontrolü</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">Gestalt algı prensiplerine göre sayfadaki boşlukları, hiyerarşiyi ve hizalamaları kusursuzca denetler.</p>
                        </div>
                    </div>

                    {/* Center overlapping black badge */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#111111] text-white p-4 rounded-3xl shadow-xl flex items-center justify-center border-4 border-[#f8f9fa]">
                        <Sparkles className="w-8 h-8" />
                    </div>
                </motion.div>
            </section>

            {/* 2. TEXT/STORY SECTION (Like "Remember the days...") */}
            <section className="py-32 px-6 max-w-3xl mx-auto space-y-12 text-center md:text-left">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-2xl md:text-3xl text-gray-500 font-medium leading-snug tracking-tight"
                >
                    Çoğu zaman günlerce üzerinde uğraşılan tasarımların teknik hatalarını, küçük tipografi veya renk uyumsuzluklarını
                    <span className="text-gray-900 font-bold bg-white px-2 py-1 rounded-lg shadow-sm mx-1">kendi gözümüzle görmek zordur.</span>
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-2xl md:text-3xl text-gray-500 font-medium leading-snug tracking-tight"
                >
                    Tasarımcı körlüğünü yenmek ve çok daha temiz arayüzler elde etmek için, yapay zekanın acımasız ama kesin doğrularını kullanarak tarafsız bir analiz platformu oluşturmak istedik. 🎯
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-2xl md:text-3xl text-gray-500 font-medium leading-snug tracking-tight"
                >
                    Kendini geliştirmek isteyen amatör tasarımcılardan tutun, müşterisine iş teslim etmeden önce <span className="text-gray-900 font-bold underline decoration-4 decoration-gray-200">"gözden kaçan bir detay var mı?"</span> demek isteyen deneyimli profesyonellere kadar...
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-2xl md:text-3xl text-gray-500 font-medium leading-snug tracking-tight"
                >
                    RevizeAI estetik kaliteye verilerle ulaşmak isteyen herkes içindir. ✨
                </motion.p>
            </section>

            {/* 3. DARK SECTION: CREATOR / BEHIND THE SCENES */}
            <section className="py-32 px-6 bg-[#0f1013] text-white relative overflow-hidden flex flex-col items-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-16">

                    {/* Info Side */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start text-left shrink-0">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6 border border-gray-800 bg-gray-900/50 px-4 py-2 rounded-full">
                            Geliştirici & Üretici
                        </p>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]">
                            Selman <br /> Aydoğan
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                            "Yazılım ve tasarımın sadece bir araç değil; insanların hikayelerini anlatmak, duygularına dokunmak için bir sanat olduğuna inanıyorum."
                            <br /><br />
                            Sıklıkla harika fikirlerle yola çıkıp teknik detaylarda boğulan kreatiflere yardım etmek en büyük motivasyonum.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com/aaydogaan" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl flex items-center gap-3 transition-colors text-white font-semibold">
                                <Github className="w-5 h-5" /> GitHub
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="bg-[#0a66c2]/80 hover:bg-[#0a66c2] px-6 py-4 rounded-2xl flex items-center gap-3 transition-colors text-white font-semibold">
                                <Linkedin className="w-5 h-5" /> LinkedIn
                            </a>
                        </div>
                    </div>

                    {/* Interactive Phone / Avatar Side */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

                        <div className="bg-[#1c1d21] border border-gray-800 rounded-[40px] p-2 md:p-4 shadow-2xl relative w-full max-w-[400px]">
                            <div className="bg-[#0f1013] rounded-[36px] overflow-hidden relative aspect-[4/5] flex items-center justify-center p-8 group">

                                {/* Decorative Lines */}
                                <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50" />
                                <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50" />

                                {/* Photo / Avatar */}
                                <div className="relative z-10 w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-[#2a2b30] group-hover:scale-105 transition-transform duration-700 shadow-2xl">
                                    <img
                                        src="https://avatars.githubusercontent.com/u/84683050?v=4"
                                        alt="Selman Aydoğan"
                                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>

                                {/* Floating Stats / Tags */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-2 whitespace-nowrap shadow-xl"
                                >
                                    <Coffee className="w-4 h-4 text-[var(--color-brand-orange)]" />
                                    <span className="text-sm font-bold tracking-wider text-gray-200">100+ Fincan Kahve</span>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    )
}
