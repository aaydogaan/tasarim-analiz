import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Lock, CreditCard, ExternalLink, Loader2, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OdealModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OdealModal({ isOpen, onClose }: OdealModalProps) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [htmlForm, setHtmlForm] = useState<string | null>(null);

    const handleStartCheckout = async () => {
        setLoading(true);
        setErrorMsg(null);
        setHtmlForm(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            const res = await fetch('/api/odeal-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    userEmail: user?.email,
                    userName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Tasarımcı'
                })
            });

            const data = await res.json();
            
            if (data.threeDFormHtml) {
                setHtmlForm(data.threeDFormHtml);
            } else if (data.paymentUrl) {
                window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
                onClose();
            } else {
                setErrorMsg(data.error || 'ÖdeAl 3D Secure ödeme ekranı yanıt vermedi.');
            }
        } catch (err: any) {
            console.error('ÖdeAl checkout hatası:', err);
            setErrorMsg('ÖdeAl Sanal POS ödeme sistemine bağlanırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
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

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[961] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[var(--card-bg)] rounded-[32px] border border-[var(--border-primary)] shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden relative flex flex-col"
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
                                            <span>ÖdeAl Sanal POS</span>
                                            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Lock size={10} /> 3D Secure
                                            </span>
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">Revizelesene PRO — 59 ₺ / ay</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                {htmlForm ? (
                                    <div 
                                        className="w-full min-h-[300px] bg-white rounded-2xl p-4"
                                        dangerouslySetInnerHTML={{ __html: htmlForm }}
                                    />
                                ) : (
                                    <>
                                        {/* Price Summary Card */}
                                        <div className="bg-gradient-to-r from-[#FF5500]/10 via-[var(--bg-secondary)] to-amber-500/10 p-5 rounded-2xl border border-[#FF5500]/20 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5500] block mb-1">PRO Üyelik Paketi</span>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-3xl font-black text-[var(--text-primary)]">59 ₺</span>
                                                    <span className="text-xs text-[var(--text-secondary)] font-bold">/ ay</span>
                                                </div>
                                            </div>
                                            <span className="bg-[#FF5500] text-white text-[10px] font-black uppercase px-3 py-1 rounded-xl shadow-md shadow-[#FF5500]/20 flex items-center gap-1">
                                                <Zap size={12} /> Sınırsız AI
                                            </span>
                                        </div>

                                        {errorMsg && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium text-center">
                                                {errorMsg}
                                            </div>
                                        )}

                                        {/* Primary Button */}
                                        <button
                                            onClick={handleStartCheckout}
                                            disabled={loading}
                                            className="w-full py-4 rounded-2xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-black text-sm shadow-xl shadow-[#FF5500]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span>ÖdeAl 3D Ödeme Ekranı Yükleniyor...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>ÖdeAl 3D Secure Kartla Öde</span>
                                                    <ExternalLink size={18} />
                                                </>
                                            )}
                                        </button>

                                        <p className="text-[11px] text-center text-[var(--text-secondary)] font-medium leading-relaxed">
                                            Banka SMS ve mobil onaylı ÖdeAl 3D Secure ödeme ekranı açılacaktır. Ödemeniz tamamlandığında hesabınız anında PRO yapılacaktır.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3.5 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/30 flex items-center justify-between text-[11px] text-[var(--text-secondary)] shrink-0 font-medium">
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <ShieldCheck size={14} /> ÖdeAl Sanal POS Güvenli Ödeme
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
