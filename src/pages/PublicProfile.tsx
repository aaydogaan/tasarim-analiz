import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Trophy, Calendar, Link as LinkIcon, Twitter, Briefcase, Award, Star, Activity, ArrowLeft, X } from 'lucide-react';

export default function PublicProfile() {
    const { slug } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [seciliGorsel, setSeciliGorsel] = useState<string | null>(null);
    
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
                    .select('*, analizler(gorsel_url, isletme, tasarim_turu, genel_puan)')
                    .eq('user_id', profData.id)
                    .order('created_at', { ascending: false });
                
                const formattedShowcases = (showcaseData || []).map(post => {
                    const rawG = post.analizler?.gorsel_url || post.gorsel_url;
                    const imageSrc = rawG ? (rawG.startsWith('http') || rawG.startsWith('data:') ? rawG : `data:image/jpeg;base64,${rawG}`) : '';
                    return {
                        ...post,
                        image_url: imageSrc,
                        isletme: post.analizler?.isletme || post.title || 'Genel',
                        tasarim_turu: post.analizler?.tasarim_turu || 'Tasarım',
                        genel_puan: post.analizler?.genel_puan || 0
                    };
                });

                setShowcases(formattedShowcases);
                
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
        <div className="min-h-screen bg-[#fafafa] pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-6">
                
                {/* Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200/60 rounded-[32px] overflow-hidden mb-8 shadow-sm"
                >
                    {/* Cover Image */}
                    <div className="h-32 md:h-48 w-full bg-gradient-to-r from-orange-100 to-amber-100 relative">
                        {profile.cover_url ? (
                            <img src={profile.cover_url} alt="Kapak" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                        )}
                    </div>

                    <div className="px-8 pb-8 md:px-12 md:pb-12">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative -mt-16 md:-mt-20 mb-6">
                            <div className="relative">
                                <img 
                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.id}`} 
                                    alt={profile.display_name} 
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-sm object-cover bg-white"
                                />
                                <div className="absolute bottom-2 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm border-2 border-white uppercase tracking-wider">
                                    Level {userLevel}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left pb-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">
                                    {profile.display_name}
                                </h1>
                                <p className="text-gray-500 text-sm md:text-base font-medium flex items-center justify-center md:justify-start gap-1.5">
                                    <Award className="w-4 h-4" /> 
                                    {levelTitle}
                                </p>
                            </div>
                        </div>
                        
                        {profile.bio && (
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 max-w-2xl font-medium text-center md:text-left">
                                {profile.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-medium text-gray-500">
                            {profile.created_at && (
                                <div className="flex items-center gap-1.5 bg-gray-100/80 px-4 py-2.5 rounded-xl">
                                    <Calendar className="w-3.5 h-3.5" /> 
                                    {new Date(profile.created_at).toLocaleDateString('tr-TR')} katıldı
                                </div>
                            )}
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors">
                                    <LinkIcon className="w-3.5 h-3.5" /> Web Sitesi
                                </a>
                            )}
                            {profile.twitter_url && (
                                <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sky-600 bg-sky-50 hover:bg-sky-100 px-4 py-2.5 rounded-xl transition-colors">
                                    <Twitter className="w-3.5 h-3.5" /> Twitter
                                </a>
                            )}
                            {profile.dribbble_url && (
                                <a href={profile.dribbble_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-pink-600 bg-pink-50 hover:bg-pink-100 px-4 py-2.5 rounded-xl transition-colors">
                                    <Briefcase className="w-3.5 h-3.5" /> Dribbble
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white border border-gray-200/60 rounded-[24px] p-6 text-center shadow-sm">
                        <div className="text-3xl font-black text-gray-900 mb-1">{xpData.total.toLocaleString()}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Toplam XP</div>
                    </div>
                    <div className="bg-white border border-gray-200/60 rounded-[24px] p-6 text-center shadow-sm">
                        <div className="text-3xl font-black text-gray-900 mb-1">{xpData.posts}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Vitrin Paylaşımı</div>
                    </div>
                    <div className="bg-white border border-gray-200/60 rounded-[24px] p-6 text-center shadow-sm">
                        <div className="text-3xl font-black text-gray-900 mb-1">{xpData.analizler}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Analizler</div>
                    </div>
                    <div className="bg-white border border-gray-200/60 rounded-[24px] p-6 text-center shadow-sm">
                        <div className="text-3xl font-black text-gray-900 mb-1">{userLevel}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seviye</div>
                    </div>
                </div>

                {/* Showcases */}
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Vitrin Paylaşımları
                    <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">{showcases.length}</span>
                </h2>
                {showcases.length === 0 ? (
                    <div className="bg-white border border-gray-200/60 rounded-3xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Star className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz Paylaşım Yok</h3>
                        <p className="text-gray-500 text-sm">Kullanıcı henüz Keşfet vitrininde bir tasarım paylaşmamış.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {showcases.map((post) => (
                            <div 
                                key={post.id} 
                                onClick={() => { if (post.image_url) setSeciliGorsel(post.image_url); }}
                                className="bg-white border border-gray-200/60 rounded-[24px] overflow-hidden hover:border-gray-300 transition-all group block shadow-sm hover:shadow-md cursor-pointer"
                            >
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    {post.image_url ? (
                                        <img 
                                            src={post.image_url} 
                                            alt={post.isletme} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            Görsel Bulunamadı
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-5 border-t border-gray-100 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{post.isletme}</h3>
                                        <p className="text-gray-500 text-sm font-medium">{post.tasarim_turu}</p>
                                    </div>
                                    {post.genel_puan > 0 && (
                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 font-bold px-2.5 py-1 rounded-lg text-sm shrink-0 border border-amber-100">
                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                            {post.genel_puan}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Modal for viewing image */}
            <AnimatePresence>
                {seciliGorsel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-md"
                        onClick={() => setSeciliGorsel(null)}
                    >
                        <button 
                            className="fixed top-20 right-4 md:top-6 md:right-6 z-[10000] p-2.5 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSeciliGorsel(null);
                            }}
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-3xl max-h-[70vh] relative flex justify-center items-center pointer-events-none"
                        >
                            <img
                                src={seciliGorsel}
                                alt="Tasarım Görseli"
                                className="w-auto h-auto max-w-full max-h-[70vh] rounded-2xl shadow-2xl object-contain border border-white/10 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
