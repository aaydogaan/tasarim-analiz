import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Lock, CreditCard, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

interface ShopierModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SHOPIER_PRODUCT_URL = 'https://www.shopier.com/revizelesene/49368202';

export default function ShopierModal({ isOpen, onClose }: ShopierModalProps) {
    const handleProceedToShopier = () => {
        window.open(SHOPIER_PRODUCT_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[960]"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[961] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[var(--card-bg)] rounded-[32px] border border-[var(--border-primary)] shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center font-bold border border-[#FF5500]/20">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-[var(--text-primary)] text-base leading-tight flex items-center gap-2">
                                            <span>Shopier Güvenli Ödeme</span>
                                            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Lock size={10} /> 256-Bit SSL
                                            </span>
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">Revizelesene PRO — 59 ₺ / ay</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5">
                                {/* Summary Card */}
                                <div className="bg-gradient-to-r from-[#FF5500]/10 via-[var(--bg-secondary)] to-amber-500/10 p-5 rounded-2xl border border-[#FF5500]/20 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5500] block mb-1">PRO Üyelik Paketi</span>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-3xl font-black text-[var(--text-primary)]">59 ₺</span>
                                            <span className="text-xs text-[var(--text-secondary)] font-bold">/ ay</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="bg-[#FF5500] text-white text-[10px] font-black uppercase px-3 py-1 rounded-xl shadow-md shadow-[#FF5500]/20 flex items-center gap-1">
                                            <Sparkles size={12} /> Sınırsız AI
                                        </span>
                                    </div>
                                </div>

                                {/* Features Checklist */}
                                <div className="space-y-2 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-primary)]">
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 size={16} />
                                        <span>Tüm kredi & banka kartları ile 3D Secure güvenli ödeme</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 size={16} />
                                        <span>Ödeme sonrası anında üyelik aktifleştirme</span>
                                    </div>
                                </div>

                                {/* Primary Button */}
                                <button
                                    onClick={handleProceedToShopier}
                                    className="w-full py-4 rounded-2xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-black text-sm shadow-xl shadow-[#FF5500]/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                                >
                                    <span>Shopier Güvenli Ödeme Sayfasına Git</span>
                                    <ExternalLink size={18} />
                                </button>

                                <p className="text-[11px] text-center text-[var(--text-secondary)] font-medium">
                                    Butona tıkladığınızda Shopier korumalı ödeme penceresi açılacaktır.
                                </p>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3.5 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/30 flex items-center justify-between text-[11px] text-[var(--text-secondary)] shrink-0 font-medium">
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <ShieldCheck size={14} /> Shopier Güvenli Ödeme Altyapısı
                                </span>
                                <span>256-Bit SSL Koruma</span>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
