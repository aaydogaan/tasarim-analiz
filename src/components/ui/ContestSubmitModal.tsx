import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Plus, CheckCircle2, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ContestData } from './ContestHeroCard';

interface ContestSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: ContestData | null;
  onSuccess?: () => void;
}

export const ContestSubmitModal: React.FC<ContestSubmitModalProps> = ({
  isOpen,
  onClose,
  contest,
  onSuccess,
}) => {
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [entryNote, setEntryNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !contest) return;

    const fetchUserAndPosts = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        setCurrentUser(user);

        // Check if user already submitted
        const { data: existingEntry } = await supabase
          .from('contest_entries')
          .select('id')
          .eq('contest_id', contest.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingEntry) {
          setAlreadySubmitted(true);
        } else {
          setAlreadySubmitted(false);
        }

        // Fetch user's designs from analizler
        const { data: posts } = await supabase
          .from('analizler')
          .select('id, gorsel_url, isletme, genel_puan, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setUserPosts(posts || []);
        if (posts && posts.length > 0) {
          setSelectedPostId(posts[0].id);
        }
      } catch (err) {
        console.error('Fetch user posts error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [isOpen, contest]);

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !contest || !selectedPostId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('contest_entries').insert({
        contest_id: contest.id,
        user_id: currentUser.id,
        post_id: selectedPostId,
        entry_note: entryNote.trim(),
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Bu yarışmaya zaten katıldınız!');
        } else {
          throw error;
        }
      } else {
        // Increment participant_count
        await supabase
          .from('contests')
          .update({ participant_count: (contest.participant_count || 0) + 1 })
          .eq('id', contest.id);

        toast.success('🎉 Yarışmaya katılımınız başarıyla alındı! Bol şanslar!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(`Katılım sağlanamadı: ${err.message || 'Bir hata oluştu'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !contest) return null;

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
          className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!currentUser ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Yarışmaya Katılmak İçin Giriş Yapın
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                Yarışmaya tasarım gönderebilmek için platforma ücretsiz kaydolabilir veya giriş yapabilirsiniz.
              </p>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/auth?mode=kayit';
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Giriş Yap / Kayıt Ol
              </button>
            </div>
          ) : alreadySubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Bu Yarışmaya Zaten Katıldınız!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                Tasarımınız değerlendirmeye alınmıştır. Değerlendirme tamamlandığında ve sonuçlar açıklandığında bilgilendirileceksiniz.
              </p>
              <button
                onClick={onClose}
                className="py-3 px-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm"
              >
                Tamam
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitEntry} className="space-y-6">
              <div>
                <span className="text-xs font-extrabold text-[#FF5500] uppercase tracking-wider block mb-1">
                  Yarışma Katılım Formu
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {contest.title}
                </h3>
              </div>

              {/* Tasarım Seçimi */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Yarışmaya Katılacak Tasarımınızı Seçin:
                </label>

                {loading ? (
                  <div className="text-center py-6 text-xs text-zinc-400">
                    Tasarımlarınız yükleniyor...
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-zinc-500">
                      Henüz platforma yüklediğiniz bir tasarım bulunmuyor. Katılmak için önce tasarım analizi oluşturabilirsiniz.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.location.href = '/?upload=true';
                      }}
                      className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Yeni Tasarım Yükle
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
                    {userPosts.map((post) => {
                      const isSelected = selectedPostId === post.id;
                      return (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPostId(post.id)}
                          className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-square group ${
                            isSelected
                              ? 'border-[#FF5500] ring-2 ring-[#FF5500]/30 shadow-md'
                              : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={post.gorsel_url}
                            alt={post.isletme || 'Design'}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#FF5500] text-white p-1 rounded-full shadow-md">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1.5 text-center text-[10px] text-white font-medium truncate">
                            {post.isletme || 'Tasarım Çalışması'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ek Not */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Jüriye / Topluluğa Notunuz (Opsiyonel):
                </label>
                <textarea
                  rows={2}
                  placeholder="Tasarımınızın hikayesinden veya konseptinden kısaca bahsedin..."
                  value={entryNote}
                  onChange={(e) => setEntryNote(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !selectedPostId}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#FF5500] hover:bg-[#e64d00] disabled:bg-zinc-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    'Gönderiliyor...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Yarışmaya Katıl
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3.5 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm"
                >
                  Vazgeç
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
