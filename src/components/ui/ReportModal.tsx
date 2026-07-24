import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, X, Loader2, Send } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
}

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;
        setIsSubmitting(true);
        await onSubmit(reason);
        setIsSubmitting(false);
        setReason('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10"
                    >
                        <div className="px-6 pt-6 pb-4 border-b border-[var(--border-primary)]/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                                    <Flag className="w-5 h-5 opacity-80" />
                                    <h3 className="text-lg font-semibold tracking-tight">Bildir</h3>
                                </div>
                                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[var(--text-secondary)] text-xs">Lütfen bu içeriği bildirme nedeninizi açıklayın.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Nedeni buraya yazın..."
                                    className="w-full h-28 px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/30 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--text-primary)]/30 focus:ring-1 focus:ring-[var(--text-primary)]/30 transition-all resize-none text-sm"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="py-2.5 px-5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!reason.trim() || isSubmitting}
                                    className="py-2.5 px-5 rounded-lg text-sm font-medium bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gönder'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
