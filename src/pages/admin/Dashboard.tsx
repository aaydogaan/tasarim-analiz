import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Image as ImageIcon, MessageSquare, Flag } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        comments: 0,
        reports: 0
    });
    const [loading, setLoading] = useState(true);

    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const [usersRes, postsRes, commentsRes, reportsRes, recentUsersRes, recentPostsRes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('community_posts').select('id', { count: 'exact', head: true }),
                supabase.from('post_comments').select('id', { count: 'exact', head: true }),
                supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('profiles').select('id, display_name, avatar_url, created_at').order('created_at', { ascending: false }).limit(5),
                supabase.from('community_posts').select('id, title, content, created_at, user_id').order('created_at', { ascending: false }).limit(4)
            ]);

            setStats({
                users: usersRes.count || 0,
                posts: postsRes.count || 0,
                comments: commentsRes.count || 0,
                reports: reportsRes.count || 0
            });
            if (recentUsersRes.data) setRecentUsers(recentUsersRes.data);
            if (recentPostsRes.data) setRecentPosts(recentPostsRes.data);
            setLoading(false);
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Toplam Kullanıcı', value: stats.users, icon: <Users className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-500/10' },
        { label: 'Topluluk Gönderisi', value: stats.posts, icon: <ImageIcon className="w-6 h-6 text-emerald-500" />, bg: 'bg-emerald-500/10' },
        { label: 'Toplam Yorum', value: stats.comments, icon: <MessageSquare className="w-6 h-6 text-purple-500" />, bg: 'bg-purple-500/10' },
        { label: 'Bekleyen Şikayet', value: stats.reports, icon: <Flag className="w-6 h-6 text-[#FF5500]" />, bg: 'bg-[#FF5500]/10' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Genel Bakış</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-primary)] shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" style={{ backgroundColor: 'currentColor' }}></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`p-4 rounded-2xl ${card.bg}`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                                <p className="text-3xl font-black text-[var(--text-primary)]">
                                    {loading ? '...' : card.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Users */}
                <div className="col-span-1 lg:col-span-1 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-primary)] shadow-sm p-6">
                    <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Son Kayıtlar</h2>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-sm text-[var(--text-secondary)]">Yükleniyor...</p>
                        ) : recentUsers.map((u, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`} alt="" className="w-10 h-10 rounded-full border border-[var(--border-primary)]" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{u.display_name}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)]">{new Date(u.created_at).toLocaleDateString('tr-TR')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Posts */}
                <div className="col-span-1 lg:col-span-2 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-primary)] shadow-sm p-6">
                    <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Son Gönderiler</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {loading ? (
                            <p className="text-sm text-[var(--text-secondary)]">Yükleniyor...</p>
                        ) : recentPosts.map((p, i) => (
                            <div key={i} className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-primary)]">
                                <p className="text-sm font-bold text-[var(--text-primary)] mb-1 truncate">{p.title || 'Adsız'}</p>
                                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">{p.content || 'İçerik yok.'}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">{new Date(p.created_at).toLocaleDateString('tr-TR')}</span>
                                    <span className="text-[10px] bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--border-primary)]">ID: {p.user_id?.substring(0,4)}...</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
