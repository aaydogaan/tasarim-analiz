import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPosts() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('community_posts')
            .select('*, analizler(gorsel_url, isletme, genel_puan, tasarim_turu)')
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
            
            const formattedPosts = data.map(post => {
                const rawG = post.analizler?.gorsel_url || post.gorsel_url;
                const imageSrc = rawG ? (rawG.startsWith('http') || rawG.startsWith('data:') ? rawG : `data:image/jpeg;base64,${rawG}`) : null;
                return {
                    ...post,
                    image_url: imageSrc,
                    profiles: profileMap[post.user_id] || { display_name: 'Bilinmeyen Kullanıcı' }
                };
            });
            setPosts(formattedPosts);
        } else {
            console.error('Gönderi çekilirken hata:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (postId: string) => {
        if (!window.confirm('Bu gönderiyi tamamen silmek istediğinize emin misiniz?')) return;
        
        const { error } = await supabase.from('community_posts').delete().eq('id', postId);
        if (error) {
            toast.error('Gönderi silinemedi');
        } else {
            toast.success('Gönderi silindi');
            fetchPosts();
        }
    };

    const handleFeatureToggle = async (postId: string, currentStatus: boolean) => {
        const { error } = await supabase.from('community_posts').update({ is_featured: !currentStatus }).eq('id', postId);
        if (error) {
            toast.error('İşlem başarısız');
        } else {
            toast.success(currentStatus ? 'Öne çıkarma iptal edildi' : 'Gönderi keşfette öne çıkarıldı! ✨');
            fetchPosts();
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gönderi Moderasyonu</h1>

            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] text-[var(--text-secondary)] font-bold">
                            <tr>
                                <th className="p-4">Gönderi</th>
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
                            ) : posts.map(post => (
                                <tr key={post.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4 max-w-md">
                                            {post.image_url ? (
                                                <div className="w-20 h-14 rounded-xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex-shrink-0 relative group">
                                                    <img src={post.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    {post.analizler?.genel_puan && (
                                                        <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded px-1.5 py-0.5 flex items-center gap-1">
                                                            <span className="text-[8px] font-bold text-amber-400">{post.analizler.genel_puan}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-20 h-14 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] flex-shrink-0 flex items-center justify-center">
                                                    <span className="text-[10px] text-[var(--text-secondary)]">Görsel Yok</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[var(--text-primary)] truncate">{post.title || 'Adsız Tasarım'}</p>
                                                <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">{post.content || 'İçerik yok.'}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] font-bold bg-[var(--bg-primary)] border border-[var(--border-primary)] px-2 py-0.5 rounded-full text-[var(--text-secondary)] flex items-center gap-1">
                                                        👍 {post.likes_count || 0}
                                                    </span>
                                                    <span className="text-[10px] font-bold bg-[var(--bg-primary)] border border-[var(--border-primary)] px-2 py-0.5 rounded-full text-[var(--text-secondary)] flex items-center gap-1">
                                                        💬 {post.comments_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-2 rounded-xl inline-flex w-full max-w-[200px]">
                                            <img src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${post.user_id}`} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-bold text-[var(--text-primary)] truncate">{post.profiles?.display_name || 'Bilinmiyor'}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)]">ID: {post.user_id?.substring(0,6)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[var(--text-primary)]">{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                                            <span className="text-xs text-[var(--text-secondary)]">{new Date(post.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute:'2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a 
                                                href={`/community?post=${post.id}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Görüntüle"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button 
                                                onClick={() => handleFeatureToggle(post.id, post.is_featured)}
                                                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${post.is_featured ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-amber-500 hover:bg-amber-500/10'}`}
                                                title={post.is_featured ? "Öne Çıkarmayı Kaldır" : "Keşfette Öne Çıkar"}
                                            >
                                                <Sparkles className={`w-4 h-4 ${post.is_featured ? 'fill-amber-500' : ''}`} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Gönderiyi Sil"
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
