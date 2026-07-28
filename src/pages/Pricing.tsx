import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Flame, Zap, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import ShopierModal from '../components/ui/ShopierModal';

const plans = [
  {
    name: 'Ücretsiz Plan',
    badge: 'Temel Kullanım',
    price: '₺0',
    period: 'Sonsuza kadar ücretsiz',
    description: 'Bireysel denemeler, temel analiz ihtiyaçları ve topluluk katılımı.',
    features: [
      'Günde 2 Ücretsiz Tasarım Analizi',
      'Topluluk Vitrininde Paylaşım',
      'Genel Kalite Puanlaması (0-100)',
      'Baskın Renk Paleti Çıkarımı',
      'Standart Yapay Zeka Raporu',
    ],
    buttonText: 'Mevcut Planınız',
    buttonVariant: 'outline',
    icon: <Flame className="w-5 h-5 text-gray-500" />,
    popular: false,
  },
  {
    name: 'Pro Paket',
    badge: 'En Popüler',
    price: '59 ₺',
    period: '/ ay',
    description: 'Profesyoneller için sınırsız AI asistanı ve derinlemesine teknik analizler.',
    features: [
      'Sınırsız & Öncelikli Tasarım Analizi',
      'Kıdemli Tasarım Direktörü Derin Raporu',
      'Kilitli AI Tasarım Revizyon Önerileri',
      'Yüksek Çözünürlüklü PDF Rapor İndirme',
      'Topluluk Vitrininde Öncelikli Vurgulanma',
      'Kesintisiz 7/24 Kullanım',
    ],
    buttonText: 'PRO Plana Geç',
    buttonVariant: 'solid',
    icon: <Zap className="w-5 h-5 text-[#FF5500]" />,
    popular: true,
  }
];

export default function Pricing() {
  const [shopierModalOpen, setShopierModalOpen] = useState(false);

  return (
    <div className="w-full pt-8 md:pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center min-h-screen">
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] text-xs font-black uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Şeffaf & Esnek Fiyatlandırma</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4 leading-tight">
          İhtiyacınıza Uygun <br />
          <span className="text-[#FF5500]">Planı Seçin 🚀</span>
        </h1>

        <p className="text-[var(--text-secondary)] text-sm sm:text-base font-medium leading-relaxed">
          Tüm özelliklere erişmek, sınırsız analiz yapmak ve yapay zekadan derinlemesine teknik direktör tavsiyeleri almak için PRO plana yükseltin.
        </p>
      </motion.div>

      {/* Pricing Cards Grid (2 Centered Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`relative flex flex-col justify-between rounded-[32px] p-7 md:p-8 border ${
              plan.popular
                ? 'border-[#FF5500] shadow-2xl bg-[var(--card-bg)]'
                : 'border-[var(--border-primary)] shadow-sm bg-[var(--card-bg)]'
            } overflow-hidden`}
          >
            {/* Background Effect for Popular */}
            {plan.popular && (
              <>
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF5500] to-amber-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />
              </>
            )}

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-[#FF5500]/10' : 'bg-[var(--bg-secondary)]'}`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)]">{plan.name}</h3>
                  </div>
                  {plan.badge && (
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      plan.popular ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]'
                    }`}>
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-[var(--text-secondary)] text-xs md:text-sm mb-6 leading-relaxed font-medium">{plan.description}</p>

                <div className="mb-6 flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter">{plan.price}</span>
                    <span className="text-[var(--text-secondary)] text-xs md:text-sm font-bold">{plan.period}</span>
                    {plan.popular && (
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)] shrink-0">
                        +%20 KDV
                      </span>
                    )}
                  </div>
                  {plan.popular && (
                    <span className="text-[10px] text-[var(--text-secondary)] font-bold mt-1.5 block">Shopier Kredi/Banka Kartı İle Güvenli Ödeme</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (plan.popular) {
                      setShopierModalOpen(true);
                    }
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 mb-8 ${
                    plan.popular
                      ? 'bg-[#FF5500] hover:bg-[#e64d00] text-white shadow-xl shadow-[#FF5500]/30 cursor-pointer transform hover:-translate-y-0.5'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] cursor-default'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Paket İçeriği</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-[#FF5500]/20 text-[#FF5500]' : 'bg-[var(--bg-secondary)] text-emerald-500'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[var(--text-primary)] text-xs md:text-sm font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ShopierModal isOpen={shopierModalOpen} onClose={() => setShopierModalOpen(false)} />
    </div>
  );
}
