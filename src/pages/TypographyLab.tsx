import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Type, Sparkles, Wand2, Copy, Check, ArrowRight, LayoutTemplate } from 'lucide-react';
import TextPressure from '../components/ui/TextPressure';

// Pre-curated highly aesthetic modern font pairings
const FONT_PAIRINGS = [
    {
        id: 'modern-luxury',
        name: 'Modern Lüks',
        desc: 'Kurumsal, Premium ve Minimalist',
        heading: { name: 'Playfair Display', css: "'Playfair Display', serif", weight: '700' },
        body: { name: 'Inter', css: "'Inter', sans-serif", weight: '400' },
        tags: ['E-Ticaret', 'Portfolyo', 'Moda']
    },
    {
        id: 'tech-startup',
        name: 'Teknoloji Çizgisi',
        desc: 'Sade, Geometrik ve Güçlü',
        heading: { name: 'Outfit', css: "'Outfit', sans-serif", weight: '800' },
        body: { name: 'Roboto', css: "'Roboto', sans-serif", weight: '400' },
        tags: ['SaaS', 'App', 'Startup']
    },
    {
        id: 'editorial-chic',
        name: 'Editoryal Şıklık',
        desc: 'Edebiyat, Dergi ve Sanat',
        heading: { name: 'Lora', css: "'Lora', serif", weight: '600' },
        body: { name: 'Merriweather', css: "'Merriweather', serif", weight: '300' },
        tags: ['Blog', 'Haber', 'Sanat']
    },
    {
        id: 'bold-brutalism',
        name: 'Cesur Brutalizm',
        desc: 'Dikkat Çekici ve Keskin',
        heading: { name: 'Space Grotesk', css: "'Space Grotesk', sans-serif", weight: '700' },
        body: { name: 'Space Mono', css: "'Space Mono', monospace", weight: '400' },
        tags: ['Web3', 'Ajans', 'Teknoloji']
    },
    {
        id: 'friendly-casual',
        name: 'Sıcak & Dostane',
        desc: 'Yumuşak, Okunabilir ve Canlı',
        heading: { name: 'Quicksand', css: "'Quicksand', sans-serif", weight: '700' },
        body: { name: 'Nunito', css: "'Nunito', sans-serif", weight: '400' },
        tags: ['Eğitim', 'Sağlık', 'Mobil']
    }
];

