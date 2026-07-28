import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Lock, CreditCard, ExternalLink, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface ShopierModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SHOPIER_PRODUCT_URL = 'https://www.shopier.com/ShowProductCode?id=49368202';

export default function ShopierModal({ isOpen, onClose }: ShopierModalProps) {
    const [loading, setLoading] = useState(true);
    const [iframeFailed, setIframeFailed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setIframeFailed(false);
        }
    }, [isOpen]);

    const handleIframeLoad = () => {
        setLoading(false);
    };

    const handleOpenNewTab = () => {
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
                        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[960]"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[961] flex items-center justify-center p-2 sm:p-4 md:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[var(--card-bg)] rounded-[28px] md:rounded-[36px] border border-[var(--border-primary)] shadow-2xl w-full max-w-2xl h-[92vh] max-h-[760px] flex flex-col overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Top Header */}
                            <div className="px-5 sm:px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/80 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center font-bold border border-[#FF5500]/20 shrink-0">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-[var(--text-primary)] text-sm sm:text-base leading-tight flex items-center gap-2">
                                            <span>Shopier Anında Ödeme</span>
                                            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Lock size={10} /> 256-Bit SSL
                                            </span>
                                        </h3>
                                        <p className="text-[11px] text-[var(--text-secondary)] font-medium">Revizelesene PRO — 59 ₺ / ay</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleOpenNewTab}
                                        title="Yeni Sekmede Aç"
                                        className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[#FF5500] px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-primary)] transition-colors border border-transparent hover:border-[var(--border-primary)]"
                                    >
                                        <ExternalLink size={14} />
                                        <span>Yeni Sekme</span>
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Main Body (Embedded Iframe & Loading State) */}
                            <div className="flex-1 bg-white dark:bg-[var(--bg-primary)] relative overflow-hidden flex flex-col items-center justify-center">
                                {/* Loading Overlay */}
                                {loading && (
                                    <div className="absolute inset-0 bg-[var(--bg-primary)] z-10 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center mb-4 relative">
                                            <Loader2 size={28} className="animate-spin text-[#FF5500]" />
                                        </div>
                                        <h4 className="font-extrabold text-[var(--text-primary)] text-sm sm:text-base mb-1">
                                            Shopier Güvenli Kart Ödeme Ekranı Yükleniyor...
                                        </h4>
                                        <p className="text-xs text-[var(--text-secondary)] font-medium max-w-xs">
                                            Kart bilgilerinizi ve 3D Secure şifrenizi bu pencereden güvenle girebilirsiniz.
                                        </p>
                                    </div>
                                )}

                                {/* Embedded Shopier Payment Checkout */}
                                <iframe
                                    src={SHOPIER_PRODUCT_URL}
                                    onLoad={handleIframeLoad}
                                    onError={() => { setLoading(false); setIframeFailed(true); }}
                                    className="w-full h-full border-none bg-white"
                                    title="Shopier Güvenli Ödeme"
                                    allow="payment *"
                                />

                                {/* Fallback if embedded loading issues occur */}
                                {iframeFailed && (
                                    <div className="absolute inset-0 bg-[var(--bg-primary)] z-20 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-12 h-12 rounded-full bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center mb-3">
                                            <CreditCard size={24} />
                                        </div>
                                        <h4 className="font-extrabold text-[var(--text-primary)] text-base mb-2">Ödeme Sayfasını Açın</h4>
                                        <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-5 font-medium">
                                            Tarayıcı güvenlik ayarlarınız sebebiyle ödeme ekranını yeni sekmede açarak kart bilgilerinizle ödemenizi tamamlayabilirsiniz.
                                        </p>
                                        <button
                                            onClick={handleOpenNewTab}
                                            className="px-6 py-3 rounded-2xl bg-[#FF5500] text-white font-black text-xs shadow-lg shadow-[#FF5500]/25 flex items-center gap-2 cursor-pointer"
                                        >
                                            <span>Shopier Ödeme Sayfasına Git</span>
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal Bottom Footer */}
                            <div className="px-5 sm:px-6 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--text-secondary)] shrink-0 font-medium">
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <ShieldCheck size={14} /> 3D Secure & 256-Bit SSL Korumalı Shopier Altyapısı
                                </span>
                                <button
                                    onClick={handleOpenNewTab}
                                    className="text-[#FF5500] hover:underline font-bold sm:hidden flex items-center gap-1"
                                >
                                    <span>Yeni Sekmede Aç</span>
                                    <ExternalLink size={12} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
