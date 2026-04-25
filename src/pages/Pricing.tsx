import React from 'react';
import { motion } from 'motion/react';
import { Check, Flame, Zap, Crown, ArrowRight } from 'lucide-react';

const plans = [
    {
        name: 'Başlangıç',
        badge: '',
        price: 'Ücretsiz',
        period: 'Sonsuza kadar',
        description: 'Temel analiz ihtiyaçları ve topluluk deneyimi.',
        features: [
            'Günde 3 Temel Tasarım Analizi',
            'Keşfet\'te Paylaşım ve Etkileşim',
            'Genel Kalite Skorlaması (100 Üzerinden)',
            'Baskın Renk Paleti Çıkarımı',
        ],
        notIncluded: [
            'Yapay Zeka İyileştirme Önerisi (PRO)',
            'Teknik Detay Analizleri (Boşluk, Kontrast)',
            'Sınırsız Analiz Hakkı'
        ],
        buttonText: 'Hemen Başla',
        buttonVariant: 'outline',
        icon: <Flame className="w-5 h-5 text-gray-500" />,
        popular: false,
        gradient: 'from-gray-100 to-white'
    },
    {
        name: 'Pro',
        badge: 'En Çok Tercih Edilen',
        price: '₺149',
        period: '/ay',
        description: 'Yapay zeka asistanı ve gelişmiş analiz metrikleri.',
        features: [
            'Sınırsız Tasarım Analizi',
            'Yapay Zeka (PRO) Tasarım İyileştirme Önerisi',
            'Teknik Detaylar (Negatif Alan, Kontrast vb.)',
            'Analiz Geçmişine Erişim',
            'Keşfet\'te Öne Çıkan Tasarımlar',
            'Öncelikli Hızlı Analiz Kuyruğu'
        ],
        notIncluded: [
            'Markaya Özel AI Model Eğitimi',
            'Sınırsız API Erişimi'
        ],
        buttonText: '14 Gün Ücretsiz Dene',
        buttonVariant: 'solid',
        icon: <Zap className="w-5 h-5 text-[var(--color-brand-orange)]" />,
        popular: true,
        gradient: 'from-[var(--color-brand-orange)]/10 to-transparent'
    },
    {
        name: 'Stüdyo',
        badge: 'Profesyoneller İçin',
        price: '₺499',
        period: '/ay',
        description: 'Ajanslar ve yoğun üretim yapan takımlar için.',
        features: [
            'Pro plandaki her şey +',
            'Markaya Özel Tasarım Dili Eğitme (Çok Yakında)',
            'Toplu Klasör & Sayfa Analizi (Çok Yakında)',
            'Gelişmiş API Erişimi (Sınırlandırılmış)',
            'Rakip Tasarım Kıyaslama Raporu (Çok Yakında)',
            '7/24 Öncelikli Kurumsal Destek'
        ],
        notIncluded: [],
        buttonText: 'Satış Ekibiyle Görüş',
        buttonVariant: 'dark',
        icon: <Crown className="w-5 h-5 text-purple-500" />,
        popular: false,
        gradient: 'from-purple-500/10 to-transparent'
    }
];

export default function Pricing() {
    return (
        <div className="w-full pt-8 md:pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center min-h-screen">

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 max-w-2xl mx-auto"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] text-xs font-bold uppercase tracking-widest mb-6">
                    <SparklesIcon className="w-3 h-3" /> Fiyatlandırma
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tighter mb-4">
                    Tasarımınızı Bir Üst Seviyeye<br />Taşıyacak Planı Seçin.
                </h1>
                <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium">
                    Toplulukla etkileşimde kalmak için ücretsiz başlayın, veya yapay zeka analizinin gerçek gücünü keşfetmek için PRO'ya geçin.
                </p>
            </motion.div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className={`relative flex flex-col rounded-[32px] p-8 border ${plan.popular ? 'border-[var(--color-brand-orange)] shadow-2xl scale-100 md:-translate-y-4' : 'border-[var(--border-primary)] shadow-lg bg-[var(--card-bg)]'} overflow-hidden`}
                    >
                        {/* Background Effect for Popular */}
                        {plan.popular && (
                            <>
                                <div className="absolute inset-0 bg-[var(--card-bg)] z-0" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-orange)]/5 to-transparent z-0" />
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#ff4d00] to-amber-500" />
                            </>
                        )}

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-[var(--color-brand-orange)]/10' : 'bg-[var(--bg-secondary)]'}`}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{plan.name}</h3>
                                </div>
                                {plan.badge && (
                                    <span className="bg-[#ff4d00] text-white text-[9px] font-extrabold px-2 py-1 rounded-[6px] uppercase tracking-wider">
                                        {plan.badge}
                                    </span>
                                )}
                            </div>

                            <div className="mb-4">
                                <p className="text-[var(--text-secondary)] text-sm h-10 leading-snug">{plan.description}</p>
                            </div>

                            <div className="mb-8 flex items-end gap-1">
                                <span className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter">{plan.price}</span>
                                <span className="text-[var(--text-secondary)] text-sm font-bold mb-1">{plan.period}</span>
                            </div>

                            <button
                                className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 mb-8 ${plan.buttonVariant === 'solid'
                                    ? 'bg-gradient-to-r from-[#ff4d00] to-amber-500 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]'
                                    : plan.buttonVariant === 'dark'
                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 hover:scale-[1.02]'
                                        : 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'
                                    }`}
                            >
                                {plan.buttonText} <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Özellikler</p>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-[var(--color-brand-orange)]/20 text-[var(--color-brand-orange)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-[var(--text-primary)] text-sm font-medium">{feature}</span>
                                    </div>
                                ))}

                                {plan.notIncluded.length > 0 && (
                                    <>
                                        <div className="h-px w-full bg-[var(--border-primary)] my-4" />
                                        {plan.notIncluded.map((feature, i) => (
                                            <div key={`not-${i}`} className="flex items-start gap-3 opacity-50">
                                                <div className="mt-0.5 rounded-full p-0.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </div>
                                                <span className="text-[var(--text-primary)] text-sm font-medium line-through">{feature}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
        </svg>
    );
}
