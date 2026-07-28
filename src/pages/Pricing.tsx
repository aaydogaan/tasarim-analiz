import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles, SlidersHorizontal, Lightbulb, BarChart3, Wand2, ShieldCheck } from 'lucide-react';
import OdealModal from '../components/ui/OdealModal';

const features = [
  { icon: <Zap className="w-4 h-4 text-slate-800 dark:text-slate-200" />, text: 'Sınırsız & Öncelikli AI Tasarım Analizi' },
  { icon: <SlidersHorizontal className="w-4 h-4 text-slate-800 dark:text-slate-200" />, text: 'Kıdemli Tasarım Direktörü Derin Raporu' },
  { icon: <Lightbulb className="w-4 h-4 text-slate-800 dark:text-slate-200" />, text: 'AI Tasarım Revizyon & İyileştirme Önerileri' },
  { icon: <BarChart3 className="w-4 h-4 text-slate-800 dark:text-slate-200" />, text: 'Baskın Renk Paleti & Tipografi Sentezi' },
  { icon: <Wand2 className="w-4 h-4 text-slate-800 dark:text-slate-200" />, text: 'Kesintisiz 7/24 Kullanım' },
];

export default function Pricing() {
  const [odealModalOpen, setOdealModalOpen] = useState(false);

  return (
    <div className="w-full pt-6 md:pt-12 pb-24 px-4 sm:px-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[85vh]">
      
      {/* Reference Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white dark:bg-[#121214] text-slate-900 dark:text-slate-100 rounded-[38px] p-8 sm:p-9 border border-slate-200/90 dark:border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          {/* Card Title */}
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">
            PRO Paket
          </h3>

          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white">
              59 ₺
            </span>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight max-w-[130px]">
              aylık abonelik <br />
              tüm özellikler açık
            </div>
          </div>

          {/* Sunset Mesh Gradient Glow & CTA Button Container */}
          <div className="relative my-4 p-2 rounded-[28px] overflow-hidden flex items-center justify-center">
            {/* Vibrant Sunset Mesh Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-300 via-amber-300 to-orange-400 dark:from-sky-500/40 dark:via-amber-500/40 dark:to-orange-500/40 blur-xl opacity-90 scale-110 pointer-events-none" />
            
            <button
              type="button"
              onClick={() => setOdealModalOpen(true)}
              className="relative z-10 w-full py-4 rounded-[22px] bg-[#18181b] hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-base shadow-xl transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Hemen Başla</span>
            </button>
          </div>

          {/* Feature List (Exact Icon + Text Alignment) */}
          <div className="space-y-4 pt-6">
            {features.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Subtext */}
        <div className="mt-8 pt-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>ÖdeAl Sanal POS 3D Secure Güvenli Ödeme</span>
        </div>
      </motion.div>

      <OdealModal isOpen={odealModalOpen} onClose={() => setOdealModalOpen(false)} />
    </div>
  );
}
