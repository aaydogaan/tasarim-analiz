import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Crown, Sparkles, Check, Mail, Users, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export interface ContestData {
  id: string;
  title: string;
  short_description: string;
  rules_content: string;
  reward_title: string;
  reward_description?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'ended' | 'draft';
  cover_images: string[];
  participant_count: number;
  slug?: string;
}

interface ContestHeroCardProps {
  contest: ContestData;
  onOpenDetail: (contest: ContestData) => void;
  onOpenSubmit: (contest: ContestData) => void;
}

export const ContestHeroCard: React.FC<ContestHeroCardProps> = ({
  contest,
  onOpenDetail,
  onOpenSubmit,
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{ text: string; isExpired: boolean }>({ text: '', isExpired: false });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [winnerEntry, setWinnerEntry] = useState<any | null>(null);

  useEffect(() => {
    const fetchWinner = async () => {
      if (!contest.id) return;
      const { data } = await supabase
        .from('contest_entries')
        .select('*, profiles:user_id(display_name, avatar_url)')
        .eq('contest_id', contest.id)
        .eq('is_winner', true)
        .eq('winner_rank', 1)
        .maybeSingle();

      if (data) setWinnerEntry(data);
    };
    fetchWinner();
  }, [contest.id]);

  useEffect(() => {
    const updateCountdown = () => {
      const end = new Date(contest.end_date).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0 || contest.status === 'ended') {
        setTimeLeft({ text: '🏁 Süresi Doldu • Yakında Açıklanıyor!', isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft({ text: `${days} gün kaldı`, isExpired: false });
      } else {
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        setTimeLeft({ text: `⏱️ ${h}:${m}:${s} kaldı`, isExpired: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [contest.end_date, contest.status]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterLoading(true);
    try {
      const { error } = await supabase.from('contest_subscribers').insert({
        email: newsletterEmail.trim(),
      });

      if (error) {
        if (error.code === '23505') {
          toast.success('Zaten bültene kayıtlısınız!');
        } else {
          throw error;
        }
      } else {
        toast.success('Bültene başarıyla kaydoldunuz!');
      }
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (err: any) {
      toast.error('Kayıt yapılırken bir hata oluştu.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const coverImage = (contest.cover_images && contest.cover_images[0]) 
    ? contest.cover_images[0]
    : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-zinc-200/30 dark:shadow-none my-8 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sol Taraf: İçerik ve Butonlar */}
        <div className="lg:col-span-6 flex flex-col items-start justify-center space-y-5">
          
          {/* Rozetler */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className={`w-2 h-2 rounded-full ${timeLeft.isExpired ? 'bg-zinc-400' : 'bg-red-500 animate-pulse'}`} />
              {timeLeft.text}
            </div>

            {contest.participant_count > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                {contest.participant_count} Katılımcı
              </div>
            )}
          </div>

          {/* Başlık & Açıklama */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
              {contest.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {contest.short_description}
            </p>
          </div>

          {/* Minimal Ödül Kutusu */}
          <div className="w-full bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white shrink-0">
              <Crown className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 block">
                Yarışma Ödülü
              </span>
              <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate block">
                {contest.reward_title || 'Ana Sayfa Öne Çıkanlar'}
              </span>
            </div>
          </div>

          {/* Butonlar */}
          {!timeLeft.isExpired ? (
            <div className="w-full space-y-3 pt-1">
              <button
                onClick={() => navigate(`/yarisma/${contest.slug || contest.id}`)}
                className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm sm:text-base transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FF5500]" />
                Yarışmaya Katıl
              </button>

              <button
                onClick={() => navigate(`/yarisma/${contest.slug || contest.id}`)}
                className="w-full py-3.5 px-6 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Daha fazla bilgi al
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3 pt-1">
              {winnerEntry ? (
                <div className="p-4 sm:p-5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/90 dark:border-zinc-700/80 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4.5 h-4.5 text-[#FF5500] shrink-0" />
                      <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white">
                        1.lik Derecesi Sahibini Buldu
                      </span>
                    </div>

                    {winnerEntry.jury_score && (
                      <span className="px-3 py-1 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] dark:text-white dark:bg-[#FF5500] text-xs sm:text-sm font-black tracking-tight shrink-0">
                        {winnerEntry.jury_score} / 100 Puan
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                    <img
                      src={winnerEntry.profiles?.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=user'}
                      alt="Winner"
                      className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-600 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-white block truncate">
                        {winnerEntry.profiles?.display_name || 'Kazanan Tasarımcı'}
                      </span>
                      <span className="text-xs text-[#FF5500] font-bold block">
                        1. Birincilik Ödülü Sahibi
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    🏁 Bu yarışmanın süresi dolmuştur. Jüri değerlendirmesi devam ediyor. Kazananlar yakında ilan edilecektir.
                  </p>
                </div>
              )}

              {newsletterSuccess ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Bültenimize kaydolduğunuz için teşekkürler!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="E-posta adresiniz..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-zinc-400 text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400"
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Kayıt Ol
                  </button>
                </form>
              )}

              <button
                onClick={() => onOpenDetail(contest)}
                className="w-full py-3 px-6 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Geçmiş Yarışma Detayları & Kurallar
              </button>
            </div>
          )}

        </div>

        {/* Sağ Taraf: Tekli Statik Yatay Görsel (HİÇBİR HOVER SCALE VEYA TİTREŞİM EFEKTİ YOKTUR) */}
        <div className="lg:col-span-6 h-[260px] sm:h-[340px] w-full relative rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-zinc-100 dark:bg-zinc-800">
          <img 
            src={coverImage} 
            alt={contest.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 dark:border-zinc-700/50 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                Tasarım Yarışması
              </span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Revizelesene
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
