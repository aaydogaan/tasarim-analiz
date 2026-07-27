import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Flame, Plus, Trash2, Edit3, Image as ImageIcon, Send, Sparkles, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { sendRevizelesAnnouncementEmail } from '../../lib/resend';

export default function AdminRevizeles() {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Siyaset & Kurumsal');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState<'active' | 'archived'>('active');
    const [sendEmailNotify, setSendEmailNotify] = useState(true);

    const [uploadingImage, setUploadingImage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [tableMissing, setTableMissing] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('revizeles_topics')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                if (error.message?.includes('revizeles_topics') || error.code === '42P01' || error.message?.includes('schema cache')) {
                    setTableMissing(true);
                } else {
                    console.error('Revizeles topics fetch error:', error);
                }
            } else {
                setTableMissing(false);
                setTopics(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const s3Client = new S3Client({
                region: 'auto',
                endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
                    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
                },
            });

            const fileName = `revizeles/topic_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const fileBuffer = await file.arrayBuffer();

            await s3Client.send(new PutObjectCommand({
                Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
                Key: fileName,
                Body: new Uint8Array(fileBuffer),
                ContentType: file.type,
            }));

            const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL.replace(/\/$/, "");
            const finalUrl = `${r2PublicUrl}/${fileName}`;
            setImageUrl(finalUrl);
            toast.success('Görsel yüklendi!');
        } catch (err: any) {
            toast.error('Görsel yüklenemedi: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !imageUrl) {
            toast.error('Lütfen başlık, açıklama ve görsel alanlarını doldurun.');
            return;
        }

        setSubmitting(true);
        try {
            const session = await supabase.auth.getSession();
            const adminUser = session.data.session?.user;

            let createdTopicId = editingTopicId;

            if (editingTopicId) {
                // Update
                const { error } = await supabase
                    .from('revizeles_topics')
                    .update({
                        title: title.trim(),
                        category,
                        description: description.trim(),
                        image_url: imageUrl,
                        status
                    })
                    .eq('id', editingTopicId);

                if (error) throw error;
                toast.success('Gündem konusu güncellendi');
            } else {
                // Insert
                const { data: newTopic, error } = await supabase
                    .from('revizeles_topics')
                    .insert({
                        title: title.trim(),
                        category,
                        description: description.trim(),
                        image_url: imageUrl,
                        status: 'active',
                        created_by: adminUser?.id
                    })
                    .select()
                    .single();

                if (error) throw error;
                createdTopicId = newTopic.id;
                toast.success('Yeni Gündem Konusu (Revizeleş!) Yayına Alındı 🔥');

                // Send email & in-app notifications if requested
                if (sendEmailNotify) {
                    const { data: profiles } = await supabase.from('profiles').select('id, email').not('email', 'is', null);
                    if (profiles && profiles.length > 0) {
                        const emails = profiles.map(p => p.email).filter(Boolean);

                        sendRevizelesAnnouncementEmail({
                            to: emails,
                            title: title.trim(),
                            description: description.trim(),
                            imageUrl,
                            topicId: createdTopicId || ''
                        }).catch(err => console.error('Email notify error:', err));

                        const notifs = profiles.map(p => ({
                            user_id: p.id,
                            title: `🔥 Yeni Revizeleş Gündemi: "${title.trim()}"`,
                            message: `Gündemdeki yeni logo/tasarım hakkında sen ne düşünüyorsun? Eleştirini yaz veya kendi revizyonunu yükle!`,
                            type: 'revizeles',
                            read: false
                        }));
                        await supabase.from('user_notifications').insert(notifs);
                    }
                }
            }

            resetForm();
            fetchTopics();
        } catch (err: any) {
            toast.error(err.message || 'İşlem sırasında hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu Gündem Konusunu silmek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase.from('revizeles_topics').delete().eq('id', id);
            if (error) throw error;
            toast.success('Gündem konusu silindi');
            fetchTopics();
        } catch (err: any) {
            toast.error('Silinemedi: ' + err.message);
        }
    };

    const handleToggleStatus = async (topic: any) => {
        const nextStatus = topic.status === 'active' ? 'archived' : 'active';
        try {
            await supabase.from('revizeles_topics').update({ status: nextStatus }).eq('id', topic.id);
            toast.success(`Durum: ${nextStatus === 'active' ? 'Aktif' : 'Arşivlendi'}`);
            fetchTopics();
        } catch (err) {
            toast.error('Durum değiştirilemedi');
        }
    };

    const resetForm = () => {
        setEditingTopicId(null);
        setTitle('');
        setCategory('Siyaset & Kurumsal');
        setDescription('');
        setImageUrl('');
        setStatus('active');
        setModalOpen(false);
    };

    const openEditModal = (topic: any) => {
        setEditingTopicId(topic.id);
        setTitle(topic.title);
        setCategory(topic.category || 'Siyaset & Kurumsal');
        setDescription(topic.description);
        setImageUrl(topic.image_url);
        setStatus(topic.status);
        setModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--border-primary)] p-6 rounded-3xl shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                            <Flame className="w-5 h-5" />
                        </span>
                        <h1 className="text-2xl font-black text-[var(--text-primary)]">Revizeleş! (Gündem Revizyonları)</h1>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                        Gündemdeki logoları, amblemleri ve lansman tasarımlarını yayınlayın; topluluğun eleştirmesini ve kendi alternatif revizyonlarını paylaşmasını sağlayın.
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setModalOpen(true); }}
                    className="px-5 py-3 rounded-2xl bg-[#FF5500] hover:bg-[#e64d00] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Gündem Konusu Yükle</span>
                </button>
            </div>

            {/* Topics List */}
            {tableMissing ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 space-y-3">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>Supabase Veritabanı Tablosu Henüz Oluşturulmadı (`revizeles_topics`)</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        "Revizeleş!" özelliğini aktif etmek için lütfen Supabase Paneliniz &gt; SQL Editor ekranında aşağıdaki kodları kopyalayıp çalıştırın (Run):
                    </p>
                    <pre className="bg-zinc-950 text-amber-300 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto select-all leading-relaxed border border-zinc-800">
{`CREATE TABLE IF NOT EXISTS public.revizeles_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'Siyaset & Kurumsal',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.revizeles_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.revizeles_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    redesign_image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.revizeles_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revizeles_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read revizeles_topics" ON public.revizeles_topics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated insert revizeles_topics" ON public.revizeles_topics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update revizeles_topics" ON public.revizeles_topics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete revizeles_topics" ON public.revizeles_topics FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow public read revizeles_posts" ON public.revizeles_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated insert revizeles_posts" ON public.revizeles_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update revizeles_posts" ON public.revizeles_posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete revizeles_posts" ON public.revizeles_posts FOR DELETE TO authenticated USING (true);

GRANT ALL ON TABLE public.revizeles_topics TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.revizeles_posts TO anon, authenticated, service_role;`}
                    </pre>
                </div>
            ) : loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#FF5500] animate-spin" />
                </div>
            ) : topics.length === 0 ? (
                <div className="text-center py-16 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-8">
                    <Flame className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[var(--text-primary)]">Henüz Gündem Konusu Eklenmedi</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                        Yukarıdaki "Yeni Gündem Konusu Yükle" butonuna tıklayarak ilk gündem tasarımını (Örn: Parti logosu, yeni amblem vb.) yayına alabilirsiniz.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map((topic) => (
                        <div key={topic.id} className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                            <div className="flex gap-4 items-start">
                                <img
                                    src={topic.image_url}
                                    alt={topic.title}
                                    className="w-24 h-24 rounded-2xl object-cover border border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0"
                                />
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            topic.status === 'active' 
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                                : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                        }`}>
                                            {topic.status === 'active' ? '● Aktif Gündem' : 'Arşiv'}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                                        {topic.title}
                                    </h3>
                                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                                        {topic.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-[var(--border-primary)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                                <span className="text-[10px] font-medium text-gray-400">
                                    {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(topic)}
                                        className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] transition-colors"
                                        title={topic.status === 'active' ? 'Arşive Kaldır' : 'Yayına Al'}
                                    >
                                        {topic.status === 'active' ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-emerald-500" />}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(topic)}
                                        className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] transition-colors"
                                        title="Düzenle"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(topic.id)}
                                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-primary)]">
                            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Flame className="w-5 h-5 text-[#FF5500]" />
                                {editingTopicId ? 'Gündem Konusunu Düzenle' : 'Yeni Revizeleş Gündemi Ekle'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Gündem Başlığı *</label>
                                <input
                                    type="text"
                                    placeholder="Örn: Özgür Özel'in Yeni Parti Logosu Sizce Nasıl?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#FF5500]"
                                />
                            </div>

                            {editingTopicId && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Durum</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as any)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-primary)] focus:outline-none"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="archived">Arşivlendi</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Konu Görseli / Orijinal Logo *</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Görsel URL veya dosya yükleyin"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-primary)] focus:outline-none"
                                    />
                                    <label className="px-4 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 cursor-pointer text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all">
                                        {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                                        <span>{uploadingImage ? 'Yükleniyor...' : 'Görsel Seç'}</span>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                </div>
                                {imageUrl && (
                                    <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--border-primary)]">
                                        <img src={imageUrl} alt="Önizleme" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Açıklama / Bağlam *</label>
                                <textarea
                                    rows={4}
                                    placeholder="Gündem konusu hakkında kısa arka plan bilgisi ve tasarımcıların eleştirmesini istediğiniz noktalar..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#FF5500] resize-none"
                                />
                            </div>

                            {!editingTopicId && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={sendEmailNotify}
                                            onChange={(e) => setSendEmailNotify(e.target.checked)}
                                            className="w-4 h-4 rounded text-[#FF5500] focus:ring-[#FF5500]"
                                        />
                                        <span className="text-xs font-bold text-[var(--text-primary)]">
                                            ✉️ Yayınlandığında kayıtlı tüm üyelere e-posta ve site içi bildirim gönder
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="pt-3 border-t border-[var(--border-primary)] flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || uploadingImage}
                                    className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#e64d00] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                                    <span>{submitting ? 'Yayınlanıyor...' : (editingTopicId ? 'Güncelle' : 'Yayına Al')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
