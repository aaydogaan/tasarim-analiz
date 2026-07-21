import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Shield, LogOut, Check, Upload, Shuffle, Lock, AlertCircle, X } from 'lucide-react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface ProfilePageProps {
  kullanici: any;
  supabase: any;
  goHome: () => void;
}

export default function ProfilePage({ kullanici, supabase, goHome }: ProfilePageProps) {
  const [tab, setTab] = useState<'hesap' | 'guvenlik'>('hesap');
  
  const [adSoyad, setAdSoyad] = useState(kullanici?.user_metadata?.full_name || '');
  const [seciliAvatar, setSeciliAvatar] = useState(kullanici?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${kullanici?.id}`);
  
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  
  const [yukleniyor, setYukleniyor] = useState(false);
  const [avatarYukleniyor, setAvatarYukleniyor] = useState(false);
  const [avatarOnayAcik, setAvatarOnayAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync kullanici verileri
  useEffect(() => {
    if (kullanici?.user_metadata) {
      if (kullanici.user_metadata.full_name) {
        setAdSoyad(kullanici.user_metadata.full_name);
      }
      if (kullanici.user_metadata.avatar_url) {
        setSeciliAvatar(kullanici.user_metadata.avatar_url);
      }
    }
  }, [kullanici]);

  if (!kullanici) return null;

  const rastgeleAvatarUret = async () => {
    if (seciliAvatar && !seciliAvatar.includes('dicebear.com')) {
      setAvatarOnayAcik(true);
      return;
    }
    await rastgeleAvatarUygula();
  };

  const rastgeleAvatarUygula = async () => {
    setAvatarOnayAcik(false);
    const yeniAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`;
    setSeciliAvatar(yeniAvatar);
    
    // Rastgele avatarı da hemen kaydet
    try {
      await supabase.auth.updateUser({
        data: { avatar_url: yeniAvatar }
      });
    } catch(err) {}
  };

  const avatarYukle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarYukleniyor(true);
    setHata(null);
    try {
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
        },
      });

      const fileName = `avatars/${kullanici?.id || Date.now()}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
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
      
      // Otomatik olarak profili de güncelle
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      setBasari('Avatar başarıyla yüklendi ve profilinize kaydedildi!');
      setTimeout(() => setBasari(null), 3000);
    } catch (err: any) {
      console.error('Yükleme hatası:', err);
      setHata('Avatar yüklenirken bir hata oluştu: ' + err.message);
    } finally {
      setAvatarYukleniyor(false);
    }
  };

  const bilgileriKaydet = async () => {
    setHata(null);
    setBasari(null);
    setYukleniyor(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: adSoyad,
          avatar_url: seciliAvatar
        }
      });
      
      if (error) throw error;
      setBasari('Profil bilgileriniz başarıyla güncellendi!');
      setTimeout(() => goHome(), 2000);
    } catch (err: any) {
      setHata(err.message || 'Güncelleme sırasında bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  const sifreGuncelle = async () => {
    if (sifre !== sifreTekrar) {
      setHata('Şifreler birbiriyle eşleşmiyor.');
      return;
    }
    if (sifre.length < 6) {
      setHata('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setHata(null);
    setBasari(null);
    setYukleniyor(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: sifre
      });
      
      if (error) throw error;
      setBasari('Şifreniz başarıyla güncellendi!');
      setSifre('');
      setSifreTekrar('');
      setTimeout(() => setBasari(null), 3000);
    } catch (err: any) {
      setHata(err.message || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-2xl mx-auto my-12" style={{ zIndex: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[32px] shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/50">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Profil Ayarları</h3>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1 font-medium">Hesabınızı ve güvenliğinizi yönetin.</p>
          </div>
          <button onClick={goHome} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors self-start">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Tabs */}
          <div className="flex bg-[var(--bg-primary)] p-1 rounded-2xl mb-8 relative border border-[var(--border-primary)]/50">
            <div 
              className="absolute inset-y-1 w-[calc(50%-4px)] bg-[var(--card-bg)] rounded-xl shadow-sm transition-all duration-300 ease-out border border-[var(--border-primary)]/50"
              style={{ left: tab === 'hesap' ? '4px' : 'calc(50%)' }}
            />
            <button onClick={() => { setTab('hesap'); setHata(null); setBasari(null); }} className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative z-10 flex items-center justify-center gap-2 ${tab === 'hesap' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <User className="w-4 h-4" /> Hesap
            </button>
            <button onClick={() => { setTab('guvenlik'); setHata(null); setBasari(null); }} className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative z-10 flex items-center justify-center gap-2 ${tab === 'guvenlik' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Lock className="w-4 h-4" /> Güvenlik
            </button>
          </div>

          <AnimatePresence mode="wait">
            {hata && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                <div className="flex items-start gap-2 text-rose-600 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100/50">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[13px] font-medium leading-relaxed">{hata}</p>
                </div>
              </motion.div>
            )}

            {basari && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                <div className="flex items-start gap-2 text-emerald-600 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[13px] font-medium leading-relaxed">{basari}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {tab === 'hesap' ? (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-5 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5500] to-orange-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative w-full h-full rounded-full border-4 border-[var(--card-bg)] shadow-xl overflow-hidden bg-[var(--bg-primary)]">
                    {avatarYukleniyor ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[#FF5500]/30 border-t-[#FF5500] rounded-full animate-spin" />
                      </div>
                    ) : (
                      <img src={seciliAvatar} alt="Profil Avatar" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 w-full justify-center">
                  <button onClick={rastgeleAvatarUret} disabled={avatarYukleniyor} className="py-2.5 px-5 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl text-[13px] font-semibold transition-colors flex items-center gap-2">
                    <Shuffle className="w-4 h-4" /> Rastgele
                  </button>
                  <label className="py-2.5 px-5 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl text-[13px] font-semibold transition-colors flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Yükle
                    <input type="file" accept="image/*" className="hidden" onChange={avatarYukle} disabled={avatarYukleniyor} />
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                <div className="relative group">
                  <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">E-posta Adresi <span className="text-[10px] bg-[var(--bg-primary)] px-2 py-0.5 rounded-full ml-2 border border-[var(--border-primary)]">Değiştirilemez</span></p>
                  <div className="w-full px-4 py-3.5 bg-[var(--bg-primary)]/50 border border-[var(--border-primary)] rounded-2xl text-[14px] font-medium text-[var(--text-secondary)] cursor-not-allowed">
                    {kullanici.email}
                  </div>
                </div>

                <div className="relative group">
                  <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">Ad Soyad</p>
                  <input type="text" placeholder="Adınız ve Soyadınız" value={adSoyad} onChange={e => setAdSoyad(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl text-[14px] text-[var(--text-primary)] outline-none focus:border-[#FF5500] focus:ring-4 focus:ring-[#FF5500]/10 transition-all font-medium placeholder:text-[var(--text-secondary)]/50" />
                </div>
              </div>

              <button onClick={bilgileriKaydet} disabled={yukleniyor || avatarYukleniyor}
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-[#FF5500] to-orange-500 text-white text-sm font-bold shadow-[0_8px_16px_-6px_rgba(255,85,0,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(255,85,0,0.5)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
                <span className="relative z-10 flex items-center gap-2">
                  {yukleniyor ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-5 h-5" />}
                  {yukleniyor ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="relative group">
                <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">Yeni Şifre</p>
                <input type="password" placeholder="En az 6 karakter" value={sifre} onChange={e => setSifre(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl text-[14px] text-[var(--text-primary)] outline-none focus:border-[#FF5500] focus:ring-4 focus:ring-[#FF5500]/10 transition-all font-medium placeholder:text-[var(--text-secondary)]/50" />
              </div>

              <div className="relative group">
                <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">Yeni Şifre (Tekrar)</p>
                <input type="password" placeholder="Şifrenizi tekrar girin" value={sifreTekrar} onChange={e => setSifreTekrar(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl text-[14px] text-[var(--text-primary)] outline-none focus:border-[#FF5500] focus:ring-4 focus:ring-[#FF5500]/10 transition-all font-medium placeholder:text-[var(--text-secondary)]/50" />
              </div>

              <button onClick={sifreGuncelle} disabled={yukleniyor || !sifre || !sifreTekrar}
                className="w-full py-4 mt-6 rounded-2xl bg-[#FF5500] text-white text-sm font-bold shadow-[0_8px_16px_-6px_rgba(255,85,0,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(255,85,0,0.5)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                {yukleniyor ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-5 h-5" />}
                {yukleniyor ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Avatar Onay Modalı */}
      <AnimatePresence>
        {avatarOnayAcik && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setAvatarOnayAcik(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 bg-orange-100 text-[var(--color-brand-orange)] rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Emin misiniz?</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Şu anda özel olarak yüklediğiniz bir profil fotoğrafınız var. Onay verirseniz bu fotoğraf silinecek ve rastgele bir avatar ile değiştirilecektir.
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setAvatarOnayAcik(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={rastgeleAvatarUygula}
                    className="flex-1 py-3 px-4 bg-[var(--color-brand-orange)] hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors shadow-sm"
                  >
                    Değiştir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
