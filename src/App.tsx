import React, { useState, useRef, useEffect } from "react";
import Lenis from 'lenis';
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Upload, ChevronRight, ChevronLeft, RotateCcw, Palette, Type as TypeIcon, Layout, Grid, Sparkles, Smartphone, Building2, ShoppingBag, Printer, BarChart2, Share2, User, X, LogOut, Copy, Check, AlertCircle, Globe, ArrowUpRight, Layers, Code, Scan, Download, ExternalLink, BookOpen, Link as LinkIcon, FileText, Clock, Settings, Home, Plus, Target } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from "./lib/supabase";
import { Vitrin } from "./pages/Vitrin";
import TextPressure from "./components/ui/TextPressure";
import LandingPage from "./pages/LandingPage";
import Footer from "./components/ui/Footer";
import Community from "./pages/Community";
import Header from "./components/ui/Header";
import ProfilePage from "./pages/ProfilePage";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Tools from "./pages/Tools";
import TypographyLab from "./pages/TypographyLab";
import LiveActivityFeed from "./components/ui/LiveActivityFeed";
import AnalizEtButton from "./components/ui/AnalizEtButton";
import ScanningOverlay from "./components/ui/ScanningOverlay";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const KARUSEL_IPUCLARI = [
  "💡 Zıt (kontrast) renklerin bir arada kullanımı, butonların ve harekete geçirici mesajların algılanmasını %40 artırır.",
  "💡 Gestalt prensiplerine göre, birbirine yakın duran tasarımsal ögeler beyin tarafından otomatik olarak gruplandırılır.",
  "💡 Renklerin psikolojisi vardır: Mavi 'Güven', Kırmızı 'Tutku', Yeşil ise 'Doğa ve Büyüme' hissi verir.",
  "💡 Tasarımdaki 'negatif boş alanlar' kusur değildir; aksine odaklanmayı sağlar ve lüks hissettirir.",
  "💡 İnsan gözünün oluşturduğu en estetik denge şekli matematikteki 'Altın Oran' (1.618) formülünde gizlidir.",
  "💡 Metin hiyerarşisi, kullanıcının sayfada nereye bakacağını saniyeler içinde zihinsel olarak yönlendirir."
];
type TasarimTuru = "Sosyal Medya" | "Kurumsal" | "E-Ticaret" | "Baskı Materyali";

const kriterlerMap: Record<TasarimTuru, { key: string; label: string; emoji: React.ReactNode }[]> = {
  "Sosyal Medya": [
    { key: "renk", label: "Dikkat Çekicilik", emoji: <Sparkles className="w-4 h-4" /> },
    { key: "font", label: "Mobil Okunabilirlik", emoji: <Smartphone className="w-4 h-4" /> },
    { key: "butunluk", label: "Marka Tutarlılığı", emoji: <Layout className="w-4 h-4" /> },
    { key: "kompozisyon", label: "CTA Netliği", emoji: <Grid className="w-4 h-4" /> },
  ],
  "Kurumsal": [
    { key: "renk", label: "Profesyonel Çekicilik", emoji: <Palette className="w-4 h-4" /> },
    { key: "font", label: "Tipografi", emoji: <TypeIcon className="w-4 h-4" /> },
    { key: "butunluk", label: "Marka Uyumu", emoji: <Building2 className="w-4 h-4" /> },
    { key: "kompozisyon", label: "Düzen & Hiyerarşi", emoji: <Grid className="w-4 h-4" /> },
  ],
  "E-Ticaret": [
    { key: "renk", label: "Ürün Görünürlüğü", emoji: <Palette className="w-4 h-4" /> },
    { key: "font", label: "Okunabilirlik", emoji: <TypeIcon className="w-4 h-4" /> },
    { key: "butunluk", label: "Güven Sinyalleri", emoji: <ShoppingBag className="w-4 h-4" /> },
    { key: "kompozisyon", label: "CTA & Dönüşüm", emoji: <Grid className="w-4 h-4" /> },
  ],
  "Baskı Materyali": [
    { key: "renk", label: "Renk & Baskı Uyumu", emoji: <Printer className="w-4 h-4" /> },
    { key: "font", label: "Tipografi", emoji: <TypeIcon className="w-4 h-4" /> },
    { key: "butunluk", label: "Tasarım Bütünlüğü", emoji: <Layout className="w-4 h-4" /> },
    { key: "kompozisyon", label: "Baskı Hazırlığı", emoji: <Grid className="w-4 h-4" /> },
  ],
};

const tasarimTuruConfig: { id: TasarimTuru; icon: React.ReactNode; desc: string }[] = [
  { id: "Sosyal Medya", icon: <Smartphone className="w-5 h-5" />, desc: "Post, Story, Reels, Banner" },
  { id: "Kurumsal", icon: <Building2 className="w-5 h-5" />, desc: "Kartvizit, Sunum, Antetli" },
  { id: "E-Ticaret", icon: <ShoppingBag className="w-5 h-5" />, desc: "Ürün, Banner, Kampanya" },
  { id: "Baskı Materyali", icon: <Printer className="w-5 h-5" />, desc: "Broşür, Afiş, Katalog" },
];

const sosyalMedyaPlatformlari = [
  "Instagram Post", "Instagram Story", "Instagram Reels",
  "Twitter / X", "LinkedIn", "TikTok", "Facebook",
];

const isletmeTurleri = [
  "E-Ticaret", "Cafe & Restoran", "Sağlık & Klinik", "Eğitim", "Güzellik Salonu", "Diğer"
];

const gc = {
  card: "bg-white/80 backdrop-blur-2xl border border-[var(--color-brand-dark)]/10 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
  label: "text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--color-brand-dark)]/30 ml-1 mb-2 block",
  input: "w-full bg-white/50 border border-[var(--color-brand-dark)]/5 text-[var(--color-brand-dark)] rounded-[20px] px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)]/30 focus:bg-white transition-all placeholder:text-[var(--color-brand-dark)]/20 shadow-inner",
};

function GlassCard({ children, className = "", glowColor = "blue", delay = 0 }: { children: React.ReactNode; className?: string; glowColor?: string; delay?: number; key?: string }) {
  const glowMap: Record<string, string> = {
    blue: "from-[var(--color-brand-orange)]/10 via-white/50",
    purple: "from-[var(--color-brand-orange)]/10 via-white/50",
    green: "from-[var(--color-brand-orange)]/10 via-white/50",
    cyan: "from-[var(--color-brand-orange)]/10 via-white/50",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={`relative group overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-2xl ${className}`}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      {/* Bottom glow */}
      <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-gradient-to-t ${glowMap[glowColor] || glowMap.blue} to-transparent blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700`} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const halfCirc = circ / 2;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"; // Modern green/yellow/red

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[140px] h-[70px] overflow-hidden">
        <svg width={140} height={140} viewBox="0 0 140 140" className="transform rotate-180">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-brand-dark)" strokeOpacity="0.05" strokeWidth="14" strokeDasharray={`${halfCirc} ${halfCirc}`} />
          <motion.circle
            cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={`${halfCirc} ${halfCirc}`}
            initial={{ strokeDashoffset: halfCirc }}
            animate={{ strokeDashoffset: halfCirc - (score / 100) * halfCirc }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute left-0 right-0 bottom-0 flex flex-col items-center justify-end">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[var(--color-brand-dark)] text-4xl font-extrabold leading-none tracking-tighter"
          >
            {score}
          </motion.span>
          <span className="text-[var(--color-brand-dark)]/40 text-[8px] font-black uppercase tracking-widest mt-1 mb-1">TOPLAM PUAN</span>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ puan, max = 25 }: { puan: number; max?: number }) {
  const pct = (puan / max) * 100;
  const color = pct >= 75 ? "#38bdf8" : pct >= 50 ? "#fbbf24" : "#f87171";

  return (
    <div className="h-2 bg-[var(--color-brand-dark)]/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}55, 0 0 4px ${color}88` }}
      />
    </div>
  );
}

