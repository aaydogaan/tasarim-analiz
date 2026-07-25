import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Crown, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Award, 
  Star,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ContestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contest, setContest] = useState<any | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userJoined, setUserJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchContestData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch Contest
        const { data: contestData, error } = await supabase
          .from('contests')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setContest(contestData);

        // Check if current user joined
        if (user) {
          const { data: entry } = await supabase
            .from('contest_entries')
            .select('id')
            .eq('contest_id', id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (entry) setUserJoined(true);
        }

        // Fetch winners & submissions
        const { data: entriesData } = await supabase
          .from('contest_entries')
          .select(`
            *,
            profiles:user_id(display_name, avatar_url, slug, verification_badge),
            analizler:post_id(gorsel_url, isletme)
          `)
          .eq('contest_id', id)
          .order('created_at', { ascending: false });

        if (entriesData) {
          setEntries(entriesData);
          const winList = entriesData
            .filter((e) => e.is_winner)
            .sort((a, b) => (a.winner_rank || 99) - (b.winner_rank || 99));
          setWinners(winList);
        }
      } catch (err: any) {
        toast.error('Yarışma bulunamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchContestData();
  }, [id]);

  const handleJoinContest = async () => {
    if (!currentUser) {
      toast.error('Yarışmaya katılmak için lütfen önce giriş yapın.');
      navigate('/auth?mode=kayit');
      return;
    }

    if (!contest) return;

    setJoining(true);
    try {
      const { error } = await supabase.from('contest_entries').insert({
        contest_id: contest.id,
        user_id: currentUser.id,
      });

      if (error) {
        if (error.code === '23505') {
          toast.success('Bu yarışmaya zaten katıldınız!');
        } else {
          throw error;
        }
      } else {
        // Update participant count
        await supabase
          .from('contests')
          .update({ participant_count: (contest.participant_count || 0) + 1 })
          .eq('id', contest.id);

        setUserJoined(true);
        setContest((prev: any) => ({ ...prev, participant_count: (prev.participant_count || 0) + 1 }));
        toast.success('🎉 Yarışmaya kaydınız alındı! Tasarımınızı Profilim sayfanızdan yükleyebilirsiniz.');
      }
    } catch (err: any) {
      toast.error(`Katılım sağlanamadı: ${err.message || 'Hata oluştu'}`);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Yarışma Bulunamadı</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2">Aradığınız yarışma mevcut değil veya silinmiş olabilir.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm rounded-xl"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const isExpired = new Date(contest.end_date).getTime() <= Date.now() || contest.status === 'ended';
  const coverImage = (contest.cover_images && contest.cover_images[0]) 
    ? contest.cover_images[0] 
    : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>

        {/* Hero Header Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-xl">
          <div className="h-64 sm:h-80 w-full relative">
            <img src={coverImage} alt={contest.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  {isExpired ? 'Tamamlanan Yarışma' : 'Canlı Tasarım Yarışması'}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {contest.title}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2">
                  {contest.short_description}
                </p>
              </div>

              {!isExpired && (
                <div>
                  {userJoined ? (
                    <div className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg">
                      <CheckCircle2 className="w-4 h-4" /> Katıldınız
                    </div>
                  ) : (
                    <button
                      onClick={handleJoinContest}
                      disabled={joining}
                      className="px-6 py-3.5 bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      {joining ? 'Kaydediliyor...' : 'Yarışmaya Katıl'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-primary)]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">Bitiş Tarihi</span>
              <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                {new Date(contest.end_date).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">Katılımcı Sayısı</span>
              <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                {contest.participant_count || 0} Tasarımcı
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">Ödül</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#FF5500] truncate block">
                {contest.reward_title}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">Değerlendirme</span>
              <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                Jüri Puanlaması (1-100)
              </span>
            </div>
          </div>
        </div>

        {/* Action Banner for Joined Users */}
        {userJoined && !isExpired && (
          <div className="p-5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF5500]" />
                Yarışmaya Katılımınız Onaylandı!
              </h4>
              <p className="text-xs text-orange-800/80 dark:text-orange-400">
                Hazırladığınız çalışmayı yarışma bitiş tarihine kadar Profilim sayfanızdaki "Yarışmalarım" bölümünden istediğiniz zaman yükleyebilirsiniz.
              </p>
            </div>
            <button
              onClick={() => navigate('/profilim')}
              className="px-4 py-2.5 bg-[#FF5500] text-white font-bold text-xs rounded-xl hover:bg-[#e64d00] transition-colors shrink-0 cursor-pointer"
            >
              Profilime Git & Tasarım Yükle
            </button>
          </div>
        )}

        {/* Winners Section (if available) */}
        {winners.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                Yarışma Kazananları & Dereceler
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {winners.map((win) => {
                const img = win.design_url || win.analizler?.gorsel_url;
                const profile = win.profiles;
                const rankText = win.winner_rank === 1 ? '🥇 1. Birinci' : win.winner_rank === 2 ? '🥈 2. İkinci' : '🥉 3. Üçüncü';

                return (
                  <div
                    key={win.id}
                    className="bg-[var(--card-bg)] border-2 border-amber-400/60 rounded-3xl overflow-hidden p-4 space-y-3 shadow-lg relative"
                  >
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow">
                      {rankText}
                    </div>

                    {img && (
                      <div className="h-48 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <img src={img} alt="Winner design" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={profile?.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=user'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border border-amber-300"
                      />
                      <div>
                        <span className="text-sm font-bold text-[var(--text-primary)] block">
                          {profile?.display_name || 'Tasarımcı'}
                        </span>
                        {win.jury_score && (
                          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 block">
                            Jüri Puanı: {win.jury_score} / 100
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Rules & Requirements */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[var(--border-primary)] pb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF5500]" />
              Yarışma Şartları & Jüri Değerlendirme Kriterleri
            </h3>
          </div>

          <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line space-y-4">
            {contest.rules_content || 'Özel bir şart belirtilmemiştir. Özgün çalışmanızla katılabilirsiniz.'}
          </div>

          {contest.reward_description && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs sm:text-sm text-amber-900 dark:text-amber-300">
              <strong className="block font-bold mb-1">🎁 Ödül Detayı:</strong>
              {contest.reward_description}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
