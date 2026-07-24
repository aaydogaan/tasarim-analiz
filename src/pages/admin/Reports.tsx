import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Trash2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                profiles (display_name)
            `)
            .order('created_at', { ascending: false });
        
        if (data) {
            // İlgili içerikleri çekmek için post ve comment id'lerini ayıklayalım
            const postIds = data.filter(r => r.item_type === 'post').map(r => r.reported_item_id);
            const commentIds = data.filter(r => r.item_type === 'comment').map(r => r.reported_item_id);

            let postsMap: Record<string, any> = {};
            let commentsMap: Record<string, any> = {};

            if (postIds.length > 0) {
                const { data: postsData } = await supabase
                    .from('community_posts')
                    .select('id, title, content, analizler(gorsel_url)')
                    .in('id', postIds);
                if (postsData) {
                    postsMap = Object.fromEntries(postsData.map(p => [p.id, p]));
                }
            }

            if (commentIds.length > 0) {
                const { data: commentsData } = await supabase
                    .from('post_comments')
                    .select('id, content, post_id')
                    .in('id', commentIds);
                if (commentsData) {
                    commentsMap = Object.fromEntries(commentsData.map(c => [c.id, c]));
                }
            }

            const formattedReports = data.map(report => {
                let reportedContent = null;
                if (report.item_type === 'post' && postsMap[report.reported_item_id]) {
                    const p = postsMap[report.reported_item_id];
                    const rawG = p.analizler?.gorsel_url;
                    reportedContent = {
                        title: p.title || 'Adsız Tasarım',
                        content: p.content,
                        image: rawG ? (rawG.startsWith('http') || rawG.startsWith('data:') ? rawG : `data:image/jpeg;base64,${rawG}`) : null
                    };
                } else if (report.item_type === 'comment' && commentsMap[report.reported_item_id]) {
                    const c = commentsMap[report.reported_item_id];
                    reportedContent = {
                        content: c.content,
                        post_id: c.post_id
                    };
                }

                return {
                    ...report,
                    reportedContent
                };
            });

            setReports(formattedReports);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleUpdateStatus = async (reportId: string, status: string, reporterId: string) => {
        let confirmMessage = status === 'resolved' 
            ? "Bu şikayeti 'Çözüldü' olarak işaretlemek istediğinize emin misiniz? (Not: Eğer ilgili gönderiyi sildiyseniz bu şikayet kapanmış sayılır.)"
            : "Bu şikayeti 'Görmezden Gel' (Reddedildi) olarak işaretlemek istediğinize emin misiniz? Şikayet eden kullanıcıya bu bildirimin asılsız olduğu işlenir.";
            
        if (!window.confirm(confirmMessage)) return;

        const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
        if (error) {
            toast.error('İşlem başarısız');
        } else {
            toast.success(status === 'resolved' ? 'Şikayet çözüldü olarak işaretlendi!' : 'Şikayet reddedildi.');
            
            // Bildirim gönder
            const { data: { user } } = await supabase.auth.getUser();
            if (user && reporterId) {
                const { error: notifyError } = await supabase.from('notifications').insert({
                    user_id: reporterId,
                    type: status === 'resolved' ? 'report_resolved' : 'report_dismissed',
                    actor_id: user.id
                });
                if (notifyError) {
                    toast.error('Bildirim gönderilemedi: ' + notifyError.message);
                }
            }

            fetchReports();
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        if (!window.confirm('Bu şikayeti kayıtlarından silmek istediğinize emin misiniz?')) return;
        const { error } = await supabase.from('reports').delete().eq('id', reportId);
        if (error) {
            toast.error('Silinemedi');
        } else {
            toast.success('Şikayet silindi');
            fetchReports();
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Şikayet Bildirimleri</h1>

            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] text-[var(--text-secondary)] font-bold">
                            <tr>
                                <th className="p-4">Durum</th>
                                <th className="p-4 w-[300px]">Şikayet Edilen İçerik</th>
                                <th className="p-4 w-[200px]">Şikayet Nedeni</th>
                                <th className="p-4">Bildiren</th>
                                <th className="p-4">Tarih</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--text-secondary)]" />
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">
                                        Hiç şikayet bulunamadı.
                                    </td>
                                </tr>
                            ) : reports.map(report => (
                                <tr key={report.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                    <td className="p-4">
                                        {report.status === 'pending' && <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md text-xs font-bold">Bekliyor</span>}
                                        {report.status === 'resolved' && <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-xs font-bold">Çözüldü</span>}
                                        {report.status === 'dismissed' && <span className="px-2 py-1 bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] rounded-md text-xs font-bold">Reddedildi</span>}
                                    </td>
                                    <td className="p-4">
                                        {report.reportedContent ? (
                                            report.item_type === 'post' ? (
                                                <div className="flex items-start gap-3 bg-[var(--bg-primary)] p-2 rounded-xl border border-[var(--border-primary)]">
                                                    {report.reportedContent.image ? (
                                                        <img src={report.reportedContent.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-[var(--border-primary)] shrink-0" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] flex items-center justify-center shrink-0">
                                                            <span className="text-[8px] text-[var(--text-secondary)]">Görsel Yok</span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">{report.reportedContent.title}</p>
                                                        <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">{report.reportedContent.content}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-primary)]">
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-purple-500 mb-1">YORUM</div>
                                                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic">"{report.reportedContent.content}"</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded-lg">Silinmiş veya bulunamadı</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-[var(--text-primary)] font-medium line-clamp-3">{report.reason}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center">
                                                <span className="text-xs font-bold text-[var(--text-secondary)]">{report.profiles?.display_name?.charAt(0) || 'U'}</span>
                                            </div>
                                            <span className="text-sm font-bold text-[var(--text-primary)]">{report.profiles?.display_name || 'Bilinmiyor'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[var(--text-primary)]">{new Date(report.created_at).toLocaleDateString('tr-TR')}</span>
                                            <span className="text-xs text-[var(--text-secondary)]">{new Date(report.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute:'2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {report.item_type === 'post' && report.reportedContent && (
                                                <a 
                                                    href={`/community?post=${report.reported_item_id}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                    title="İlgili Gönderiye Git"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            {report.item_type === 'comment' && report.reportedContent && report.reportedContent.post_id && (
                                                <a 
                                                    href={`/community?post=${report.reportedContent.post_id}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-2 text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors"
                                                    title="Yorumun Bulunduğu Gönderiye Git"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            {report.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(report.id, 'resolved', report.reporter_id)}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                        title="Çözüldü Olarak İşaretle"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(report.id, 'dismissed', report.reporter_id)}
                                                        className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                                                        title="Görmezden Gel"
                                                    >
                                                        <AlertTriangle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDeleteReport(report.id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Şikayeti Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
