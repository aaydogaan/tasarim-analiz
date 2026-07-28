import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit3, CheckCircle2, XCircle, Megaphone, Info, Wrench, Trophy, Gift, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AnnouncementType = 'info' | 'warning' | 'maintenance' | 'event' | 'contest' | 'gift';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: AnnouncementType;
    link_url: string;
    link_text: string;
    is_active: boolean;
    created_at: string;
}

const TYPE_OPTIONS: { value: AnnouncementType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'info', label: 'Bilgi', icon: <Info size={14} />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { value: 'warning', label: 'Duyuru', icon: <Megaphone size={14} />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { value: 'maintenance', label: 'Bakım', icon: <Wrench size={14} />, color: 'text-slate-300 bg-slate-500/10 border-slate-500/20' },
    { value: 'event', label: 'Etkinlik', icon: <Megaphone size={14} />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { value: 'contest', label: 'Yarışma', icon: <Trophy size={14} />, color: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20' },
    { value: 'gift', label: 'Kampanya', icon: <Gift size={14} />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
];

const EMPTY_FORM = { title: '', message: '', type: 'info' as AnnouncementType, link_url: '', link_text: '', is_active: true };

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableMissing, setTableMissing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => { fetchAnnouncements(); }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42P01' || error.message?.includes('announcements') || error.message?.includes('schema cache')) {
                setTableMissing(true);
            } else {
                toast.error('Duyurular yüklenemedi: ' + error.message);
            }
        } else {
            setAnnouncements(data || []);
            setTableMissing(false);
        }
        setLoading(false);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (ann: Announcement) => {
        setEditingId(ann.id);
        setForm({ title: ann.title, message: ann.message, type: ann.type, link_url: ann.link_url || '', link_text: ann.link_text || '', is_active: ann.is_active });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) { toast.error('Başlık ve mesaj zorunludur.'); return; }
        setSubmitting(true);
        try {
            if (editingId) {
                const { error } = await supabase.from('announcements').update({ ...form }).eq('id', editingId);
                if (error) throw error;
                toast.success('Duyuru güncellendi!');
            } else {
                const { error } = await supabase.from('announcements').insert([{ ...form }]);
                if (error) throw error;
                toast.success('Duyuru oluşturuldu!');
            }
            setModalOpen(false);
            fetchAnnouncements();
        } catch (err: any) {
            toast.error('İşlem başarısız: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        const { error } = await supabase.from('announcements').update({ is_active: !current }).eq('id', id);
        if (error) { toast.error('Güncellenemedi'); return; }
        toast.success(current ? 'Duyuru pasife alındı' : 'Duyuru aktif edildi');
        fetchAnnouncements();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) { toast.error('Silinemedi'); return; }
        toast.success('Duyuru silindi');
        fetchAnnouncements();
    };

    const getTypeConfig = (type: AnnouncementType) => TYPE_OPTIONS.find(t => t.value === type) || TYPE_OPTIONS[0];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-[#FF5500]" /> Duyuru Yönetimi
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">Kullanıcılara gösterilecek bildirim ve duyuruları yönetin.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#FF5500] hover:bg-[#e64d00] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#FF5500]/20 cursor-pointer"
                >
                    <Plus size={16} /> Yeni Duyuru
                </button>
            </div>

            {/* Table missing warning */}
            {tableMissing && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-amber-400 text-sm">Veritabanı Tablosu Bulunamadı</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                            Duyuru sistemini kullanmak için Supabase'de <code className="bg-[var(--bg-secondary)] px-1 py-0.5 rounded font-mono text-xs">announcements</code> tablosunu oluşturmanız gerekiyor.
                        </p>
                        <details className="mt-2">
                            <summary className="text-xs font-bold text-amber-400 cursor-pointer hover:underline">SQL Komutu Göster</summary>
                            <pre className="mt-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl p-3 text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' 
    CHECK (type IN ('info','warning','maintenance','event','contest','gift')),
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni (widget için)
CREATE POLICY "announcements_public_read" ON public.announcements
  FOR SELECT USING (is_active = true);

-- Sadece admin yazabilir (service role üzerinden)
CREATE POLICY "announcements_service_write" ON public.announcements
  FOR ALL USING (true) WITH CHECK (true);`}
                            </pre>
                        </details>
                    </div>
                </div>
            )}

            {/* Announcements list */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF5500]" />
                </div>
            ) : !tableMissing && announcements.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-12 text-center">
                    <Megaphone className="w-10 h-10 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-[var(--text-secondary)] text-sm">Henüz duyuru yok</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-70">Yeni duyuru oluşturmak için "Yeni Duyuru" butonuna tıklayın.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((ann) => {
                        const tc = getTypeConfig(ann.type);
                        return (
                            <motion.div
                                key={ann.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl p-4 flex items-start gap-4 transition-all ${!ann.is_active ? 'opacity-50' : ''}`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${tc.color}`}>
                                    {tc.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-extrabold text-[var(--text-primary)] text-sm truncate">{ann.title}</h3>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${tc.color} shrink-0`}>{tc.label}</span>
                                        {ann.is_active ? (
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">Aktif</span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] shrink-0">Pasif</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium line-clamp-2">{ann.message}</p>
                                    {ann.link_url && (
                                        <a href={ann.link_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#FF5500] hover:underline font-bold mt-1 inline-block">
                                            {ann.link_text || ann.link_url}
                                        </a>
                                    )}
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 opacity-60">
                                        {new Date(ann.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleToggleActive(ann.id, ann.is_active)}
                                        title={ann.is_active ? 'Pasife Al' : 'Aktif Et'}
                                        className={`p-2 rounded-xl transition-colors cursor-pointer ${ann.is_active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                                    >
                                        {ann.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                        onClick={() => openEdit(ann)}
                                        className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ann.id)}
                                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[950]"
                            onClick={() => setModalOpen(false)}
                        />
                        <div className="fixed inset-0 z-[951] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                                className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-2xl w-full max-w-lg overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="px-6 py-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                                    <h2 className="font-extrabold text-[var(--text-primary)] text-base">{editingId ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Oluştur'}</h2>
                                    <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] cursor-pointer transition-colors">
                                        <XCircle size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {/* Type picker */}
                                    <div>
                                        <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2">Duyuru Türü</label>
                                        <div className="flex flex-wrap gap-2">
                                            {TYPE_OPTIONS.map(t => (
                                                <button
                                                    key={t.value}
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, type: t.value }))}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${form.type === t.value ? t.color : 'text-[var(--text-secondary)] border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                                >
                                                    {t.icon} {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">Başlık *</label>
                                        <input
                                            value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            placeholder="Duyuru başlığı..."
                                            maxLength={100}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] font-medium placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[#FF5500]/50 transition-colors"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">Mesaj *</label>
                                        <textarea
                                            value={form.message}
                                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                            placeholder="Kullanıcılara gösterilecek mesaj..."
                                            rows={3}
                                            maxLength={300}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] font-medium placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[#FF5500]/50 transition-colors resize-none"
                                        />
                                        <p className="text-[10px] text-[var(--text-secondary)] mt-1 text-right">{form.message.length}/300</p>
                                    </div>

                                    {/* Link (optional) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">Link URL (İsteğe bağlı)</label>
                                            <input
                                                value={form.link_url}
                                                onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                                                placeholder="https://..."
                                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-medium placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[#FF5500]/50 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">Link Metni</label>
                                            <input
                                                value={form.link_text}
                                                onChange={e => setForm(f => ({ ...f, link_text: e.target.value }))}
                                                placeholder="Detaylar"
                                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-medium placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[#FF5500]/50 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Active toggle */}
                                    <div className="flex items-center justify-between bg-[var(--bg-secondary)] rounded-xl px-4 py-3">
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">Aktif olarak yayınla</p>
                                            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">Kapalıysa kullanıcılara gösterilmez</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.is_active ? 'bg-emerald-500' : 'bg-[var(--border-primary)]'}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setModalOpen(false)}
                                            className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold text-sm hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                            {editingId ? 'Güncelle' : 'Oluştur'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
