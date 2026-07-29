import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, MessageSquare, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function SurveyWidget({ kullanici, onAuthClick }: { kullanici: any, onAuthClick: () => void }) {
    const [surveys, setSurveys] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [ratingHover, setRatingHover] = useState(0);
    const [rating, setRating] = useState(0);
    const [textAnswer, setTextAnswer] = useState('');
    const [selectedChoice, setSelectedChoice] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchActiveSurveys();
    }, [kullanici]);

    const fetchActiveSurveys = async () => {
        setLoading(true);
        try {
            const { data: activeSurveys, error: surveyError } = await supabase
                .from('surveys')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (surveyError) {
                // If the table doesn't exist yet, we just ignore
                if (surveyError.code === '42P01') return;
                throw surveyError;
            }

            if (!activeSurveys || activeSurveys.length === 0) {
                setSurveys([]);
                setLoading(false);
                return;
            }

            let unanswered = activeSurveys;

            if (kullanici) {
                const { data: responses, error: responseError } = await supabase
                    .from('survey_responses')
                    .select('survey_id')
                    .eq('user_id', kullanici.id);
                
                if (!responseError && responses) {
                    const answeredIds = new Set(responses.map(r => r.survey_id));
                    unanswered = activeSurveys.filter(s => !answeredIds.has(s.id));
                }
            } else {
                const dismissed = JSON.parse(localStorage.getItem('dismissedSurveys') || '[]');
                unanswered = activeSurveys.filter(s => !dismissed.includes(s.id));
            }

            setSurveys(unanswered);
            
            if (unanswered.length > 0) {
                setTimeout(() => setIsOpen(true), 3000);
            }
        } catch (error) {
            console.error("Anket yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        if (!surveys[currentIndex]) return;
        setIsOpen(false);
        
        if (!kullanici) {
            const dismissed = JSON.parse(localStorage.getItem('dismissedSurveys') || '[]');
            dismissed.push(surveys[currentIndex].id);
            localStorage.setItem('dismissedSurveys', JSON.stringify(dismissed));
        }
    };

    const handleSubmit = async () => {
        if (!kullanici) {
            toast.error("Oy kullanmak için giriş yapmalısınız!");
            onAuthClick();
            return;
        }

        const survey = surveys[currentIndex];
        let answer = '';
        
        if (survey.type === 'rating') {
            if (rating === 0) return toast.error("Lütfen bir puan seçin.");
            answer = rating.toString();
        } else if (survey.type === 'text') {
            if (!textAnswer.trim()) return toast.error("Lütfen bir cevap yazın.");
            answer = textAnswer.trim();
        } else if (survey.type === 'choice') {
            if (!selectedChoice) return toast.error("Lütfen bir seçenek işaretleyin.");
            answer = selectedChoice;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('survey_responses')
                .insert({
                    survey_id: survey.id,
                    user_id: kullanici.id,
                    answer: answer
                });

            if (error) {
                if (error.code === '23505') { 
                    toast.error("Bu ankete zaten katıldınız.");
                } else {
                    throw error;
                }
            } else {
                setSuccessMessage("Değerlendirmeniz için teşekkürler!");
                setTimeout(() => {
                    setSuccessMessage('');
                    if (currentIndex < surveys.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                        setRating(0);
                        setTextAnswer('');
                        setSelectedChoice('');
                    } else {
                        setIsOpen(false);
                        setSurveys([]);
                    }
                }, 2000);
            }
        } catch (error: any) {
            toast.error("Bir hata oluştu: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || surveys.length === 0 || !isOpen) return null;

    const currentSurvey = surveys[currentIndex];

    if (isMinimized) {
        return (
            <motion.button
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] bg-[var(--color-brand-orange)] text-white p-3 md:px-4 md:py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-[#e64500] transition-colors"
            >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden md:inline font-semibold text-sm">Geri Bildirim</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            {isOpen && !isMinimized && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] w-[calc(100vw-32px)] md:w-[380px] bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-2xl rounded-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-[var(--bg-secondary)] px-4 py-3 border-b border-[var(--border-primary)] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[var(--color-brand-orange)]" />
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">
                                {currentSurvey.title || "Geri Bildiriminiz Önemli"}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsMinimized(true)}
                                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-[var(--text-secondary)] transition-colors"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={handleDismiss}
                                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-[var(--text-secondary)] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        {successMessage ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-6 text-center gap-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <p className="font-bold text-[var(--text-primary)]">{successMessage}</p>
                            </motion.div>
                        ) : (
                            <>
                                <p className="text-[15px] font-medium text-[var(--text-primary)] mb-5 leading-relaxed">
                                    {currentSurvey.question}
                                </p>

                                {/* Rating Type */}
                                {currentSurvey.type === 'rating' && (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex gap-1 sm:gap-1.5 w-full justify-between">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setRating(num)}
                                                    onMouseEnter={() => setRatingHover(num)}
                                                    onMouseLeave={() => setRatingHover(0)}
                                                    className={`w-7 h-8 sm:w-8 sm:h-9 rounded-md flex items-center justify-center font-bold text-[13px] sm:text-sm transition-all ${
                                                        (ratingHover || rating) >= num 
                                                            ? 'bg-[var(--color-brand-orange)] text-white scale-110 shadow-md' 
                                                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--color-brand-orange)]/20'
                                                    }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-between w-full text-[10px] text-[var(--text-secondary)] font-medium px-1 mt-1">
                                            <span>Hiç Beğenmedim</span>
                                            <span>Çok Beğendim</span>
                                        </div>
                                    </div>
                                )}

                                {/* Choice Type */}
                                {currentSurvey.type === 'choice' && currentSurvey.options && (
                                    <div className="flex flex-col gap-2">
                                        {Array.isArray(currentSurvey.options) && currentSurvey.options.map((opt: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedChoice(opt)}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all ${
                                                    selectedChoice === opt 
                                                        ? 'border-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/10 font-bold text-[var(--color-brand-orange)]' 
                                                        : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--color-brand-orange)]/50 text-[var(--text-primary)]'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Text Type */}
                                {currentSurvey.type === 'text' && (
                                    <textarea
                                        value={textAnswer}
                                        onChange={(e) => setTextAnswer(e.target.value)}
                                        placeholder="Cevabınızı buraya yazın..."
                                        className="w-full h-24 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--color-brand-orange)] resize-none"
                                    />
                                )}

                                {!kullanici && (
                                    <p className="text-[11px] text-[var(--text-secondary)] text-center mt-4">
                                        Oy kullanmak için giriş yapmalısınız.
                                    </p>
                                )}

                                <div className="mt-5 flex gap-2">
                                    {surveys.length > 1 && (
                                        <div className="flex-1 flex items-center justify-center text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-xl px-3 max-w-[60px]">
                                            {currentIndex + 1} / {surveys.length}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || (currentSurvey.type === 'rating' && rating === 0) || (currentSurvey.type === 'choice' && !selectedChoice) || (currentSurvey.type === 'text' && !textAnswer.trim())}
                                        className={`flex-1 flex items-center justify-center gap-2 bg-[var(--color-brand-orange)] text-white px-5 py-2.5 rounded-xl font-bold transition-opacity ${(currentSurvey.type === 'rating' && rating === 0) || (currentSurvey.type === 'choice' && !selectedChoice) || (currentSurvey.type === 'text' && !textAnswer.trim()) || submitting ? 'opacity-50' : 'hover:opacity-90'}`}
                                    >
                                        {submitting ? 'Gönderiliyor...' : 'Gönder'}
                                        {!submitting && <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
