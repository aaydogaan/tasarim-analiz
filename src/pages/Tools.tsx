import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Copy, Check, Sparkles, Wand2, Maximize } from 'lucide-react';

// Core Tool: Color Conversion Logic
const hexToHSL = (hex: string) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const HSLToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const isValidHex = (hex: string) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

export default function Tools() {
    const [baseColor, setBaseColor] = useState('#FF4D00');
    const [inputValue, setInputValue] = useState('#FF4D00');
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    // Auto-update baseColor when input is a valid hex
    useEffect(() => {
        if (isValidHex(inputValue)) {
            // Expand 3 digit hex
            let expanded = inputValue;
            if (inputValue.length === 4) {
                expanded = '#' + inputValue[1] + inputValue[1] + inputValue[2] + inputValue[2] + inputValue[3] + inputValue[3];
            }
            setBaseColor(expanded.toUpperCase());
        }
    }, [inputValue]);

    const handleCopy = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 1500);
    };

    // Calculate variations based on baseColor
    const { h, s, l } = hexToHSL(baseColor);

    const palettes = {
        monochromatic: [
            HSLToHex(h, s, Math.min(90, l + 40)),
            HSLToHex(h, s, Math.min(80, l + 20)),
            baseColor,
            HSLToHex(h, s, Math.max(20, l - 20)),
            HSLToHex(h, s, Math.max(10, l - 40)),
        ],
        complementary: [
            baseColor,
            HSLToHex(h, Math.max(0, s - 20), Math.min(90, l + 10)),
            HSLToHex((h + 180) % 360, s, l),
            HSLToHex((h + 180) % 360, Math.max(0, s - 20), Math.max(10, l - 20)),
        ],
        analogous: [
            HSLToHex((h - 30 + 360) % 360, s, l),
            baseColor,
            HSLToHex((h + 30) % 360, s, l),
            HSLToHex((h + 60) % 360, Math.max(0, s - 10), Math.min(80, l + 10)),
        ],
        triadic: [
            baseColor,
            HSLToHex((h + 120) % 360, s, l),
            HSLToHex((h + 240) % 360, s, l),
        ]
    };

    // Derived typical UI Colors
    const uiColors = {
        bg: HSLToHex(h, Math.min(20, s), 98),
        surface: '#FFFFFF',
        primary: baseColor,
        secondary: HSLToHex((h + 180) % 360, s, l),
        text: HSLToHex(h, Math.min(30, s), 15),
        textMuted: HSLToHex(h, Math.min(20, s), 45)
    };

    return (
        <div className="w-full bg-[var(--bg-primary)] min-h-screen font-sans selection:bg-[var(--color-brand-orange)] selection:text-white pb-24">

            {/* HEADER HERO */}
            <section className="relative pt-24 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
                <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: baseColor }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-sm text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                        <Sparkles className="w-3.5 h-3.5" style={{ color: baseColor }} /> Renk Sentezleyici
                    </div>

                    <h1 className="text-[48px] md:text-[72px] font-black text-[var(--text-primary)] tracking-tighter leading-[1.05] mb-6">
                        Renklerin <br className="hidden md:block" />
                        <span style={{ color: baseColor }} className="transition-colors duration-500">
                            Matematiği.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        Ana renginizi seçin, yapay zeka ve renk teorisi destekli algoritmamız projeniz için en kusursuz renk kombinasyonlarını ve UI kurallarını anında üretsin.
                    </p>
                </motion.div>

                {/* Main Input Control */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-20 w-full max-w-xl mx-auto flex items-center bg-[var(--card-bg)] p-2 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-[var(--border-primary)]"
                >
                    <div
                        className="w-16 h-16 rounded-[20px] shadow-inner shrink-0 relative overflow-hidden group border border-[var(--border-primary)]"
                        style={{ backgroundColor: baseColor }}
                    >
                        <input
                            type="color"
                            value={baseColor}
                            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                            <Palette className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
                        </div>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase mb-1">Temel Renk</p>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (!val.startsWith('#')) val = '#' + val;
                                setInputValue(val);
                            }}
                            className="bg-transparent border-none outline-none text-2xl font-black text-[var(--text-primary)] w-full font-mono uppercase"
                            placeholder="#FF4D00"
                            maxLength={7}
                        />
                    </div>
                    <button
                        onClick={() => handleCopy(baseColor)}
                        className="w-14 h-14 bg-[var(--bg-primary)] hover:bg-[var(--card-bg)] rounded-[20px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0 shrink-0 border border-[var(--border-primary)]"
                    >
                        {copiedColor === baseColor ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                </motion.div>
            </section>

            {/* RESULTS BENTO GRID */}
            <section className="px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">

                {/* Left Column: UI Preview */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="md:col-span-12 lg:col-span-5 bg-[var(--card-bg)] rounded-[40px] p-8 shadow-xl border border-[var(--border-primary)] relative overflow-hidden"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-[var(--bg-primary)] rounded-2xl">
                            <Wand2 className="w-5 h-5 text-[var(--text-secondary)]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--text-primary)] text-lg">Arayüz Adaptasyonu</h3>
                            <p className="text-[var(--text-secondary)] text-sm">Gerçek Dünya Senaryosu</p>
                        </div>
                    </div>

                    {/* Mock UI Box */}
                    <div
                        className="w-full rounded-[32px] p-6 shadow-2xl transition-colors duration-500 border border-black/5"
                        style={{ backgroundColor: uiColors.bg }}
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: uiColors.primary }}></div>
                            <div className="flex gap-2">
                                <div className="w-12 h-3 rounded-full opacity-20" style={{ backgroundColor: uiColors.text }}></div>
                                <div className="w-8 h-3 rounded-full opacity-20" style={{ backgroundColor: uiColors.text }}></div>
                            </div>
                        </div>

                        <h4 className="text-3xl font-black mb-4 tracking-tight transition-colors duration-500" style={{ color: uiColors.text }}>
                            Modern & Şık
                        </h4>
                        <p className="text-sm leading-relaxed mb-10 transition-colors duration-500 font-medium" style={{ color: uiColors.textMuted }}>
                            Tasarımında bu renk şemasını kullanarak, hiyerarşiyi kusursuz bir şekilde oturtabilirsin.
                        </p>

                        <div className="flex gap-3">
                            <button
                                className="px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                                style={{ backgroundColor: uiColors.primary }}
                            >
                                Hemen Başla
                            </button>
                            <button
                                className="px-6 py-3 rounded-xl font-bold border-2 transition-transform hover:scale-105 active:scale-95"
                                style={{ borderColor: uiColors.primary, color: uiColors.primary }}
                            >
                                İncele
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Palettes */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
                >

                    {/* Palette Block Factory */}
                    <PaletteBlock title="Monokromatik" desc="Ton Geçişleri" colors={palettes.monochromatic} copiedColor={copiedColor} handleCopy={handleCopy} />
                    <PaletteBlock title="Tamamlayıcı" desc="Kontrast Yaratın" colors={palettes.complementary} copiedColor={copiedColor} handleCopy={handleCopy} />
                    <PaletteBlock title="Analog" desc="Doğal Uyum" colors={palettes.analogous} copiedColor={copiedColor} handleCopy={handleCopy} />
                    <PaletteBlock title="Üçlü (Triadic)" desc="Canlı & Dengeli" colors={palettes.triadic} copiedColor={copiedColor} handleCopy={handleCopy} />

                </motion.div>
            </section>
        </div>
    );
}

