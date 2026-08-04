import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  ArrowLeft, 
  Crown, 
  Check, 
  ShieldCheck,
  User,
  ExternalLink,
  Maximize2,
  X
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
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const [countdownText, setCountdownText] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchContestData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch Contest by slug or id
        let contestData = null;
        const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);

        if (isUuid) {
          const { data } = await supabase.from('contests').select('*').eq('id', id).maybeSingle();
          contestData = data;
        }

        if (!contestData) {
          const { data } = await supabase.from('contests').select('*').eq('slug', id).maybeSingle();
          contestData = data;
        }

        if (!contestData) {
          setContest(null);
          setLoading(false);
          return;
        }

        setContest(contestData);
        document.title = `${contestData.title || 'Tasarım Yarışması'} — Ödüllü Tasarım Yarışması | Revizelesene`;
        let descTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (descTag) {
          descTag.content = `${contestData.short_description || contestData.title} tasarım yarışmasına katılın, tasarımlarınızı jüriye sunun ve ödüller kazanın.`;
        }

        const realContestId = contestData.id;

        // Check if user joined & fetch profile slug
        if (user) {
          const { data: entry } = await supabase
            .from('contest_entries')
            .select('id')
            .eq('contest_id', realContestId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (entry) setUserJoined(true);

          const { data: userProf } = await supabase
            .from('profiles')
            .select('slug')
            .eq('id', user.id)
            .maybeSingle();

          if (userProf?.slug) setUserSlug(userProf.slug);
        }

        // Fetch entries & winners
        const { data: entriesData } = await supabase
          .from('contest_entries')
          .select(`
            *,
            profiles:user_id(display_name, avatar_url, slug, verification_badge),
            analizler:post_id(gorsel_url, isletme)
          `)
          .eq('contest_id', realContestId)
          .order('created_at', { ascending: false });

        if (entriesData) {
          setEntries(entriesData);
          const winList = entriesData
            .filter((e) => e.is_winner)
            .sort((a, b) => (a.winner_rank || 99) - (b.winner_rank || 99));
          setWinners(winList);
        }
      } catch (err: any) {
        console.error('Yarışma verisi yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContestData();
  }, [id]);

  useEffect(() => {
    if (!contest?.end_date) return;
    const update = () => {
      const end = new Date(contest.end_date).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0 || contest.status === 'ended') {
        setIsExpired(true);
        setCountdownText('Süresi Doldu • Jüri Değerlendirmesinde');
        return;
      }

      setIsExpired(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdownText(`${days} gün kaldı`);
      } else {
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        setCountdownText(`⏱️ ${h}:${m}:${s} kaldı`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [contest?.end_date, contest?.status]);

  const handleJoinContest = async () => {
    if (!currentUser) {
      toast.error('Yarışmaya katılmak için lütfen giriş yapın.');
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
        await supabase
          .from('contests')
          .update({ participant_count: (contest.participant_count || 0) + 1 })
          .eq('id', contest.id);

        setUserJoined(true);
        setContest((prev: any) => ({ ...prev, participant_count: (prev.participant_count || 0) + 1 }));
        toast.success('🎉 Yarışmaya kaydınız alındı! Tasarımınızı Profilim sayfanızdan dilediğiniz zaman yükleyebilirsiniz.');
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
        <p className="text-sm text-[var(--text-secondary)] mt-2">Aradığınız yarışma mevcut değil veya kaldırılmış olabilir.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2.5 bg-zinc-900 text-white font-bold text-sm rounded-xl cursor-pointer"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const coverImage = (contest?.cover_images && contest?.cover_images[0]) 
    ? contest.cover_images[0] 
    : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80';

  const endDateObj = new Date(contest.end_date);
  const monthAbbr = endDateObj.toLocaleString('tr-TR', { month: 'short' }).toUpperCase();
  const dayNum = String(endDateObj.getDate()).padStart(2, '0');

  // Real participant profile avatars & name
  const participantProfiles = entries
    .map((e) => e.profiles)
    .filter(Boolean);

  const participantAvatars = participantProfiles
    .map((p) => p.avatar_url)
    .filter(Boolean)
    .slice(0, 3);

  const realParticipantCount = Math.max(contest?.participant_count || 0, entries.length);
  const topParticipantName = participantProfiles[0]?.display_name || 'Katılımcılar';
  const otherParticipantsCount = Math.max(0, realParticipantCount - 1);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>

        {/* ÜST KAPAK GÖRSELİ (BANNER - Kesilmeden Sığdırma & Net Arka Plan) */}
        <div className="w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden relative border border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-[#0c0c0e] flex items-center justify-center">
          <img src={coverImage} alt={contest.title} className="w-full h-full object-contain relative z-10 p-3 sm:p-4" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none z-10" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1 z-20">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FF5500] text-white text-xs font-extrabold shadow">
              {contest.title}
            </span>
          </div>
        </div>

        {/* SOL (Yarışma hakkında) - SAĞ (Temel Bilgiler) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SOL TARAFTAKİ METİN & KURALLAR (8 KOLON) */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
                Yarışma hakkında
              </h1>
              
              <div className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed space-y-4 whitespace-pre-line">
                <p>{contest.short_description}</p>
                <p>{contest.rules_content || 'Özel bir açıklama girilmemiştir. Özgün tasarımlarınızla katılabilirsiniz.'}</p>
              </div>

              {/* Detay & Brief Görselleri (Eğer eklenmişse) */}
              {contest.cover_images && contest.cover_images.length > 1 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    📌 Detaylı Brief & Referans Görselleri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {contest.cover_images.slice(1).map((imgUrl: string, imgIdx: number) => (
                      <button
                        key={imgIdx}
                        type="button"
                        onClick={() => setSelectedImageModal(imgUrl)}
                        className="group relative rounded-2xl overflow-hidden border border-[var(--border-primary)] bg-[#0c0c0e] block shadow-sm hover:border-[#FF5500] transition-all cursor-pointer text-left w-full"
                      >
                        <img src={imgUrl} alt={`Detay Görseli ${imgIdx + 1}`} className="w-full h-auto object-cover max-h-[350px]" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 backdrop-blur-xs">
                          <Maximize2 className="w-4 h-4 text-[#FF5500]" /> Görseli Büyüt / İncele
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Kazananlar Bölümü (Eğer sonuçlandıysa) */}
            {winners.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                <h3 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-500" />
                  Yarışma Kazananları & Dereceler
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {winners.map((win) => {
                    const winImg = win.design_url || win.analizler?.gorsel_url;
                    const profile = win.profiles;
                    const rankText = win.winner_rank === 1 ? '🥇 1. Birinci' : win.winner_rank === 2 ? '🥈 2. İkinci' : '🥉 3. Üçüncü';

                    return (
                      <div
                        key={win.id}
                        className="bg-[var(--card-bg)] border-2 border-amber-400/60 rounded-2xl overflow-hidden p-3.5 space-y-2 shadow-sm"
                      >
                        <span className="inline-block bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          {rankText}
                        </span>

                        {winImg && (
                          <div className="h-36 rounded-xl overflow-hidden bg-black/5">
                            <img src={winImg} alt="Winner design" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <img
                            src={profile?.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=user'}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full border border-amber-300"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                              {profile?.display_name || 'Tasarımcı'}
                            </span>
                            {win.jury_score && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                                Jüri: {win.jury_score} / 100
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
          </div>

          {/* SAĞ TARAFTAKİ "Temel Bilgiler" KARTI (EKRAN GÖRÜNTÜSÜYLE %100 BİREBİR HİZALAMA) */}
          <div className="lg:col-span-4 sticky top-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
              
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                Temel Bilgiler
              </h2>

              {/* Başvuru Son Tarihi Rozeti - BİREBİR TEMİZ BEYAZ KUTU & KIRMIZI AĞU */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-16 bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="text-[10px] font-extrabold text-red-500 tracking-wider uppercase">
                    {monthAbbr}
                  </span>
                  <span className="text-lg font-black text-zinc-900 dark:text-white leading-none mt-0.5">
                    {dayNum}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-0.5">
                    Başvuru Son Tarihi
                  </span>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-white block">
                    {countdownText}
                  </span>
                </div>
              </div>

              {/* Katılım Butonu (BİREBİR SİYAH SHARP BUTTON) */}
              <div className="space-y-3">
                {!isExpired ? (
                  userJoined ? (
                    <div className="space-y-3">
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Yarışmaya Katıldınız!
                      </div>
                      <button
                        onClick={() => navigate(userSlug ? `/${userSlug}` : '/profilim')}
                        className="w-full py-3.5 px-6 rounded-2xl bg-[#18181b] hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-sm transition-all cursor-pointer"
                      >
                        Profilimden Tasarım Yükle
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleJoinContest}
                      disabled={joining}
                      className="w-full py-4 px-6 rounded-2xl bg-[#18181b] hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-base transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {joining ? 'Kaydediliyor...' : 'Yarışmaya Katıl'}
                    </button>
                  )
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl text-center space-y-1">
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400 block uppercase tracking-wider">
                      🏁 Süresi Doldu
                    </span>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      Jüri değerlendirmesi devam ediyor. Kazananlar çok yakında burada açıklanacak!
                    </p>
                  </div>
                )}

              </div>

              {/* Katılımcı Avatarları ve Bilgi Yazısı (BİREBİR HİZALI PROFİL FOTOLARI) */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="flex items-center shrink-0">
                  {participantAvatars.length > 0 ? (
                    participantAvatars.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Participant"
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 object-cover shadow-xs -ml-2.5 first:ml-0"
                      />
                    ))
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {realParticipantCount > 0 ? (
                    <>
                      <strong className="font-extrabold text-zinc-900 dark:text-white">
                        {topParticipantName}
                      </strong>
                      {otherParticipantsCount > 0 && ` ve ${otherParticipantsCount} kullanıcı daha `}
                      <span className="block text-zinc-500 dark:text-zinc-400 font-normal">
                        yarışmaya katıldı
                      </span>
                    </>
                  ) : (
                    <span className="text-zinc-500 font-normal">
                      Henüz katılan olmadı. İlk katılan siz olun!
                    </span>
                  )}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* GÖRSEL BÜYÜTME (LIGHTBOX) MODAL */}
      <AnimatePresence>
        {selectedImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImageModal(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center cursor-zoom-out"
          >
            <button
              type="button"
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            >
              <img
                src={selectedImageModal}
                alt="Detay Görseli Büyütülmüş"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
