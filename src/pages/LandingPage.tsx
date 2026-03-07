import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import Footer from '../components/ui/Footer';
import AnalizEtButton from '../components/ui/AnalizEtButton';
import NasilCalisir from '../components/ui/NasilCalisir';
import CommunitySpotlight from '../components/ui/CommunitySpotlight';
import CommunityCTA from '../components/ui/CommunityCTA';

interface LandingPageProps {
    onStart: () => void;
    onVitrinClick: () => void;
    onCommunityClick: () => void;
}

export default function LandingPage({ onStart, onVitrinClick, onCommunityClick }: LandingPageProps) {
    const brandOrange = "var(--color-brand-orange, #ff4d00)";

    return (
        <div className="min-h-screen bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] font-sans overflow-x-hidden selection:bg-[#ff4d00] selection:text-white">

            {/* Navbar (Agero style exact match) */}
            <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-16 pt-8 pb-4 bg-transparent">
                {/* Logo Area */}
                <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <span className="text-2xl md:text-[32px] font-bold tracking-tight text-[var(--color-brand-orange)] font-display leading-none">Revize.</span>
                </div>

                {/* Center Links */}
                <div className="hidden lg:flex items-center gap-10 text-[13px] font-medium text-[#666666]">
                    <button
                        onClick={() => document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth' })}
                        className="hover:text-[var(--color-brand-dark)] transition-colors"
                    >
                        Nasıl Çalışır
                    </button>
                    <a href="#" className="hover:text-[var(--color-brand-dark)] transition-colors">Özellikler</a>
                    <button
                        onClick={onVitrinClick}
                        className="hover:text-[var(--color-brand-dark)] transition-colors"
                    >
                        Keşfet
                    </button>
                    <button
                        onClick={onCommunityClick}
                        className="hover:text-[var(--color-brand-dark)] transition-colors"
                    >
                        Topluluk
                    </button>
                    <a href="#" className="hover:text-[var(--color-brand-dark)] transition-colors">SSS</a>
                </div>

                {/* Right Action */}
                <button
                    onClick={onStart}
                    className="px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[#ebebeb] text-[12px] md:text-[13px] font-medium transition-all hover:scale-105 bg-[#4A4A4A] hover:bg-[#333] shadow-sm tracking-wide"
                >
                    Hemen Başla
                </button>
            </nav>

            {/* Hero Section */}
            <main className="flex flex-col items-center pt-32 md:pt-48 pb-12 px-6 relative z-10 w-full max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center text-center w-full"
                >
                    <div className="relative mt-8 md:mt-16 group w-full">
                        {/* Moving Glossy Blur Effect - Wandering Blobs */}
                        <div className="absolute -inset-4 md:-inset-10 pointer-events-none z-20 overflow-hidden select-none">
                            {/* Blob 1: Large wandering blur */}
                            <motion.div
                                animate={{
                                    left: ["-10%", "40%", "80%", "20%", "-10%"],
                                    top: ["10%", "60%", "20%", "80%", "10%"],
                                    scale: [1, 1.2, 0.9, 1.1, 1],
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute w-[200px] md:w-[350px] h-[200px] md:h-[350px] bg-white/[0.04] backdrop-blur-[8px] md:backdrop-blur-[12px] rounded-full"
                                style={{
                                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 75%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 75%)',
                                }}
                            />

                            {/* Blob 2: Medium wandering blur (opposite rhythm) */}
                            <motion.div
                                animate={{
                                    left: ["90%", "20%", "50%", "80%", "90%"],
                                    top: ["70%", "20%", "80%", "30%", "70%"],
                                    scale: [1, 0.8, 1.3, 1, 1],
                                }}
                                transition={{
                                    duration: 25,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 2
                                }}
                                className="absolute w-[150px] md:w-[300px] h-[150px] md:h-[300px] bg-white/[0.03] backdrop-blur-[6px] md:backdrop-blur-[8px] rounded-full"
                                style={{
                                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 75%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 75%)',
                                }}
                            />

                            {/* Blob 3: Faster, smaller 'highlight' blur */}
                            <motion.div
                                animate={{
                                    left: ["20%", "70%", "10%", "90%", "20%"],
                                    top: ["40%", "10%", "90%", "50%", "40%"],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute w-[100px] md:w-[200px] h-[100px] md:h-[200px] bg-white/[0.05] backdrop-blur-[4px] rounded-full"
                                style={{
                                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
                                }}
                            />

                            {/* Fast Gloss Streak remains for premium feel */}
                            <motion.div
                                animate={{
                                    left: ["-100%", "200%"],
                                }}
                                transition={{
                                    duration: 7,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 3
                                }}
                                className="absolute w-[150px] h-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent skew-x-[-20deg] blur-[30px] z-30"
                            />
                        </div>

                        <div className="text-[32px] sm:text-[42px] md:text-[64px] lg:text-[88px] font-display font-bold leading-[1.1] tracking-[-0.03em] flex flex-col items-center relative z-10 transition-all duration-700 group-hover:scale-[1.01]">
                            {/* Line 1 */}
                            <div className="flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-1 py-1">
                                <span className="text-[var(--color-brand-dark)]">Yapay Zeka</span>
                                <motion.div
                                    animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-[35px] sm:w-[45px] md:w-[80px] h-[35px] sm:h-[45px] md:h-[80px] rounded-[50%] overflow-hidden relative shadow-[0_8px_30px_rgb(255,77,0,0.3)] bg-[#FF4D00] flex items-center justify-center -mb-1 md:-mb-2"
                                >
                                    <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80" className="w-[85%] h-[85%] object-cover object-top mix-blend-luminosity opacity-40 rounded-full" alt="AI Icon" />
                                </motion.div>
                                <span className="text-[#FF4D00]">Destekli</span>
                            </div>

                            {/* Line 2 */}
                            <div className="flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-1 py-1">
                                <span className="text-[#7A7A7A]">Tasarım</span>
                                <motion.div
                                    animate={{ y: [0, 8, 0], rotate: [0, -2, 2, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="w-[35px] sm:w-[45px] md:w-[80px] h-[35px] sm:h-[45px] md:h-[80px] rounded-[50%] overflow-hidden relative shadow-lg -mb-1 md:-mb-2 border border-[var(--color-brand-dark)]/5"
                                >
                                    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover grayscale-[20%]" alt="Design Icon" />
                                </motion.div>
                                <span className="text-[var(--color-brand-dark)]">Analizi</span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-[#7A7A7A] text-[14px] md:text-[17px] max-w-2xl mx-auto leading-relaxed font-medium px-4">
                        RevizeAI ile tasarımlarınızı analiz edin, eksikleri saniyeler içinde fark edin <br className="hidden md:block" /> ve mükemmel tasarım uyumunu yakalayın.
                    </p>

                    {/* Action button */}
                    <div className="mt-10 md:mt-12">
                        <AnalizEtButton onClick={onStart} />
                    </div>

                </motion.div>
            </main>

            <NasilCalisir />

            <CommunitySpotlight onExploreClick={onVitrinClick} />

            {/* Tilted Marquee Section */}
            <div className="w-full overflow-hidden py-24 md:py-32 relative flex flex-col items-center justify-center bg-[var(--color-brand-light)] mt-10">
                {/* Orange Banner */}
                <div className="absolute w-[150vw] md:w-[120vw] -left-[25vw] md:-left-[10vw] bg-[#FF4D00] py-3 md:py-5 transform rotate-[-4deg] z-10 whitespace-nowrap overflow-hidden flex shadow-2xl outline outline-2 outline-white/10">
                    <motion.div
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ duration: 200, ease: "linear", repeat: Infinity }}
                        className="flex items-center text-white text-xl md:text-3xl lg:text-4xl font-display font-black tracking-tight w-max"
                    >
                        {Array(15).fill("Arayüz Analizi ✕ Renk Uyumu ✕ Tipografi ✕ Kompozisyon ✕").map((text, i) => (
                            <span key={i} className="mx-4 md:mx-6 px-2">{text}</span>
                        ))}
                    </motion.div>
                </div>
                {/* Black Banner */}
                <div className="absolute w-[150vw] md:w-[120vw] -left-[25vw] md:-left-[10vw] bg-[#111111] py-3 md:py-5 transform rotate-[3deg] z-0 whitespace-nowrap overflow-hidden flex shadow-2xl">
                    <motion.div
                        animate={{ x: ["-50%", "0%"] }}
                        transition={{ duration: 200, ease: "linear", repeat: Infinity }}
                        className="flex items-center text-[#e0e0e0] text-lg md:text-2xl font-bold tracking-wide w-max"
                    >
                        {Array(15).fill("Hızlı Sonuçlar ✕ Profesyonel Geri Bildirim ✕ 100+ Mutlu Tasarımcı ✕").map((text, i) => (
                            <span key={i} className="mx-4 md:mx-6 px-2">{text}</span>
                        ))}
                    </motion.div>
                </div>
            </div>

            <CommunityCTA />

            {/* ── Contact Section - Pixel Perfect Match ── */}
            <div className="relative w-full overflow-hidden flex flex-col items-center pt-[80px] md:pt-[160px] pb-[12px] bg-[var(--color-brand-light)]">

                {/* Large "Merhaba" Background Heading */}
                <div className="w-full flex justify-center relative z-0 h-[100px] md:h-[200px]">
                    <div
                        style={{
                            WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                            maskImage: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'visible'
                        }}
                    >
                        <h2
                            className="font-display font-semibold text-center whitespace-nowrap"
                            style={{
                                fontSize: 'clamp(80px, 20vw, 320px)',
                                lineHeight: '1',
                                letterSpacing: '0px',
                                color: 'rgba(12, 12, 12, 0.82)',
                                transform: 'translateY(10px)'
                            }}
                        >
                            <span
                                style={{
                                    backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.45) 159%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                Merhaba
                            </span>
                        </h2>
                    </div>
                </div>

                {/* Contact Box Container */}
                <div className="w-full max-w-[1920px] mx-auto px-4 md:px-2 relative z-20">
                    <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col pt-16 md:pt-[112px] pb-12 md:pb-[64px] px-6 md:px-[148px]">
                        {/* Background Image exactly as original */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://framerusercontent.com/images/1sREGvYWbdhqXmijCOMUIsD7A.png"
                                className="w-full h-full object-cover rounded-[24px] md:rounded-[32px]"
                                alt="contact-bg"
                            />
                        </div>

                        {/* Content Container */}
                        <div className="relative z-10 w-full flex flex-col gap-16 md:gap-[224px]">

                            {/* Top Row: Headlines & Form */}
                            <div className="flex flex-col md:flex-row justify-between items-start w-full max-w-[1144px] gap-12 md:gap-8 mx-auto">

                                {/* Left Side: Headline */}
                                <div className="flex flex-col gap-4 w-full md:max-w-[456px]">
                                    <h2
                                        className="text-white font-sans font-medium leading-[1.1] tracking-tight md:tracking-[-1.8px]"
                                        style={{ fontSize: 'clamp(32px, 6vw, 64px)' }}
                                    >
                                        Got a project in mind?
                                    </h2>
                                    <p className="text-white/80 text-base md:text-[18px] font-sans">
                                        Let's make something happen together
                                    </p>
                                </div>

                                {/* Right Side: Form */}
                                <div className="flex flex-col items-center gap-16 w-full md:max-w-[456px]">
                                    <form className="flex flex-col items-start gap-8 w-full" onSubmit={e => e.preventDefault()}>

                                        <div className="flex flex-col items-start gap-2 w-full">
                                            <label className="text-white font-sans text-[14px] font-medium tracking-[-0.14px]">
                                                Your Name
                                            </label>
                                            <div className="w-full h-10 border-b border-white/20 relative">
                                                <input
                                                    type="text"
                                                    required
                                                    name="Name"
                                                    placeholder="Enter your Name"
                                                    className="w-full h-full bg-transparent font-sans text-[14px] font-medium tracking-[-0.14px] text-white placeholder:text-white/60 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start gap-2 w-full">
                                            <label className="text-white font-sans text-[14px] font-medium tracking-[-0.14px]">
                                                Your Email
                                            </label>
                                            <div className="w-full h-10 border-b border-white/20 relative">
                                                <input
                                                    type="email"
                                                    required
                                                    name="Email"
                                                    placeholder="Enter the Email"
                                                    className="w-full h-full bg-transparent font-sans text-[14px] font-medium tracking-[-0.14px] text-white placeholder:text-white/60 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start gap-2 w-full">
                                            <label className="text-white font-sans text-[14px] font-medium tracking-[-0.14px]">
                                                Project Description
                                            </label>
                                            <div className="w-full min-h-[80px] border-b border-white/20 relative">
                                                <textarea
                                                    name="Description"
                                                    placeholder="Type Here..."
                                                    className="w-full bg-transparent font-sans text-[14px] font-medium tracking-[-0.14px] text-white placeholder:text-white/60 outline-none resize-y min-h-[40px] pt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full h-10 mt-4 relative">
                                            <button
                                                type="submit"
                                                className="w-full h-full rounded-full bg-[#dcdcdc] text-black font-sans text-[14px] font-medium tracking-[-0.14px] flex items-center justify-center transition-transform hover:scale-[1.02] shadow-[inset_0px_0.5px_0.5px_0px_rgba(255,255,255,0.24),inset_0px_4px_16px_0px_rgba(255,255,255,0.16)] cursor-pointer"
                                            >
                                                Send Now!
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Bottom Marquee (Inline, exact style) */}
                            <div className="w-full overflow-hidden flex items-center justify-center">
                                <motion.div
                                    animate={{ x: ["0%", "-50%"] }}
                                    transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                                    className="flex items-center gap-8 w-max pr-8"
                                    style={{
                                        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)',
                                        maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)'
                                    }}
                                >
                                    {Array(8).fill(null).map((_, i) => (
                                        <div key={i} className="flex items-center gap-8">
                                            <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                                                <img
                                                    src="https://framerusercontent.com/images/bPFUMYGmKDGU6pubiY2MFnjtBAk.svg"
                                                    alt="star"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h5 className="font-sans text-[16px] md:text-[24px] font-semibold text-white/90">
                                                franklin<span className="text-[#FF4D00]">@</span>agero.com
                                            </h5>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <Footer onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        </div>
    );
}
