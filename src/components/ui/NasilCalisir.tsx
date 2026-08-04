import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Sliders, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Share2, 
  Download, 
  Check, 
  BarChart2, 
  Zap,
  Palette,
  Type,
  LayoutGrid
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Tasarımı Yükle',
    description: 'Saniyeler içinde analiz ettirmek istediğin afiş, logo veya sosyal medya tasarımını yükle.',
    icon: Upload,
    mockup: (
      <div className="w-full h-full bg-[var(--card-bg)] rounded-3xl border border-[var(--border-primary)] p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">gorsel_yukleme.png</span>
        </div>

        {/* Upload Box Showcase */}
        <div className="my-auto py-6 px-4 rounded-2xl border-2 border-dashed border-[#FF5500]/40 bg-[#FF5500]/5 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center shadow-lg shadow-[#FF5500]/25">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-black text-[var(--text-primary)]">afis_tasarimi_v2.png</p>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">2.4 MB • 1080x1350 px</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-extrabold border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Görsel Yüklendi
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] pt-2 border-t border-[var(--border-primary)]">
          <span>Format: Sosyal Medya Postu</span>
          <span className="text-[#FF5500]">Adım 1 / 4</span>
        </div>
      </div>
    )
  },
  {
    number: '02',
    title: 'Detayları Belirt',
    description: 'Tasarım türünü ve hedef sektörünü belirleyerek daha doğru analiz sonuçları al.',
    icon: Sliders,
    mockup: (
      <div className="w-full h-full bg-[var(--card-bg)] rounded-3xl border border-[var(--border-primary)] p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)]">
          <span className="text-xs font-bold text-[var(--text-primary)]">Analiz Kriterleri</span>
          <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Hazır</span>
        </div>

        <div className="space-y-3.5 my-auto">
          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Tasarım Formatı</label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[#FF5500]/40 text-xs font-bold text-[var(--text-primary)]">
              <span>Sosyal Medya Afişi</span>
              <Check className="w-4 h-4 text-[#FF5500]" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Hedef Sektör</label>
            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-primary)]">
              E-Ticaret & Teknoloji
            </div>
          </div>
        </div>

        <div className="w-full py-3 rounded-xl bg-[#FF5500] text-white text-xs font-extrabold text-center shadow-md shadow-[#FF5500]/20 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          <span>Analizi Başlat</span>
        </div>
      </div>
    )
  },
  {
    number: '03',
    title: 'AI Analizi',
    description: 'Yapay zeka renk uyumu, tipografi, kontrast ve kompozisyon kurallarını anında tarar.',
    icon: Cpu,
    mockup: (
      <div className="w-full h-full bg-[var(--card-bg)] rounded-3xl border border-[var(--border-primary)] p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF5500]">
            <Cpu className="w-4 h-4 animate-spin" />
            <span>AI Taraması Yapılıyor</span>
          </div>
          <span className="text-[11px] font-black text-[var(--text-primary)]">%94</span>
        </div>

        {/* Live scanning cards */}
        <div className="space-y-2.5 my-auto">
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              <span>Renk Paleti & Kontrast</span>
            </div>
            <span className="text-emerald-500 text-[11px]">Tamamlandı ✓</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-500" />
              <span>Tipografi Hiyerarşisi</span>
            </div>
            <span className="text-emerald-500 text-[11px]">Tamamlandı ✓</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[#FF5500]/40 flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#FF5500]" />
              <span>Gestalt Kompozisyon</span>
            </div>
            <span className="text-[#FF5500] text-[11px]">Taranıyor...</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-primary)]">
          <div className="bg-[#FF5500] h-full rounded-full w-[94%] transition-all duration-1000" />
        </div>
      </div>
    )
  },
  {
    number: '04',
    title: 'Sonuç & Paylaş',
    description: 'Detaylı 0-100 puan karneni incele, revize önerilerini uygula veya toplulukta paylaş.',
    icon: Sparkles,
    mockup: (
      <div className="w-full h-full bg-[var(--card-bg)] rounded-3xl border border-[var(--border-primary)] p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)]">
          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Analiz Raporu Hazır
          </span>
          <div className="px-3 py-1 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-xs font-black border border-[#FF5500]/20">
            PUAN: 94 / 100
          </div>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-auto">
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Estetik</p>
            <p className="text-lg font-black text-[var(--text-primary)] mt-0.5">96 / 100</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Kontrast</p>
            <p className="text-lg font-black text-[var(--text-primary)] mt-0.5">92 / 100</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Tipografi</p>
            <p className="text-lg font-black text-[var(--text-primary)] mt-0.5">95 / 100</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Kompozisyon</p>
            <p className="text-lg font-black text-[var(--text-primary)] mt-0.5">93 / 100</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 py-2.5 rounded-xl bg-[#FF5500] text-white text-xs font-extrabold text-center shadow-md shadow-[#FF5500]/20 flex items-center justify-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> PDF İndir
          </div>
          <div className="flex-1 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs font-extrabold text-center flex items-center justify-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Vitrin'de Paylaş
          </div>
        </div>
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
    <section id="nasil-calisir" className="w-full bg-[var(--bg-primary)] py-20 overflow-hidden relative border-t border-[var(--border-primary)]">
      {/* Grid Background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,rgba(0,0,0,0)_1px),linear-gradient(to_bottom,var(--grid-color)_1px,rgba(0,0,0,0)_1px)] bg-[size:32px_32px] pointer-events-none"
        style={{
          maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
        }}
      />

      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Side: Text Content */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-[#FF5500] font-extrabold text-xs uppercase tracking-[0.2em] mb-3 block"
              >
                SÜREÇ NASIL İŞLER?
              </motion.span>
              <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] leading-tight tracking-tight">
                Hızlıca <span className="text-[#FF5500]">Kusursuzlaştır.</span>
              </h2>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col">
                  <button
                    onClick={() => setActiveStep(index)}
                    className={`w-full group text-left p-4 lg:p-5 rounded-2xl transition-all duration-400 border relative overflow-hidden cursor-pointer ${
                      activeStep === index
                        ? 'bg-[var(--card-bg)] border-[#FF5500]/40 shadow-xl shadow-black/[0.04]'
                        : 'bg-transparent border-transparent hover:bg-[var(--card-bg)]/40'
                    }`}
                  >
                    {/* Progress line for active step */}
                    {activeStep === index && (
                      <motion.div
                        layoutId="progress-bar"
                        className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FF5500]"
                      />
                    )}

                    <div className="flex items-start gap-3 lg:gap-4">
                      <span className={`text-xs font-black pt-1 ${activeStep === index ? 'text-[#FF5500]' : 'text-[var(--text-secondary)]/40'}`}>
                        {step.number}
                      </span>
                      <div>
                        <h3 className={`font-extrabold text-sm lg:text-base transition-colors ${activeStep === index ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {step.title}
                        </h3>
                        <AnimatePresence mode="wait">
                          {activeStep === index && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5 font-medium"
                            >
                              {step.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </button>

                  {/* Mobile Accordion Mockup */}
                  <AnimatePresence>
                    {activeStep === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden overflow-hidden"
                      >
                        <div className="pt-4 pb-2 px-1">
                          <div className="relative h-[320px] w-full max-w-[400px] mx-auto">
                            <div className="relative h-full w-full bg-[var(--bg-secondary)] rounded-[24px] border border-[var(--border-primary)] shadow-lg p-3 sm:p-4 flex items-center justify-center">
                              {step.mockup}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Interactive Visual Product Showcase */}
          <div className="hidden lg:block lg:col-span-7 sticky top-28">
            <div className="relative aspect-[4/3] w-full max-w-[560px] mx-auto">
              {/* Decorative background cards */}
              <div className="absolute inset-0 bg-[#FF5500]/10 blur-3xl scale-95 translate-y-6 rounded-[40px] pointer-events-none" />

              <div className="relative h-full w-full bg-[var(--bg-secondary)] rounded-[32px] border border-[var(--border-primary)] shadow-2xl p-6 md:p-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {steps[activeStep].mockup}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step indicator dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStep === idx ? 'w-8 bg-[#FF5500]' : 'w-2 bg-[var(--border-primary)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