export default function TypographyLab() {
    const [selectedPair, setSelectedPair] = useState(FONT_PAIRINGS[0]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const generateCssCode = () => {
        return `/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=${selectedPair.heading.name.replace(' ', '+')}:wght@${selectedPair.heading.weight}&family=${selectedPair.body.name.replace(' ', '+')}:wght@${selectedPair.body.weight}&display=swap');

/* TailwindCSS / Custom CSS Config */
:root {
  --font-heading: ${selectedPair.heading.css};
  --font-body:    ${selectedPair.body.css};
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: ${selectedPair.heading.weight};
}

body, p, span, a {
  font-family: var(--font-body);
  font-weight: ${selectedPair.body.weight};
}`;
    };

    return (
        <div className="w-full bg-[#f8f9fa] min-h-screen font-sans selection:bg-[var(--color-brand-orange)] selection:text-white pb-24">

            {/* HEADER HERO */}
            <section className="relative pt-24 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[120px] opacity-60 pointer-events-none" />
                <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-40 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                        <Type className="w-3.5 h-3.5 text-indigo-500" /> Tipografi Laboratuvarı
                    </div>

                    <h1 className="text-[48px] md:text-[72px] font-black text-[#111111] tracking-tighter leading-[1.05] mb-6">
                        Metinlerin <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Uyumu.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        Başlık ve gövde metinleri arasındaki o kusursuz dengeyi yakalayın. Projenizin kimliğini belirleyen en estetik Google Fonts kombinasyonları.
                    </p>
                </motion.div>
            </section>

            {/* MAIN WORKSPACE */}
            <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Sidebar: Font Pairings List */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="lg:col-span-4 space-y-4"
                >
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <Wand2 className="w-5 h-5 text-[var(--color-brand-orange)]" />
                        <h3 className="font-bold text-[#111111] text-lg">Özel Kombinasyonlar</h3>
                    </div>

                    {FONT_PAIRINGS.map((pair) => (
                        <div
                            key={pair.id}
                            onClick={() => setSelectedPair(pair)}
                            className={`cursor-pointer group p-5 rounded-[24px] border-2 transition-all duration-300 ${selectedPair.id === pair.id
                                    ? 'bg-white border-indigo-500 shadow-lg scale-[1.02]'
                                    : 'bg-white/60 border-transparent hover:bg-white hover:border-indigo-200 hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-[#111111]">{pair.name}</h4>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5">{pair.desc}</p>
                                </div>
                                {selectedPair.id === pair.id && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="flex gap-2 mt-4">
                                {pair.tags.map(tag => (
                                    <span key={tag} className="text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-gray-100 text-gray-500">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Right Area: Preview & Code */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="lg:col-span-8 flex flex-col gap-8"
                >
                    {/* Live Preview Canvas */}
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col relative overflow-hidden min-h-[500px]">
                        {/* Decorative Background grid */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                        <div className="relative z-10 flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3">
                                <LayoutTemplate className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Canlı Önizleme</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 max-w-2xl mx-auto w-full text-center md:text-left flex flex-col justify-center">

                            <p
                                className="text-sm uppercase tracking-[0.3em] text-indigo-500 mb-6 transition-all duration-700"
                                style={{ fontFamily: selectedPair.body.css, fontWeight: 700 }}
                            >
                                {selectedPair.name}
                            </p>

                            <h2
                                className="text-4xl md:text-6xl text-[#111111] mb-8 transition-all duration-700 leading-[1.1]"
                                style={{ fontFamily: selectedPair.heading.css, fontWeight: selectedPair.heading.weight }}
                            >
                                Tasarım, sessiz konuşan mükemmel bir hikayedir.
                            </h2>

                            <p
                                className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl transition-all duration-700"
                                style={{ fontFamily: selectedPair.body.css, fontWeight: selectedPair.body.weight }}
                            >
                                Kullanıcılar içeriğinizi okumadan önce, onu <b>hissederler</b>. Doğru seçilmiş bir tipografi hiyerarşisi, vermek istediğiniz mesajı iki kat daha güçlü kılar. Bu örnek metin, iki font arasındaki o kusursuz dengeyi test etmeniz için var.
                            </p>

                            <div className="mt-12 flex flex-wrap gap-4 justify-center md:justify-start">
                                <button
                                    className="px-8 py-4 rounded-xl text-white font-bold tracking-wide hover:shadow-lg hover:-translate-y-1 transition-all bg-indigo-600"
                                    style={{ fontFamily: selectedPair.body.css }}
                                >
                                    Hemen Keşfet
                                </button>
                                <button
                                    className="px-8 py-4 rounded-xl text-gray-600 font-bold border-2 border-gray-200 hover:border-gray-300 transition-all bg-white"
                                    style={{ fontFamily: selectedPair.body.css }}
                                >
                                    Dokümantasyon
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Code Snippet Box */}
                    <div className="bg-[#0f1013] rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2 items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                <span className="ml-3 text-gray-500 font-mono text-xs font-bold tracking-widest">css-export.css</span>
                            </div>
                            <button
                                onClick={() => handleCopy(generateCssCode())}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            >
                                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                {copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}
                            </button>
                        </div>

                        <pre className="font-mono text-sm text-[var(--color-brand-orange)] opacity-90 overflow-x-auto p-4 bg-black/30 rounded-2xl">
                            <code>{generateCssCode()}</code>
                        </pre>
                    </div>

                </motion.div>
            </section>
        </div>
    );
}
