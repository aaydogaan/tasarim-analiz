import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { User, X, Eye, EyeOff, MailCheck, RefreshCw, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import CustomSelect from '../components/ui/CustomSelect';

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

    const [authMod, setAuthMod] = useState<'giris' | 'kayit' | 'sifremi-unuttum' | 'sifre-yenile' | 'eposta-dogrulama'>(initialMode);
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

    // Email verification state
    const [cooldown, setCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

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

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            toast.success('🎉 E-posta adresiniz başarıyla doğrulandı! Lütfen giriş yapın.');
            setAuthMod('giris');
        }
    }, [location.search]);

    const resendVerificationEmail = async () => {
        const targetEmail = (unconfirmedEmail || authEmail).trim();
        if (!targetEmail) return;
        setResendLoading(true);
        const emailRedirectUrl = `${window.location.origin}/auth?verified=true`;
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: targetEmail,
            options: {
                emailRedirectTo: emailRedirectUrl,
            }
        });
        setResendLoading(false);
        if (error) {
            toast.error(`E-posta gönderilemedi: ${error.message}`);
        } else {
            toast.success('Doğrulama e-postası tekrar gönderildi!');
            setCooldown(60);
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
                    if (error.message?.includes('Email not confirmed') || (error.status === 400 && error.message?.toLowerCase().includes('confirm'))) {
                        setUnconfirmedEmail(authEmail);
                        throw new Error('E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanıza gelen doğrulama bağlantısına tıklayın.');
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
                const emailRedirectUrl = `${window.location.origin}/auth?verified=true`;
                let signUpRes = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: authSifre,
                    options: {
                        emailRedirectTo: emailRedirectUrl,
                        data: {
                            full_name: authAdSoyad || 'Tasarımcı',
                            display_name: authAdSoyad || 'Tasarımcı'
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

                if (userRecord) {
                    try {
                        const baseName = (authAdSoyad || 'Tasarimci').toLowerCase()
                            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '');

                        let finalSlug = baseName || 'tasarimci';
                        let counter = 1;
                        let success = false;

                        while (!success && counter < 10) {
                            const { error } = await supabase.from('profiles').upsert({
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

                            if (!error) {
                                success = true;
                            } else {
                                finalSlug = `${baseName}-${counter}`;
                                counter++;
                            }
                        }
                    } catch (_) { }

                    // Eğer e-posta doğrulaması gerekiyorsa
                    if (!signUpRes.data?.session || !userRecord.confirmed_at) {
                        setAuthMod('eposta-dogrulama');
                        setCooldown(60);
                        toast.success('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
                        return;
                    }
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

    const avatarTamamla = async () => {
        setAvatarYukleniyor(true);
        try {
            await supabase.auth.updateUser({
                data: { avatar_url: seciliAvatar }
            });
            // Update profile as well
            const sessionRes = await supabase.auth.getSession();
            const user = sessionRes.data.session?.user;
            if (user) {
                await supabase.from('profiles').update({ avatar_url: seciliAvatar }).eq('id', user.id);
            }
            navigate('/');
        } catch (err: any) {
            toast.error('Avatar kaydedilirken hata: ' + err.message);
        } finally {
            setAvatarYukleniyor(false);
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
                            Tasarım süreçlerini<br/>
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
                                authMod === 'eposta-dogrulama' ? 'E-postanı Doğrula' :
                                authMod === 'sifre-yenile' ? 'Şifreni Yenile' :
                                authMod === 'sifremi-unuttum' ? 'Şifremi Unuttum' :
                                authMod === 'giris' ? 'Tekrar Hoş Geldin!' : 'Hesap Oluştur'
                            ) : (
                                'Profilini Tamamla'
                            )}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {authAdim === 1 ? (
                                authMod === 'eposta-dogrulama' ? 'Hesabını aktifleştirmek için e-postanı kontrol et.' :
                                authMod === 'sifre-yenile' ? 'Yeni şifreni belirleyerek devam et.' :
                                authMod === 'sifremi-unuttum' ? 'E-posta adresini gir, sıfırlama linki gönderelim.' :
                                authMod === 'giris' ? 'Hesabına giriş yap ve kaldığın yerden devam et.' : 'Hemen ücretsiz bir hesap oluştur.'
                            ) : (
                                'Toplulukta seni nasıl tanıyacaklar?'
                            )}
                        </p>
                    </div>

                    {authAdim === 1 && authMod !== 'sifre-yenile' && authMod !== 'sifremi-unuttum' && authMod !== 'eposta-dogrulama' && (
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
                                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-[13px] font-medium border border-red-100 leading-snug space-y-2">
                                    <p>{authHata}</p>
                                    {unconfirmedEmail && (
                                        <button
                                            type="button"
                                            onClick={resendVerificationEmail}
                                            disabled={resendLoading || cooldown > 0}
                                            className="text-xs font-bold text-[#FF5500] hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                        >
                                            {resendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                            {cooldown > 0 ? `Doğrulama Bağlantısını Tekrar Gönder (${cooldown}s)` : 'Doğrulama Bağlantısını Tekrar Gönder'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {authMod === 'eposta-dogrulama' ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-4 space-y-6"
                                >
                                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                                        <div className="absolute inset-0 bg-[#FF5500]/20 rounded-full animate-ping opacity-75" />
                                        <div className="relative w-20 h-20 bg-gradient-to-tr from-[#FF5500] to-orange-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-[#FF5500]/30">
                                            <MailCheck className="w-10 h-10" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                                            <strong className="text-gray-900 block text-base mb-1">{authEmail}</strong>
                                            adresine bir doğrulama bağlantısı gönderdik. Lütfen e-posta kutunu kontrol et.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-orange-50/80 border border-orange-100 rounded-2xl text-xs text-gray-600 text-left flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-[#FF5500] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-gray-900 mb-0.5">Spam / Önemsiz Kutusunu Kontrol Et</p>
                                            <p>E-posta birkaç dakika içinde ulaşmazsa spam/junk klasörüne bakmayı unutma.</p>
                                        </div>
                                    </div>

                                    <div className="pt-2 space-y-3">
                                        <button
                                            type="button"
                                            onClick={resendVerificationEmail}
                                            disabled={resendLoading || cooldown > 0}
                                            className="w-full py-3.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            {resendLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                            {cooldown > 0 ? `Tekrar Gönder (${cooldown}s)` : 'Doğrulama E-postasını Tekrar Gönder'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setAuthMod('giris'); setAuthHata(null); }}
                                            className="w-full py-3 px-4 bg-transparent hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl transition-colors"
                                        >
                                            Giriş Yap Ekranına Dön
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button type="submit" disabled={authYukleniyor}
                                    className="w-full bg-[var(--color-brand-orange)] text-white text-[13px] font-bold py-3 px-4 rounded-xl shadow-md shadow-[var(--color-brand-orange)]/20 hover:shadow-lg hover:shadow-[var(--color-brand-orange)]/30 transition-all hover:-translate-y-0.5 flex justify-center disabled:opacity-50 disabled:hover:translate-y-0">
                                    {authYukleniyor ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                                        (authMod === 'giris' ? 'Giriş Yap' : authMod === 'sifremi-unuttum' ? 'Sıfırlama Linki Gönder' : authMod === 'sifre-yenile' ? 'Şifremi Yenile' : 'Kayıt Ol')}
                                </button>
                            )}

                            {authMod === 'giris' && (
                                <button type="button" onClick={() => setAuthMod('sifremi-unuttum')} className="w-full text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                    Şifremi Unuttum
                                </button>
                            )}
                        </form>
                    ) : (
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
                                <button onClick={avatarTamamla} disabled={avatarYukleniyor} className="w-full bg-gray-900 text-white text-[13px] font-bold py-3 px-4 rounded-xl shadow-md hover:bg-black transition-all flex justify-center">
                                    {avatarYukleniyor ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Maceraya Başla'}
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
                    )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
