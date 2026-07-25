import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Users, 
  Crown, 
  Mail, 
  Download, 
  UploadCloud,
  X, 
  ExternalLink,
  Star,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

// Helper to compress and convert uploaded image to a clean Data URL (works 100% reliably without storage permissions errors)
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export default function Contests() {
  const [activeTab, setActiveTab] = useState<'contests' | 'entries' | 'subscribers'>('contests');
  const [contests, setContests] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Contest Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<any | null>(null);

  // Selected contest filter
  const [selectedContestId, setSelectedContestId] = useState<string>('all');

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formRules, setFormRules] = useState('');
  const [formRewardTitle, setFormRewardTitle] = useState('Ana Sayfa Öne Çıkanlar');
  const [formRewardDesc, setFormRewardDesc] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'ended' | 'draft'>('active');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Jury Score state per entry
  const [juryScores, setJuryScores] = useState<Record<string, number>>({});

  const fetchContests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContests(data || []);
    } catch (err: any) {
      toast.error('Yarışmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      let query = supabase
        .from('contest_entries')
        .select(`
          *,
          contests:contest_id(title),
          profiles:user_id(display_name, avatar_url, slug, verification_badge),
          analizler:post_id(gorsel_url, isletme, genel_puan)
        `)
        .order('created_at', { ascending: false });

      if (selectedContestId !== 'all') {
        query = query.eq('contest_id', selectedContestId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEntries(data || []);

      const scoresMap: Record<string, number> = {};
      data?.forEach((item) => {
        if (item.jury_score !== null && item.jury_score !== undefined) {
          scoresMap[item.id] = item.jury_score;
        }
      });
      setJuryScores(scoresMap);
    } catch (err: any) {
      toast.error('Katılımcı gönderileri yüklenemedi');
    }
  };

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('contest_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err: any) {
      toast.error('Bülten aboneleri yüklenemedi');
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (activeTab === 'entries') fetchEntries();
    if (activeTab === 'subscribers') fetchSubscribers();
  }, [activeTab, selectedContestId]);

  const openNewModal = () => {
    setEditingContest(null);
    setFormTitle('');
    setFormShortDesc('');
    setFormRules('');
    setFormRewardTitle('Ana Sayfa Öne Çıkanlar');
    setFormRewardDesc('');
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setFormEndDate(nextWeek);
    setFormStatus('active');
    setCoverImageUrl('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (contest: any) => {
    setEditingContest(contest);
    setFormTitle(contest.title || '');
    setFormShortDesc(contest.short_description || '');
    setFormRules(contest.rules_content || '');
    setFormRewardTitle(contest.reward_title || 'Ana Sayfa Öne Çıkanlar');
    setFormRewardDesc(contest.reward_description || '');
    setFormEndDate(new Date(contest.end_date).toISOString().slice(0, 16));
    setFormStatus(contest.status || 'active');
    setCoverImageUrl((contest.cover_images && contest.cover_images[0]) || '');
    setIsModalOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setUploadingImage(true);
    try {
      // 1. Try Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `contest_cover_${Date.now()}.${fileExt}`;
      const filePath = `contests/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('analiz-gorselleri')
        .upload(filePath, file, { upsert: true });

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage
          .from('analiz-gorselleri')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          setCoverImageUrl(publicUrlData.publicUrl);
          toast.success('Kapak görseli yüklendi!');
          setUploadingImage(false);
          return;
        }
      }

      // 2. Fallback to optimized base64
      const compressedDataUrl = await compressImageFile(file);
      if (compressedDataUrl) {
        setCoverImageUrl(compressedDataUrl);
        toast.success('Kapak görseli yüklendi!');
      } else {
        throw new Error('Görsel okunamadı.');
      }
    } catch (err: any) {
      // Final fallback to base64
      const compressedDataUrl = await compressImageFile(file);
      if (compressedDataUrl) {
        setCoverImageUrl(compressedDataUrl);
        toast.success('Kapak görseli yüklendi!');
      } else {
        toast.error('Görsel yüklenirken bir hata oluştu.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formEndDate) {
      toast.error('Lütfen başlık ve bitiş tarihini doldurun.');
      return;
    }

    setSaving(true);
    try {
      const coverArray = coverImageUrl ? [coverImageUrl] : [];

      const payload = {
        title: formTitle.trim(),
        short_description: formShortDesc.trim(),
        rules_content: formRules.trim(),
        reward_title: formRewardTitle.trim(),
        reward_description: formRewardDesc.trim(),
        end_date: new Date(formEndDate).toISOString(),
        status: formStatus,
        cover_images: coverArray,
        updated_at: new Date().toISOString(),
      };

      if (editingContest) {
        const { error } = await supabase
          .from('contests')
          .update(payload)
          .eq('id', editingContest.id);
        if (error) throw error;
        toast.success('Yarışma başarıyla güncellendi.');
      } else {
        const { error } = await supabase.from('contests').insert({
          ...payload,
          start_date: new Date().toISOString(),
          participant_count: 0,
        });
        if (error) throw error;
        toast.success('Yeni yarışma başarıyla oluşturuldu!');
      }

      setIsModalOpen(false);
      fetchContests();
    } catch (err: any) {
      toast.error(`Hata: ${err.message || 'Kaydedilemedi'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContest = async (id: string) => {
    if (!window.confirm('Bu yarışmayı silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase.from('contests').delete().eq('id', id);
      if (error) throw error;
      toast.success('Yarışma silindi.');
      fetchContests();
    } catch (err: any) {
      toast.error('Silme hatası.');
    }
  };

  const handleUpdateJuryScore = async (entryId: string, score: number) => {
    try {
      const { error } = await supabase
        .from('contest_entries')
        .update({ jury_score: score })
        .eq('id', entryId);

      if (error) throw error;
      toast.success(`Jüri puanı (${score}) kaydedildi.`);
      fetchEntries();
    } catch (err: any) {
      toast.error('Puan kaydedilemedi.');
    }
  };

  const handleSetWinner = async (entryId: string, rank: number | null) => {
    try {
      const { error } = await supabase
        .from('contest_entries')
        .update({
          is_winner: rank !== null,
          winner_rank: rank,
        })
        .eq('id', entryId);

      if (error) throw error;
      toast.success(rank ? `Derece atandı (${rank}.lik)` : 'Derece kaldırıldı');
      fetchEntries();
    } catch (err: any) {
      toast.error('Derece güncellenemedi');
    }
  };

  const exportSubscribersCSV = () => {
    if (subscribers.length === 0) return;
    const csvContent = 'data:text/csv;charset=utf-8,E-posta,Kayıt Tarihi\n' +
      subscribers.map((s) => `"${s.email}","${new Date(s.created_at).toLocaleString('tr-TR')}"`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bulten-aboneleri-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Upper Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-primary)] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FF5500]" />
            Tasarım Yarışmaları Yönetimi
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Yarışmaları düzenleyin, PC'den görsel yükleyin, katılan tasarımları değerlendirip jüri puanı (1-100) verin.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="bg-[#FF5500] hover:bg-[#e64d00] text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yeni Yarışma Ekle
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-primary)] pb-3">
        <button
          onClick={() => setActiveTab('contests')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'contests'
              ? 'bg-[#FF5500]/10 text-[#FF5500]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Yarışmalar ({contests.length})
        </button>

        <button
          onClick={() => setActiveTab('entries')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'entries'
              ? 'bg-[#FF5500]/10 text-[#FF5500]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Katılımcı Gönderileri ({entries.length})
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'subscribers'
              ? 'bg-[#FF5500]/10 text-[#FF5500]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Bülten Aboneleri ({subscribers.length})
        </button>
      </div>

      {/* Tab 1: Contests List */}
      {activeTab === 'contests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contests.map((c) => {
            const isEnded = new Date(c.end_date).getTime() <= Date.now() || c.status === 'ended';
            const img = (c.cover_images && c.cover_images[0]) || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';

            return (
              <div
                key={c.id}
                className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-5 space-y-4 shadow-sm"
              >
                <div className="h-40 rounded-xl overflow-hidden relative border border-[var(--border-primary)]">
                  <img src={img} alt={c.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold shadow ${
                        isEnded ? 'bg-zinc-800 text-white' : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {isEnded ? 'Süresi Doldu' : 'Yayında (Aktif)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{c.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">
                      {c.short_description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg hover:bg-[var(--bg-secondary)]"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContest(c.id)}
                      className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-500/10"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Ödül:</span>
                    <strong className="text-[var(--text-primary)]">{c.reward_title}</strong>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Bitiş Tarihi:</span>
                    <strong className="text-[var(--text-primary)]">
                      {new Date(c.end_date).toLocaleString('tr-TR')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Katılımcı Sayısı:</span>
                    <strong className="text-[#FF5500]">{c.participant_count || 0} Tasarımcı</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedContestId(c.id);
                    setActiveTab('entries');
                  }}
                  className="w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  Gönderilen Tasarımları & Jüri Puanlarını İncele
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Entries List, Jury Scoring & Winner Selection */}
      {activeTab === 'entries' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Yarışma Filtresi:</label>
            <select
              value={selectedContestId}
              onChange={(e) => setSelectedContestId(e.target.value)}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs font-bold rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">Tüm Yarışmalar</option>
              {contests.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {entries.map((item) => {
              const designer = item.profiles;
              const designImg = item.design_url || item.analizler?.gorsel_url;

              return (
                <div
                  key={item.id}
                  className={`bg-[var(--card-bg)] border rounded-2xl overflow-hidden p-4 space-y-3 relative ${
                    item.is_winner ? 'border-[#FF5500] ring-2 ring-[#FF5500]/20' : 'border-[var(--border-primary)]'
                  }`}
                >
                  {item.is_winner && (
                    <div className="absolute top-3 right-3 bg-[#FF5500] text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md z-10">
                      <Crown className="w-3 h-3" />
                      {item.winner_rank ? `${item.winner_rank}. Derece` : 'Kazanan'}
                    </div>
                  )}

                  {designImg ? (
                    <div className="h-44 rounded-xl overflow-hidden relative group bg-black/5">
                      <img src={designImg} alt="Submission" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                          href={designImg}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-white rounded-full text-zinc-900 shadow"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center text-xs text-[var(--text-secondary)]">
                      <UploadCloud className="w-8 h-8 mb-1 opacity-40" />
                      Tasarım Henüz Yüklenmedi
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <img
                      src={designer?.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=user'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-[var(--border-primary)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {designer?.display_name || 'Tasarımcı'}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        {item.contests?.title}
                      </p>
                    </div>
                  </div>

                  {item.entry_note && (
                    <p className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-2.5 rounded-xl italic">
                      "{item.entry_note}"
                    </p>
                  )}

                  {/* Jury Score Input */}
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[var(--text-secondary)] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Jüri Puanı:
                      </span>
                      <span className="text-[#FF5500]">
                        {juryScores[item.id] !== undefined ? `${juryScores[item.id]} / 100` : 'Puan Verilmedi'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1-100"
                        value={juryScores[item.id] !== undefined ? juryScores[item.id] : ''}
                        onChange={(e) => setJuryScores({ ...juryScores, [item.id]: Number(e.target.value) })}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs font-bold rounded-lg px-2 py-1 outline-none"
                      />
                      <button
                        onClick={() => handleUpdateJuryScore(item.id, juryScores[item.id])}
                        className="px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer shrink-0"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>

                  {/* Derece Atama Butonları */}
                  <div className="pt-1 flex gap-1">
                    <button
                      onClick={() => handleSetWinner(item.id, 1)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                        item.winner_rank === 1
                          ? 'bg-[#FF5500] text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      🥇 1. Seç
                    </button>

                    <button
                      onClick={() => handleSetWinner(item.id, 2)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                        item.winner_rank === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      🥈 2. Seç
                    </button>

                    <button
                      onClick={() => handleSetWinner(item.id, 3)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                        item.winner_rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      🥉 3. Seç
                    </button>

                    {item.is_winner && (
                      <button
                        onClick={() => handleSetWinner(item.id, null)}
                        className="p-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg"
                        title="Dereceyi Kaldır"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Newsletter Subscribers */}
      {activeTab === 'subscribers' && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Yarışma Bülteni E-posta Listesi
            </h3>

            <button
              onClick={exportSubscribersCSV}
              disabled={subscribers.length === 0}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              CSV İndir
            </button>
          </div>

          <div className="divide-y divide-[var(--border-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden">
            {subscribers.map((sub) => (
              <div key={sub.id} className="p-3.5 flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)]">{sub.email}</span>
                <span className="text-[var(--text-secondary)]">
                  {new Date(sub.created_at).toLocaleString('tr-TR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Contests — STANDART TEMİZ AÇIK TEMA (LIGHT MODE) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-xl bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF5500] block mb-1">
                  Revizelesene Admin
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {editingContest ? 'Yarışmayı Düzenle' : 'Yeni Yarışma Oluştur'}
                </h3>
              </div>

              <form onSubmit={handleSaveContest} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Yarışma Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: Videoda Yaz Esintileri"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none text-slate-900 focus:border-[#FF5500] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kısa Açıklama *
                  </label>
                  <input
                    type="text"
                    required
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    placeholder="Örn: Bazı videolar yaz mevsimini anımsatıyor..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none text-slate-900 focus:border-[#FF5500] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Ödül Başlığı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formRewardTitle}
                      onChange={(e) => setFormRewardTitle(e.target.value)}
                      placeholder="Örn: Ana Sayfa Öne Çıkanlar"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none text-slate-900 focus:border-[#FF5500] focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Bitiş Tarihi & Saati *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none text-slate-900 focus:border-[#FF5500] focus:bg-white transition-all font-medium cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Katılım Şartları & Detaylı Kurallar Metni
                  </label>
                  <textarea
                    rows={4}
                    value={formRules}
                    onChange={(e) => setFormRules(e.target.value)}
                    placeholder="Yarışma kurallarını, detaylarını ve ilham fikirlerini yazın..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none text-slate-900 focus:border-[#FF5500] focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* PC File Upload for Cover Image */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kapak Görseli (Bilgisayarınızdan Yükleyin) *
                  </label>
                  
                  <div className="flex items-center gap-3">
                    {coverImageUrl && (
                      <img
                        src={coverImageUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    )}

                    <label className="flex-1 border border-dashed border-slate-300 hover:border-[#FF5500] bg-slate-50 p-3.5 rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#FF5500]" /> Görsel Yükleniyor...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-[#FF5500]" /> Bilgisayardan Görsel Seç & Yükle
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Yarışma Durumu (Açılır Menü)
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none text-slate-900 font-bold focus:border-[#FF5500] cursor-pointer"
                  >
                    <option value="active">Yayında (Aktif)</option>
                    <option value="ended">Süresi Doldu (Tamamlandı)</option>
                    <option value="draft">Taslak (Gizli)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3.5 bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet ve Yayınla'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-3.5 px-5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