// Subcomponent for Palette Blocks
function PaletteBlock({ title, desc, colors, copiedColor, handleCopy }: { title: string, desc: string, colors: string[], copiedColor: string | null, handleCopy: (val: string) => void }) {
    return (
        <div className="bg-[var(--card-bg)] rounded-[32px] p-6 shadow-xl border border-[var(--border-primary)] flex flex-col justify-between hover:shadow-2xl transition-shadow">
            <div className="mb-6">
                <h3 className="font-bold text-[var(--text-primary)] text-lg">{title}</h3>
                <p className="text-[var(--text-secondary)] text-sm font-medium">{desc}</p>
            </div>
            <div className="w-full flex h-24 rounded-2xl overflow-hidden shadow-inner border border-black/5">
                {colors.map((color, idx) => (
                    <div
                        key={idx}
                        className="flex-1 relative group cursor-pointer hover:flex-[1.5] transition-all duration-300"
                        style={{ backgroundColor: color }}
                        onClick={() => handleCopy(color)}
                    >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 touch-auto">
                            {copiedColor === color ? (
                                <Check className="w-5 h-5 text-white drop-shadow-md" />
                            ) : (
                                <span className="text-white font-mono text-[10px] font-bold tracking-wider drop-shadow-md rotate-90 sm:rotate-0">
                                    {color}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
