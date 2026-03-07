import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, Coffee, Github, Linkedin, ExternalLink, Heart } from 'lucide-react';

export default function About() {
    return (
        <div className="w-full pt-8 md:pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 md:mb-24 max-w-3xl mx-auto"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] text-xs font-bold uppercase tracking-widest mb-6">
                    <Heart className="w-3 h-3 fill-current" /> Biz Kimiz?
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--color-brand-dark)] tracking-tighter mb-6 leading-tight">
                    Tasarımı <span className="text-[var(--color-brand-orange)]">Herkes İçin</span><br />Erişilebilir Kılıyoruz.
                </h1>
                <p className="text-[var(--color-brand-dark)]/60 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                    RevizeAI, kendi içgüdüleriyle tasarım yapanlara akademik ve profesyonel bir göz sağlamak amacıyla doğdu. Hiçbir tasarım yalnız gelişmez; her zaman bir revizyona ihtiyaç vardır.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-[var(--color-brand-dark)]/5 group hover:border-blue-500/20 transition-colors"
                >
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Target className="w-7 h-7 text-blue-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-[var(--color-brand-dark)] mb-4 tracking-tight">Neden Çıktı?</h2>
                    <p className="text-[var(--color-brand-dark)]/70 leading-relaxed font-medium">
                        Çoğu zaman günlerce üzerinde uğraşılan tasarımların teknik hatalarını, küçük tipografi veya renk uyumsuzluklarını kendi gözümüzle görmek zordur. Tasarımcı körlüğünü yenmek ve çok daha temiz arayüzler elde etmek için, yapay zekanın acımasız ama kesin doğrularını kullanarak, tasarımcıları geliştiren tarafsız bir analiz platformu oluşturmak istedik.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-[var(--color-brand-dark)]/5 group hover:border-emerald-500/20 transition-colors"
                >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-[var(--color-brand-dark)] mb-4 tracking-tight">Kimler İçin?</h2>
                    <p className="text-[var(--color-brand-dark)]/70 leading-relaxed font-medium">
                        Kendini geliştirmek isteyen amatör/junior tasarımcılardan tutun, müşterisine iş teslim etmeden önce "gözden kaçan bir detay var mı?" demek isteyen deneyimli freelancerlara, sosyal medya yöneticilerinden pazarlama uzmanlarına kadar görsel kaliteye ve dönüşüm oranlarına estetikle ulaşmak isteyen herkes içindir.
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full bg-[var(--color-brand-dark)] rounded-[40px] p-8 md:p-16 overflow-hidden relative shadow-2xl"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="lg:w-1/3 w-full flex justify-center">
                        <div className="relative group/photo">
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-[#ff4d00]/20 blur-3xl rounded-full scale-110 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="w-64 h-64 md:w-80 md:h-80 rounded-[40px] overflow-hidden border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center -rotate-3 group-hover/photo:rotate-0 transition-transform duration-500">
                                {/* Geliştirici Placeholder Fotoğrafı (Eğer resim yoksa ikon gösterilir) */}
                                <div className="text-center absolute inset-0 flex flex-col items-center justify-center z-0">
                                    <Coffee className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                    <span className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">Geliştirici<br />Fotoğrafı</span>
                                </div>
                                {/* Resim linki eklendiğinde devreye girer */}
                                <img src="https://avatars.githubusercontent.com/u/84683050?v=4" alt="Selman Aydoğan" className="absolute inset-0 w-full h-full object-cover z-10 opacity-90 group-hover/photo:opacity-100 transition-opacity duration-300 grayscale-[0.2]" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3 w-full text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                            Geliştirici & Üretici
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Selman Aydoğan
                        </h3>
                        <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0 font-medium">
                            Yazılım ve tasarımın sadece bir araç değil; insanların hikayelerini anlatmak, duygularına dokunmak için bir sanat olduğuna inanıyorum. Sıklıkla harika fikirlerle yola çıkıp teknik detaylarda boğulan kreatiflere yardım etmek en büyük motivasyonum. Kodları tasarımla, estetiği matematiksel verilerle harmanlayan bu projeyi geliştirirken geceler boyu harcanan kahveleri saymıyorum bile. ☕
                        </p>

                        <div className="flex items-center justify-center lg:justify-start gap-4">
                            <a href="https://github.com/aaydogaan" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-105">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 hover:bg-[#0a66c2]/80 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-105">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="mailto:selman@example.com" className="flex items-center gap-2 px-6 h-12 rounded-full bg-white text-[var(--color-brand-dark)] font-bold text-sm tracking-wide hover:scale-105 hover:bg-gray-100 transition-all ml-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                İletişime Geç <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
