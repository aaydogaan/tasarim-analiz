import React, { useState, useRef, useEffect } from "react";
import Lenis from 'lenis';
import { motion, AnimatePresence } from "motion/react";
import { Upload, ChevronRight, ChevronLeft, RotateCcw, Palette, Type as TypeIcon, Layout, Grid, Sparkles, Smartphone, Building2, ShoppingBag, Printer, BarChart2, Share2, User, X, LogOut, Copy, Check, AlertCircle, Globe, BrainCircuit, ArrowUpRight, Layers, Code, Scan, Download, ExternalLink, BookOpen, Link as LinkIcon } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from "./lib/supabase";
import { Vitrin } from "./pages/Vitrin";
import TextPressure from "./components/ui/TextPressure";
import LandingPage from "./pages/LandingPage";
import Footer from "./components/ui/Footer";
import Community from "./pages/Community";
import Header from "./components/ui/Header";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Tools from "./pages/Tools";
import TypographyLab from "./pages/TypographyLab";
import LiveActivityFeed from "./components/ui/LiveActivityFeed";

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
          <span className="text-[var(--color-brand-dark)]/40 text-[8px] font-black uppercase tracking-widest mt-1 mb-1">TOTAL SCORE</span>
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
  const [gorunum, setGorunum] = useState<'landing' | 'app' | 'vitrin' | 'community' | 'pricing' | 'about' | 'tools' | 'typography'>(() => getSessionData('ra_gorunum', 'landing'));
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
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ra_darkMode');
    return saved ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('ra_darkMode', darkMode.toString());
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const kriterler = kriterlerMap[tasarimTuru];
  const [hata, setHata] = useState<string | null>(null);
  const [seciliGorsel, setSeciliGorsel] = useState<string | null>(null);
  const [acikKriter, setAcikKriter] = useState<string | null>(null);
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

  const girisYap = async () => {
    setAuthYukleniyor(true); setAuthHata(null);
    const { error } = authMod === 'giris'
      ? await supabase.auth.signInWithPassword({ email: authEmail, password: authSifre })
      : await supabase.auth.signUp({ email: authEmail, password: authSifre });
    if (error) setAuthHata(error.message);
    else setAuthAcik(false);
    setAuthYukleniyor(false);
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
      alert('PDF oluşturulamadı. Lütfen tekrar deneyin.');
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
      alert('Yayınlanırken bir hata oluştu: ' + error.message);
      return false;
    }
  };


  useEffect(() => {
    try {
      sessionStorage.setItem('ra_adim', JSON.stringify(adim));
      sessionStorage.setItem('ra_gorsel', JSON.stringify(gorsel));
      sessionStorage.setItem('ra_gorselBase64', JSON.stringify(gorselBase64));
      sessionStorage.setItem('ra_revizeGorsel', JSON.stringify(revizeGorsel));
      sessionStorage.setItem('ra_tasarimTuru', JSON.stringify(tasarimTuru));
      sessionStorage.setItem('ra_platform', JSON.stringify(platform));
      sessionStorage.setItem('ra_isletme', JSON.stringify(isletme));
      sessionStorage.setItem('ra_digerIsletme', JSON.stringify(digerIsletme));
      sessionStorage.setItem('ra_sorular', JSON.stringify(sorular));
      sessionStorage.setItem('ra_sonuc', JSON.stringify(sonuc));
      sessionStorage.setItem('ra_gorunum', JSON.stringify(gorunum));
    } catch (e) {
      console.warn("SessionStorage aşıldı.", e);
    }
  }, [adim, gorsel, gorselBase64, revizeGorsel, tasarimTuru, platform, isletme, digerIsletme, sorular, sonuc, gorunum]);

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

        // %80 kalite ile WebP'ye dönüştür, devasa yer tasarrufu sağlar
        const webpDataUrl = canvas.toDataURL("image/webp", 0.85);

        setGorsel(webpDataUrl);
        setGorselBase64(webpDataUrl.split(",")[1]);
        setYukleniyor(false);
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
    if (!gorselBase64 && !imageUrl) return;
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
          imageBase64: uploadMod === 'dosya' ? gorselBase64 : undefined,
          imageUrl: uploadMod === 'link' ? imageUrl : undefined,
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
    setGorunum('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen selection:bg-[#ff4d00] selection:text-white font-sans flex flex-col justify-between overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Studio Grid Background */}
      {gorunum === 'app' && adim < 3 && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(var(--color-brand-dark) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
      )}

      <Header
        gorunum={gorunum}
        setGorunum={setGorunum}
        kullanici={kullanici}
        onStatsClick={statsAc}
        onLogoutClick={cikisYap}
        onAuthClick={() => setAuthAcik(true)}
        goHome={goHome}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {gorunum === 'landing' ? (
        <LandingPage
          onStart={() => setGorunum('app')}
          onVitrinClick={() => {
            setGorunum('vitrin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCommunityClick={() => {
            setGorunum('community');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : gorunum === 'vitrin' ? (
        <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 mt-20">
          <Vitrin />
        </main>
      ) : gorunum === 'community' ? (
        <main className="flex-1 w-full mt-20">
          <Community />
        </main>
      ) : gorunum === 'pricing' ? (
        <main className="flex-1 w-full mt-20">
          <Pricing />
        </main>
      ) : gorunum === 'about' ? (
        <main className="flex-1 w-full mt-20">
          <About />
        </main>
      ) : gorunum === 'tools' ? (
        <main className="flex-1 w-full mt-20">
          <Tools />
        </main>
      ) : gorunum === 'typography' ? (
        <main className="flex-1 w-full mt-20">
          <TypographyLab />
        </main>
      ) : (
        <>
          {gorunum === 'app' && adim < 3 && (
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
              style={{ backgroundImage: 'radial-gradient(var(--color-brand-dark) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
          )}
          {adim < 3 ? (
            <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-6 md:px-12 gap-16 lg:gap-24 pt-32 pb-20 relative z-10">

              {/* Left Column: Branding, Steps & Core OS Status */}
              <aside className="lg:w-[420px] flex flex-col space-y-12 lg:sticky lg:top-32 h-fit">

                {/* 1. Branding Section */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                  >
                    <h1 className="text-6xl md:text-8xl font-black text-[var(--color-brand-dark)] tracking-tighter leading-[0.85] mb-2">
                      REVİZE<span className="text-[var(--color-brand-orange)]">AI</span><br />
                      <span className="text-[var(--color-brand-dark)] text-opacity-10 uppercase text-5xl md:text-6xl">STUDIO</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-10 h-[2px] bg-[var(--color-brand-orange)]" />
                      <p className="text-[var(--color-brand-dark)]/30 text-[9px] font-black uppercase tracking-[0.4em]">Tasarım Analiz Laboratuvarı v4.2</p>
                    </div>
                  </motion.div>

                  <div className="space-y-4 pt-4">
                    <h2 className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tighter leading-[0.9] flex flex-col">
                      <span>TASARIMI</span>
                      <span className="text-[var(--color-brand-orange)]">KUSURSUZLAŞTIR.</span>
                    </h2>
                    <p className="text-[var(--color-brand-dark)]/40 text-[13px] font-medium max-w-[340px] leading-relaxed">
                      Yapay zeka motorumuz tasarımınızı 4,000'den fazla veri noktası üzerinden analiz eder ve profesyonel iyileştirme önerileri sunar.
                    </p>
                  </div>
                </div>

                {/* 2. Vertical Stepper */}
                <div className="flex flex-col gap-8 py-6 relative">
                  {/* Progress Line */}
                  <div className="absolute left-[23px] top-10 bottom-10 w-[1px] bg-[var(--color-brand-dark)]/5" />

                  {[
                    { n: 1, label: "Görsel Yükleme", sub: "Analiz edilecek taslağı seçin" },
                    { n: 2, label: "Bağlam Girişi", sub: "Marka ve hedef sektör bilgisi" },
                    { n: 3, label: "Yapay Zeka Raporu", sub: "İyileştirme stratejisi" }
                  ].map((s) => (
                    <div key={s.n} className="flex items-center gap-6 group relative z-10 overflow-hidden">
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-sm border
                        ${adim === s.n
                          ? 'bg-[var(--color-brand-dark)] text-white scale-110 shadow-xl shadow-black/10'
                          : adim > s.n
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white/50 text-[var(--color-brand-dark)]/20 border-black/5'
                        }
                      `}>
                        {adim > s.n ? <Check className="w-5 h-5" /> : s.n}
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className={`text-[12px] font-black uppercase tracking-wider transition-colors ${adim === s.n ? 'text-[var(--color-brand-dark)]' : 'text-[var(--color-brand-dark)]/20'}`}>
                          {s.label}
                        </span>
                        <span className="text-[9px] font-bold text-[var(--color-brand-dark)]/30 uppercase tracking-[0.15em]">
                          {s.sub}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>


              </aside>

              {/* Right Column: Interaction Workspace */}
              <main className="flex-1 flex flex-col gap-8 min-h-[600px]">
                <AnimatePresence mode="wait">
                  {/* ADIM 1 */}
                  {adim === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                      className="w-full flex flex-col gap-8"
                    >
                      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8 items-stretch h-full">
                        {/* Target Interaction: Upload Zone */}
                        <div className="xl:col-span-12 w-full space-y-8">
                          {/* Mod Seçimi - Centered and more premium */}
                          <div className="flex justify-center">
                            <div className="flex gap-1 p-1 bg-white/50 backdrop-blur-xl rounded-2xl border border-[var(--color-brand-dark)]/5 shadow-sm">
                              <button
                                onClick={() => { setUploadMod('dosya'); setGorsel(null); setGorselBase64(null); setImageUrl(""); }}
                                className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${uploadMod === 'dosya' ? 'bg-[var(--color-brand-dark)] text-white shadow-lg scale-105' : 'text-[var(--color-brand-dark)]/30 hover:text-[var(--color-brand-dark)] hover:bg-white/50'}`}
                              >
                                Görsel Yükle
                              </button>
                              <button
                                onClick={() => { setUploadMod('link'); setGorsel(null); setGorselBase64(null); setImageUrl(""); }}
                                className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${uploadMod === 'link' ? 'bg-[var(--color-brand-dark)] text-white shadow-lg scale-105' : 'text-[var(--color-brand-dark)]/30 hover:text-[var(--color-brand-dark)] hover:bg-white/50'}`}
                              >
                                Link Yapıştır
                              </button>
                            </div>
                          </div>

                          <div className="relative group/zone h-full min-h-[450px]">
                            {/* Corner Accents - More subtle and professional */}
                            <div className="absolute -top-2 -left-2 w-16 h-16 border-t-[3px] border-l-[3px] border-[var(--color-brand-orange)]/30 rounded-tl-[54px] z-20 pointer-events-none group-hover/zone:border-[var(--color-brand-orange)] group-hover/zone:scale-110 transition-all duration-700" />
                            <div className="absolute -top-2 -right-2 w-16 h-16 border-t-[3px] border-r-[3px] border-[var(--color-brand-orange)]/30 rounded-tr-[54px] z-20 pointer-events-none group-hover/zone:border-[var(--color-brand-orange)] group-hover/zone:scale-110 transition-all duration-700" />
                            <div className="absolute -bottom-2 -left-2 w-16 h-16 border-b-[3px] border-l-[3px] border-[var(--color-brand-orange)]/30 rounded-bl-[54px] z-20 pointer-events-none group-hover/zone:border-[var(--color-brand-orange)] group-hover/zone:scale-110 transition-all duration-700" />
                            <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-[3px] border-r-[3px] border-[var(--color-brand-orange)]/30 rounded-br-[54px] z-20 pointer-events-none group-hover/zone:border-[var(--color-brand-orange)] group-hover/zone:scale-110 transition-all duration-700" />

                            <div
                              onClick={() => uploadMod === 'dosya' && fileRef.current?.click()}
                              className={`
                                relative h-full min-h-[450px] rounded-[54px] overflow-hidden transition-all duration-700
                                border-2 border-dashed
                                ${(gorsel || (uploadMod === 'link' && imageUrl))
                                  ? 'border-transparent bg-white shadow-[0_40px_80px_rgba(0,0,0,0.08)]'
                                  : 'border-[var(--color-brand-dark)]/5 bg-white/30 backdrop-blur-3xl hover:bg-white/80 hover:border-[var(--color-brand-orange)]/20 hover:shadow-[0_48px_96px_rgba(255,77,0,0.08)]'
                                }
                                ${uploadMod === 'dosya' ? 'cursor-pointer' : 'cursor-default'}
                                flex flex-col items-center justify-center p-12 group/inner
                              `}
                            >
                              {/* Scanning Line Effect */}
                              {(!gorsel && !(uploadMod === 'link' && imageUrl)) && (
                                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-0 group-hover/inner:opacity-100 transition-opacity duration-700">
                                  <div className="w-full h-1/2 bg-gradient-to-b from-[var(--color-brand-orange)]/[0.08] to-transparent absolute top-0 animate-scan" />
                                </div>
                              )}

                              {uploadMod === 'dosya' && !gorsel && (
                                <div className="text-center space-y-10 relative z-20">
                                  <div className="w-28 h-28 rounded-[36px] bg-gradient-to-br from-[var(--color-brand-orange)] to-[#ff8c00] flex items-center justify-center mx-auto group-hover/inner:scale-110 group-hover/inner:rotate-[8deg] transition-all duration-700 shadow-[0_24px_48px_rgba(255,77,0,0.3)]">
                                    <Upload className="w-12 h-12 text-white" />
                                  </div>
                                  <div className="space-y-4">
                                    <p className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight uppercase">Tasarımı Buraya Bırak</p>
                                    <p className="text-[var(--color-brand-dark)]/30 text-xs font-black uppercase tracking-[0.4em]">Sürükle bırak veya tıklayarak seç</p>
                                  </div>
                                </div>
                              )}

                              {uploadMod === 'link' && !gorsel && (
                                <div className="text-center space-y-10 relative z-20 w-full max-w-lg px-8">
                                  <div className="w-28 h-28 rounded-[36px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-[0_24px_48px_rgba(59,130,246,0.3)]">
                                    <LinkIcon className="w-12 h-12 text-white" />
                                  </div>
                                  <div className="space-y-8">
                                    <div className="space-y-3">
                                      <p className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight uppercase">Tasarım Linkini Yapıştır</p>
                                      <p className="text-[var(--color-brand-dark)]/30 text-xs font-black uppercase tracking-[0.4em]">Behance, Dribbble veya Portfolyo Linki</p>
                                    </div>
                                    <div className="relative group/link">
                                      <input
                                        type="text"
                                        placeholder="https://behance.net/gallery/..."
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-white/80 border-2 border-[var(--color-brand-dark)]/5 text-[var(--color-brand-dark)] rounded-[24px] px-8 py-5 text-base focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold pr-16 shadow-inner placeholder:text-[var(--color-brand-dark)]/20"
                                      />
                                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500">
                                        <ExternalLink className="w-6 h-6" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(gorsel) && (
                                <div className="w-full h-full relative group/img p-4 flex items-center justify-center">
                                  <img src={gorsel} alt="Tasarım" className="max-w-full max-h-[450px] object-contain rounded-[36px] shadow-2xl" />
                                  <div className="absolute inset-0 bg-[var(--color-brand-dark)]/70 opacity-0 group-hover/img:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-md rounded-[54px]">
                                    <div className="flex gap-8 scale-90 group-hover/img:scale-100 transition-transform duration-500">
                                      {uploadMod === 'dosya' && (
                                        <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="w-16 h-16 bg-white rounded-[24px] text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-orange)] hover:text-white transition-all shadow-2xl flex items-center justify-center">
                                          <RotateCcw className="w-7 h-7" />
                                        </button>
                                      )}
                                      <button onClick={(e) => { e.stopPropagation(); setGorsel(null); setGorselBase64(null); setImageUrl(""); }} className="w-16 h-16 bg-white rounded-[24px] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-2xl flex items-center justify-center">
                                        <X className="w-7 h-7" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Parameters Below Upload in the right column */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tasarım Türü */}
                        <div className={`${gc.card} p-6 space-y-4 border border-white/60 relative overflow-hidden group/card`}>
                          <span className={gc.label}>Tasarım Formatı</span>
                          <div className="grid grid-cols-2 gap-3 relative z-10">
                            {tasarimTuruConfig.map(({ id, icon }) => (
                              <button
                                key={id}
                                onClick={() => setTasarimTuru(id)}
                                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-400 ${tasarimTuru === id
                                  ? "bg-[var(--color-brand-orange)] text-white border-[var(--color-brand-orange)] shadow-[0_12px_24px_rgba(255,77,0,0.2)] scale-[1.02]"
                                  : "bg-white/40 border-[var(--color-brand-dark)]/5 text-[var(--color-brand-dark)] hover:bg-white hover:border-[var(--color-brand-dark)]/10"
                                  }`}
                              >
                                <div className={`p-2 rounded-xl ${tasarimTuru === id ? "bg-white/20" : "bg-[var(--color-brand-dark)]/5"}`}>
                                  {React.cloneElement(icon as any, { className: "w-4 h-4" })}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider">{id}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sektör */}
                        <div className={`${gc.card} p-6 space-y-4 border border-white/60 relative overflow-hidden group/card`}>
                          <span className={gc.label}>Hedef Sektör</span>
                          <div className="space-y-3 relative z-10">
                            <select
                              value={isletme}
                              onChange={(e) => setIsletme(e.target.value)}
                              className={`${gc.input} !py-4 !px-5 text-xs font-black uppercase tracking-wider !bg-white/40 backdrop-blur-md cursor-pointer`}
                            >
                              {isletmeTurleri.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <AnimatePresence mode="wait">
                              {isletme === "Diğer" && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                  <input
                                    type="text"
                                    placeholder="Sektörünüzü belirtin..."
                                    value={digerIsletme}
                                    onChange={(e) => setDigerIsletme(e.target.value)}
                                    className={`${gc.input} !py-4 !px-5 text-xs font-bold !bg-white/40`}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {(gorsel || (uploadMod === 'link' && imageUrl)) && (
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAdim(2)}
                          className="w-full py-6 rounded-[32px] bg-[var(--color-brand-dark)] text-white font-black text-xl shadow-[0_24px_48px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-4 group"
                        >
                          STRATEJİYE GEÇ
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[var(--color-brand-orange)] transition-colors">
                            <ArrowUpRight className="w-6 h-6" />
                          </div>
                        </motion.button>
                      )}

                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleDosya(e.target.files[0])} />
                    </motion.div>
                  )}

                  {/* ADIM 2 */}
                  {adim === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="w-full space-y-8"
                    >
                      <div className={`${gc.card} overflow-hidden border border-white/60`}>
                        <div className="bg-[var(--color-brand-dark)] p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)] animate-pulse" />
                            <p className="text-white text-[12px] font-black uppercase tracking-[0.2em]">SİSTEM BİLGİ GİRİŞİ</p>
                          </div>
                          <Sparkles className="w-5 h-5 text-white/20" />
                        </div>
                        <div className="p-8 space-y-6">
                          {[
                            { key: "markaAdi", label: "Marka Adı", ph: "örn. Brew & Co." },
                            { key: "isYapisi", label: "Marka Ne İş Yapar?", ph: "örn. Butik Cafe ve Tatlı Salonu" },
                            { key: "kurumselRenk", label: "Kurumsal Renkler", ph: "örn. Yeşil, Krem" },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-dark)]/30 ml-2 mb-2 block">{f.label}</label>
                              <input
                                value={(sorular as any)[f.key]}
                                onChange={e => setSorular(p => ({ ...p, [f.key]: e.target.value }))}
                                placeholder={f.ph}
                                className={`${gc.input} !py-4 !px-6 !bg-white/40 backdrop-blur-md`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {hata && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-black uppercase tracking-widest text-center">
                          {hata}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button
                          onClick={() => setAdim(1)}
                          className="flex-1 py-5 rounded-[24px] bg-white/40 backdrop-blur-md border border-white text-[var(--color-brand-dark)]/60 font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center justify-center gap-3"
                        >
                          <ChevronLeft className="w-4 h-4" /> Geri
                        </button>
                        <button
                          onClick={analiz}
                          disabled={yukleniyor}
                          className={`
                            flex-[2] py-5 rounded-[24px] font-black text-white transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]
                            ${yukleniyor ? "bg-[var(--color-brand-dark)]/10 text-[var(--color-brand-dark)]/30 cursor-not-allowed" : "bg-[var(--color-brand-orange)] shadow-[0_24px_48px_rgba(255,77,0,0.2)] hover:scale-[1.02] active:scale-[0.98]"}
                          `}
                        >
                          {yukleniyor ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Analiz ediliyor...
                            </>
                          ) : (
                            <>Tasarımı Analiz Et <Sparkles className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>

            </div>
          ) : (
            <main className={`flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-4 pt-24 pb-20 mt-4 relative z-10 transition-all duration-700`}>
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4 pl-2">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-brand-orange)]/10 flex items-center justify-center relative">
                        <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-[2px] border-white rounded-full"></div>
                        <span className="text-xl font-black text-[var(--color-brand-dark)]">{isletme.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-[var(--color-brand-dark)] font-bold text-base leading-tight">Analiz Raporu</h3>
                        <p className="text-[var(--color-brand-dark)]/40 text-xs font-medium">Hoş geldin, projen hazır 👋</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <button onClick={sifirla} className="px-4 py-2 rounded-xl text-[var(--color-brand-dark)]/60 hover:bg-[var(--color-brand-light)] font-semibold text-sm transition-colors border border-transparent hover:border-[var(--color-brand-dark)]/5 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Yeni Analiz
                      </button>
                      <button
                        onClick={indirPDF}
                        disabled={yukleniyor}
                        className="px-4 py-2 rounded-xl text-[var(--color-brand-dark)]/60 hover:bg-[var(--color-brand-light)] font-semibold text-sm transition-colors border border-[var(--color-brand-dark)]/10 flex items-center gap-2"
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
                            if (basarili) setGorunum('vitrin');
                            setYayinlaniyor(false);
                          }, 1500);
                        }}
                        className="px-5 py-2 rounded-xl bg-[var(--color-brand-orange)] text-white font-bold text-sm shadow-[0_4px_12px_rgba(255,77,0,0.2)] hover:bg-[#e64500] transition-colors flex items-center gap-2 disabled:opacity-50"
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
                          { label: "Baskın Renk", value: sonuc.teknikOzet?.baskinRenkSayisi || 3, sub: "farklı renk", icon: <Palette />, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
                          { label: "Görsel Düzen", value: `%${sonuc.teknikOzet?.detayYogunlugu || 45}`, sub: "doluluk oranı", icon: <Grid />, color: "text-[#38bdf8]", bg: "bg-[#38bdf8]/10" },
                          { label: "Okunabilirlik", value: sonuc.teknikOzet?.kontrastDegeri || 'Yüksek', sub: "metin netliği", icon: <TypeIcon />, color: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/10" }
                        ].map((m, i) => (
                          <div key={i} className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                            <div className="flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-full ${m.bg} ${m.color} flex items-center justify-center mb-4`}>
                                {React.cloneElement(m.icon as any, { className: "w-6 h-6" })}
                              </div>
                              <p className="text-[var(--color-brand-dark)]/40 text-[10px] uppercase font-bold tracking-widest text-center">{m.label}</p>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-black text-[var(--color-brand-dark)] tracking-tight">{m.value}</span>
                              </div>
                              <span className="text-[var(--color-brand-dark)]/40 text-xs font-semibold bg-gray-50 px-2 py-0.5 rounded-full mt-2">{m.sub}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Middle Gauge & Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Gauge Card */}
                        <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-[var(--color-brand-dark)]/40" />
                              <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Tasarım Puanı</span>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-dark)]/40 border border-[var(--color-brand-dark)]/10 px-3 py-1 rounded-full hover:bg-[var(--color-brand-light)]">Detaylar</button>
                          </div>
                          <ScoreRing score={sonuc.genelPuan} />
                          <div className="mt-8 pt-4 border-t border-[var(--color-brand-dark)]/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <span className="text-green-500 text-sm font-bold">+</span>
                            </div>
                            <div>
                              <p className="text-[var(--color-brand-dark)] text-sm font-bold">Harika!</p>
                              <p className="text-[var(--color-brand-dark)]/40 text-[10px]">Genel kalite standartını yakaladınız.</p>
                            </div>
                            <ChevronRight className="w-4 h-4 ml-auto text-[var(--color-brand-dark)]/30" />
                          </div>
                        </div>

                        {/* Summary / Productivity Card */}
                        <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-4 h-4 text-[var(--color-brand-dark)]/40" />
                              <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Detaylı Analiz</span>
                            </div>
                          </div>
                          <div className="space-y-4 flex-1 flex flex-col justify-center">
                            {kriterler.slice(0, 4).map((k) => (
                              <div key={k.key}>
                                <div className="flex justify-between items-end mb-1.5">
                                  <span className="text-[var(--color-brand-dark)]/60 text-[11px] font-bold">{k.label}</span>
                                  <span className="text-[var(--color-brand-dark)] text-sm font-black">{sonuc[k.key]?.puan}/25</span>
                                </div>
                                <div className="h-[6px] w-full bg-[var(--color-brand-light)] rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(sonuc[k.key]?.puan / 25) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-[#10b981] rounded-full"
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
                      <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b border-[var(--color-brand-dark)]/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[var(--color-brand-dark)]/40" />
                            <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Yüklediğiniz Tasarım</span>
                          </div>
                          <button className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-dark)]/40 border border-[var(--color-brand-dark)]/10 px-3 py-1 rounded-full hover:bg-[var(--color-brand-light)]">Büyüt</button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center items-center bg-[var(--color-brand-light)]/50 group cursor-zoom-in min-h-[220px]" onClick={() => gorsel && setSeciliGorsel(gorsel)}>
                          <img src={gorsel!} alt="Orijinal" className="max-w-full max-h-[250px] object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-500 shadow-sm" />
                        </div>

                        {/* Sub Colors */}
                        {sonuc.renkPaleti?.length > 0 && (
                          <div className="p-4 border-t border-[var(--color-brand-dark)]/5 bg-white">
                            <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                              {sonuc.renkPaleti.slice(0, 5).map((hex: string, i: number) => (
                                <div key={i} className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => renkKopyala(hex)}>
                                  <div className="w-8 h-8 rounded-full border border-[var(--color-brand-dark)]/10 shadow-inner group-hover:scale-110 transition-transform relative" style={{ backgroundColor: hex }}>
                                    {kopyalananRenk === hex && <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full"><Check className="w-4 h-4 text-white" /></div>}
                                  </div>
                                  <span className="text-[8px] font-mono font-bold text-[var(--color-brand-dark)]/30 opacity-0 group-hover:opacity-100 transition-opacity">{hex.toUpperCase()}</span>
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
                    <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-[var(--color-brand-dark)]/40" />
                          <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Geri Bildirimler</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-[var(--color-brand-light)] p-4 rounded-xl">
                          <p className="text-[var(--color-brand-dark)]/80 text-[13px] font-semibold leading-relaxed">"{sonuc.genelYorum}"</p>
                        </div>
                        {sonuc.gucluYon && (
                          <div className="flex items-start gap-3 border border-[var(--color-brand-dark)]/5 rounded-xl p-4">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-[var(--color-brand-dark)]/40 text-[9px] font-bold uppercase tracking-widest mb-1">Güçlü Yön</p>
                              <p className="text-[var(--color-brand-dark)]/70 text-xs leading-relaxed">{sonuc.gucluYon}</p>
                            </div>
                          </div>
                        )}
                        {sonuc.zayifYon && (
                          <div className="flex items-start gap-3 border border-[var(--color-brand-dark)]/5 rounded-xl p-4">
                            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-3 h-3 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-[var(--color-brand-dark)]/40 text-[9px] font-bold uppercase tracking-widest mb-1">Geliştirilebilir</p>
                              <p className="text-[var(--color-brand-dark)]/70 text-xs leading-relaxed">{sonuc.zayifYon}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Suggestion */}
                    <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 md:p-8 flex flex-col relative overflow-hidden group">
                      {/* Arka plan efektleri (Parallax & Glow) */}
                      <div className="absolute top-[-50%] right-[-10%] w-[150%] h-[150%] bg-gradient-to-br from-[#ff4d00]/10 via-purple-600/5 to-transparent blur-3xl rounded-full transform rotate-12 group-hover:opacity-100 opacity-60 transition-opacity duration-700 pointer-events-none"></div>

                      <div className="relative z-10 flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff4d00]/20 to-amber-500/20 flex items-center justify-center border border-[#ff4d00]/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="w-6 h-6 text-[#ff4d00]" />
                          </div>
                          <div>
                            <span className="text-[var(--color-brand-dark)] font-black text-xl tracking-tight block leading-tight">AI Tasarım Revizyonu</span>
                            <span className="text-[var(--color-brand-dark)]/40 text-[10px] font-bold uppercase tracking-widest mt-0.5 block">Sizi Bir Üst Seviyeye Taşır</span>
                          </div>
                        </div>
                        <span className="bg-gradient-to-r from-[#ff4d00] to-amber-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(255,77,0,0.4)] border border-white/20">PRO</span>
                      </div>

                      <div className="relative z-10 flex-1 border border-[#ff4d00]/20 bg-gradient-to-br from-[#ff4d00]/[0.1] to-transparent rounded-2xl p-8 mb-6 backdrop-blur-md group-hover:border-[#ff4d00]/30 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden">
                        {/* Blur overlay for PRO info */}
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Sparkles className="w-6 h-6 text-[#ff4d00]" />
                          </div>
                          <p className="text-[var(--color-brand-dark)] font-bold text-sm mb-1 uppercase tracking-tight">Revizyon Detayları Kilitli</p>
                          <p className="text-[var(--color-brand-dark)]/40 text-[10px] uppercase font-black tracking-widest leading-normal">
                            AI ile tasarımınızı otomatik iyileştirmek ve teknik revizyonları görmek için PRO plana geçin.
                          </p>
                        </div>
                        <p className="text-[var(--color-brand-dark)]/80 text-[14px] opacity-20 select-none blur-[2px]">
                          {sonuc.oneri}
                        </p>
                      </div>

                      <button className="relative z-10 w-full py-4 rounded-xl bg-[var(--color-brand-dark)] hover:bg-black text-white font-black text-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden">
                        {/* Shimmer effect inside button */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
                        <span className="relative z-10 flex items-center gap-2">Tasarımı AI İle İyileştir <ChevronRight className="w-4 h-4" /></span>
                      </button>
                    </div>
                  </div>

                  {/* RESOURCES & DISCLAIMER */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
                    {/* Educational Resources */}
                    <div className="col-span-1 md:col-span-8 bg-white/50 backdrop-blur-sm rounded-[24px] border border-[var(--color-brand-dark)]/5 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-[var(--color-brand-orange)]" />
                        <h4 className="font-bold text-[var(--color-brand-dark)] text-sm uppercase tracking-wider">Tasarımını Geliştirmen İçin Kaynaklar</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { title: "Nielsen Norman Group", desc: "UX/UI dünyasının en prestijli eğitim ve araştırma kurumu.", url: "https://www.nngroup.com/" },
                          { title: "Interaction Design Foundation", desc: "Tasarım prensiplerini derinlemesine öğrenin.", url: "https://www.interaction-design.org/" },
                          { title: "Color Contrast Guide (WCAG)", desc: "Erişilebilir renk kullanımı kuralları.", url: "https://webaim.org/resources/contrastchecker/" },
                          { title: "Laws of UX", desc: "Kullanıcı psikolojisi ve tasarım kural seti.", url: "https://lawsofux.com/" }
                        ].map((source, i) => (
                          <a target="_blank" rel="noopener noreferrer" key={i} href={source.url} className="group block p-4 bg-white rounded-xl border border-[var(--color-brand-dark)]/5 hover:border-[var(--color-brand-orange)]/30 transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[var(--color-brand-dark)] text-xs">{source.title}</span>
                              <ExternalLink className="w-3 h-3 text-[var(--color-brand-dark)]/20 group-hover:text-[var(--color-brand-orange)] transition-colors" />
                            </div>
                            <p className="text-[var(--color-brand-dark)]/40 text-[10px] leading-relaxed">{source.desc}</p>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="col-span-1 md:col-span-4 bg-white/50 backdrop-blur-sm rounded-[24px] border border-[var(--color-brand-dark)]/5 p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-[var(--color-brand-dark)] text-xs uppercase tracking-wider">Önemli Not</h4>
                      </div>
                      <p className="text-[var(--color-brand-dark)]/50 text-[11px] leading-relaxed italic">
                        "Feragatname: Bu eleştiri yapay zeka teknolojisi kullanılarak oluşturulur ve yalnızca bir rehberlik aracı olarak kullanılmalıdır. Doğruluk için çaba gösterirken, nihai tasarım kararlarında insan yargısı ve profesyonel uzmanlık dikkate alınmalıdır."
                      </p>
                    </div>
                  </div>

                  {/* Footer Padding for aesthetics */}
                  <div className="h-12 w-full" />
                </motion.div>
              )}
            </main>
          )}
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
                className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-[var(--color-brand-light)]/95 backdrop-blur-3xl"
              >
                {/* AI Beyin / Tarama Animasyonu */}
                <div className="relative mb-12">
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-20px] rounded-full border border-dashed border-[var(--color-brand-orange)]/20"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 0 40px rgba(255, 77, 0, 0.1)",
                        "0 0 80px rgba(255, 77, 0, 0.3)",
                        "0 0 40px rgba(255, 77, 0, 0.1)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-40 h-40 rounded-full border-2 border-[var(--color-brand-orange)]/40 flex items-center justify-center bg-white shadow-2xl relative z-10"
                  >
                    <div className="absolute inset-2 rounded-full border border-[var(--color-brand-orange)]/10 animate-pulse" />
                    <BrainCircuit className="w-16 h-16 text-[var(--color-brand-orange)]" />
                  </motion.div>
                </div>

                {/* Başlık */}
                <div className="space-y-4 text-center px-6">
                  <h2 className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">
                    Zeka <span className="text-[var(--color-brand-orange)]">Taraması Başladı</span>
                  </h2>
                  <p className="text-[var(--color-brand-dark)]/40 text-sm font-medium max-w-xs mx-auto">
                    Tasarımınızın her pikselini profesyonel kriterlere göre analiz ediyoruz.
                  </p>
                </div>

                <div className="flex items-center gap-3 my-10">
                  <motion.div
                    animate={{ x: [-10, 10, -10] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-1 w-24 bg-gradient-to-r from-transparent via-[var(--color-brand-orange)] to-transparent rounded-full opacity-30"
                  />
                </div>

                {/* Dinamik İpuçları (Karusel) */}
                <div className="h-24 w-full max-w-lg flex items-center justify-center overflow-hidden relative border border-[var(--color-brand-dark)]/5 bg-white rounded-3xl p-6 shadow-sm">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingTipIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5 }}
                      className="text-[var(--color-brand-dark)]/60 text-sm md:text-base text-center leading-relaxed font-medium absolute w-full px-6"
                    >
                      {KARUSEL_IPUCLARI[loadingTipIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <p className="fixed bottom-10 text-[var(--color-brand-dark)]/40 text-xs font-bold tracking-widest uppercase">
                  Bu işlem birkaç saniye sürebilir
                </p>
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
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--color-brand-light)]/80 backdrop-blur-xl"
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
                  <h3 className="text-xl font-bold text-[var(--color-brand-dark)] mb-2">Giriş Yapmadınız</h3>
                  <p className="text-[var(--color-brand-dark)]/60 text-sm mb-6 leading-relaxed">
                    Misafir olarak analiz yapabilirsiniz ancak analiziniz <strong>kaydedilmeyecek</strong>, istatistiklerinize yansımayacak ve daha sonra erişilemeyecektir.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setAuthUyariAcik(false);
                        setAuthAcik(true);
                        setAuthMod('kayit');
                      }}
                      className="w-full py-3 rounded-xl bg-[var(--color-brand-dark)] text-white font-bold transition-transform hover:scale-[1.02] shadow-sm"
                    >
                      Kayıt Ol / Giriş Yap
                    </button>
                    <button
                      onClick={() => {
                        setAuthUyariAcik(false);
                        analiziBaslat(true);
                      }}
                      className="w-full py-3 rounded-xl bg-white hover:bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]/70 hover:text-[var(--color-brand-dark)] font-semibold transition-colors border border-[var(--color-brand-dark)]/10"
                    >
                      Kayıt Olmadan Devam Et
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
                        {/* Daha önce burada olan userStats kısmı kaldırıldı çünkü root objesi zaten user_id'ye ait */}

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

          {/* ── AUTH MODAL ── */}
          <AnimatePresence>
            {authAcik && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-brand-light)]/90 backdrop-blur-2xl"
                onClick={() => setAuthAcik(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ ease: [0.22, 1, 0.36, 1] }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-sm bg-white border border-[var(--color-brand-dark)]/10 rounded-3xl shadow-sm overflow-hidden"
                >
                  <div className="p-5 border-b border-[var(--color-brand-dark)]/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-[var(--color-brand-orange)]" />
                      <div className="flex gap-1" style={{ position: 'relative', zIndex: 10 }}>
                        {(['giris', 'kayit'] as const).map(m => (
                          <button key={m} onClick={() => setAuthMod(m)}
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${authMod === m ? 'bg-[var(--color-brand-orange)] text-white shadow-sm' : 'text-[var(--color-brand-dark)]/40 hover:text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-light)]'}`}>
                            {m === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setAuthAcik(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]/40 hover:text-[var(--color-brand-dark)] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={e => { e.preventDefault(); girisYap(); }} className="p-5 space-y-3">
                    <input type="email" placeholder="E-posta" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                      className="bg-[var(--color-brand-light)] border border-[var(--color-brand-dark)]/5 rounded-xl text-[var(--color-brand-dark)] text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-[var(--color-brand-dark)]/30" />
                    <input type="password" placeholder="Şifre" value={authSifre} onChange={e => setAuthSifre(e.target.value)}
                      className="bg-[var(--color-brand-light)] border border-[var(--color-brand-dark)]/5 rounded-xl text-[var(--color-brand-dark)] text-sm p-3 w-full outline-none focus:border-[var(--color-brand-orange)]/50 focus:bg-white transition-colors placeholder:text-[var(--color-brand-dark)]/30" />

                    {authHata && <p className="text-red-500/80 text-[11px] px-1">{authHata}</p>}

                    <button type="submit" disabled={authYukleniyor || !authEmail || !authSifre}
                      className="w-full py-3 rounded-xl bg-[var(--color-brand-dark)] text-white text-sm font-bold hover:bg-[var(--color-brand-dark)]/90 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {authYukleniyor ? <div className="w-4 h-4 border-2 border-white/30 border-t-[var(--color-brand-orange)] rounded-full animate-spin" /> : null}
                      {authMod === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'}
                    </button>

                    {authMod === 'kayit' && (
                      <p className="text-[var(--color-brand-dark)]/40 text-[10px] text-center leading-relaxed">
                        Kayıt olduktan sonra e-postanı doğrulamanı isteyebilir.
                      </p>
                    )}
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <LiveActivityFeed />
      <Footer onLogoClick={goHome} />
    </div>
  );
}
