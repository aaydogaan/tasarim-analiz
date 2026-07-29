import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNewsletter() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubscribers(data || []);
        } catch (err: any) {
            console.error('Fetch error:', err);
            toast.error('Bülten aboneleri yüklenemedi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, email: string) => {
        if (!window.confirm(`${email} adresini bülten listesinden silmek istediğinize emin misiniz?`)) return;
        setDeletingId(id);
        try {
            const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
            if (error) throw error;
            toast.success('Abone başarıyla silindi');
            setSubscribers(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            toast.error('Silinirken hata oluştu: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-3">
                        <Mail className="w-8 h-8 text-[#FF5500]" />
                        Bülten Aboneleri
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 font-medium">
                        Bültene kayıtlı e-posta adreslerini yönetin ve görüntüleyin. Toplam: {subscribers.length} abone.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-[#FF5500]" />
                </div>
            ) : subscribers.length === 0 ? (
                <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl">
                    <Mail className="w-16 h-16 text-[var(--text-secondary)]/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Henüz abone yok</h3>
                    <p className="text-[var(--text-secondary)] mt-2">Bültene henüz kimse katılmamış.</p>
                </div>
            ) : (
                <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                                    <th className="p-4 font-bold text-sm text-[var(--text-secondary)]">E-Posta</th>
                                    <th className="p-4 font-bold text-sm text-[var(--text-secondary)]">Durum</th>
                                    <th className="p-4 font-bold text-sm text-[var(--text-secondary)]">Kayıt Tarihi</th>
                                    <th className="p-4 font-bold text-sm text-[var(--text-secondary)] text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-[var(--text-primary)] text-sm">{sub.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${sub.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {sub.status === 'active' ? 'Aktif' : 'Ayrıldı'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-medium text-[var(--text-secondary)]">
                                                {new Date(sub.created_at).toLocaleDateString('tr-TR')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(sub.id, sub.email)}
                                                disabled={deletingId === sub.id}
                                                className="inline-flex items-center justify-center p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                            >
                                                {deletingId === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
