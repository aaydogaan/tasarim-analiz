import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { User, X, Eye, EyeOff, MailCheck, RefreshCw, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import CustomSelect from '../components/ui/CustomSelect';
import { generateUniqueSlug } from '../lib/communityProfile';
import { sendWelcomeEmail } from '../lib/resend';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';

const RANK_OPTIONS = [
    { value: 'stajyer', label: 'Stajyer Tasarımcı' },
    { value: 'junior', label: 'Junior Tasarımcı' },
    { value: 'tasarimci', label: 'Tasarımcı' },
    { value: 'senior', label: 'Senior Tasarımcı' },
    { value: 'art-direktor', label: 'Art Direktör' },
    { value: 'tasarim-direktoru', label: 'Tasarım Direktörü' },

];

const SPECIALTY_OPTIONS = [
    { value: 'ui-ux', label: 'UI/UX Tasarım' },
    { value: 'marka', label: 'Marka Kimliği' },
    { value: 'sosyal-medya', label: 'Sosyal Medya Tasarımı' },
    { value: 'e-ticaret', label: 'E-ticaret Tasarımı' },
    { value: 'hareketli', label: 'Hareketli Grafik' },
    { value: 'illustrasyon', label: 'İllüstrasyon' },
    { value: 'basili', label: 'Basılı Tasarım' },
];

const EXPERIENCE_OPTIONS = [
    { value: '0-1', label: '0-1 yıl' },
    { value: '1-3', label: '1-3 yıl' },
    { value: '3-5', label: '3-5 yıl' },
    { value: '5+', label: '5+ yıl' },
];

export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Query parametrelerinden mode al
    const searchParams = new URLSearchParams(location.search);
    const initialMode = searchParams.get('mode') as 'giris' | 'kayit' | 'sifremi-unuttum' | 'sifre-yenile' || 'giris';

    const [authMod, setAuthMod] = useState<'giris' | 'kayit' | 'sifremi-unuttum' | 'sifre-yenile'>(
        initialMode === 'sifre-yenile' || initialMode === 'sifremi-unuttum' || initialMode === 'kayit' ? initialMode : 'giris'
    );
    const [authAdim, setAuthAdim] = useState<1 | 2>(1);
    const [authEmail, setAuthEmail] = useState('');
    const [authAdSoyad, setAuthAdSoyad] = useState('');
    const [authSifre, setAuthSifre] = useState('');
    const [authSifreTekrar, setAuthSifreTekrar] = useState('');
    const [authSifreGoster, setAuthSifreGoster] = useState(false);
    const [authSifreTekrarGoster, setAuthSifreTekrarGoster] = useState(false);

    const [authDesignRank, setAuthDesignRank] = useState('');
    const [authSpecialty, setAuthSpecialty] = useState('');
    const [authExperienceLevel, setAuthExperienceLevel] = useState('');

    // Checkboxes
    const [kabulKosuullarGizlilik, setKabulKosuullarGizlilik] = useState(false);
    const [kabulKvkk, setKabulKvkk] = useState(false);
    const [kabulPazarlama, setKabulPazarlama] = useState(false);

    const [authYukleniyor, setAuthYukleniyor] = useState(false);
    const [authHata, setAuthHata] = useState<string | null>(null);

    // Avatar state
    const [seciliAvatar, setSeciliAvatar] = useState<string>('');
    const [avatarYukleniyor, setAvatarYukleniyor] = useState(false);
    const [avatarOnayAcik, setAvatarOnayAcik] = useState(false);

    // Şifre sıfırlama veya e-posta doğrulama linkinden dönünce
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            if (_e === 'PASSWORD_RECOVERY') {
                setAuthMod('sifre-yenile');
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const googleIleGirisYap = async () => {
        setAuthYukleniyor(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`
                }
            });
            if (error) throw error;
        } catch (err: any) {
            toast.error(err.message || 'Google ile giriş yapılırken bir hata oluştu.');
            setAuthYukleniyor(false);
        }
    };

    const girisYap = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setAuthHata(null);

        // Validasyonlar
        if (authMod === 'kayit') {
            if (!kabulKosuullarGizlilik) {
                setAuthHata("Kayıt olabilmek için Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmelisiniz.");
                return;
            }
            if (!kabulKvkk) {
                setAuthHata("Kayıt olabilmek için KVKK Aydınlatma Metni'ni onaylamalısınız.");
                return;
            }
        }

        setAuthYukleniyor(true);
        try {
            if (authMod === 'giris') {
                const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authSifre });
                if (error) {
                    if (error.message?.includes('Email not confirmed')) {
                        throw new Error('Giriş yapılamadı: E-posta adresi doğrulanmamış. Supabase panelinden Confirm Email ayarını kapatabilirsiniz.');
                    }
                    throw error;
                }
                navigate(-1); // Önceki sayfaya dön
            } else if (authMod === 'sifremi-unuttum') {
                const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
                    redirectTo: window.location.origin + '/auth?mode=sifre-yenile',
                });
                if (error) throw error;
                toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
                setAuthMod('giris');
            } else if (authMod === 'sifre-yenile') {
                if (authSifre !== authSifreTekrar) throw new Error('Şifreler uyuşmuyor.');
                if (authSifre.length < 6) throw new Error('Şifreniz en az 6 karakter olmalıdır.');
                const { error } = await supabase.auth.updateUser({ password: authSifre });
                if (error) throw error;
                toast.success('Şifreniz başarıyla güncellendi.');
                navigate('/');
            } else {
                // Kayıt Ol
                if (authSifreTekrar && authSifre !== authSifreTekrar) {
                    throw new Error('Şifreler uyuşmuyor.');
                }
                if (authSifre.length < 6) {
                    throw new Error('Şifreniz en az 6 karakter olmalıdır.');
                }
                const cleanEmail = authEmail.trim();
                let signUpRes = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: authSifre,
                    options: {
                        data: {
                            full_name: authAdSoyad || 'Tasarımcı',
                            display_name: authAdSoyad || 'Tasarımcı',
                            design_rank: authDesignRank,
                            specialty: authSpecialty,
                            experience_level: authExperienceLevel,
                            marketing_opt_in: kabulPazarlama
                        }
                    }
                });

                if (signUpRes.error) {
                    if (signUpRes.error.message?.includes('already registered') || signUpRes.error.message?.includes('user_already_exists')) {
                        throw new Error('Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.');
                    }
                    throw signUpRes.error;
                }

                let userRecord = signUpRes.data?.user;
                if (!signUpRes.data?.session) {
                    const signInRes = await supabase.auth.signInWithPassword({ email: cleanEmail, password: authSifre });
                    if (signInRes.data?.user) {
                        userRecord = signInRes.data.user;
                    }
                }

                if (userRecord) {
                    try {
                        const finalSlug = await generateUniqueSlug(authAdSoyad || 'Tasarımcı', userRecord.id);
                        await supabase.from('profiles').upsert({
                            id: userRecord.id,
                            display_name: authAdSoyad || 'Tasarımcı',
                            slug: finalSlug,
                            avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${userRecord.id}`,
                            marketing_opt_in: kabulPazarlama,
                            design_rank: authDesignRank,
                            specialty: authSpecialty,
                            experience_level: authExperienceLevel,
                            updated_at: new Date().toISOString()
                        });

                        // Trigger Resend Welcome Email
                        sendWelcomeEmail(cleanEmail, authAdSoyad || 'Tasarımcı').catch(err => {
                            console.error('Welcome email error:', err);
                        });
                    } catch (_) { }
                }

                setAuthAdim(2);
                setSeciliAvatar(`https://api.dicebear.com/7.x/notionists/svg?seed=${userRecord?.id || Date.now()}`);
            }
        } catch (error: any) {
            setAuthHata(error.message || 'Bir hata oluştu.');
        } finally {
            setAuthYukleniyor(false);
        }
    };

    const rastgeleAvatarUret = () => {
        if (seciliAvatar && !seciliAvatar.includes('dicebear.com')) {
            setAvatarOnayAcik(true);
            return;
        }
        rastgeleAvatarUygula();
    };

    const rastgeleAvatarUygula = () => {
        setAvatarOnayAcik(false);
        setSeciliAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`);
    };

    const avatarYukle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarYukleniyor(true);
        try {
            const s3Client = new S3Client({
                region: 'auto',
                endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
                    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
                },
            });

            const fileName = `avatars/temp_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const fileBuffer = await file.arrayBuffer();

            await s3Client.send(new PutObjectCommand({
                Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
                Key: fileName,
                Body: new Uint8Array(fileBuffer),
                ContentType: file.type,
            }));

            const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL.replace(/\/$/, "");
            const avatarUrl = `${r2PublicUrl}/${fileName}`;
            setSeciliAvatar(avatarUrl);
        } catch (err: any) {
            console.error('Yükleme hatası:', err);
            toast.error('Avatar yüklenirken bir hata oluştu: ' + err.message);
        } finally {
            setAvatarYukleniyor(false);
        }
    };

    const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
    const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
    const [followSubmitting, setFollowSubmitting] = useState(false);

    const loadRecommendedUsers = async (currentUserId?: string) => {
        try {
            // 1. Fetch Founders (verification_badge === 'gold' or founder_number > 0)
            const { data: foundersData } = await supabase
                .from('profiles')
                .select('id, display_name, avatar_url, slug, bio, verification_badge, founder_number')
                .or('verification_badge.eq.gold,founder_number.gt.0')
                .order('founder_number', { ascending: true })
                .limit(3);

            // 2. Fetch Active Vitrin post creators
            const { data: activePosts } = await supabase
                .from('community_posts')
                .select('user_id')
                .order('created_at', { ascending: false })
                .limit(30);

            const activeUserIds = Array.from(new Set((activePosts || []).map(p => p.user_id).filter(Boolean)));
            let activeUsersData: any[] = [];

            if (activeUserIds.length > 0) {
                const { data: activeProfs } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url, slug, bio, verification_badge, founder_number')
                    .in('id', activeUserIds)
                    .limit(10);
                activeUsersData = activeProfs || [];
            }

            // 3. Fallback newest users if active users list is short
            const { data: newestUsers } = await supabase
                .from('profiles')
                .select('id, display_name, avatar_url, slug, bio, verification_badge, founder_number')
                .order('created_at', { ascending: false })
                .limit(10);

            // Combine: Founders (Top 3) -> Active Vitrin Creators -> Newest Users
            const combined = [
                ...(foundersData || []),
                ...activeUsersData,
                ...(newestUsers || [])
            ];

            // Deduplicate & remove current user
            const seen = new Set<string>();
            const finalRecommended: any[] = [];

            for (const u of combined) {
                if (!u || !u.id) continue;
                if (u.id === currentUserId) continue;
                if (!seen.has(u.id)) {
                    seen.add(u.id);
                    finalRecommended.push(u);
                }
            }

            const result = finalRecommended.slice(0, 10);
            setRecommendedUsers(result);
            setFollowedUserIds(new Set());
        } catch (err) {
            console.error('Recommended users error:', err);
        }
    };

    const avatarTamamla = async () => {
        setAvatarYukleniyor(true);
        try {
            await supabase.auth.updateUser({
                data: { avatar_url: seciliAvatar }
            });
            const sessionRes = await supabase.auth.getSession();
            const user = sessionRes.data.session?.user;
            if (user) {
                await supabase.from('profiles').update({ avatar_url: seciliAvatar }).eq('id', user.id);
                await loadRecommendedUsers(user.id);
            }
            setAuthAdim(3);
        } catch (err: any) {
            toast.error('Avatar kaydedilirken hata: ' + err.message);
        } finally {
            setAvatarYukleniyor(false);
        }
    };

    const toggleFollowUser = (userId: string) => {
        setFollowedUserIds(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const toggleFollowAll = () => {
        if (followedUserIds.size === recommendedUsers.length) {
            setFollowedUserIds(new Set());
        } else {
            setFollowedUserIds(new Set(recommendedUsers.map(u => u.id)));
        }
    };

    const finishOnboardingWithFollows = async () => {
        setFollowSubmitting(true);
        try {
            const sessionRes = await supabase.auth.getSession();
            const user = sessionRes.data.session?.user;

            if (user && followedUserIds.size > 0) {
                const inserts = Array.from(followedUserIds).map(targetId => ({
                    follower_id: user.id,
                    following_id: targetId,
                    notify_posts: true
                }));
                await supabase.from('user_follows').upsert(inserts, { onConflict: 'follower_id,following_id' });
                toast.success(`${followedUserIds.size} tasarımcı takip edildi! 🎉`);
            }
            navigate('/');
        } catch (err: any) {
            console.error('Follow error:', err);
            navigate('/');
        } finally {
            setFollowSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex">
            {/* Sol Taraf - Marka & Branding (Sadece Desktop) */}
            <div className="hidden lg:flex flex-1 relative bg-gray-900 overflow-hidden p-12 lg:p-20">
                {/* Arka plan efekti */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-[#FF5500]/20 z-0"></div>
                <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#FF5500] blur-[150px] opacity-20"></div>

                <div className="relative z-10 flex flex-col justify-between w-full max-w-xl mx-auto pl-8 xl:pl-16">
                    <div className="mt-12">
                        <img src="/Revizelesene-logo.png" alt="Revizelesene" className="h-10 mb-16 brightness-0 invert" />
                        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
                            Tasarım süreçlerini<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] to-orange-300">hızlandır ve yönet.</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-md">
                            Geri bildirimleri tek merkezde topla, revizyonları kolayca yönet ve ekibinle uyum içinde çalış.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mb-12">
                        <div className="flex -space-x-3">
                            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-100" />
                            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Aneka" className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-100" />
                            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Bella" className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-100" />
                        </div>
                        <div className="text-sm font-medium text-gray-300">
                            <span className="text-white font-bold">500+</span> tasarımcıya katıl
                        </div>
                    </div>
                </div>
            </div>

            {/* Sağ Taraf - Form Alanı */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-white lg:bg-transparent lg:backdrop-blur-none">
                <button onClick={() => navigate('/')} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors z-20">
                    <X className="w-5 h-5" />
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-md flex flex-col"
                >
                    <div className="mb-8 text-center lg:text-left">
                        {/* Mobil için logo */}
                        <img src="/Revizelesene-logo.png" alt="Revizelesene" className="h-8 mb-8 mx-auto lg:hidden" />

                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                            {authAdim === 1 ? (
                                authMod === 'sifre-yenile' ? 'Şifreni Yenile' :
                                    authMod === 'sifremi-unuttum' ? 'Şifremi Unuttum' :
                                        authMod === 'giris' ? 'Tekrar Hoş Geldin!' : 'Hesap Oluştur'
                            ) : (
                                'Profilini Tamamla'
                            )}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {authAdim === 1 ? (
                                authMod === 'sifre-yenile' ? 'Yeni şifreni belirleyerek devam et.' :
                                    authMod === 'sifremi-unuttum' ? 'E-posta adresini gir, sıfırlama linki gönderelim.' :
                                        authMod === 'giris' ? 'Hesabına giriş yap ve kaldığın yerden devam et.' : 'Hemen ücretsiz bir hesap oluştur.'
                            ) : (
                                'Toplulukta seni nasıl tanıyacaklar?'
                            )}
                        </p>
                    </div>

                    {authAdim === 1 && authMod !== 'sifre-yenile' && authMod !== 'sifremi-unuttum' && (
                        <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                            <button
                                onClick={() => { setAuthMod('giris'); setAuthHata(null); }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMod === 'giris' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Giriş Yap
                            </button>
                            <button
                                onClick={() => { setAuthMod('kayit'); setAuthHata(null); }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMod === 'kayit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Kayıt Ol
                            </button>
                        </div>
                    )}

                    <div className="space-y-4">
                        {authAdim === 1 ? (
                            <>
                                <form onSubmit={girisYap} className="space-y-4">
                                    {authMod !== 'sifre-yenile' && authMod !== 'kayit' && (
                                        <input type="email" placeholder="E-posta" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required
                                            className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />
                                    )}

                                    {authMod === 'kayit' && (
                                        <>
                                            <input type="text" placeholder="Profil adın" value={authAdSoyad} onChange={e => setAuthAdSoyad(e.target.value)} required
                                                className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />

                                            <input type="email" placeholder="E-posta" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required
                                                className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />

                                            <CustomSelect
                                                value={authDesignRank}
                                                onChange={setAuthDesignRank}
                                                options={RANK_OPTIONS}
                                                placeholder="Unvanınız"
                                                required
                                            />

                                            <div className="flex gap-3">
                                                <CustomSelect
                                                    value={authSpecialty}
                                                    onChange={setAuthSpecialty}
                                                    options={SPECIALTY_OPTIONS}
                                                    placeholder="Tasarım Alanınız"
                                                    required
                                                    className="flex-1"
                                                />
                                                <CustomSelect
                                                    value={authExperienceLevel}
                                                    onChange={setAuthExperienceLevel}
                                                    options={EXPERIENCE_OPTIONS}
                                                    placeholder="Deneyim"
                                                    required
                                                    className="flex-1"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {authMod !== 'sifremi-unuttum' && (
                                        <div className="relative">
                                            <input type={authSifreGoster ? "text" : "password"} placeholder="Şifre" value={authSifre} onChange={e => setAuthSifre(e.target.value)} required
                                                className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full pr-10 outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />
                                            <button type="button" onClick={() => setAuthSifreGoster(!authSifreGoster)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {authSifreGoster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    )}

                                    {(authMod === 'kayit' || authMod === 'sifre-yenile') && (
                                        <div className="relative">
                                            <input type={authSifreTekrarGoster ? "text" : "password"} placeholder="Şifre (Tekrar)" value={authSifreTekrar} onChange={e => setAuthSifreTekrar(e.target.value)} required
                                                className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full pr-10 outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />
                                            <button type="button" onClick={() => setAuthSifreTekrarGoster(!authSifreTekrarGoster)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {authSifreTekrarGoster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    )}

                                    {authMod === 'kayit' && (
                                        <div className="space-y-3 mt-2 mb-2">
                                            <label className="flex items-start gap-2 cursor-pointer group">
                                                <div className="relative flex items-center justify-center mt-0.5">
                                                    <input type="checkbox" className="peer sr-only" checked={kabulKosuullarGizlilik} onChange={(e) => setKabulKosuullarGizlilik(e.target.checked)} />
                                                    <div className="w-4 h-4 rounded border border-gray-300 peer-checked:bg-[var(--color-brand-orange)] peer-checked:border-[var(--color-brand-orange)] flex items-center justify-center transition-colors">
                                                        <svg className={`w-3 h-3 text-white ${kabulKosuullarGizlilik ? 'block' : 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </div>
                                                <span className="text-[12px] text-gray-600 leading-snug select-none">
                                                    <a href="/kosullar" target="_blank" className="text-[var(--color-brand-orange)] hover:underline" onClick={e => e.stopPropagation()}>Kullanım Koşulları</a> ve <a href="/gizlilik" target="_blank" className="text-[var(--color-brand-orange)] hover:underline" onClick={e => e.stopPropagation()}>Gizlilik Politikası</a>'nı okudum, kabul ediyorum. <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <label className="flex items-start gap-2 cursor-pointer group">
                                                <div className="relative flex items-center justify-center mt-0.5">
                                                    <input type="checkbox" className="peer sr-only" checked={kabulKvkk} onChange={(e) => setKabulKvkk(e.target.checked)} />
                                                    <div className="w-4 h-4 rounded border border-gray-300 peer-checked:bg-[var(--color-brand-orange)] peer-checked:border-[var(--color-brand-orange)] flex items-center justify-center transition-colors">
                                                        <svg className={`w-3 h-3 text-white ${kabulKvkk ? 'block' : 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </div>
                                                <span className="text-[12px] text-gray-600 leading-snug select-none">
                                                    KVKK kapsamında kişisel verilerimin işlenmesine ilişkin <a href="/kvkk" target="_blank" className="text-[var(--color-brand-orange)] hover:underline" onClick={e => e.stopPropagation()}>Aydınlatma Metni</a>'ni okudum. <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <label className="flex items-start gap-2 cursor-pointer group">
                                                <div className="relative flex items-center justify-center mt-0.5">
                                                    <input type="checkbox" className="peer sr-only" checked={kabulPazarlama} onChange={(e) => setKabulPazarlama(e.target.checked)} />
                                                    <div className="w-4 h-4 rounded border border-gray-300 peer-checked:bg-[var(--color-brand-orange)] peer-checked:border-[var(--color-brand-orange)] flex items-center justify-center transition-colors">
                                                        <svg className={`w-3 h-3 text-white ${kabulPazarlama ? 'block' : 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </div>
                                                <span className="text-[12px] text-gray-600 leading-snug select-none">
                                                    İletişim bilgilerime kampanya, duyuru ve bilgilendirme mesajları gönderilmesini kabul ediyorum.
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    {authHata && (
                                        <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-[13px] font-medium border border-red-100 leading-snug">
                                            <p>{authHata}</p>
                                        </div>
                                    )}

                                    <button type="submit" disabled={authYukleniyor}
                                        className="w-full bg-[var(--color-brand-orange)] text-white text-[13px] font-bold py-3 px-4 rounded-xl shadow-md shadow-[var(--color-brand-orange)]/20 hover:shadow-lg hover:shadow-[var(--color-brand-orange)]/30 transition-all hover:-translate-y-0.5 flex justify-center disabled:opacity-50 disabled:hover:translate-y-0">
                                        {authYukleniyor ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                                            (authMod === 'giris' ? 'Giriş Yap' : authMod === 'sifremi-unuttum' ? 'Sıfırlama Linki Gönder' : authMod === 'sifre-yenile' ? 'Şifremi Yenile' : 'Kayıt Ol')}
                                    </button>

                                    {authMod === 'giris' && (
                                        <button type="button" onClick={() => setAuthMod('sifremi-unuttum')} className="w-full text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                            Şifremi Unuttum
                                        </button>
                                    )}
                                </form>

                                {(authMod === 'giris' || authMod === 'kayit') && (
                                    <div className="space-y-4">
                                        <div className="relative my-4 flex items-center justify-center">
                                            <div className="border-t border-gray-200 w-full" />
                                            <span className="bg-white px-3 text-xs text-gray-400 font-medium absolute">veya</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={googleIleGirisYap}
                                            disabled={authYukleniyor}
                                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                            </svg>
                                            <span>Google ile Giriş Yap</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : authAdim === 2 ? (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="relative group w-24 h-24">
                                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 group-hover:border-[var(--color-brand-orange)]/50 transition-colors" />
                                        <img src={seciliAvatar || `https://api.dicebear.com/7.x/notionists/svg?seed=new`} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-white shadow-md relative z-10" />
                                        <input type="file" id="avatar-upload" accept="image/*" onChange={avatarYukle} className="hidden" />
                                        {avatarYukleniyor && (
                                            <div className="absolute inset-0 z-20 bg-white/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                                                <div className="w-6 h-6 border-2 border-[var(--color-brand-orange)] border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-gray-900 mb-1">Avatarını Seç</h4>
                                        <p className="text-[12px] text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                                            Kendi fotoğrafını yükleyebilir veya rastgele bir tasarımcı karakteri oluşturabilirsin.
                                        </p>
                                    </div>
                                    <div className="flex gap-2 w-full mt-2">
                                        <button onClick={rastgeleAvatarUret} className="flex-1 py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-[12px] font-bold hover:bg-gray-100 transition-colors">
                                            Rastgele
                                        </button>
                                        <button onClick={() => document.getElementById('avatar-upload')?.click()} className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] text-[12px] font-bold hover:bg-[var(--color-brand-orange)]/20 transition-colors">
                                            Yükle
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                    <button onClick={avatarTamamla} disabled={avatarYukleniyor} className="w-full bg-[var(--color-brand-orange)] text-white text-[13px] font-bold py-3 px-4 rounded-xl shadow-md hover:bg-[#e64d00] transition-all flex items-center justify-center gap-1">
                                        {avatarYukleniyor ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Devam Et →</span>}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {avatarOnayAcik && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-30 flex flex-col gap-3">
                                            <p className="text-[13px] text-gray-800 font-medium text-center">Yüklediğiniz kendi fotoğrafınızı silip yerine rastgele bir çizim avatar oluşturmak istediğinize emin misiniz?</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => setAvatarOnayAcik(false)} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-[12px] font-bold hover:bg-gray-200 transition-colors">İptal</button>
                                                <button onClick={rastgeleAvatarUygula} className="flex-1 py-2 rounded-xl bg-[var(--color-brand-orange)] text-white text-[12px] font-bold shadow-md shadow-[var(--color-brand-orange)]/20 hover:bg-[#e64d00] transition-colors">Evet, Değiştir</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {avatarOnayAcik && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20" onClick={() => setAvatarOnayAcik(false)} />}
                            </div>
                        ) : (
                            /* Step 3: Follow Recommended Designers & Founders */
                            <div className="space-y-4">
                                <div className="text-center space-y-1.5">
                                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-wider">
                                        ✨ Topluluğa Katıl
                                    </span>
                                    <h4 className="text-base font-bold text-gray-900">Öne Çıkan Tasarımcıları Takip Et</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                                        İlham veren kurucuları ve aktif tasarımcıları takip ederek akışını hemen renklendir.
                                    </p>
                                </div>

                                <div className="flex justify-between items-center px-1 pt-1">
                                    <span className="text-[11px] font-bold text-gray-500">Önerilen Hesaplar</span>
                                    <button
                                        type="button"
                                        onClick={toggleFollowAll}
                                        className="text-[11px] font-black text-[var(--color-brand-orange)] hover:underline"
                                    >
                                        {followedUserIds.size === recommendedUsers.length ? 'Seçimi Kaldır' : '👑 Hepsini Seç'}
                                    </button>
                                </div>

                                {/* User List */}
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                    {recommendedUsers.map((u) => {
                                        const isFollowing = followedUserIds.has(u.id);
                                        return (
                                            <div key={u.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <img
                                                        src={u.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`}
                                                        alt={u.display_name}
                                                        className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs font-bold text-gray-900 truncate block">
                                                                {u.display_name || 'Tasarımcı'}
                                                            </span>
                                                            <VerifiedBadge badge={u.verification_badge} size="xs" />
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 block truncate">
                                                            @{u.slug || 'profil'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleFollowUser(u.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                                        isFollowing
                                                            ? 'bg-emerald-500 text-white shadow-xs'
                                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {isFollowing ? '✓ Takip Ediliyor' : '+ Takip Et'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        Geç
                                    </button>
                                    <button
                                        type="button"
                                        onClick={finishOnboardingWithFollows}
                                        disabled={followSubmitting}
                                        className="flex-[2] bg-gray-900 hover:bg-black text-white text-[13px] font-bold py-3 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-1 disabled:opacity-50"
                                    >
                                        {followSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <span>Maceraya Başla 🚀</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
