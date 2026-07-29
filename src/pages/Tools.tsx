import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Palette, Copy, Check, Sparkles, Layout, Layers, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

// Core Color Logic
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

const hexToRGB = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
};

const getLuminance = (r: number, g: number, b: number) => {
    let a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (hex1: string, hex2: string) => {
    const rgb1 = hexToRGB(hex1);
    const rgb2 = hexToRGB(hex2);
    let lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    let lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    let brightest = Math.max(lum1, lum2);
    let darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
};

const getContrastColor = (hexcolor: string) => {
    const rgb = hexToRGB(hexcolor);
    const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

const isValidHex = (hex: string) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

export default function Tools() {
    const [baseColor, setBaseColor] = useState('#FF4D00');
    const [inputValue, setInputValue] = useState('#FF4D00');
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    useEffect(() => {
        if (isValidHex(inputValue)) {
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
        setInputValue(color);
        setTimeout(() => setCopiedColor(null), 1500);
    };

    const { h, s, l } = hexToHSL(baseColor);

    const palettes = {
        monochromatic: [
            HSLToHex(h, s, Math.min(95, l + 40)),
            HSLToHex(h, s, Math.min(80, l + 20)),
            baseColor,
            HSLToHex(h, s, Math.max(20, l - 20)),
            HSLToHex(h, s, Math.max(10, l - 40)),
        ],
        complementary: [
            HSLToHex(h, s, Math.max(10, l - 20)),
            baseColor,
            HSLToHex(h, s, Math.min(90, l + 20)),
            HSLToHex((h + 180) % 360, s, l),
            HSLToHex((h + 180) % 360, s, Math.max(20, l - 20)),
        ],
        analogous: [
            HSLToHex((h - 30 + 360) % 360, s, l),
            HSLToHex((h - 15 + 360) % 360, s, l),
            baseColor,
            HSLToHex((h + 15) % 360, s, l),
            HSLToHex((h + 30) % 360, s, l),
        ]
    };

    // UI Mockup Colors based on Base Color
    const textColorOnBase = getContrastColor(baseColor);
    const lightBg = HSLToHex(h, s, 96);
    const darkText = HSLToHex(h, Math.max(0, s - 30), 15);
    const mutedText = HSLToHex(h, Math.max(0, s - 20), 40);
    
    // Contrast Analysis
    const contrastRatioWhite = getContrastRatio(baseColor, '#FFFFFF').toFixed(2);
    const contrastRatioBlack = getContrastRatio(baseColor, '#000000').toFixed(2);
    const passWhite = parseFloat(contrastRatioWhite) >= 4.5;
    const passBlack = parseFloat(contrastRatioBlack) >= 4.5;

    return (
        <div className="w-full bg-[var(--bg-primary)] min-h-screen font-sans selection:bg-[var(--color-brand-orange)] selection:text-white pb-24">
            {/* HEADER HERO */}
            <section className="relative pt-24 pb-16 px-6 overflow-hidden flex flex-col items-center justify-center text-center border-b border-[var(--border-primary)]">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-sm text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                        <Palette className="w-3.5 h-3.5 text-emerald-500" /> Renk Atölyesi
                    </div>

                    <h1 className="text-[40px] md:text-[64px] font-black text-[var(--text-primary)] tracking-tighter leading-[1.05] mb-6">
                        Kusursuz Renkleri <br />
                        Keşfedin ve Önizleyin
                    </h1>
                    
                    <p className="text-[16px] md:text-[18px] text-[var(--text-secondary)] mb-10 max-w-xl mx-auto leading-relaxed">
                        Seçtiğiniz rengin paletlerini oluşturun, erişilebilirlik (WCAG) skorunu görün ve gerçek bir arayüz üzerinde nasıl durduğunu anında test edin.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <div className="w-6 h-6 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: baseColor }}></div>
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-[var(--card-bg)] border-2 border-[var(--border-primary)] text-[var(--text-primary)] font-mono font-bold text-lg px-14 py-4 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                                placeholder="#HEX Kodu"
                            />
                        </div>
                    </div>
                </motion.div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COL: Palettes */}
                <div className="lg:col-span-5 space-y-8">
                    {Object.entries(palettes).map(([name, colors]) => (
                        <div key={name} className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-emerald-500" />
                                {name === 'monochromatic' ? 'Monokromatik' : name === 'complementary' ? 'Tamamlayıcı' : 'Analog'}
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {colors.map((color, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => handleCopy(color)}
                                        className="group relative w-full h-14 sm:h-32 sm:flex-1 rounded-2xl cursor-pointer overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg hover:z-10 border border-black/5"
                                        style={{ backgroundColor: color }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                            {copiedColor === color ? (
                                                <Check className="w-6 h-6 text-white" />
                                            ) : (
                                                <Copy className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            {color}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT COL: Realtime Mockup & Accessibility */}
                <div className="lg:col-span-7 space-y-8">
                    
                    {/* ACCESSIBILITY CHECKER */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                WCAG Kontrast Analizi
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] mb-4">
                                Seçtiğiniz ana rengin üzerinde beyaz ve siyah metnin ne kadar okunabilir olduğunu WCAG 2.0 standartlarına göre gösterir. (Minimum 4.5 oran gereklidir.)
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-[var(--border-primary)] rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ backgroundColor: baseColor }}>
                                    <span className="text-4xl font-black text-white mb-2">Aa</span>
                                    <span className="text-white text-xs font-bold bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">Oran: {contrastRatioWhite}</span>
                                    <div className="absolute top-2 right-2">
                                        {passWhite ? <Check className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-red-300" />}
                                    </div>
                                </div>
                                <div className="border border-[var(--border-primary)] rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ backgroundColor: baseColor }}>
                                    <span className="text-4xl font-black text-black mb-2">Aa</span>
                                    <span className="text-black text-xs font-bold bg-black/10 px-2 py-1 rounded-md backdrop-blur-sm">Oran: {contrastRatioBlack}</span>
                                    <div className="absolute top-2 right-2">
                                        {passBlack ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REAL-TIME UI MOCKUP */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Layout className="w-4 h-4 text-emerald-500" />
                            Canlı Arayüz Önizlemesi
                        </h3>
                        
                        {/* Mockup Container */}
                        <div className="rounded-2xl border border-[var(--border-primary)] shadow-inner overflow-hidden transition-colors duration-500" style={{ backgroundColor: lightBg }}>
                            
                            {/* Mock Navbar */}
                            <div className="px-6 py-4 border-b border-black/5 bg-white/50 backdrop-blur-md flex justify-between items-center">
                                <div className="flex items-center gap-2 font-black text-lg transition-colors duration-500" style={{ color: baseColor }}>
                                    <div className="w-6 h-6 rounded-lg transition-colors duration-500" style={{ backgroundColor: baseColor }}></div>
                                    BrandUI
                                </div>
                                <div className="hidden sm:flex gap-6 text-sm font-medium transition-colors duration-500" style={{ color: mutedText }}>
                                    <span>Anasayfa</span>
                                    <span>Özellikler</span>
                                    <span>Fiyatlandırma</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-500 cursor-pointer" style={{ backgroundColor: baseColor, color: textColorOnBase }}>
                                    Hemen Başla
                                </div>
                            </div>

                            {/* Mock Hero */}
                            <div className="px-6 py-16 flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors duration-500" style={{ backgroundColor: baseColor + '15', color: baseColor }}>
                                        <Sparkles className="w-3.5 h-3.5" /> Yeni Özellikler Yayında
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight transition-colors duration-500" style={{ color: darkText }}>
                                        Renklerin Gücünü <br />
                                        <span className="transition-colors duration-500" style={{ color: baseColor }}>Arayüzde Hissedin.</span>
                                    </h2>
                                    <p className="text-base leading-relaxed max-w-md transition-colors duration-500" style={{ color: mutedText }}>
                                        Seçtiğiniz renk paletinin gerçek bir web sitesi şablonunda nasıl durduğunu anında görerek tasarım kararlarınızı hızlandırın.
                                    </p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/5 cursor-pointer flex items-center gap-2 transition-all duration-500" style={{ backgroundColor: baseColor, color: textColorOnBase }}>
                                            Ücretsiz Başla <ArrowRight className="w-4 h-4" />
                                        </div>
                                        <div className="px-6 py-3 rounded-xl text-sm font-bold border-2 cursor-pointer transition-colors duration-500" style={{ borderColor: baseColor + '30', color: baseColor }}>
                                            Daha Fazla Bilgi
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full relative">
                                    {/* Abstract Graphic */}
                                    <div className="aspect-square rounded-full absolute -right-10 top-0 blur-3xl opacity-30 transition-colors duration-500" style={{ backgroundColor: baseColor }}></div>
                                    <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 p-6 aspect-video flex flex-col justify-between">
                                        <div className="flex justify-between items-center border-b border-black/5 pb-4">
                                            <div className="h-4 w-24 rounded-full transition-colors duration-500" style={{ backgroundColor: baseColor + '20' }}></div>
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl flex-shrink-0 transition-colors duration-500" style={{ backgroundColor: baseColor + '20' }}></div>
                                                <div className="flex-1 space-y-2 pt-1">
                                                    <div className="h-4 w-3/4 rounded-full transition-colors duration-500" style={{ backgroundColor: baseColor + '40' }}></div>
                                                    <div className="h-3 w-1/2 rounded-full transition-colors duration-500" style={{ backgroundColor: baseColor + '15' }}></div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl flex-shrink-0 transition-colors duration-500" style={{ backgroundColor: baseColor + '50' }}></div>
                                                <div className="flex-1 space-y-2 pt-1">
                                                    <div className="h-4 w-2/3 rounded-full transition-colors duration-500" style={{ backgroundColor: baseColor + '40' }}></div>
                                                    <div className="h-3 w-1/3 rounded-full transition-colors duration-500" style={{ backgroundColor: baseColor + '15' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
