import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, Send, Check, Mail, Clock, Trophy, Users } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState<{ text: string; isExpired: boolean }>({ text: '', isExpired: false });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const end = new Date(contest.end_date).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0 || contest.status === 'ended') {
        setTimeLeft({ text: 'Süresi Doldu', isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft({ text: `${days} gün kaldı`, isExpired: false });
      } else if (hours > 0) {
        setTimeLeft({ text: `${hours} saat ${minutes} dk kaldı`, isExpired: false });
      } else {
        setTimeLeft({ text: `${minutes} dk kaldı`, isExpired: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
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
          toast.success('Zaten bültene kayıtlısınız! Teşekkürler.');
        } else {
          throw error;
        }
      } else {
        toast.success('Bültene başarıyla kaydoldunuz! Yeni yarışmalarda size haber vereceğiz.');
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
      transition={{ duration: 0.5 }}
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-orange-500/5 dark:shadow-none overflow-hidden my-8 relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sol Taraf: Bilgiler & Kurumsal Turuncu Akış */}
        <div className="lg:col-span-6 flex flex-col items-start justify-center space-y-5">
          
          {/* Süre Rozeti & Katılımcı Sayısı */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-xs font-bold text-[#FF5500]">
              <span className={`w-2 h-2 rounded-full ${timeLeft.isExpired ? 'bg-zinc-400' : 'bg-[#FF5500] animate-ping'}`} />
              {timeLeft.text}
            </div>

            {contest.participant_count > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                <Users className="w-3.5 h-3.5 text-[#FF5500]" />
                {contest.participant_count} Tasarımcı Katıldı
              </div>
            )}
          </div>

          {/* Başlık & Açıklama */}
          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
              {contest.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              {contest.short_description}
            </p>
          </div>

          {/* Kurumsal Turuncu Ödül Kutusu */}
          <div className="w-full bg-[#FF5500]/5 dark:bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/20 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#FF5500] uppercase tracking-wider block">
                Ödül
              </span>
              <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white truncate block">
                {contest.reward_title || 'Ana Sayfa Öne Çıkanlar'}
              </span>
            </div>
          </div>

          {/* Aksiyon Butonları (Turuncu Kurumsal Tema) */}
          {!timeLeft.isExpired ? (
            <div className="w-full space-y-3 pt-2">
              <button
                onClick={() => onOpenSubmit(contest)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-[#FF5500]/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4.5 h-4.5" />
                Yarışmaya Katıl
              </button>

              <button
                onClick={() => onOpenDetail(contest)}
                className="w-full py-3.5 px-6 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Daha fazla bilgi al
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3 pt-2">
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl">
                <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-300">
                  🏁 Bu yarışmanın süresi bitti. Gelecek yarışmaları kaçırmamak için e-posta bültenine kaydolabilirsiniz!
                </p>
              </div>

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
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#FF5500]"
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="px-4 py-2.5 bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Kayıt Ol
                  </button>
                </form>
              )}

              <button
                onClick={() => onOpenDetail(contest)}
                className="w-full py-3 px-6 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Geçmiş Yarışma Detayları & Kurallar
              </button>
            </div>
          )}

        </div>

        {/* Sağ Taraf: Tekli Şık Yatay Görsel Kartı */}
        <div className="lg:col-span-6 h-[260px] sm:h-[340px] w-full relative rounded-3xl overflow-hidden group border border-zinc-200/80 dark:border-zinc-800 shadow-md">
          <img 
            src={coverImage} 
            alt={contest.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          
          {/* Görsel Üzerindeki Turuncu Şerit */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FF5500] text-white flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                Revizelesene Özel Challenge
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-[#FF5500] bg-[#FF5500]/10 px-2.5 py-1 rounded-full">
              CANLI YARIŞMA
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
