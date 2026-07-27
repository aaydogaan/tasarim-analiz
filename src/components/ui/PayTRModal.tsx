import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Loader2, Lock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface PayTRModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PayTRModal({ isOpen, onClose }: PayTRModalProps) {
    const [loading, setLoading] = useState(false);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setIframeUrl(null);
            setErrorMsg(null);
            return;
        }

        const initCheckout = async () => {
            setLoading(true);
            setErrorMsg(null);
            try {
                const session = (await supabase.auth.getSession()).data.session;
                const token = session?.access_token;

                const res = await fetch('/api/paytr-checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });

                const data = await res.json();
                if (res.ok && data.iframeUrl) {
                    setIframeUrl(data.iframeUrl);
                } else {
                    setErrorMsg(data.reason || data.error || 'Ödeme ekranı yüklenemedi.');
                }
            } catch (err: any) {
                console.error('PayTR checkout hatası:', err);
                setErrorMsg('Ödeme servisine bağlanırken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        initCheckout();
    }, [isOpen]);

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[960]"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[961] flex items-center justify-center p-3 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[var(--card-bg)] rounded-[28px] border border-[var(--border-primary)] shadow-2xl w-full max-w-2xl h-[90vh] max-h-[720px] flex flex-col overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center font-bold">
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-[var(--text-primary)] text-sm leading-tight flex items-center gap-1.5">
                                            <span>Güvenli PRO Ödeme</span>
                                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                <Lock size={10} /> 256-Bit SSL
                                            </span>
                                        </h3>
                                        <p className="text-[10px] text-[var(--text-secondary)] font-medium">Revizelesene PRO — 59 ₺ / ay (+%20 KDV = 70.80 ₺)</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body / PayTR Iframe */}
                            <div className="flex-1 bg-white relative overflow-hidden flex flex-col items-center justify-center">
                                {loading && (
                                    <div className="flex flex-col items-center gap-3 p-8 text-slate-700">
                                        <Loader2 size={32} className="animate-spin text-[#FF5500]" />
                                        <p className="text-xs font-bold">PayTR Güvenli Ödeme Ekranı Yükleniyor...</p>
                                    </div>
                                )}

                                {errorMsg && !loading && (
                                    <div className="p-8 text-center max-w-md">
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
                                            <X size={24} />
                                        </div>
                                        <h4 className="font-extrabold text-slate-900 text-sm mb-1">Ödeme Ekranı Yüklenemedi</h4>
                                        <p className="text-xs text-slate-500 mb-4">{errorMsg}</p>
                                        <button
                                            onClick={onClose}
                                            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                                        >
                                            Kapat
                                        </button>
                                    </div>
                                )}

                                {iframeUrl && !loading && (
                                    <iframe
                                        src={iframeUrl}
                                        className="w-full h-full border-none"
                                        title="PayTR Güvenli Ödeme"
                                    />
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/30 flex items-center justify-between text-[10px] text-[var(--text-secondary)] shrink-0">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-emerald-500" /> PayTR Altyapısı İle Korunmaktadır
                                </span>
                                <span>İstediğiniz zaman iptal edebilirsiniz</span>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

