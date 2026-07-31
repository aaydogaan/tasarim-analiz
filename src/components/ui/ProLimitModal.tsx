import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, ShieldCheck, Zap, Layers, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ShopierModal from './ShopierModal';

interface ProLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export default function ProLimitModal({
    isOpen,
    onClose,
    title = 'Günlük Ücretsiz Analiz Hakkınız Doldu!',
    description = 'Bugünlük 3/3 ücretsiz analiz hakkınızı tamamladınız. Sınırsız analiz yapmak ve derinlemesine teknik raporlar almak için PRO plana geçin.',
}: ProLimitModalProps) {
    const navigate = useNavigate();
    const [shopierOpen, setShopierOpen] = React.useState(false);

    const handleUpgrade = () => {
        setShopierOpen(true);
    };

    const features = [
        'Sınırsız & Öncelikli Hızlı AI Tasarım Analizi',
        'Derinlemesine Teknik Tasarım Direktörü Raporu',
        'Kilitli AI Tasarım Revizyon Önerilerine Tam Erişim',
        'Topluluk Vitrininde Öncelikli Yayınlama & Vurgu',
        'Yüksek Çözünürlüklü PDF Rapor İndirme'
    ];

    return (
        <>
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[950]"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[951] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 12 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="bg-[var(--card-bg)] rounded-[32px] border border-[var(--border-primary)] shadow-2xl w-full max-w-md overflow-hidden p-6 md:p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
                            >
                                <X size={18} />
                            </button>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] text-xs font-black uppercase tracking-wider mb-4">
                                <Sparkles size={14} /> PRO Plan Ayrıcalığı
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-[var(--text-primary)] font-black text-xl md:text-2xl tracking-tight leading-snug mb-2">
                                {title}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-medium mb-6">
                                {description}
                            </p>

                            {/* Features List */}
                            <div className="space-y-2.5 mb-6 bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--border-primary)]">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-semibold">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Pricing Box */}
                            <div className="bg-gradient-to-r from-[#FF5500]/10 via-[var(--bg-secondary)] to-amber-500/10 p-4 rounded-2xl border border-[#FF5500]/20 flex items-center justify-between mb-6">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">PRO Üyelik</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-[var(--text-primary)]">59 ₺</span>
                                        <span className="text-xs text-[var(--text-secondary)] font-bold">/ ay</span>
                                    </div>
                                </div>
                                <span className="bg-[#FF5500] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                                    En Popüler
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2.5">
                                <button
                                    onClick={handleUpgrade}
                                    className="w-full py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-black text-sm shadow-lg shadow-[#FF5500]/25 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Hemen PRO'ya Geç</span>
                                    <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs transition-colors"
                                >
                                    Yarın 00:00'da Yenilenmesini Bekle
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
        <ShopierModal isOpen={shopierOpen} onClose={() => setShopierOpen(false)} />
        </>
    );
}