function StepIndicator({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
        ${done ? "bg-[#ff4d00] text-white" : active ? "bg-[#ff4d00]/20 border-2 border-[#ff4d00] text-[#ff4d00]" : "bg-white border border-[var(--color-brand-dark)]/10 text-[var(--color-brand-dark)]/30"}
      `}>
        {done ? "✓" : n}
      </div>
    </div>
  );
}

const getSessionData = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export default function App() {
  // Lenis Smooth Scroll Initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const initGorsel = getSessionData('ra_gorsel', null);
  const initGorselBase64 = getSessionData('ra_gorselBase64', null);
  let initAdim = getSessionData('ra_adim', 1);

  // Eğer session'dan adım 2 veya 3 geliyorsa ancak görsel boyuttan dolayı kaydedilememişse başa döndür.
  if (initAdim > 1 && (!initGorsel || !initGorselBase64)) {
    initAdim = 1;
  }

  const [adim, setAdim] = useState(initAdim);
  const navigate = useNavigate();
  const location = useLocation();
  const gorunum = location.pathname.substring(1) || 'landing';
  const [gorsel, setGorsel] = useState<string | null>(initGorsel);
  const [gorselBase64, setGorselBase64] = useState<string | null>(initGorselBase64);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploadMod, setUploadMod] = useState<'dosya' | 'link'>('dosya');
  const [revizeGorsel, setRevizeGorsel] = useState<string | null>(() => getSessionData('ra_revizeGorsel', null));
  const [tasarimTuru, setTasarimTuru] = useState<TasarimTuru>(() => getSessionData('ra_tasarimTuru', 'Sosyal Medya'));
  const [platform, setPlatform] = useState<string>(() => getSessionData('ra_platform', 'Instagram Post'));
  const [isletme, setIsletme] = useState(() => getSessionData('ra_isletme', "E-Ticaret"));
  const [digerIsletme, setDigerIsletme] = useState(() => getSessionData('ra_digerIsletme', ""));
  const [sorular, setSorular] = useState(() => getSessionData('ra_sorular', { markaAdi: "", kurumselRenk: "", isYapisi: "", hedefKitle: "", slogan: "" }));
  const [yukleniyor, setYukleniyor] = useState(false);
  const [revizeYukleniyor, setRevizeYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<any>(() => getSessionData('ra_sonuc', null));
  // Dark mode kaldırıldı

  const kriterler = kriterlerMap[tasarimTuru];
  const [hata, setHata] = useState<string | null>(null);
  const [seciliGorsel, setSeciliGorsel] = useState<string | null>(null);
  const [acikKriter, setAcikKriter] = useState<string | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'genel' | 'analizlerim' | 'raporlar' | 'gecmis' | 'tercihler'>('genel');
  const [kopyalananRenk, setKopyalananRenk] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Stats modal
  const [statsAcik, setStatsAcik] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [statsYukleniyor, setStatsYukleniyor] = useState(false);

  // Share
  const [paylasimKopyalandi, setPaylasimKopyalandi] = useState(false);
  const [vitrindeYayinlandi, setVitrindeYayinlandi] = useState(false);
  const [yayinlaniyor, setYayinlaniyor] = useState(false);

  // Auth
  const [authAcik, setAuthAcik] = useState(false);
  const [authMod, setAuthMod] = useState<'giris' | 'kayit'>('giris');
  const [authEmail, setAuthEmail] = useState('');
  const [authSifre, setAuthSifre] = useState('');
  const [authAdSoyad, setAuthAdSoyad] = useState('');
  const [authSifreTekrar, setAuthSifreTekrar] = useState('');
  // Auth Adım 2 (Avatar)
  const [authAdim, setAuthAdim] = useState<1 | 2>(1);
  const [seciliAvatar, setSeciliAvatar] = useState<string>('');
  const [avatarYukleniyor, setAvatarYukleniyor] = useState(false);
  
  // Profile Modal (Kaldırıldı)

  const [authYukleniyor, setAuthYukleniyor] = useState(false);
  const [authHata, setAuthHata] = useState<string | null>(null);
  const [kullanici, setKullanici] = useState<any>(null);
  const [authUyariAcik, setAuthUyariAcik] = useState(false);

  // Auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setKullanici(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setKullanici(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (gorunum !== 'app' || adim !== 1) return;
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) handleDosya(blob);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [gorunum, adim]);

  // Modal Escape Key & Scroll Lock for seciliGorsel
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSeciliGorsel(null);
    };
    window.addEventListener("keydown", handleEsc);

    if (seciliGorsel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [seciliGorsel]);

  // Karusel Yükleme İpuçları
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (yukleniyor) {
      interval = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % KARUSEL_IPUCLARI.length);
      }, 4500);
    } else {
      setLoadingTipIndex(0);
    }
    return () => clearInterval(interval);
  }, [yukleniyor]);

  const girisYap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthYukleniyor(true); setAuthHata(null);
    try {
      if (authMod === 'giris') {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authSifre });
        if (error) throw error;
        setAuthAcik(false);
      } else {
        if (authSifre !== authSifreTekrar) {
          throw new Error('Şifreler uyuşmuyor.');
        }
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authSifre,
          options: {
            data: { full_name: authAdSoyad }
          }
        });
        if (error) throw error;
        
        // Step 1 done, move to Step 2
        setAuthAdim(2);
        setSeciliAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`);
      }
    } catch (error: any) {
      setAuthHata(error.message);
    } finally {
      setAuthYukleniyor(false);
    }
  };

  const rastgeleAvatarUret = () => {
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
      setAuthAcik(false);
    } catch (err: any) {
      toast.error('Avatar kaydedilirken hata: ' + err.message);
    } finally {
      setAvatarYukleniyor(false);
    }
  };

  const cikisYap = async () => { await supabase.auth.signOut(); };

  const statsAc = async () => {
    setStatsAcik(true);
    setStatsYukleniyor(true);
    try {
      const gecerliToken = (await supabase.auth.getSession()).data.session?.access_token;
      const resp = await fetch('/api/stats', {
        headers: gecerliToken ? { "Authorization": `Bearer ${gecerliToken}` } : {}
      });
      setStatsData(await resp.json());
    } catch (e) { console.error('Stats hata:', e); }
    setStatsYukleniyor(false);
  };

  const paylasimLinkiKopyala = () => {
    if (!sonuc?._analiz_id) return;
    const link = `${window.location.origin}/share/${sonuc._analiz_id}`;
    navigator.clipboard.writeText(link);
    setPaylasimKopyalandi(true);
    setTimeout(() => setPaylasimKopyalandi(false), 2000);
  };

  const renkKopyala = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setKopyalananRenk(hex);
    setTimeout(() => setKopyalananRenk(null), 2000);
  };

  const indirPDF = async () => {
    const element = document.getElementById('analiz-raporu');
    if (!element) return;

    setYukleniyor(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`revize-ai-analiz-${sonuc?.markaAdi || 'tasarim'}.pdf`);
    } catch (err) {
      console.error('PDF Hatası:', err);
      toast.error('PDF oluşturulamadı. Lütfen tekrar deneyin.');
    }
    setYukleniyor(false);
  };

  const vitrindeYayinla = async () => {
    if (!sonuc?._analiz_id) return false;

    // Güvenlik: Eğer guest iseler veya login olmadan yapmışlarsa _analiz_id olmayabilir veya supabase izin vermeyebilir,
    // Ancak zaten guestMode false olduğunda ekleniyor.
    const { error } = await supabase
      .from('analizler')
      .update({ paylasim_aktif: true })
      .eq('id', sonuc._analiz_id);

    if (!error) {
      setVitrindeYayinlandi(true);
      return true;
    } else {
      console.error(error);
      toast.error('Yayınlanırken bir hata oluştu: ' + error.message);
      return false;
    }
  };


  useEffect(() => {
    try {
      sessionStorage.setItem('ra_adim', JSON.stringify(adim));
      if (gorsel) sessionStorage.setItem('ra_gorsel', JSON.stringify(gorsel));
      if (gorselBase64) sessionStorage.setItem('ra_gorselBase64', JSON.stringify(gorselBase64));
      if (revizeGorsel) sessionStorage.setItem('ra_revizeGorsel', JSON.stringify(revizeGorsel));
      sessionStorage.setItem('ra_tasarimTuru', JSON.stringify(tasarimTuru));
      sessionStorage.setItem('ra_platform', JSON.stringify(platform));
      sessionStorage.setItem('ra_isletme', JSON.stringify(isletme));
      sessionStorage.setItem('ra_digerIsletme', JSON.stringify(digerIsletme));
      sessionStorage.setItem('ra_sorular', JSON.stringify(sorular));
      if (sonuc) sessionStorage.setItem('ra_sonuc', JSON.stringify(sonuc));
      if (gorunum) sessionStorage.setItem('ra_gorunum', JSON.stringify(gorunum));
    } catch (e) {
      console.warn("SessionStorage aşıldı.", e);
    }
  }, [adim, gorsel, gorselBase64, revizeGorsel, tasarimTuru, platform, isletme, digerIsletme, sorular, sonuc, gorunum]);

  const handleLink = (url: string) => {
    if (!url) return;
    setSonuc(null); setHata(null); setRevizeGorsel(null);
    setGorselBase64(null);
    setGorsel(url);
    setImageUrl(url);
    setAdim(2);
  };

  const handleDosya = (f: File) => {
    if (!f) return;
    setSonuc(null); setHata(null); setRevizeGorsel(null);

    // Yükleniyor durumunu geçici olarak gösterelim (Ağır görsellerde donmayı önlemek için)
    setYukleniyor(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const d = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const max_dim = 1600; // Maksimum uzun kenar

        if (width < 2 || height < 2) {
          setHata("Görsel çözünürlüğü çok düşük. Lütfen geçerli bir tasarım yükleyin.");
          setYukleniyor(false);
          return;
        }

        if (width > max_dim || height > max_dim) {
          if (width > height) {
            height = Math.round((height * max_dim) / width);
            width = max_dim;
          } else {
            width = Math.round((width * max_dim) / height);
            height = max_dim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setGorsel(jpegDataUrl);
        setGorselBase64(jpegDataUrl.split(",")[1]);
        setYukleniyor(false);
        setAdim(2);
      };
      img.onerror = () => {
        setHata("Görsel işlenirken bir hata oluştu.");
        setYukleniyor(false);
      };
      img.src = d;
    };
    reader.onerror = () => {
      setHata("Dosya okunamadı.");
      setYukleniyor(false);
    };
    reader.readAsDataURL(f);
  };

  const analiz = () => {
    if (!gorsel && !imageUrl && !gorselBase64) return;
    if (!kullanici) {
      setAuthUyariAcik(true);
      return;
    }
    analiziBaslat(false);
  };

  const analiziBaslat = async (guestMode: boolean) => {
    setYukleniyor(true); setHata(null); setRevizeGorsel(null);
    try {
      const gecerliToken = (await supabase.auth.getSession()).data.session?.access_token;

      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(gecerliToken ? { "Authorization": `Bearer ${gecerliToken}` } : {})
        },
        body: JSON.stringify({
          imageBase64: gorselBase64 || undefined,
          imageUrl: imageUrl || gorsel || undefined,
          isletme: isletme === "Diğer" ? (digerIsletme || "Bilinmiyor") : isletme,
          tasarimTuru,
          platform: tasarimTuru === "Sosyal Medya" ? platform : undefined,
          sorular,
          guestMode
        }),
      });

      // Handle non-JSON responses (timeout, server error, etc.)
      const contentType = resp.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("application/json")) {
        const text = await resp.text();
        if (!text || text.trim().length === 0) {
          throw new Error("Sunucu boş yanıt döndürdü. Lütfen tekrar deneyin.");
        }
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Sunucu geçersiz yanıt döndürdü. Lütfen tekrar deneyin.");
        }
      } else {
        // Response is not JSON (e.g. HTML error page, timeout)
        const text = await resp.text().catch(() => "");
        console.error("Non-JSON response:", resp.status, text.substring(0, 200));
        if (resp.status === 504) {
          throw new Error("İstek zaman aşımına uğradı. Daha küçük bir görsel ile tekrar deneyin.");
        }
        throw new Error(`Sunucu hatası (${resp.status}). Lütfen tekrar deneyin.`);
      }

      if (!resp.ok) {
        throw new Error(data?.error || "Analiz sırasında bir hata oluştu.");
      }

      setSonuc(data);
      setAdim(3);

      // Start generating the revised image in the background
      // revizeEt(data.oneri); // Removed as per instruction
    } catch (err: any) {
      console.error("Analiz hatası:", err);
      setHata(err.message || "Analiz sırasında beklenmeyen bir hata oluştu.");
    }
    setYukleniyor(false);
  };

  const revizeEt = async (oneri: string) => {
    if (!gorselBase64) return;
    setRevizeYukleniyor(true);
    try {
      const resp = await fetch("/api/revise", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          imageBase64: gorselBase64,
          oneri,
          sorular: { markaAdi: sorular.markaAdi },
          isletme: isletme === "Diğer" ? (digerIsletme || "Bilinmiyor") : isletme,
        }),
      });

      const contentType = resp.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("application/json")) {
        const text = await resp.text();
        if (text && text.trim().length > 0) {
          try {
            data = JSON.parse(text);
          } catch {
            console.error("Revize JSON parse hatası");
          }
        }
      }

      if (!resp.ok) {
        throw new Error(data?.error || "Revize sırasında bir hata oluştu");
      }

      if (data?.imageBase64) {
        setRevizeGorsel(`data:image/png;base64,${data.imageBase64}`);
      }
    } catch (err) {
      console.error("Revize hatası:", err);
    }
    setRevizeYukleniyor(false);
  };

  const sifirla = () => {
    sessionStorage.clear();
    setAdim(1); setGorsel(null); setGorselBase64(null); setRevizeGorsel(null); setSonuc(null); setHata(null);
    setSorular({ markaAdi: "", kurumselRenk: "", isYapisi: "", hedefKitle: "", slogan: "" });
    setDigerIsletme(""); setTasarimTuru("Sosyal Medya"); setPlatform("Instagram Post");
    setImageUrl(""); setUploadMod('dosya');
  };

  const goHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen selection:bg-[#ff4d00] selection:text-white font-sans flex flex-col justify-between overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Studio Grid Background */}
      {gorunum === 'app' && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '30px 30px', color: '#CBD5E1' }}
        />
      )}

      <Header
        kullanici={kullanici}
        onStatsClick={statsAc}
        onLogoutClick={cikisYap}
        onAuthClick={() => setAuthAcik(true)}
      />

      <Routes>
        <Route path="/" element={
          <LandingPage
            onStart={() => {
              navigate('/app');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onVitrinClick={() => {
              navigate('/vitrin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCommunityClick={() => {
              navigate('/community');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        } />
        <Route path="/vitrin" element={
          <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 mt-20">
            <Vitrin />
          </main>
        } />
        <Route path="/community" element={
          <main className="flex-1 w-full mt-20">
            <Community />
          </main>
        } />
        <Route path="/pricing" element={
          <main className="flex-1 w-full mt-20">
            <Pricing />
          </main>
        } />
        <Route path="/about" element={
          <main className="flex-1 w-full mt-20">
            <About />
          </main>
        } />
        <Route path="/tools" element={
          <main className="flex-1 w-full mt-20">
            <Tools />
          </main>
        } />
        <Route path="/typography" element={
          <main className="flex-1 w-full mt-20">
            <TypographyLab />
          </main>
        } />
        <Route path="/profile" element={
          <main className="flex-1 w-full mt-20 flex items-center justify-center">
            <ProfilePage kullanici={kullanici} supabase={supabase} goHome={goHome} />
          </main>
        } />
        <Route path="/app" element={
          <>
            <div className="relative min-h-screen bg-[var(--bg-primary)] flex text-[var(--text-primary)] font-sans z-10 w-full items-start">
              {/* Sidebar */}
              <aside className="w-[260px] hidden lg:flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] sticky top-0 h-screen">
                <div className="p-6 pb-2">
                  <div onClick={goHome} className="flex items-center gap-2 cursor-pointer mb-8">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5500] to-[#FF8800] flex items-center justify-center shadow-lg shadow-[#FF5500]/20">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Revizele</span>
                  </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                  <p className="px-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 mt-4">Analiz</p>
                  <button onClick={() => setDashboardTab('genel')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${dashboardTab === 'genel' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}>
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4" />
                      <span className="text-sm">Genel Bakış</span>
                    </div>
                    {kullanici ? <span className="bg-[#FF5500] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">3</span> : null}
                  </button>
                  <button onClick={() => setDashboardTab('analizlerim')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${dashboardTab === 'analizlerim' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}>
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Analizlerim</span>
                  </button>
                  <button onClick={() => setDashboardTab('raporlar')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${dashboardTab === 'raporlar' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}>
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Raporlar</span>
                  </button>
                  <button onClick={() => setDashboardTab('gecmis')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${dashboardTab === 'gecmis' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Geçmiş</span>
                  </button>

                  <p className="px-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 mt-8">Ayarlar</p>
                  <button onClick={() => setDashboardTab('tercihler')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${dashboardTab === 'tercihler' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}>
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Tercihler</span>
                  </button>
                </nav>

                <div className="p-4 mt-auto">
                  <div 
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-br from-[#FF5500] to-[#FF8800] rounded-xl p-4 text-white shadow-lg shadow-[#FF5500]/20 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-white" />
                        <h4 className="font-bold text-sm">Pro'ya Geç</h4>
                      </div>
                      <p className="text-xs text-white/80 mb-3">Sınırsız analiz ve PDF raporları için yükseltin.</p>
                      <div className="w-full bg-white text-[#FF5500] text-center text-xs font-bold py-2 rounded-lg shadow-sm">
                        Planları İncele
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] flex items-center justify-center border border-[var(--border-primary)]">
                      {kullanici ? (
                        <span className="font-bold text-[var(--text-secondary)] text-xs">{kullanici.email?.charAt(0).toUpperCase()}</span>
                      ) : (
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                      )}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">{kullanici ? kullanici.email : 'Misafir Kullanıcı'}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">Ücretsiz Plan</p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1 flex flex-col min-w-0 w-full min-h-screen">
                {/* Topbar */}
                <header className="h-20 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-primary)] sticky top-0 z-40 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="lg:hidden p-2 text-slate-500 hover:text-slate-900">
                      <div className="w-5 h-0.5 bg-current mb-1.5" />
                      <div className="w-5 h-0.5 bg-current mb-1.5" />
                      <div className="w-5 h-0.5 bg-current" />
                    </button>
                    <div>
                      <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight hidden sm:block">
                        Merhaba, {kullanici ? kullanici.email?.split('@')[0] : 'Tasarımcı'} 👋
                      </h1>
                      <p className="text-sm text-[var(--text-secondary)] font-medium hidden sm:block">Bugün ne analiz edelim?</p>
                      <h2 className="text-lg font-bold sm:hidden cursor-pointer text-[var(--text-primary)]" onClick={goHome}>RevizeAI.</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDashboardTab('gecmis')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] text-sm font-semibold rounded-lg transition-colors border border-[var(--border-primary)]">
                      <Clock className="w-4 h-4" />
                      <span>Geçmişim</span>
                    </button>
                    <button onClick={() => { sifirla(); setDashboardTab('genel'); }} className="flex items-center gap-2 px-4 py-2 bg-[#FF5500] hover:bg-[#e64d00] text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-[#FF5500]/20">
                      <Plus className="w-4 h-4" />
                      <span>Yeni Analiz</span>
                    </button>
                  </div>
                </header>

                {/* Dashboard Scrollable Content */}
                <div className="flex-1 p-6 md:p-8 lg:p-10 space-y-6 max-w-[1600px] w-full mx-auto pb-24">
                  {dashboardTab === 'analizlerim' ? (
                    <div className="flex flex-col h-full min-h-[400px] bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-[var(--text-primary)]">Analizlerim</h2>
                          <p className="text-sm text-[var(--text-secondary)]">Geçmişte yaptığınız tüm tasarım analizleri.</p>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col items-center justify-center flex-1 text-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                          <Layers className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Henüz analiz bulunmuyor</h3>
                        <p className="text-[var(--text-secondary)] max-w-md mb-6">İlk tasarımınızı analiz ederek burayı doldurmaya başlayabilirsiniz. Yaptığınız tüm analizler burada listelenecektir.</p>
                        <button onClick={() => setDashboardTab('genel')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10 flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Yeni Analiz Başlat
                        </button>
                      </div>
                    </div>
                  ) : dashboardTab === 'raporlar' ? (
                    <div className="flex flex-col h-full min-h-[400px] bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-[var(--text-primary)]">Raporlar</h2>
                          <p className="text-sm text-[var(--text-secondary)]">PDF formatında dışa aktardığınız profesyonel raporlar.</p>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col items-center justify-center flex-1 text-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">PDF Raporu Bulunamadı</h3>
                        <p className="text-[var(--text-secondary)] max-w-md mb-6">Bir analizi tamamladıktan sonra "PDF İndir" butonuna tıklayarak ilk profesyonel raporunuzu oluşturabilirsiniz.</p>
                        <button onClick={() => setDashboardTab('genel')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10 flex items-center gap-2">
                           Analiz Sayfasına Git <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : dashboardTab === 'gecmis' ? (
                    <div className="flex flex-col h-full min-h-[400px] bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-[var(--text-primary)]">Hareket Geçmişi</h2>
                          <p className="text-sm text-[var(--text-secondary)]">Hesabınızdaki tüm aktiviteler ve kredi kullanımları.</p>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col items-center justify-center flex-1 text-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                          <Clock className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Aktivite Yok</h3>
                        <p className="text-[var(--text-secondary)] max-w-md">Şu an için gösterilecek bir hesap aktivitesi bulunmuyor.</p>
                      </div>
                    </div>
                  ) : dashboardTab === 'tercihler' ? (
                    <div className="flex flex-col h-full min-h-[400px] bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-[var(--text-primary)]">Tercihler</h2>
                          <p className="text-sm text-[var(--text-secondary)]">Hesap ve uygulama ayarlarınızı yönetin.</p>
                        </div>
                      </div>
                      <div className="p-8 max-w-2xl">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Profil Ayarları</h3>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                    <User className="w-6 h-6 text-slate-400" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-[var(--text-primary)] text-lg">{kullanici ? kullanici.email : 'Misafir Kullanıcı'}</p>
                                    <p className="text-sm text-emerald-600 font-medium">Ücretsiz Plan</p>
                                  </div>
                                </div>
                                <button className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Düzenle</button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Bildirimler</h3>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-[var(--text-primary)]">E-posta Bildirimleri</p>
                                  <p className="text-sm text-[var(--text-secondary)]">Yeni özellikler ve güncellemeler hakkında e-posta alın.</p>
                                </div>
                                <div className="w-12 h-7 bg-[#FF5500] rounded-full relative cursor-pointer shadow-inner">
                                  <div className="absolute right-1 top-1 bottom-1 w-5 bg-white rounded-full shadow-sm" />
                                </div>
                              </div>
                              <div className="h-px w-full bg-slate-100" />
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-[var(--text-primary)]">Haftalık Rapor</p>
                                  <p className="text-sm text-[var(--text-secondary)]">Analiz istatistiklerinizin haftalık özetini alın.</p>
                                </div>
                                <div className="w-12 h-7 bg-slate-200 rounded-full relative cursor-pointer shadow-inner">
                                  <div className="absolute left-1 top-1 bottom-1 w-5 bg-white rounded-full shadow-sm" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : adim < 3 ? (
                    <>
                      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
                        
                        {/* MAIN BIG CARD (Upload + Stepper) */}
                        <div className="flex-1 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[24px] shadow-sm flex flex-col xl:flex-row overflow-hidden w-full">
                          
                          {/* Left: Upload Action Area */}
                          <div className="flex-1 p-6 lg:p-10 xl:p-14 relative flex flex-col justify-center items-center">
                            {/* Wrapper for content with better expansion */}
                            <div className="w-full max-w-4xl">
                              {/* Header */}
                              <div className="text-center mb-10">
                                <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-3 mb-2">
                                  <Sparkles className="w-8 h-8 text-[#FF5500]" />
                                  Tasarımınızı Analiz Edin
                                </h3>
                                <p className="text-[var(--text-secondary)] font-medium text-base">Saniyeler içinde UI/UX hatalarını bulun ve yapay zeka ile mükemmelleştirin.</p>
                              </div>
                              
                              {adim === 1 ? (
                                <div className="flex flex-col md:flex-row items-start justify-center gap-10 lg:gap-12 w-full">
                                {/* Format Selection */}
                                <div className="w-full md:w-1/2 max-w-[360px] flex flex-col">
                                  <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm">1</div>
                                    Tasarım Formatı
                                  </h4>
                                  <div className="flex flex-col gap-3">
                                    {(Object.keys(kriterlerMap) as TasarimTuru[]).map(turu => {
                                      const isAvailable = turu === "Sosyal Medya";
                                      return (
                                        <button
                                          key={turu}
                                          disabled={!isAvailable}
                                          onClick={() => isAvailable && setTasarimTuru(turu)}
                                          className={`w-full px-5 py-4 rounded-full border text-left flex items-center justify-between transition-all duration-300 font-bold relative overflow-hidden ${
                                            !isAvailable 
                                              ? 'bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-70' 
                                              : tasarimTuru === turu 
                                                ? 'bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-primary)] shadow-md' 
                                                : 'bg-[var(--card-bg)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                                          }`}
                                        >
                                          <span className={`text-sm ${!isAvailable ? 'blur-[0.5px]' : ''}`}>{turu}</span>
                                          {isAvailable ? (
                                            tasarimTuru === turu && <Check className="w-5 h-5 text-[#FF5500]" />
                                          ) : (
                                            <span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-black tracking-tighter uppercase">Yakında</span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  </div>


                                {/* Dropzone */}
                                <div className="w-full md:w-1/2 max-w-[400px] flex flex-col">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-[#FF5500] flex items-center justify-center text-white shadow-sm">2</div>
                                      Dosya veya Link
                                    </h4>
                                    <div className="flex bg-[var(--bg-primary)] p-1 rounded-full">
                                      <button onClick={() => setUploadMod('dosya')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${uploadMod === 'dosya' ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><Upload className="w-3.5 h-3.5" /> Dosya</button>
                                      <button onClick={() => setUploadMod('link')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${uploadMod === 'link' ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><LinkIcon className="w-3.5 h-3.5" /> URL</button>
                                    </div>
                                  </div>
                                  
                                  {uploadMod === 'link' ? (
                                    <div className="w-full aspect-square bg-[var(--card-bg)] border-2 border-[#FF5500]/20 rounded-[32px] flex flex-col items-center justify-center p-8 text-center shadow-sm relative overflow-hidden">
                                      <div className="w-16 h-16 mb-4 rounded-full bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/20 text-[#FF5500]">
                                        <LinkIcon className="w-6 h-6" />
                                      </div>
                                      <h4 className="text-[var(--text-primary)] text-xl font-bold mb-4">Bağlantıdan Yükle</h4>
                                      <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://.../gorsel.png" className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-full px-5 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#FF5500] transition-all mb-4 text-center font-medium" />
                                      <button onClick={() => handleLink(imageUrl)} className="w-full bg-[#FF5500] hover:bg-[#e64d00] text-white py-3.5 rounded-full text-sm font-bold transition-colors shadow-md shadow-[#FF5500]/20">Tasarımı Getir</button>
                                    </div>
                                  ) : (
                                    <div
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleDosya(e.dataTransfer.files[0]); }}
                                      onClick={() => fileRef.current?.click()}
                                      className="w-full aspect-square border-2 border-dashed border-[#FF5500]/20 hover:border-[#FF5500]/50 bg-[#FF5500]/[0.02] rounded-[32px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group shadow-sm relative overflow-hidden p-6"
                                    >
                                      <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--card-bg)] flex items-center justify-center shadow-md border border-[#FF5500]/10 group-hover:scale-105 transition-transform duration-300 relative z-10 text-[#FF5500]">
                                        <Upload className="w-8 h-8" />
                                      </div>
                                      <p className="text-[var(--text-primary)] text-xl font-bold mb-1 text-center relative z-10">Sürükle veya Seç</p>
                                      <p className="text-[var(--text-secondary)] text-xs font-medium relative z-10 mb-6">PNG, JPG, WEBP (Maks 10MB)</p>
                                      
                                      <div className="px-5 py-2.5 bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-full text-[var(--text-secondary)] font-bold text-xs shadow-sm hover:bg-[var(--bg-primary)] transition-colors relative z-10 flex items-center gap-2">
                                        <Upload className="w-3.5 h-3.5" /> Dosyalara Göz At
                                      </div>
                                    </div>
                                  )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col xl:flex-row items-center justify-center gap-12 lg:gap-20 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                                  <div className="w-full xl:w-1/2 aspect-square max-w-md rounded-[32px] border border-[var(--border-primary)] overflow-hidden relative shadow-sm bg-[var(--bg-primary)] group">
                                  {gorsel ? (
                                    <>
                                      <img src={gorsel} alt="Yüklenen" className="w-full h-full object-contain p-4" />
                                      {yukleniyor && <ScanningOverlay />}
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                                        <button onClick={() => setAdim(1)} className="bg-[var(--card-bg)] text-[var(--text-primary)] px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
                                          <RotateCcw className="w-4 h-4" /> Değiştir
                                        </button>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                                <div className="flex-1 flex flex-col justify-center space-y-8 max-w-md">
                                   {/* Geri Butonu - Adım 2 */}
                                  <button 
                                    onClick={() => { setAdim(1); setGorsel(null); setGorselBase64(null); setImageUrl(''); }} 
                                    className="self-start flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--color-brand-orange)] hover:border-[var(--color-brand-orange)]/30 transition-all text-xs font-bold shadow-sm"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Tasarım Seçimine Dön
                                  </button>
                                  <div>
                                    <h4 className="text-3xl font-black text-[var(--text-primary)] mb-2">Harika görünüyor! ✨</h4>
                                    <p className="text-[var(--text-secondary)] font-medium">Analiz için son dokunuşları yapalım.</p>
                                  </div>
                                  
                                  {hata && (
                                    <div className="mb-4 p-3 sm:p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-[16px] text-xs sm:text-sm font-medium flex items-center gap-3">
                                      <AlertCircle className="w-5 h-5 shrink-0" /> {hata}
                                    </div>
                                  )}

                                  <div className="space-y-6">
                                    <div>
                                      <label className="text-sm font-bold text-[var(--text-secondary)] mb-3 block uppercase tracking-wide">Hedef Sektör (Opsiyonel)</label>
                                      <input
                                        type="text"
                                        value={isletme}
                                        onChange={(e) => setIsletme(e.target.value)}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-full px-6 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#FF5500] transition-all shadow-sm"
                                        placeholder="Örn: E-Ticaret, Yazılım, Tekstil"
                                      />
                                    </div>
                                      <AnalizEtButton
                                        onClick={analiz}
                                        yukleniyor={yukleniyor}
                                        metin="Yapay Zeka ile Analizi Başlat"
                                        kullanici={kullanici}
                                        authAc={() => setAuthAcik(true)}
                                        disabled={!(gorsel || gorselBase64 || imageUrl) || !tasarimTuru || !platform}
                                      />
                                  </div>
                                </div>
                              </div>
                            )}
                            </div>
                          </div>

                          {/* Right: Stepper Sidebar (Inside the Big Card) */}
                          <div className="w-full xl:w-[260px] border-t xl:border-t-0 xl:border-l border-[var(--border-primary)] p-8 flex flex-col bg-[var(--bg-primary)]/30 shrink-0">
                            <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-8 uppercase tracking-wider flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-500" />
                              Süreç Durumu
                            </h4>
                            <div className="space-y-8 relative flex-1">
                              <div className="absolute left-4 top-4 bottom-4 w-[1px] bg-[var(--border-primary)]" />
                              
                              <div className="flex gap-4 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${adim > 1 ? 'bg-emerald-50 text-emerald-500 border border-emerald-200' : 'bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/20'}`}>
                                  {adim > 1 ? <Check className="w-4 h-4" /> : "1"}
                                </div>
                                <div>
                                  <h5 className={`font-bold text-sm ${adim >= 1 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Tasarım Formatı</h5>
                                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">{adim > 1 ? 'Format ve görsel seçildi' : 'Tasarımın türünü belirleyin'}</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-4 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${adim > 2 ? 'bg-emerald-50 text-emerald-500 border border-emerald-200' : adim === 2 ? 'bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/20' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
                                  {adim > 2 ? <Check className="w-4 h-4" /> : "2"}
                                </div>
                                <div>
                                  <h5 className={`font-bold text-sm ${adim >= 2 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Derinlemesine Analiz</h5>
                                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">{adim > 2 ? 'Analiz tamamlandı' : adim === 2 ? 'Hedef kitle parametreleri' : 'Bekleniyor...'}</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-4 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${adim === 3 ? 'bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/20' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
                                  3
                                </div>
                                <div>
                                  <h5 className={`font-bold text-sm ${adim === 3 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Sonuç ve Rapor</h5>
                                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">{adim === 3 ? 'Rapor hazırlandı' : 'Bekleniyor...'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT SIDEBAR: 3 STAT CARDS */}
                        <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-4">
                          {/* Stat 1 */}
                          <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[20px] p-6 flex items-center justify-between shadow-sm">
                            <div>
                              <h3 className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-wider mb-2">Tespit Edilen Hata</h3>
                              <div className="flex items-end gap-2">
                                <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none">84</p>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-1">Bu Ay</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Stat 2 */}
                          <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[20px] p-6 flex items-center justify-between shadow-sm">
                            <div>
                              <h3 className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-wider mb-2">Toplam Analiz</h3>
                              <div className="flex items-end gap-2">
                                <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none">142</p>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md mb-1">+12%</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                              <BarChart2 className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Stat 3 */}
                          <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[20px] p-6 flex items-center justify-between shadow-sm">
                            <div>
                              <h3 className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-wider mb-2">Ort. Kalite Skoru</h3>
                              <div className="flex items-end gap-2">
                                <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none">82.4</p>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md mb-1">+5.2</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
                              <Check className="w-5 h-5" />
                            </div>
                          </div>

                          </div>
                        </div>
                      </div>

                      {/* BOTTOM ROW: Mini Info Cards */}
                      <div className="flex flex-col md:flex-row gap-4 mt-2 w-full">
                         {/* Mini Card 1 */}
                         <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm w-full md:w-[400px]">
                             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Önerilen Sektörler</h4>
                             <div className="flex flex-wrap gap-2">
                                <span className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold">E-Ticaret</span>
                                <span className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold">Moda</span>
                                <span className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold">Teknoloji</span>
                             </div>
                         </div>
                         {/* Mini Card 2 */}
                         <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm w-full md:w-[400px]">
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Analiz Derinliği</h4>
                                <span className="text-[10px] font-bold text-[#FF5500] bg-[#FF5500]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Seviye 3</span>
                             </div>
                             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-[#FF5500] rounded-full relative"></div>
                             </div>
                         </div>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleDosya(e.target.files[0])} />
                    </>
                  ) : (
                    <div className="w-full transition-all duration-700">
              {/* ADIM 3 — Premium Dashboard (Modern Mockup Style) */}
              {adim === 3 && sonuc && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full space-y-4 md:space-y-6 max-w-7xl mx-auto"
                  id="analiz-raporu"
                >
                  {/* Demo Mode Banner */}
                  {sonuc._demo && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[11px] font-medium">
                      <span className="text-lg">⚡</span>
                      <span><strong>Demo Modu</strong> — Gemini API kotası doldu. Sabah 03:00'da sıfırlanır. Gösterilen sonuçlar örnek verilerdir.</span>
                    </div>
                  )}

                  {/* Header Row (User / Restart / Share) */}
                  {/* Geri Butonu - Adım 3 */}
                  <button 
                    onClick={() => { setAdim(1); setSonuc(null); setGorsel(null); setGorselBase64(null); setImageUrl(''); }} 
                    className="self-start flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--color-brand-orange)] hover:border-[var(--color-brand-orange)]/30 transition-all text-xs font-bold shadow-sm mb-4"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Yeni Analiz Başlat
                  </button>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card-bg)] p-5 rounded-[24px] border border-[var(--border-primary)] shadow-sm">
                    <div className="flex items-center gap-4 pl-2">
                      <div className="w-12 h-12 rounded-full bg-[#FF5500]/10 flex items-center justify-center relative">
                        <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        <span className="text-xl font-black text-[var(--text-primary)]">{isletme.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-[var(--text-primary)] font-bold text-base leading-tight">Analiz Raporu</h3>
                        <p className="text-[var(--text-secondary)] text-xs font-medium">Hoş geldin, projen hazır 👋</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <button onClick={sifirla} className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] font-semibold text-sm transition-colors border border-transparent hover:border-[var(--border-primary)] flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Yeni Analiz
                      </button>
                      <button
                        onClick={indirPDF}
                        disabled={yukleniyor}
                        className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] font-semibold text-sm transition-colors border border-[var(--border-primary)] flex items-center gap-2"
                      >
                        {yukleniyor ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />} PDF İndir
                      </button>
                      <button
                        disabled={yayinlaniyor || vitrindeYayinlandi}
                        onClick={async () => {
                          if (vitrindeYayinlandi) return;
                          setYayinlaniyor(true);
                          const basarili = await vitrindeYayinla();
                          setTimeout(() => {
                            if (basarili) navigate('/vitrin');
                            setYayinlaniyor(false);
                          }, 1500);
                        }}
                        className="px-5 py-2 rounded-xl bg-[#FF5500] text-white font-bold text-sm shadow-md shadow-[#FF5500]/20 hover:bg-[#e64d00] transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {vitrindeYayinlandi ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        Paylaş & Keşfet
                      </button>
                    </div>
                  </div>

                  {/* Main Dashboard Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

                    {/* LEFT STACK - Metrics + Gauge */}
                    <div className="col-span-1 md:col-span-8 space-y-4 md:space-y-6">
                      {/* Top Top Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        {[
                          { label: "Baskın Renk", value: sonuc.teknikOzet?.baskinRenkSayisi || 3, sub: "farklı renk", icon: <Palette />, color: "text-emerald-500", bg: "bg-emerald-50" },
                          { label: "Görsel Düzen", value: `%${sonuc.teknikOzet?.detayYogunlugu || 45}`, sub: "doluluk oranı", icon: <Grid />, color: "text-sky-500", bg: "bg-sky-50" },
                          { label: "Okunabilirlik", value: sonuc.teknikOzet?.kontrastDegeri || 'Yüksek', sub: "metin netliği", icon: <TypeIcon />, color: "text-purple-500", bg: "bg-purple-50" }
                        ].map((m, i) => (
                          <div key={i} className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-primary)] shadow-sm p-6">
                            <div className="flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-full ${m.bg} ${m.color} flex items-center justify-center mb-4`}>
                                {React.cloneElement(m.icon as any, { className: "w-6 h-6" })}
                              </div>
                              <p className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest text-center">{m.label}</p>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{m.value}</span>
                              </div>
                              <span className="text-[var(--text-secondary)] text-xs font-semibold bg-[var(--bg-primary)] border border-[var(--border-primary)] px-3 py-1 rounded-full mt-3">{m.sub}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Middle Gauge & Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Gauge Card */}
                        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-primary)] shadow-sm p-6 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-[var(--text-secondary)]" />
                              <span className="text-[var(--text-primary)] font-bold text-sm tracking-wide">Tasarım Puanı</span>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border border-[var(--border-primary)] px-3 py-1 rounded-full hover:bg-[var(--bg-primary)] transition-colors">Detaylar</button>
                          </div>
                          <ScoreRing score={sonuc.genelPuan} />
                          <div className="mt-8 pt-4 border-t border-[var(--border-primary)] flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                              <span className="text-emerald-500 text-sm font-bold">+</span>
                            </div>
                            <div>
                              <p className="text-[var(--text-primary)] text-sm font-bold">Harika!</p>
                              <p className="text-[var(--text-secondary)] text-[10px]">Genel kalite standartını yakaladınız.</p>
                            </div>
                            <ChevronRight className="w-4 h-4 ml-auto text-[var(--text-secondary)]" />
                          </div>
                        </div>

                        {/* Summary / Productivity Card */}
                        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-primary)] shadow-sm p-6 flex flex-col">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-4 h-4 text-[var(--text-secondary)]" />
                              <span className="text-[var(--text-primary)] font-bold text-sm tracking-wide">Detaylı Analiz</span>
                            </div>
                          </div>
                          <div className="space-y-4 flex-1 flex flex-col justify-center">
                            {kriterler.slice(0, 4).map((k) => (
                              <div key={k.key}>
                                <div className="flex justify-between items-end mb-1.5">
                                  <span className="text-[var(--text-secondary)] text-[11px] font-bold">{k.label}</span>
                                  <span className="text-[var(--text-primary)] text-sm font-black">{sonuc[k.key]?.puan}/25</span>
                                </div>
                                <div className="h-[6px] w-full bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(sonuc[k.key]?.puan / 25) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-[#FF5500] rounded-full"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT STACK - Image & Colors */}
                    <div className="col-span-1 md:col-span-4 space-y-4 md:space-y-6">
                      {/* Image Preview (Like Crops Stocked) */}
                      <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b border-[var(--border-primary)] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[var(--text-secondary)]" />
                            <span className="text-[var(--text-primary)] font-bold text-sm tracking-wide">Yüklediğiniz Tasarım</span>
                          </div>
                          <button className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border border-[var(--border-primary)] px-3 py-1 rounded-full hover:bg-[var(--bg-primary)] transition-colors">Büyüt</button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center items-center bg-[var(--bg-primary)]/50 group cursor-zoom-in min-h-[220px]" onClick={() => gorsel && setSeciliGorsel(gorsel)}>
                          <img src={gorsel!} alt="Orijinal" className="max-w-full max-h-[250px] object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-500 shadow-sm" />
                        </div>

                        {/* Sub Colors */}
                        {sonuc.renkPaleti?.length > 0 && (
                          <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--card-bg)]">
                            <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                              {sonuc.renkPaleti.slice(0, 5).map((hex: string, i: number) => (
                                <div key={i} className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => renkKopyala(hex)}>
                                  <div className="w-8 h-8 rounded-full border border-[var(--border-primary)] shadow-inner group-hover:scale-110 transition-transform relative" style={{ backgroundColor: hex }}>
                                    {kopyalananRenk === hex && <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full"><Check className="w-4 h-4 text-white" /></div>}
                                  </div>
                                  <span className="text-[8px] font-mono font-bold text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">{hex.toUpperCase()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ROW - Feedback & AI Pro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                    {/* Detailed Feedback (Like Weather/Tasks) */}
                    <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-primary)] shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-[var(--text-secondary)]" />
                          <span className="text-[var(--text-primary)] font-bold text-sm tracking-wide">Geri Bildirimler</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] p-5 rounded-xl">
                          <p className="text-[var(--text-primary)] text-[13px] font-semibold leading-relaxed">"{sonuc.genelYorum}"</p>
                        </div>
                        {sonuc.gucluYon && (
                          <div className="flex items-start gap-3 border border-[var(--border-primary)] rounded-xl p-4 bg-[var(--card-bg)]">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mb-1">Güçlü Yön</p>
                              <p className="text-[var(--text-primary)] text-xs leading-relaxed">{sonuc.gucluYon}</p>
                            </div>
                          </div>
                        )}
                        {sonuc.zayifYon && (
                          <div className="flex items-start gap-3 border border-[var(--border-primary)] rounded-xl p-4 bg-[var(--card-bg)]">
                            <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                            </div>
                            <div>
                              <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mb-1">Geliştirilebilir</p>
                              <p className="text-[var(--text-primary)] text-xs leading-relaxed">{sonuc.zayifYon}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Suggestion */}
                    <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-primary)] shadow-sm p-6 md:p-8 flex flex-col relative overflow-hidden group">
                      {/* Arka plan efektleri (Parallax & Glow) */}
                      <div className="absolute top-[-50%] right-[-10%] w-[150%] h-[150%] bg-gradient-to-br from-[#FF5500]/10 via-purple-600/5 to-transparent blur-3xl rounded-full transform rotate-12 group-hover:opacity-100 opacity-60 transition-opacity duration-700 pointer-events-none"></div>

                      <div className="relative z-10 flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF5500]/20 to-amber-500/20 flex items-center justify-center border border-[#FF5500]/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="w-6 h-6 text-[#FF5500]" />
                          </div>
                          <div>
                            <span className="text-[var(--text-primary)] font-black text-xl tracking-tight block leading-tight">AI Tasarım Revizyonu</span>
                            <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mt-0.5 block">Sizi Bir Üst Seviyeye Taşır</span>
                          </div>
                        </div>
                        <span className="bg-gradient-to-r from-[#FF5500] to-amber-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-md shadow-[#FF5500]/30 border border-white/20">PRO</span>
                      </div>

                      <div className="relative z-10 flex-1 border border-[#FF5500]/20 bg-gradient-to-br from-[#FF5500]/[0.05] to-transparent rounded-2xl p-8 mb-6 backdrop-blur-md group-hover:border-[#FF5500]/30 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden">
                        {/* Blur overlay for PRO info */}
                        <div className="absolute inset-0 bg-[var(--card-bg)]/40 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6">
                          <div className="w-12 h-12 bg-[var(--card-bg)] rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Sparkles className="w-6 h-6 text-[#FF5500]" />
                          </div>
                          <p className="text-[var(--text-primary)] font-bold text-sm mb-1 uppercase tracking-tight">Revizyon Detayları Kilitli</p>
                          <p className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest leading-normal">
                            AI ile tasarımınızı otomatik iyileştirmek ve teknik revizyonları görmek için PRO plana geçin.
                          </p>
                        </div>
                        <p className="text-[var(--text-primary)] text-[14px] opacity-20 select-none blur-[2px]">
                          {sonuc.oneri}
                        </p>
                      </div>

                      <button 
                        onClick={() => navigate('/pricing')}
                        className="relative z-10 w-full py-4 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
                      >
                        {/* Shimmer effect inside button */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
                        <span className="relative z-10 flex items-center gap-2">Tasarımı AI İle İyileştir <ChevronRight className="w-4 h-4" /></span>
                      </button>
                    </div>
                  </div>

                  {/* RESOURCES & DISCLAIMER */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
                    {/* Educational Resources */}
                    <div className="col-span-1 md:col-span-8 bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-primary)] shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-[#FF5500]" />
                        <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Tasarımını Geliştirmen İçin Kaynaklar</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { title: "Nielsen Norman Group", desc: "UX/UI dünyasının en prestijli eğitim ve araştırma kurumu.", url: "https://www.nngroup.com/" },
                          { title: "Interaction Design Foundation", desc: "Tasarım prensiplerini derinlemesine öğrenin.", url: "https://www.interaction-design.org/" },
                          { title: "Color Contrast Guide (WCAG)", desc: "Erişilebilir renk kullanımı kuralları.", url: "https://webaim.org/resources/contrastchecker/" },
                          { title: "Laws of UX", desc: "Kullanıcı psikolojisi ve tasarım kural seti.", url: "https://lawsofux.com/" }
                        ].map((source, i) => (
                          <a target="_blank" rel="noopener noreferrer" key={i} href={source.url} className="group block p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary)] hover:border-[#FF5500]/30 transition-all hover:shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[var(--text-primary)] text-xs">{source.title}</span>
                              <ExternalLink className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-[#FF5500] transition-colors" />
                            </div>
                            <p className="text-[var(--text-secondary)] text-[10px] leading-relaxed">{source.desc}</p>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="col-span-1 md:col-span-4 bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-primary)] shadow-sm p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider">Önemli Not</h4>
                      </div>
                      <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed italic">
                        "Feragatname: Bu eleştiri yapay zeka teknolojisi kullanılarak oluşturulur ve yalnızca bir rehberlik aracı olarak kullanılmalıdır. Doğruluk için çaba gösterirken, nihai tasarım kararlarında insan yargısı ve profesyonel uzmanlık dikkate alınmalıdır."
                      </p>
                    </div>
                  </div>

                  {/* Footer Padding for aesthetics */}
                  <div className="h-12 w-full" />
                </motion.div>
              )}
                    </div>
                  )}
                </div>
              </main>
            </div>
          {/* Image Modal */}
          <AnimatePresence>
            {seciliGorsel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSeciliGorsel(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-white/95 backdrop-blur-xl cursor-zoom-out"
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ ease: [0.22, 1, 0.36, 1] }}
                  className="relative max-w-full max-h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={seciliGorsel}
                    alt="Büyütülmüş Görsel"
                    className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-sm border border-[var(--color-brand-dark)]/10"
                  />
                  <button
                    onClick={() => setSeciliGorsel(null)}
                    className="absolute -top-14 right-0 text-[var(--color-brand-dark)]/50 hover:text-[var(--color-brand-dark)] transition-colors flex items-center gap-2 text-sm font-bold bg-white backdrop-blur-xl px-4 py-2 rounded-full border border-[var(--color-brand-dark)]/10 shadow-sm"
                  >
                    Kapat ✕
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── YÜKLEME (LOADING) EKRANI MODAL ── */}
          <AnimatePresence>
            {yukleniyor && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-[#0a0a0a]/85 backdrop-blur-2xl"
              >
                {/* Sleek Minimalist Spinner */}
                <div className="relative flex items-center justify-center mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 rounded-full border-[2px] border-white/10 border-t-white"
                  />
                  {/* Subtle inner pulse to make it feel premium */}
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-4 h-4 bg-white/20 rounded-full blur-sm"
                  />
                </div>

                {/* Başlık ve Açıklama */}
                <div className="space-y-3 text-center px-6">
                  <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                    Tasarımınız İnceleniyor
                  </h2>
                  <p className="text-white/50 text-sm md:text-base max-w-sm mx-auto font-light leading-relaxed">
                    Renk hiyerarşisi, tipografi seçimleri, kompozisyon ve marka bütünlüğü profesyonel kriterlere göre değerlendiriliyor.
                  </p>
                </div>

                {/* Dinamik İpuçları (Sleek Carousel) */}
                <div className="mt-16 h-12 w-full max-w-md overflow-hidden relative flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingTipIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="text-white/40 text-xs md:text-sm text-center font-normal absolute w-full px-6"
                    >
                      {KARUSEL_IPUCLARI[loadingTipIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── AUTH MISAFIR UYARISI MODAL ── */}
          <AnimatePresence>
            {authUyariAcik && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-sm bg-white border border-[var(--color-brand-dark)]/10 p-6 rounded-3xl backdrop-blur-3xl text-center shadow-sm"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-brand-dark)] mb-2">Analiz İçin Giriş Yapın</h3>
                  <p className="text-[var(--color-brand-dark)]/60 text-sm mb-6 leading-relaxed">
                    Yapay zeka ile analiz yapabilmek ve sonuçlarınızı kaydedebilmek için <strong>ücretsiz bir hesap oluşturmanız</strong> veya giriş yapmanız gerekmektedir.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setAuthUyariAcik(false);
                        setAuthAcik(true);
                        setAuthMod('kayit');
                      }}
                      className="w-full py-3 rounded-xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold transition-colors shadow-md shadow-[#FF5500]/20"
                    >
                      Hemen Kayıt Ol / Giriş Yap
                    </button>
                    <button
                      onClick={() => setAuthUyariAcik(false)}
                      className="w-full py-2 mt-2 text-[var(--color-brand-dark)]/40 hover:text-[var(--color-brand-dark)]/70 text-xs transition-colors underline decoration-[var(--color-brand-dark)]/20 underline-offset-2"
                    >
                      İptal Et
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STATS MODAL ── */}
          <AnimatePresence>
            {statsAcik && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-brand-light)]/80 backdrop-blur-2xl"
                onClick={() => setStatsAcik(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ ease: [0.22, 1, 0.36, 1] }}
                  onClick={e => e.stopPropagation()}
                  className="relative w-full max-w-lg bg-white border border-[var(--color-brand-dark)]/10 rounded-3xl shadow-sm overflow-hidden"
                >
                  <div className="p-5 border-b border-[var(--color-brand-dark)]/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BarChart2 className="w-4 h-4 text-[var(--color-brand-orange)]" />
                      <span className="text-[var(--color-brand-dark)] text-sm font-bold">Benim İstatistiklerim</span>
                    </div>
                    <button onClick={() => setStatsAcik(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]/40 hover:text-[var(--color-brand-dark)] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5">
                    {statsYukleniyor ? (
                      <div className="flex items-center justify-center py-10 gap-3 text-[var(--color-brand-dark)]/40">
                        <div className="w-5 h-5 border-2 border-[var(--color-brand-dark)]/20 border-t-[var(--color-brand-orange)] rounded-full animate-spin" />
                        <span className="text-sm">Yükleniyor...</span>
                      </div>
                    ) : statsData ? (
                      <div className="space-y-6">

                        {/* Ana sayılar */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Toplam Analiz', value: statsData.toplamAnaliz, color: 'text-[var(--color-brand-dark)]' },
                            { label: 'Bu Hafta', value: statsData.buHafta, color: 'text-emerald-500' },
                            { label: 'Ort. Puan', value: `${statsData.ortalamaGenel}/100`, color: 'text-[var(--color-brand-orange)]' },
                          ].map(s => (
                            <div key={s.label} className="bg-[var(--color-brand-light)] rounded-2xl p-3 text-center border border-[var(--color-brand-dark)]/5 text-[var(--color-brand-dark)]">
                              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                              <div className="text-[var(--color-brand-dark)]/40 text-[10px] mt-1">{s.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Tasarım türü dağılımı */}
                        {Object.keys(statsData.turDagilim || {}).length > 0 && (
                          <div>
                            <p className="text-[var(--color-brand-dark)]/40 text-[10px] font-bold uppercase tracking-widest mb-2.5">Dağılım İstatistikleri</p>
                            <div className="space-y-2">
                              {Object.entries(statsData.turDagilim as Record<string, number>)
                                .sort(([, a], [, b]) => b - a)
                                .map(([tur, sayi]) => {
                                  const pct = Math.round((sayi / statsData.toplamAnaliz) * 100);
                                  return (
                                    <div key={tur}>
                                      <div className="flex justify-between mb-1">
                                        <span className="text-[var(--color-brand-dark)] text-[11px] font-semibold">{tur}</span>
                                        <span className="text-[var(--color-brand-dark)]/50 text-[11px] font-mono">{sayi} ({pct}%)</span>
                                      </div>
                                      <div className="h-[3px] bg-[var(--color-brand-dark)]/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                                          className="h-full rounded-full bg-blue-500" />
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* En popüler sektörler */}
                        {statsData.enPopulerSektor?.length > 0 && (
                          <div>
                            <p className="text-[var(--color-brand-dark)]/40 text-[10px] font-bold uppercase tracking-widest mb-2.5">Popüler Sektörler</p>
                            <div className="flex flex-wrap gap-2">
                              {statsData.enPopulerSektor.map((s: any, i: number) => (
                                <span key={i} className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-[var(--color-brand-light)] border border-[var(--color-brand-dark)]/5 text-[var(--color-brand-dark)] shadow-sm">
                                  {s.isletme} <span className="text-[var(--color-brand-dark)]/40">({s.sayi})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Değerlendirme dağılımı */}
                        {Object.keys(statsData.degDagilim || {}).length > 0 && (
                          <div>
                            <p className="text-[var(--color-brand-dark)]/40 text-[10px] font-bold uppercase tracking-widest mb-2.5">Değerlendirmeler</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(statsData.degDagilim as Record<string, number>).map(([deg, sayi]) => (
                                <span key={deg} className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-[var(--color-brand-light)] border border-[var(--color-brand-dark)]/5 text-[var(--color-brand-dark)] shadow-sm">
                                  {deg} <span className="text-[var(--color-brand-dark)]/40">× {sayi}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-[var(--color-brand-dark)]/40 py-8 text-sm border border-[var(--color-brand-dark)]/5 rounded-2xl bg-[var(--color-brand-light)]">Veri yüklenemedi.</p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          </>
        } />
      </Routes>
      
      {/* ── AUTH MODAL - Tüm sayfalardan erişilebilir ── */}
      <AnimatePresence>
        {authAcik && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setAuthAcik(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[var(--color-brand-orange)]" />
                  <div className="flex gap-1">
                    {authAdim === 1 ? (
                      (['giris', 'kayit'] as const).map(m => (
                        <button key={m} onClick={() => setAuthMod(m)}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${authMod === m ? 'bg-[var(--color-brand-orange)] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                          {m === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
                        </button>
                      ))
                    ) : (
                      <span className="text-[13px] font-bold text-gray-900">Profilini Tamamla</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setAuthAcik(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                {authAdim === 1 ? (
                  <form onSubmit={girisYap} className="space-y-3">
                    <input type="email" placeholder="E-posta" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />
                    
                    {authMod === 'kayit' && (
                      <input type="text" placeholder="Ad Soyad" value={authAdSoyad} onChange={e => setAuthAdSoyad(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />
                    )}

                    <input type="password" placeholder="Şifre" value={authSifre} onChange={e => setAuthSifre(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />

                    {authMod === 'kayit' && (
                      <input type="password" placeholder="Şifre (Tekrar)" value={authSifreTekrar} onChange={e => setAuthSifreTekrar(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-gray-400" />
                    )}

                    {authHata && <p className="text-red-500 text-[11px] px-1">{authHata}</p>}

                    <button type="submit" disabled={authYukleniyor || !authEmail || !authSifre}
                      className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {authYukleniyor ? <div className="w-4 h-4 border-2 border-white/30 border-t-[var(--color-brand-orange)] rounded-full animate-spin" /> : null}
                      {authMod === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'}
                    </button>
                  </form>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2 text-center">
                      Hoş Geldin, {authAdSoyad.split(' ')[0]}!
                    </h2>
                    <p className="text-xs text-gray-500 mb-6 text-center">
                      Profilini tamamlamak için harika bir avatar seç veya kendi fotoğrafını yükle.
                    </p>

                    <div className="relative w-28 h-28 mb-6">
                      <div className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                        {avatarYukleniyor ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <div className="w-8 h-8 border-4 border-orange-200 border-t-[var(--color-brand-orange)] rounded-full animate-spin" />
                          </div>
                        ) : (
                          <img src={seciliAvatar} alt="Profil Avatar" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 w-full mb-6">
                      <button onClick={rastgeleAvatarUret} disabled={avatarYukleniyor}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> Zar At
                      </button>
                      <label className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" /> Yükle
                        <input type="file" accept="image/*" className="hidden" onChange={avatarYukle} disabled={avatarYukleniyor} />
                      </label>
                    </div>

                    <button onClick={avatarTamamla} disabled={avatarYukleniyor}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-brand-orange)] to-orange-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> Harika Görünüyor, Tamamla
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LiveActivityFeed />
      <Footer onLogoClick={goHome} onNavClick={(v: string) => navigate(`/${v}`)} />
      <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { borderRadius: '16px', background: '#333', color: '#fff' } }} />
    </div>
  );
}
