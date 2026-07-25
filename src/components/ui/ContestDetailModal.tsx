import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Calendar, Users, Trophy, ShieldCheck, Sparkles } from 'lucide-react';
import { ContestData } from './ContestHeroCard';

interface ContestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: ContestData | null;
  onOpenSubmit: (contest: ContestData) => void;
}

export const ContestDetailModal: React.FC<ContestDetailModalProps> = ({
  isOpen,
  onClose,
  contest,
  onOpenSubmit,
}) => {
  if (!isOpen || !contest) return null;

  const isExpired = new Date(contest.end_date).getTime() <= new Date().getTime() || contest.status === 'ended';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-bold mb-3">
                <Trophy className="w-3.5 h-3.5" />
                Yarışma Detayları & Şartları
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {contest.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {contest.short_description}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Bitiş Tarihi
                </div>
                <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {new Date(contest.end_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Users className="w-3.5 h-3.5" /> Katılımcılar
                </div>
                <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {contest.participant_count || 0} Katılımcı
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Crown className="w-3.5 h-3.5" /> Ödül
                </div>
                <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                  {contest.reward_title}
                </div>
              </div>
            </div>

            {/* Rules Content */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Katılım Şartları & Kurallar
              </h4>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                {contest.rules_content || 'Özel bir şart belirtilmemiştir. Özgün tasarımlarınızla katılabilirsiniz.'}
              </div>
            </div>

            {/* Reward Description */}
            {contest.reward_description && (
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
                  <strong className="block font-bold mb-0.5">Ödül Hakkında:</strong>
                  {contest.reward_description}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              {!isExpired ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubmit(contest);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Şimdi Katıl
                </button>
              ) : (
                <div className="w-full text-center py-2 text-xs font-bold text-zinc-400">
                  Bu yarışmanın süresi tamamlanmıştır.
                </div>
              )}

              <button
                onClick={onClose}
                className="py-3.5 px-6 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-sm transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
