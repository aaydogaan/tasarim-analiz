import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Trash2, CheckCircle2, MessageSquare, BarChart2, Users, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSurveys() {
    const [surveys, setSurveys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    // New Survey Form State
    const [newTitle, setNewTitle] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [newType, setNewType] = useState('rating');
    const [newOptions, setNewOptions] = useState('');
    const [saving, setSaving] = useState(false);

    // View Responses State
    const [viewingSurvey, setViewingSurvey] = useState<any>(null);
    const [responses, setResponses] = useState<any[]>([]);
    const [loadingResponses, setLoadingResponses] = useState(false);

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('surveys')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            if (error.code !== '42P01') {
                toast.error("Anketler yüklenirken hata oluştu.");
            }
        } else {
            setSurveys(data || []);
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newQuestion) return toast.error("Lütfen bir soru girin.");
        
        let optionsArr = null;
        if (newType === 'choice') {
            optionsArr = newOptions.split(',').map(o => o.trim()).filter(o => o);
            if (optionsArr.length < 2) return toast.error("En az 2 şık girmelisiniz (virgülle ayırarak).");
        }

        setSaving(true);
        const { error } = await supabase.from('surveys').insert({
            title: newTitle || 'Anket',
            question: newQuestion,
            type: newType,
            options: optionsArr,
            is_active: false
        });

        if (error) {
            toast.error("Anket oluşturulamadı.");
        } else {
            toast.success("Anket oluşturuldu!");
            setIsCreating(false);
            setNewTitle('');
            setNewQuestion('');
            setNewOptions('');
            setNewType('rating');
            fetchSurveys();
        }
        setSaving(false);
    };

    const toggleActive = async (id: string, currentState: boolean) => {
        const { error } = await supabase.from('surveys').update({ is_active: !currentState }).eq('id', id);
        if (error) {
            toast.error("Durum güncellenemedi.");
        } else {
            toast.success(currentState ? "Anket durduruldu." : "Anket aktif edildi!");
            fetchSurveys();
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bu anketi ve tüm cevaplarını silmek istediğinize emin misiniz?")) return;
        
        const { error } = await supabase.from('surveys').delete().eq('id', id);
        if (error) {
            toast.error("Anket silinemedi.");
        } else {
            toast.success("Anket silindi.");
            if (viewingSurvey?.id === id) setViewingSurvey(null);
            fetchSurveys();
        }
    };

    const loadResponses = async (survey: any) => {
        setViewingSurvey(survey);
        setLoadingResponses(true);
        const { data, error } = await supabase
            .from('survey_responses')
            .select(`
                *,
                profiles (display_name, email, avatar_url)
            `)
            .eq('survey_id', survey.id)
            .order('created_at', { ascending: false });
            
        if (error) {
            toast.error("Cevaplar yüklenirken hata oluştu.");
        } else {
            setResponses(data || []);
        }
        setLoadingResponses(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-orange)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Anket Yönetimi</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Sitedeki anketleri yönetin ve sonuçları inceleyin.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-orange)] text-white rounded-xl font-medium hover:bg-[#e64d00] transition-colors"
                >
                    {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isCreating ? 'İptal' : 'Yeni Anket'}
                </button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Yeni Anket Oluştur</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Başlık (Opsiyonel)</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Örn: Haftalık Değerlendirme"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--color-brand-orange)] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Anket Türü</label>
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--color-brand-orange)] focus:outline-none appearance-none"
                                >
                                    <option value="rating">1-10 Puanlama</option>
                                    <option value="choice">Çoktan Seçmeli (Örn: Evet/Hayır)</option>
                                    <option value="text">Metin Girişi (Açık Uçlu)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Soru</label>
                            <input
                                type="text"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="Örn: Yeni eklediğimiz özelliklerimizi nasıl buldunuz?"
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--color-brand-orange)] focus:outline-none"
                            />
                        </div>
                        {newType === 'choice' && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Şıklar (Virgül ile ayırın)</label>
                                <input
                                    type="text"
                                    value={newOptions}
                                    onChange={(e) => setNewOptions(e.target.value)}
                                    placeholder="Örn: Çok beğendim, Geliştirilmeli, Fikrim yok"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--color-brand-orange)] focus:outline-none"
                                />
                            </div>
                        )}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                className="px-6 py-2.5 bg-[var(--color-brand-orange)] text-white rounded-xl font-bold hover:bg-[#e64d00] transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Oluşturuluyor...' : 'Anketi Oluştur'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Survey List */}
                <div className={`space-y-4 ${viewingSurvey ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
                    <h3 className="font-bold text-[var(--text-primary)] px-1">Tüm Anketler</h3>
                    
                    {surveys.length === 0 ? (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-8 text-center">
                            <BarChart2 className="w-12 h-12 text-[var(--text-secondary)]/30 mx-auto mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">Henüz hiç anket oluşturulmamış.</p>
                        </div>
                    ) : (
                        surveys.map((survey) => (
                            <div 
                                key={survey.id} 
                                className={`bg-[var(--card-bg)] border rounded-2xl p-4 transition-all ${viewingSurvey?.id === survey.id ? 'border-[var(--color-brand-orange)] ring-1 ring-[var(--color-brand-orange)]/50' : 'border-[var(--border-primary)] hover:border-[var(--text-secondary)]/30'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${survey.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--text-secondary)]/10 text-[var(--text-secondary)]'}`}>
                                                {survey.is_active ? 'Yayında' : 'Pasif'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
                                                {survey.type === 'rating' ? 'Puanlama' : survey.type === 'choice' ? 'Seçmeli' : 'Metin'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-[var(--text-primary)] truncate">{survey.title || 'Anket'}</h4>
                                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-1" title={survey.question}>
                                            {survey.question}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-primary)]">
                                    <button
                                        onClick={() => toggleActive(survey.id, survey.is_active)}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${survey.is_active ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                                    >
                                        {survey.is_active ? 'Durdur' : 'Yayınla'}
                                    </button>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => loadResponses(survey)}
                                            className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--color-brand-orange)] hover:text-white text-[var(--text-secondary)] transition-colors"
                                            title="Cevapları Gör"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(survey.id)}
                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Responses View */}
                {viewingSurvey && (
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-[var(--text-primary)]">Cevaplar: {viewingSurvey.title || 'Anket'}</h3>
                            <button onClick={() => setViewingSurvey(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                                <p className="font-medium text-[var(--text-primary)]">{viewingSurvey.question}</p>
                                
                                {/* Stats Summary */}
                                {responses.length > 0 && viewingSurvey.type === 'rating' && (
                                    <div className="mt-4 flex gap-4">
                                        <div className="bg-[var(--bg-primary)] px-4 py-2 rounded-xl border border-[var(--border-primary)]">
                                            <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Ortalama</div>
                                            <div className="text-xl font-black text-[var(--color-brand-orange)]">
                                                {(responses.reduce((acc, r) => acc + Number(r.answer), 0) / responses.length).toFixed(1)} / 10
                                            </div>
                                        </div>
                                        <div className="bg-[var(--bg-primary)] px-4 py-2 rounded-xl border border-[var(--border-primary)]">
                                            <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Katılım</div>
                                            <div className="text-xl font-black text-[var(--text-primary)]">
                                                {responses.length}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {loadingResponses ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-[var(--color-brand-orange)]" />
                                </div>
                            ) : responses.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-[var(--text-secondary)]">Henüz hiç cevap yok.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--border-primary)] max-h-[600px] overflow-y-auto">
                                    {responses.map((r) => (
                                        <div key={r.id} className="p-4 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <img 
                                                    src={r.profiles?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${r.user_id}`} 
                                                    alt="User" 
                                                    className="w-8 h-8 rounded-full border border-[var(--border-primary)] bg-white object-cover" 
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm text-[var(--text-primary)]">
                                                            {r.profiles?.display_name || r.profiles?.email || 'İsimsiz Kullanıcı'}
                                                        </span>
                                                        <span className="text-xs text-[var(--text-secondary)]">
                                                            {new Date(r.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                    
                                                    {viewingSurvey.type === 'rating' ? (
                                                        <div className="mt-1.5 flex items-center gap-1">
                                                            <div className="bg-[var(--color-brand-orange)] text-white text-xs font-bold px-2 py-0.5 rounded">
                                                                {r.answer} / 10
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-1.5 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-primary)] p-3 rounded-xl inline-block w-full">
                                                            {r.answer}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
