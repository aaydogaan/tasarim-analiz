import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Trophy, Calendar, Link as LinkIcon, Twitter, Briefcase, Award, Star, Activity, ArrowLeft } from 'lucide-react';

export default function PublicProfile() {
    const { slug } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // XP and Stats
    const [xpData, setXpData] = useState({ total: 0, posts: 0, comments: 0, analizler: 0, challenges: 0 });
    const [showcases, setShowcases] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // Fetch profile by slug
                const { data: profData, error: profErr } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (profErr || !profData) throw new Error('Profil bulunamadı');
                setProfile(profData);

                // Fetch XP stats
                const [postsRes, commentsRes, analizRes, challengeRes] = await Promise.all([
                    supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', profData.id),
                    supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('user_id', profData.id),
                    supabase.from('analizler').select('*', { count: 'exact', head: true }).eq('user_id', profData.id),
                    supabase.from('challenge_entries').select('*', { count: 'exact', head: true }).eq('user_id', profData.id),
                ]);

                const posts = postsRes.count || 0;
                const comments = commentsRes.count || 0;
                const analizler = analizRes.count || 0;
                const challenges = challengeRes.count || 0;

                setXpData({
                    posts,
                    comments,
                    analizler,
                    challenges,
                    total: 100 + (posts * 200) + (comments * 50) + (analizler * 150) + (challenges * 300)
                });

                // Fetch showcases
                const { data: showcaseData } = await supabase
                    .from('community_posts')
                    .select('*')
                    .eq('user_id', profData.id)
                    .order('created_at', { ascending: false });
                
                setShowcases(showcaseData || []);
                
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchProfile();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-brand-orange)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Activity className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Tasarımcı Bulunamadı</h1>
                <p className="text-[var(--text-secondary)] mb-8 max-w-md">Aradığınız profil mevcut değil veya silinmiş olabilir.</p>
                <Link to="/vitrin" className="bg-[var(--color-brand-orange)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" /> Vitrine Dön
                </Link>
            </div>
        );
    }

    // Calculate level based on XP
    const userLevel = Math.floor(xpData.total / 1000) + 1;
    const levelTitle = userLevel < 5 ? "Çaylak Tasarımcı" : userLevel < 15 ? "Deneyimli Tasarımcı" : userLevel < 30 ? "Uzman Tasarımcı" : "Tasarım Ustası";

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-6">
                
                {/* Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-8 md:p-12 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--color-brand-orange)]/10 to-transparent" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative">
                            <img 
                                src={profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.id}`} 
                                alt={profile.display_name} 
                                className="w-32 h-32 md:w-40 md:h-40 rounded-[28px] border-4 border-[var(--bg-primary)] shadow-2xl bg-white"
                            />
                            <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border-2 border-[var(--bg-primary)] flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> Lvl {userLevel}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-2">
                                {profile.display_name}
                            </h1>
                            <p className="text-[var(--text-secondary)] text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                                <Award className="w-5 h-5 text-[var(--color-brand-orange)]" /> 
                                {levelTitle}
                            </p>
                            
                            {profile.bio && (
                                <p className="text-[var(--text-primary)]/80 leading-relaxed mb-6 max-w-2xl">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                                {profile.created_at && (
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)] bg-[var(--bg-primary)] px-4 py-2 rounded-xl">
                                        <Calendar className="w-4 h-4" /> 
                                        {new Date(profile.created_at).toLocaleDateString('tr-TR')} tarihinde katıldı
                                    </div>
                                )}
                                {profile.website && (
                                    <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/10 px-4 py-2 rounded-xl hover:bg-[var(--color-brand-orange)]/20 transition-colors">
                                        <LinkIcon className="w-4 h-4" /> Web Sitesi
                                    </a>
                                )}
                                {profile.twitter_url && (
                                    <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl hover:bg-blue-500/20 transition-colors">
                                        <Twitter className="w-4 h-4" /> Twitter
                                    </a>
                                )}
                                {profile.dribbble_url && (
                                    <a href={profile.dribbble_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-pink-500 bg-pink-500/10 px-4 py-2 rounded-xl hover:bg-pink-500/20 transition-colors">
                                        <Briefcase className="w-4 h-4" /> Dribbble
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-orange-500/10 rounded-xl flex items-center justify-center mb-3">
                            <Trophy className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-[var(--text-primary)]">{xpData.total.toLocaleString()}</div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-1">Toplam XP</div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
                            <Star className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-[var(--text-primary)]">{xpData.posts}</div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-1">Vitrin Paylaşımı</div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-xl flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold text-[var(--text-primary)]">{xpData.analizler}</div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-1">Yapay Zeka Analizi</div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
                            <Award className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-[var(--text-primary)]">{userLevel}</div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-1">Tasarım Seviyesi</div>
                    </div>
                </div>

                {/* Showcases */}
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Vitrin Paylaşımları</h2>
                {showcases.length === 0 ? (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 mx-auto bg-[var(--bg-primary)] rounded-full flex items-center justify-center mb-4">
                            <Star className="w-8 h-8 text-[var(--text-secondary)] opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Henüz Paylaşım Yok</h3>
                        <p className="text-[var(--text-secondary)]">Kullanıcı henüz Keşfet vitrininde bir tasarım paylaşmamış.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {showcases.map((post) => (
                            <Link to={`/community?post=${post.id}`} key={post.id} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl overflow-hidden hover:border-[var(--color-brand-orange)]/30 transition-all group block">
                                <div className="aspect-[4/3] bg-[var(--bg-primary)] relative overflow-hidden">
                                    <img 
                                        src={post.image_url} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--color-brand-orange)] transition-colors line-clamp-1">{post.title}</h3>
                                    <p className="text-[var(--text-secondary)] text-sm line-clamp-2">{post.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
