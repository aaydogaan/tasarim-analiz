import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import ShopierModal from '../components/ui/ShopierModal';

const proFeatures = [
  'Sınırsız & Öncelikli Yapay Zeka Tasarım Analizi',
  'Kıdemli Tasarım Direktörü Derin Raporlama',
  'AI Tasarım Revizyon & İyileştirme Önerileri',
  'Renk Paleti & Tipografi Derin Sentezi',
  'Kesintisiz 7/24 Kullanım',
];

export default function Pricing() {
  const [shopierModalOpen, setShopierModalOpen] = useState(false);

  return (
    <div className="w-full pt-8 md:pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col items-center min-h-screen">
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 max-w-xl mx-auto"
      >
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3 leading-tight">
          Revizelesene <span className="text-[#FF5500]">PRO</span>
        </h1>

        <p className="text-[var(--text-secondary)] text-sm sm:text-base font-medium leading-relaxed">
          Sınırsız yapay zeka analiz asistanı ile tasarımlarınızı üst seviyeye taşıyın.
        </p>
      </motion.div>

      {/* Single Centered Pro Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md bg-[var(--card-bg)] rounded-[32px] p-7 md:p-8 border border-[#FF5500] shadow-2xl overflow-hidden"
      >
        {/* Top Gradient Highlight Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF5500] to-amber-500" />
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center font-bold border border-[#FF5500]/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] leading-tight">Pro Paket</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Profesyonel Tasarımcılar İçin</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
                PRO
              </span>
            </div>

            {/* Price Box */}
            <div className="mb-6 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary)] flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter">59 ₺</span>
                  <span className="text-[var(--text-secondary)] text-xs font-bold">/ ay</span>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold mt-1 block">
                  Shopier Kredi/Banka Kartı İle Güvenli Ödeme
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => setShopierModalOpen(true)}
              className="w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 mb-8 bg-[#FF5500] hover:bg-[#e64d00] text-white shadow-xl shadow-[#FF5500]/30 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Hemen PRO Plana Geç</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Features List */}
            <div className="space-y-3.5 pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">Paket İçeriği</p>
              {proFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center shrink-0 border border-[#FF5500]/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[var(--text-primary)] text-xs md:text-sm font-semibold">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Footer */}
      <div className="mt-8 text-center text-xs text-[var(--text-secondary)] font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Shopier 256-Bit SSL Koruması & 3D Secure Güvencesi</span>
      </div>

      <ShopierModal isOpen={shopierModalOpen} onClose={() => setShopierModalOpen(false)} />
    </div>
  );
}
