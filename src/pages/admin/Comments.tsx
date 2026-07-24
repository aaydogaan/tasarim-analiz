import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminComments() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('post_comments')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) {
            const userIds = [...new Set(data.map((c: any) => c.user_id).filter(Boolean))];
            let profileMap: Record<string, any> = {};
            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url')
                    .in('id', userIds);
                if (profilesData) {
                    profileMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
                }
            }
            
            const formattedComments = data.map(c => ({
                ...c,
                profiles: profileMap[c.user_id] || { display_name: c.user_name || 'Bilinmeyen Kullanıcı', avatar_url: c.user_avatar }
            }));
            setComments(formattedComments);
        } else {
            console.error('Yorumları çekerken hata:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleDelete = async (commentId: string) => {
        if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
        
        const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
        if (error) {
            toast.error('Yorum silinemedi');
        } else {
            toast.success('Yorum silindi');
            fetchComments();
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Yorum Moderasyonu</h1>

            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] text-[var(--text-secondary)] font-bold">
                            <tr>
                                <th className="p-4 w-1/2">Yorum İçeriği</th>
                                <th className="p-4">Kullanıcı</th>
                                <th className="p-4">Tarih</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--text-secondary)]" />
                                    </td>
                                </tr>
                            ) : comments.map(comment => (
                                <tr key={comment.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                    <td className="p-4">
                                        <p className="text-[var(--text-primary)] font-medium line-clamp-2">{comment.content}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <img src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${comment.user_id}`} alt="" className="w-6 h-6 rounded-full" />
                                            <span className="text-[var(--text-secondary)]">{comment.profiles?.display_name || 'Bilinmiyor'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[var(--text-secondary)]">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a 
                                                href={`/community?post=${comment.post_id}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Gönderiye Git"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button 
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Yorumu Sil"
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
