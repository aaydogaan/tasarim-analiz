import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Flame, Zap, Crown, ArrowRight, Sparkles, Clock, Bell, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import PayTRModal from '../components/ui/PayTRModal';

const plans = [
  {
    name: 'Ücretsiz Plan',
    badge: 'Şu An Aktif',
    price: '₺0',
    period: 'Sonsuza kadar',
    description: 'Temel analiz ihtiyaçları ve topluluk katılımı.',
    features: [
      'Günde 2 Ücretsiz Tasarım Analizi',
      'Topluluk Vitrininde Paylaşım',
      'Genel Kalite Puanlaması (0-100)',
      'Baskın Renk Paleti Çıkarımı',
    ],
    buttonText: 'Mevcut Planınız',
    buttonVariant: 'outline',
    icon: <Flame className="w-5 h-5 text-gray-500" />,
    popular: false,
    comingSoon: false,
  },
  {
    name: 'Pro Paket',
    badge: 'Önerilen',
    price: '59 ₺',
    period: '/ ay (+%20 KDV = 70.80 ₺)',
    description: 'Sınırsız yapay zeka asistanı ve derinlemesine teknik analizler.',
    features: [
      'Sınırsız & Öncelikli Tasarım Analizi',
      'Derinlemesine Tasarım Direktörü Raporu',
      'Yapay Zeka (PRO) İyileştirme Önerileri',
      'Yüksek Çözünürlüklü PDF Rapor İndirme',
      'Topluluk Vitrininde Öne Çıkarılma',
    ],
    buttonText: 'PRO Plana Geç',
    buttonVariant: 'solid',
    icon: <Zap className="w-5 h-5 text-[#FF5500]" />,
    popular: true,
    comingSoon: false,
  },
  {
    name: 'Stüdyo Paket',
    badge: 'Çok Yakında',
    price: 'Yakında',
    period: 'Lansmanda Açıklanacak',
    description: 'Ajanslar, stüdyolar ve yoğun üretim yapan ekipler için.',
    features: [
      'Pro Plandaki Her Şey +',
      'Markaya Özel AI Model Eğitimi',
      'Toplu Klasör & Sayfa Analizi',
      'Rakip Tasarım Kıyaslama Raporu',
      '7/24 Öncelikli Kurumsal Destek',
    ],
    buttonText: 'Erken Erişime Katıl',
    buttonVariant: 'dark',
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    popular: false,
    comingSoon: true,
  }
];

export default function Pricing() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paytrModalOpen, setPaytrModalOpen] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setSubmitting(true);
    try {
      await supabase.from('newsletter_subscribers').upsert({ email }, { onConflict: 'email' });
      toast.success('🎉 Erken erişim listesine eklendiniz! Pro paketler açıldığında ilk size bildireceğiz.', { duration: 5000 });
      setEmail('');
    } catch (_) {
      toast.success('🎉 Erken erişim talebiniz alındı!');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pt-8 md:pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center min-h-screen">
      
      {/* Header Section with Corporate Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] text-xs font-extrabold uppercase tracking-wider mb-6">
          <Clock className="w-4 h-4" />
          <span>Çok Yakında Hizmetinizde</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight mb-6 leading-tight">
          Revizelesene Pro Paketleri <br />
          <span className="text-[#FF5500]">Hazırlanıyor! 🚀</span>
        </h1>

        <p className="text-[var(--text-secondary)] text-base sm:text-lg font-medium leading-relaxed mb-8">
          Sınırsız yapay zeka analizleri, yüksek çözünürlüklü PDF rapor çıktısı ve öncelikli analiz sırası sunan Pro paketlerimiz üzerinde çalışıyoruz. Erken erişim lansmanı öncesi yerinizi hemen ayırın!
        </p>

        {/* Waitlist Form */}
        <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <div className="relative w-full">
            <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF5500] transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#e04b00] text-white font-extrabold text-sm transition-all shadow-md shadow-[#FF5500]/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Haber Ver</span>
          </button>
        </form>
      </motion.div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`relative flex flex-col rounded-[32px] p-8 border ${
              plan.popular
                ? 'border-[#FF5500] shadow-2xl scale-100 md:-translate-y-2'
                : 'border-[var(--border-primary)] shadow-lg bg-[var(--card-bg)]'
            } overflow-hidden`}
          >
            {/* Background Effect for Popular */}
            {plan.popular && (
              <>
                <div className="absolute inset-0 bg-[var(--card-bg)] z-0" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF5500]/5 to-transparent z-0" />
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF5500] to-amber-500" />
              </>
            )}

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-[#FF5500]/10' : 'bg-[var(--bg-secondary)]'}`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{plan.name}</h3>
                  </div>
                  {plan.badge && (
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      plan.comingSoon ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">{plan.description}</p>

                <div className="mb-8 flex items-end gap-1">
                  <span className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter">{plan.price}</span>
                  <span className="text-[var(--text-secondary)] text-sm font-bold mb-1">{plan.period}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (plan.name === 'Pro Paket') {
                      setPaytrModalOpen(true);
                    } else if (plan.comingSoon) {
                      toast('🚀 ' + plan.name + ' Çok Yakında Hizmetinizde!', { 
                        icon: '✨', 
                        duration: 4000, 
                        style: { borderRadius: '16px', background: '#18181b', color: '#fff', border: '1px solid #27272a', fontWeight: 'bold' } 
                      });
                    }
                  }}
                  className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 mb-8 ${
                    plan.popular
                      ? 'bg-[#FF5500] hover:bg-[#e64d00] text-white shadow-lg shadow-[#FF5500]/25 cursor-pointer'
                      : plan.comingSoon
                      ? 'bg-zinc-800 hover:bg-zinc-900 text-white shadow-md border border-zinc-700 cursor-pointer'
                      : 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Özellikler</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-[#FF5500]/20 text-[#FF5500]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[var(--text-primary)] text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[var(--border-primary)] flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Taahhütsüz, istediğiniz an iptal hakkı</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <PayTRModal isOpen={paytrModalOpen} onClose={() => setPaytrModalOpen(false)} />
    </div>
  );
}
