import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Copy, Check, Layers, Sliders, Monitor } from 'lucide-react';

export default function Glassmorphism() {
    const [blur, setBlur] = useState(10);
    const [opacity, setOpacity] = useState(20);
    const [borderOpacity, setBorderOpacity] = useState(30);
    const [glassColor, setGlassColor] = useState('white'); // 'white' or 'black'
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const bgColor = glassColor === 'white' 
        ? `rgba(255, 255, 255, ${opacity / 100})` 
        : `rgba(0, 0, 0, ${opacity / 100})`;
        
    const borderColor = glassColor === 'white' 
        ? `rgba(255, 255, 255, ${borderOpacity / 100})` 
        : `rgba(0, 0, 0, ${borderOpacity / 100})`;

    const generateCssCode = () => {
        return `/* Glassmorphism Effect */
.glass-panel {
  background: ${bgColor};
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: 1px solid ${borderColor};
  border-radius: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}`;
    };

    return (
        <div className="w-full min-h-screen font-sans selection:bg-pink-500 selection:text-white pb-24 relative bg-black">
            
            {/* STUNNING ANIMATED MESH BACKGROUND */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* HEADER HERO */}
            <section className="relative pt-24 pb-12 px-6 flex flex-col items-center justify-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-white text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Glassmorphism Lab
                    </div>

                    <h1 className="text-[40px] md:text-[64px] font-black text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-lg">
                        Buzlu Cam Etkisini <br className="hidden md:block" />
                        Zahmetsizce Yaratın
                    </h1>
                    
                    <p className="text-[16px] md:text-[18px] text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Modern arayüzlerin vazgeçilmezi olan şeffaf, bulanık ve şık cam görünümünü saniyeler içinde tasarlayın ve CSS kodunu kopyalayın.
                    </p>
                </motion.div>
            </section>

            <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* LEFT COL: CONTROLS */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-pink-400" />
                            Cam Ayarları
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Blur Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Bulanıklık (Blur)</label>
                                    <span className="text-xs font-mono font-bold text-pink-300 bg-pink-500/20 px-2 py-1 rounded-md">{blur}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="40" 
                                    value={blur} 
                                    onChange={(e) => setBlur(Number(e.target.value))}
                                    className="w-full accent-pink-500 bg-white/20 rounded-full appearance-none h-2 cursor-pointer outline-none"
                                />
                            </div>

                            {/* Opacity Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Şeffaflık (Opacity)</label>
                                    <span className="text-xs font-mono font-bold text-pink-300 bg-pink-500/20 px-2 py-1 rounded-md">{opacity}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={opacity} 
                                    onChange={(e) => setOpacity(Number(e.target.value))}
                                    className="w-full accent-pink-500 bg-white/20 rounded-full appearance-none h-2 cursor-pointer outline-none"
                                />
                            </div>

                            {/* Border Opacity Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Çerçeve Görünürlüğü</label>
                                    <span className="text-xs font-mono font-bold text-pink-300 bg-pink-500/20 px-2 py-1 rounded-md">{borderOpacity}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={borderOpacity} 
                                    onChange={(e) => setBorderOpacity(Number(e.target.value))}
                                    className="w-full accent-pink-500 bg-white/20 rounded-full appearance-none h-2 cursor-pointer outline-none"
                                />
                            </div>

                            {/* Glass Color */}
                            <div>
                                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-3">Cam Rengi (Işık/Gölge)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setGlassColor('white')}
                                        className={`py-3 rounded-xl border-2 transition-all font-bold text-xs ${
                                            glassColor === 'white' 
                                            ? 'border-white bg-white/20 text-white' 
                                            : 'border-white/10 text-white/50 hover:bg-white/5'
                                        }`}
                                    >
                                        Aydınlık (Beyaz)
                                    </button>
                                    <button 
                                        onClick={() => setGlassColor('black')}
                                        className={`py-3 rounded-xl border-2 transition-all font-bold text-xs ${
                                            glassColor === 'black' 
                                            ? 'border-black bg-black/40 text-white' 
                                            : 'border-black/20 text-white/50 hover:bg-black/20'
                                        }`}
                                    >
                                        Karanlık (Siyah)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CSS EXPORT */}
                    <div className="bg-[#0D0D12] rounded-3xl p-6 shadow-2xl relative overflow-hidden group border border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>🚀 CSS Çıktısı</span>
                            <button 
                                onClick={() => handleCopy(generateCssCode())}
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-xs"
                            >
                                {copiedCode ? <Check className="w-4 h-4 text-pink-400" /> : <Copy className="w-4 h-4" />}
                                {copiedCode ? 'Kopyalandı!' : 'Kopyala'}
                            </button>
                        </h3>
                        <pre className="text-[10px] sm:text-xs font-mono text-slate-300 bg-black/60 p-4 rounded-xl overflow-x-auto border border-white/5 custom-scrollbar">
                            <code>{generateCssCode()}</code>
                        </pre>
                    </div>
                </div>

                {/* RIGHT COL: PREVIEW ZONE */}
                <div className="lg:col-span-8">
                    <div className="w-full h-full min-h-[400px] border-2 border-white/10 rounded-3xl flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
                        
                        {/* THE GLASS CARD */}
                        <motion.div 
                            className="relative z-10 w-full max-w-md p-8 rounded-[32px] overflow-hidden"
                            style={{
                                background: bgColor,
                                backdropFilter: `blur(${blur}px)`,
                                WebkitBackdropFilter: `blur(${blur}px)`,
                                border: `1px solid ${borderColor}`,
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                            }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
                                    <Layers className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className={`text-xl font-black ${glassColor === 'white' ? 'text-white' : 'text-white'}`}>Kredi Kartı</h4>
                                    <p className={`text-xs font-bold ${glassColor === 'white' ? 'text-white/70' : 'text-white/50'}`}>Premium Glass Edition</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 mb-8">
                                <div className={`h-8 w-full rounded-lg ${glassColor === 'white' ? 'bg-white/20' : 'bg-black/20'}`}></div>
                                <div className={`h-4 w-3/4 rounded-lg ${glassColor === 'white' ? 'bg-white/10' : 'bg-black/10'}`}></div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className={`text-xs uppercase tracking-widest font-bold mb-1 ${glassColor === 'white' ? 'text-white/50' : 'text-white/30'}`}>Bakiye</p>
                                    <p className={`text-3xl font-black font-mono tracking-tighter ${glassColor === 'white' ? 'text-white' : 'text-white'}`}>$14,250<span className="text-lg opacity-50">.00</span></p>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${glassColor === 'white' ? 'border-white/30 bg-white/10 text-white' : 'border-black/30 bg-black/20 text-white'}`}>
                                    <Monitor className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating elements behind glass to show off the blur */}
                        <motion.div 
                            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute top-1/4 right-1/4 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 z-0"
                        />
                        <motion.div 
                            animate={{ x: [0, 30, 0], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-indigo-500/40 rounded-3xl rotate-12 z-0"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
