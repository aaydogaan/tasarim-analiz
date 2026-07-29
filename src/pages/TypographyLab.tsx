import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Type, Sparkles, Copy, Check, Scaling, BookOpen, Layers, LayoutTemplate } from 'lucide-react';

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

const SCALES = [
    { name: 'Major Third', value: 1.250, desc: 'Uygulamalar ve yoğun metinler için ideal' },
    { name: 'Perfect Fourth', value: 1.333, desc: 'Dengeli blog ve dergi görünümü' },
    { name: 'Golden Ratio', value: 1.618, desc: 'Devasa başlıklar ve dramatik etki' }
];

export default function TypographyLab() {
    const [selectedPair, setSelectedPair] = useState(FONT_PAIRINGS[0]);
    const [baseSize, setBaseSize] = useState(16);
    const [scale, setScale] = useState(SCALES[1]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Calculate Sizes
    const sizes = {
        h1: (baseSize * Math.pow(scale.value, 5)).toFixed(1),
        h2: (baseSize * Math.pow(scale.value, 4)).toFixed(1),
        h3: (baseSize * Math.pow(scale.value, 3)).toFixed(1),
        h4: (baseSize * Math.pow(scale.value, 2)).toFixed(1),
        h5: (baseSize * scale.value).toFixed(1),
        body: baseSize.toFixed(1),
        small: (baseSize / scale.value).toFixed(1),
    };

    const generateCssCode = () => {
        return `/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=${selectedPair.heading.name.replace(' ', '+')}:wght@${selectedPair.heading.weight}&family=${selectedPair.body.name.replace(' ', '+')}:wght@${selectedPair.body.weight}&display=swap');

/* CSS Variables */
:root {
  --font-heading: ${selectedPair.heading.css};
  --font-body: ${selectedPair.body.css};
  
  --text-h1: ${sizes.h1}px;
  --text-h2: ${sizes.h2}px;
  --text-h3: ${sizes.h3}px;
  --text-h4: ${sizes.h4}px;
  --text-h5: ${sizes.h5}px;
  --text-body: ${sizes.body}px;
  --text-small: ${sizes.small}px;
}

body { font-family: var(--font-body); font-size: var(--text-body); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); font-weight: ${selectedPair.heading.weight}; }
h1 { font-size: var(--text-h1); }
h2 { font-size: var(--text-h2); }
h3 { font-size: var(--text-h3); }
h4 { font-size: var(--text-h4); }
h5 { font-size: var(--text-h5); }
small { font-size: var(--text-small); }`;
    };

    return (
        <div className="w-full bg-[var(--bg-primary)] min-h-screen font-sans selection:bg-indigo-500 selection:text-white pb-24">
            
            {/* INJECT SELECTED FONTS TO DOM */}
            <style dangerouslySetInnerHTML={{
                __html: `@import url('https://fonts.googleapis.com/css2?family=${selectedPair.heading.name.replace(' ', '+')}:wght@${selectedPair.heading.weight}&family=${selectedPair.body.name.replace(' ', '+')}:wght@${selectedPair.body.weight}&display=swap');`
            }} />

            {/* HEADER HERO */}
            <section className="relative pt-24 pb-16 px-6 overflow-hidden flex flex-col items-center justify-center text-center border-b border-[var(--border-primary)]">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
                <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] opacity-40 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-sm text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                        <Type className="w-3.5 h-3.5 text-indigo-500" /> Tipografi Laboratuvarı
                    </div>

                    <h1 className="text-[48px] md:text-[64px] font-black text-[var(--text-primary)] tracking-tighter leading-[1.05] mb-6">
                        Metinlerin <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Ruhunu Belirleyin</span>
                    </h1>
                    
                    <p className="text-[16px] md:text-[18px] text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
                        Birbirine mükemmel uyan font çiftlerini seçin, Altın Oran ile kusursuz metin hiyerarşisi oluşturun ve anında blog şablonu üzerinde önizleyin.
                    </p>
                </motion.div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COL: CONTROLS */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* FONT PAIRS */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            Küratör Font Çiftleri
                        </h3>
                        <div className="space-y-3">
                            {FONT_PAIRINGS.map(pair => (
                                <div 
                                    key={pair.id}
                                    onClick={() => setSelectedPair(pair)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        selectedPair.id === pair.id 
                                        ? 'border-indigo-500 bg-indigo-500/5 shadow-md' 
                                        : 'border-[var(--border-primary)] hover:border-indigo-300 hover:bg-[var(--bg-secondary)]'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-[var(--text-primary)]">{pair.name}</h4>
                                            <p className="text-[11px] text-[var(--text-secondary)]">{pair.desc}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {pair.tags.map(tag => (
                                                <span key={tag} className="text-[9px] font-bold bg-[var(--bg-primary)] px-2 py-0.5 rounded-md text-[var(--text-secondary)] border border-[var(--border-primary)]">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-primary)]">
                                        <div className="flex-1">
                                            <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Başlık Fontu</span>
                                            <span className="font-bold text-sm text-[var(--text-primary)]">{pair.heading.name}</span>
                                        </div>
                                        <div className="flex-1 border-l border-[var(--border-primary)] pl-3">
                                            <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-1">Gövde Fontu</span>
                                            <span className="text-sm text-[var(--text-primary)]">{pair.body.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SCALES & CALCULATOR */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Scaling className="w-4 h-4 text-purple-500" />
                            Matematiksel Hiyerarşi
                        </h3>
                        
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">Temel Font Boyutu (Base Size)</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="12" 
                                    max="24" 
                                    value={baseSize} 
                                    onChange={(e) => setBaseSize(Number(e.target.value))}
                                    className="flex-1 accent-purple-500"
                                />
                                <span className="font-mono font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">{baseSize}px</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">Büyüme Oranı (Scale Ratio)</label>
                            <div className="grid grid-cols-1 gap-2">
                                {SCALES.map(s => (
                                    <div 
                                        key={s.name}
                                        onClick={() => setScale(s)}
                                        className={`px-4 py-3 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                                            scale.name === s.name 
                                            ? 'border-purple-500 bg-purple-500/5' 
                                            : 'border-[var(--border-primary)] hover:border-purple-300'
                                        }`}
                                    >
                                        <div>
                                            <span className="font-bold text-sm text-[var(--text-primary)] block">{s.name}</span>
                                            <span className="text-[10px] text-[var(--text-secondary)]">{s.desc}</span>
                                        </div>
                                        <span className="font-mono font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-md text-xs">{s.value.toFixed(3)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CSS EXPORT */}
                    <div className="bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>🚀 CSS Kodunu Al</span>
                            <button 
                                onClick={() => handleCopy(generateCssCode())}
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-xs"
                            >
                                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                {copiedCode ? 'Kopyalandı!' : 'Kopyala'}
                            </button>
                        </h3>
                        <pre className="text-[10px] sm:text-xs font-mono text-slate-300 bg-black/40 p-4 rounded-xl overflow-x-auto border border-white/10 custom-scrollbar">
                            <code>{generateCssCode()}</code>
                        </pre>
                    </div>

                </div>

                {/* RIGHT COL: PREVIEW */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* LIVE BLOG PREVIEW */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-0 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4 text-[var(--text-secondary)]" />
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Canlı Blog Önizlemesi</span>
                        </div>
                        
                        <div className="p-8 sm:p-12 bg-white" style={{ fontFamily: selectedPair.body.css }}>
                            
                            {/* Tags */}
                            <div className="flex gap-2 mb-6">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Tasarım</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Kılavuz</span>
                            </div>

                            {/* H1 */}
                            <h1 
                                className="mb-6 text-slate-900 leading-[1.1] tracking-tight"
                                style={{ 
                                    fontFamily: selectedPair.heading.css, 
                                    fontWeight: selectedPair.heading.weight,
                                    fontSize: `${sizes.h1}px`
                                }}
                            >
                                Tipografinin İnce Sanatı ve Altın Oran.
                            </h1>

                            <div className="flex items-center gap-3 mb-10 pb-10 border-b border-slate-200">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">A</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 m-0">Ahmet Tasarımcı</p>
                                    <p className="text-xs text-slate-500 m-0">24 Ekim 2024 • 5 dk okuma</p>
                                </div>
                            </div>

                            {/* Body Text */}
                            <p className="text-slate-600 leading-relaxed mb-8" style={{ fontSize: `${sizes.body}px` }}>
                                İyi bir arayüz tasarımının en önemli unsurlarından biri şüphesiz tipografidir. Metinleriniz sadece okunabilir olmakla kalmamalı, aynı zamanda markanızın ruhunu da yansıtmalıdır. Kullanıcılar bir web sitesine girdiklerinde ilk olarak metinlerin görsel hiyerarşisinden etkilenirler.
                            </p>

                            {/* H2 */}
                            <h2 
                                className="mt-12 mb-4 text-slate-900 leading-[1.2]"
                                style={{ 
                                    fontFamily: selectedPair.heading.css, 
                                    fontWeight: selectedPair.heading.weight,
                                    fontSize: `${sizes.h2}px`
                                }}
                            >
                                Görsel Hiyerarşi Neden Önemlidir?
                            </h2>
                            
                            <p className="text-slate-600 leading-relaxed mb-6" style={{ fontSize: `${sizes.body}px` }}>
                                Hiyerarşi olmadan her şey eşit görünür. Eşitlik ise kaos yaratır. Hangi bilginin en önemli olduğunu, hangisinin alt başlık olduğunu Altın Oran <strong>(1.618)</strong> gibi matematiksel dizilimlerle belirlemek, beynin bilgiyi çok daha hızlı işlemesini sağlar.
                            </p>

                            <blockquote className="border-l-4 border-indigo-500 pl-6 py-2 my-8 italic text-slate-700 bg-indigo-50/50 rounded-r-xl" style={{ fontSize: `${sizes.h4}px`, fontFamily: selectedPair.heading.css }}>
                                "Tipografi, sesin görünür formudur." — Emil Ruder
                            </blockquote>

                            {/* H3 */}
                            <h3 
                                className="mt-10 mb-4 text-slate-900 leading-[1.3]"
                                style={{ 
                                    fontFamily: selectedPair.heading.css, 
                                    fontWeight: selectedPair.heading.weight,
                                    fontSize: `${sizes.h3}px`
                                }}
                            >
                                Font Çiftlerini Seçerken
                            </h3>

                            <p className="text-slate-600 leading-relaxed mb-4" style={{ fontSize: `${sizes.body}px` }}>
                                Genel kural olarak bir başlık fontu (genellikle karakteri olan bir Serif veya Display font) ve bir gövde fontu (okunabilirliği yüksek bir Sans-Serif) seçmek mükemmel sonuçlar verir.
                            </p>

                            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8" style={{ fontSize: `${sizes.body}px` }}>
                                <li>Başlıklar için: <strong>{selectedPair.heading.name}</strong> seçildi.</li>
                                <li>Gövde metinleri için: <strong>{selectedPair.body.name}</strong> seçildi.</li>
                                <li>Boyutlandırma mantığı: {scale.name} ({scale.value})</li>
                            </ul>

                            <small className="block text-slate-400 mt-12" style={{ fontSize: `${sizes.small}px` }}>
                                Bu makale yapay zeka tarafından örnekleme amacıyla oluşturulmuştur.
                            </small>

                        </div>
                    </div>

                    {/* SIZE CHEAT SHEET */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-sm">
                         <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[var(--text-secondary)]" />
                            Boyut Tablosu Özeti
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.entries(sizes).map(([tag, size]) => (
                                <div key={tag} className="border border-[var(--border-primary)] rounded-xl p-3 flex flex-col items-center justify-center text-center bg-[var(--bg-secondary)]">
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">{tag}</span>
                                    <span className="text-lg font-mono font-bold text-[var(--text-primary)]">{size}<span className="text-xs text-[var(--text-secondary)]">px</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
