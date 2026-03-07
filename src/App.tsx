import React, { useState, useRef, useEffect } from "react";
import Lenis from 'lenis';
import { motion, AnimatePresence } from "motion/react";
import { Upload, ChevronRight, ChevronLeft, RotateCcw, Palette, Type as TypeIcon, Layout, Grid, Sparkles, Smartphone, Building2, ShoppingBag, Printer, BarChart2, Share2, User, X, LogOut, Copy, Check, AlertCircle, Globe, BrainCircuit, ArrowUpRight, Layers, Code, Scan } from "lucide-react";
import { supabase } from "./lib/supabase";
import { Vitrin } from "./pages/Vitrin";
import TextPressure from "./components/ui/TextPressure";
import LandingPage from "./pages/LandingPage";
import Footer from "./components/ui/Footer";
import Community from "./pages/Community";
import Header from "./components/ui/Header";

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
  const r = 58, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#38bdf8" : score >= 50 ? "#fbbf24" : "#f87171";
  const glowRgb = score >= 75 ? "56,189,248" : score >= 50 ? "251,191,36" : "248,113,113";
  const label = score >= 75 ? "Harika" : score >= 50 ? "İyi" : "Geliştirilebilir";

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative w-[140px] h-[140px]">
        {/* Glow behind ring */}
        <div className="absolute -inset-4 rounded-full" style={{ background: `radial-gradient(circle at center, rgba(${glowRgb}, 0.25) 0%, rgba(${glowRgb}, 0) 70%)` }} />
        <svg width={140} height={140} viewBox="0 0 140 140" className="transform -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
          <motion.circle
            cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 12px rgba(${glowRgb},0.6))` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[var(--color-brand-dark)] text-4xl font-extrabold leading-none tracking-tight"
          >
            {score}
          </motion.span>
          <span className="text-[var(--color-brand-dark)]/40 text-[11px] font-semibold mt-1 tracking-wider">/100</span>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ color }}
        className="text-sm font-bold mt-4 tracking-wide uppercase"
      >
        {label}
      </motion.span>
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
  const [gorunum, setGorunum] = useState<'landing' | 'app' | 'vitrin' | 'community'>('landing'); // Default to landing page
  const [gorsel, setGorsel] = useState<string | null>(initGorsel);
  const [gorselBase64, setGorselBase64] = useState<string | null>(initGorselBase64);
  const [revizeGorsel, setRevizeGorsel] = useState<string | null>(() => getSessionData('ra_revizeGorsel', null));
  const [tasarimTuru, setTasarimTuru] = useState<TasarimTuru>(() => getSessionData('ra_tasarimTuru', 'Sosyal Medya'));
  const [platform, setPlatform] = useState<string>(() => getSessionData('ra_platform', 'Instagram Post'));
  const [isletme, setIsletme] = useState(() => getSessionData('ra_isletme', "E-Ticaret"));
  const [digerIsletme, setDigerIsletme] = useState(() => getSessionData('ra_digerIsletme', ""));
  const [sorular, setSorular] = useState(() => getSessionData('ra_sorular', { markaAdi: "", kurumselRenk: "", isYapisi: "", hedefKitle: "", slogan: "" }));
  const [yukleniyor, setYukleniyor] = useState(false);
  const [revizeYukleniyor, setRevizeYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<any>(() => getSessionData('ra_sonuc', null));

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
    } catch (e) {
      console.warn("SessionStorage aşıldı.", e);
    }
  }, [adim, gorsel, gorselBase64, revizeGorsel, tasarimTuru, platform, isletme, digerIsletme, sorular, sonuc]);

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
    if (!gorselBase64) return;
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
          imageBase64: gorselBase64,
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
  };

  const goHome = () => {
    setGorunum('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] selection:bg-[#ff4d00] selection:text-white font-sans flex flex-col justify-between overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
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
      ) : (
        <>
          {/* Studio Side Panels (Desktop Only) */}
          {adim < 3 && (
            <>
              {/* Left Panel - Engine / Status */}
              <div className="hidden xl:flex absolute left-8 top-[35%] -translate-y-1/2 flex-col gap-6 z-0">
                <div className="bg-[var(--color-brand-dark)] text-white p-6 rounded-[32px] shadow-2xl space-y-6 w-56 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black tracking-[0.3em] text-[var(--color-brand-orange)] uppercase mb-1">Motor</p>
                      <p className="text-2xl font-black font-mono tracking-tighter">v4.2.0</p>
                    </div>
                    <BrainCircuit className="w-6 h-6 text-white/20" />
                  </div>
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <p className="text-[9px] font-black tracking-[0.3em] text-white/40 uppercase">Ağ Durumu</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[11px] font-bold text-white tracking-widest">SİSTEM AKTİF</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <p className="text-[9px] font-black tracking-[0.3em] text-white/40 uppercase mb-2">Uygulananlar</p>
                    {['Renk Taraması', 'A/B Tipografi', 'Hiyerarşi'].map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--color-brand-orange)]" />
                        <span className="text-[10px] font-bold text-white/70 tracking-wider font-mono">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Design Tools */}
              <div className="hidden xl:flex absolute right-8 top-[35%] -translate-y-1/2 flex-col items-end gap-6 z-0">
                <div className="bg-[var(--color-brand-dark)] text-white p-6 rounded-[32px] shadow-2xl space-y-6 w-56 border border-white/5">
                  <p className="text-[9px] font-black tracking-[0.3em] text-white/40 uppercase mb-2">Kapsam Modülleri</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-[xl] aspect-square flex items-center justify-center hover:bg-white/10 transition-colors cursor-default"><Layers className="w-6 h-6 text-white/40 hover:text-white transition-colors" /></div>
                    <div className="bg-white/5 rounded-[xl] aspect-square flex items-center justify-center hover:bg-white/10 transition-colors cursor-default"><Palette className="w-6 h-6 text-white/40 hover:text-[var(--color-brand-orange)] transition-colors" /></div>
                    <div className="bg-white/5 rounded-[xl] aspect-square flex items-center justify-center hover:bg-white/10 transition-colors cursor-default"><Layout className="w-6 h-6 text-white/40 hover:text-white transition-colors" /></div>
                    <div className="bg-white/5 rounded-[xl] aspect-square flex items-center justify-center hover:bg-white/10 transition-colors cursor-default"><Scan className="w-6 h-6 text-white/40 hover:text-[var(--color-brand-orange)] transition-colors" /></div>
                  </div>

                  <div className="bg-[var(--color-brand-orange)]/10 p-4 rounded-2xl border border-[var(--color-brand-orange)]/20 mt-4 relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] text-[var(--color-brand-orange)]/10"><Sparkles className="w-16 h-16" /></div>
                    <p className="text-[9px] font-black tracking-widest uppercase text-[var(--color-brand-orange)] mb-1 relative z-10">YAPAY ZEKA</p>
                    <p className="text-xs font-bold text-white/90 relative z-10">Maksimum Verim</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <main className={`flex-1 flex flex-col items-center w-full max-w-screen-xl mx-auto px-4 pt-10 pb-20 mt-4 relative z-10 transition-all duration-700 ${adim === 3 ? 'max-w-6xl' : ''}`}>

            {/* Minimal Header for App Content */}
            {adim < 3 && (
              <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 max-w-2xl mx-auto"
              >
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-[var(--color-brand-dark)] tracking-tighter mb-4 leading-none">
                  REVİZE<span className="text-[var(--color-brand-orange)]">AI</span> <span className="text-[var(--color-brand-dark)]/10">STUDIO</span>
                </h1>
                <p className="text-[var(--color-brand-dark)]/30 text-xs font-black uppercase tracking-[0.4em]">Yapay Zeka Destekli Tasarım Analiz Platformu</p>
              </motion.header>
            )}

            {/* Stepper */}
            {adim < 3 && (
              <div className="flex items-center justify-center mb-10 bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded-full shadow-2xl scale-90 md:scale-100">
                <StepIndicator n={1} active={adim === 1} done={adim > 1} />
                <div className={`w-8 h-[1px] mx-3 ${adim > 1 ? "bg-white/50" : "bg-white/10"}`} />
                <StepIndicator n={2} active={adim === 2} done={adim > 2} />
                <div className={`w-8 h-[1px] mx-3 ${adim > 2 ? "bg-white/50" : "bg-white/10"}`} />
                <StepIndicator n={3} active={adim === 3} done={false} />
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* ADIM 1 */}
              {adim === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full space-y-8"
                >
                  {/* Compact Studio Upload Area */}
                  <div className="relative group mx-auto w-full max-w-lg">
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`
                      relative overflow-hidden cursor-pointer transition-all duration-500 rounded-[40px] border-2 border-dashed
                      ${gorsel
                          ? 'border-transparent bg-white shadow-2xl'
                          : 'border-[var(--color-brand-dark)]/5 bg-white/50 backdrop-blur-xl hover:bg-white hover:border-[var(--color-brand-orange)]/30 hover:shadow-2xl hover:shadow-[var(--color-brand-orange)]/5'
                        }
                      aspect-[4/3] flex flex-col items-center justify-center p-4
                    `}
                    >
                      {!gorsel && (
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 rounded-full bg-[var(--color-brand-orange)]/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                            <Upload className="w-8 h-8 text-[var(--color-brand-orange)]" />
                          </div>
                          <div>
                            <p className="text-xl font-black text-[var(--color-brand-dark)]">Tasarımı Bırak veya Seç</p>
                            <p className="text-[var(--color-brand-dark)]/30 text-xs font-bold uppercase tracking-widest mt-1">PNG, JPG, WEBP • Max 10MB</p>
                          </div>
                        </div>
                      )}

                      {gorsel && (
                        <div className="w-full h-full relative group/img">
                          <img src={gorsel} alt="Tasarım" className="w-full h-full object-contain rounded-[32px]" />
                          <div className="absolute inset-0 bg-[var(--color-brand-dark)]/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm rounded-[32px]">
                            <div className="flex gap-4">
                              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="p-3 bg-white rounded-2xl text-[var(--color-brand-dark)] hover:scale-110 transition-transform shadow-xl">
                                <RotateCcw className="w-6 h-6" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setGorsel(null); setGorselBase64(null); }} className="p-3 bg-white rounded-2xl text-red-500 hover:scale-110 transition-transform shadow-xl">
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleDosya(e.target.files[0])} />

                  {/* Compact Config Panel */}
                  {gorsel && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {/* Tasarım Türü */}
                      <div className={`${gc.card} p-5`}>
                        <span className={gc.label}>Tasarım Türü</span>
                        <div className="grid grid-cols-2 gap-2">
                          {tasarimTuruConfig.map(({ id, icon }) => (
                            <button
                              key={id}
                              onClick={() => setTasarimTuru(id)}
                              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${tasarimTuru === id
                                ? "bg-[var(--color-brand-orange)]/10 border-[var(--color-brand-orange)]/30"
                                : "bg-white border-[var(--color-brand-dark)]/5"
                                }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tasarimTuru === id ? "text-[var(--color-brand-orange)]" : "text-[var(--color-brand-dark)]/20"}`}>
                                {icon}
                              </div>
                              <span className={`text-[11px] font-bold ${tasarimTuru === id ? "text-[var(--color-brand-dark)]" : "text-[var(--color-brand-dark)]/40"}`}>{id}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sektör */}
                      <div className={`${gc.card} p-5`}>
                        <span className={gc.label}>İşletme / Sektör</span>
                        <div className="space-y-3">
                          <select
                            value={isletme}
                            onChange={(e) => setIsletme(e.target.value)}
                            className={`${gc.input} !py-3 !px-4 text-xs font-bold appearance-none`}
                          >
                            {isletmeTurleri.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          {isletme === "Diğer" && (
                            <input
                              type="text"
                              placeholder="Sektörünüz..."
                              value={digerIsletme}
                              onChange={(e) => setDigerIsletme(e.target.value)}
                              className={`${gc.input} !py-3 !px-4 text-xs`}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {gorsel && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setAdim(2)}
                      className="w-full py-5 rounded-[24px] bg-[var(--color-brand-orange)] text-white font-black text-xl shadow-2xl shadow-[var(--color-brand-orange)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      İLERLE <ArrowUpRight className="w-6 h-6" />
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* ADIM 2 */}
              {adim === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full space-y-6"
                >
                  <div className={`${gc.card} overflow-hidden`}>
                    <div className="bg-[var(--color-brand-dark)] p-4 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-orange)] animate-pulse" />
                      <p className="text-white text-[11px] font-black uppercase tracking-[0.2em]">SİSTEM BİLGİ GİRİŞİ</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="hidden"> {/* spacer */} </div>
                      {[
                        { key: "markaAdi", label: "Marka Adı", ph: "örn. Brew & Co." },
                        { key: "isYapisi", label: "Marka Ne İş Yapar?", ph: "örn. Butik Cafe ve Tatlı Salonu" },
                        { key: "kurumselRenk", label: "Kurumsal Renkler", ph: "örn. Yeşil, Krem" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-dark)]/30 ml-2 mb-1.5 block">{f.label}</label>
                          <input
                            value={(sorular as any)[f.key]}
                            onChange={e => setSorular(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.ph}
                            className={`${gc.input} !py-3.5`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {hata && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                    >
                      {hata}
                    </motion.div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setAdim(1)}
                      className="flex-1 py-4 rounded-2xl bg-white border border-[var(--color-brand-dark)]/10 text-[var(--color-brand-dark)]/70 font-semibold hover:bg-[var(--color-brand-light)] transition-all flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" /> Geri
                    </button>
                    <button
                      onClick={analiz}
                      disabled={yukleniyor}
                      className={`
                    flex-[2] py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2
                    ${yukleniyor ? "bg-[var(--color-brand-dark)]/10 text-[var(--color-brand-dark)]/30 cursor-not-allowed" : "bg-[var(--color-brand-orange)] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98]"}
                  `}
                    >
                      {yukleniyor ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[var(--color-brand-dark)]/30 border-t-[var(--color-brand-dark)] rounded-full animate-spin" />
                          Analiz ediliyor...
                        </>
                      ) : (
                        <>Tasarımı Analiz Et <Sparkles className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ADIM 3 — Premium Dashboard */}
              {adim === 3 && sonuc && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4 w-full"
                >
                  {/* Demo Mode Banner */}
                  {sonuc._demo && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[11px] font-medium">
                      <span className="text-lg">⚡</span>
                      <span><strong>Demo Modu</strong> — Gemini API kotası doldu. Sabah 03:00'da sıfırlanır. Gösterilen sonuçlar örnek verilerdir.</span>
                    </div>
                  )}

                  {/* Hero Feature: Orijinal Tasarım (Tam Genişlik) */}
                  <GlassCard glowColor="cyan" delay={0.1}>
                    <div className="p-4 border-b border-[var(--color-brand-dark)]/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)]" style={{ boxShadow: '0 0 8px rgba(255, 77, 0, 0.4)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-dark)]/40">Orijinal Tasarım</span>
                      </div>
                      <span className="text-[9px] font-semibold text-[var(--color-brand-dark)]/50 bg-[var(--color-brand-dark)]/5 px-3 py-1 rounded-full">{isletme}</span>
                    </div>
                    <div
                      onClick={() => gorsel && setSeciliGorsel(gorsel)}
                      className="cursor-zoom-in group relative"
                    >
                      <img src={gorsel!} alt="Orijinal" className="w-full max-h-[500px] object-contain bg-[var(--color-brand-light)] transition-all duration-700 group-hover:scale-[1.01]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-light)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                        <span className="text-[var(--color-brand-dark)] text-xs font-medium bg-white/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white">Büyütmek için tıkla</span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Butonlar: Yeni Analiz & Showcase Yayınla */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={sifirla}
                      className="group relative w-full py-4 px-6 rounded-[24px] font-bold overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] border border-[var(--color-brand-dark)]/10 bg-white shadow-sm flex flex-col items-center justify-center min-h-[140px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-light)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="relative z-10 flex flex-col items-center justify-center gap-3 text-[var(--color-brand-dark)]">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-brand-light)] flex items-center justify-center border border-[var(--color-brand-dark)]/10 group-hover:-rotate-180 transition-transform duration-700">
                          <RotateCcw className="w-5 h-5 text-[var(--color-brand-orange)]" />
                        </div>
                        <span className="text-sm tracking-wide font-black text-[var(--color-brand-dark)]">Yeni Analiz Yap</span>
                      </span>
                    </button>

                    <GlassCard className="w-full flex flex-col justify-between p-5 overflow-hidden min-h-[140px] relative group rounded-[24px]" glowColor="yellow" delay={0.2}>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="relative z-10 flex gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 flex-shrink-0 relative">
                          <div className="absolute inset-0 rounded-full border border-yellow-400/20 animate-ping opacity-20" />
                          <Sparkles className="w-4 h-4 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="text-[var(--color-brand-dark)] text-xs font-bold tracking-wide flex items-center gap-2">
                            Keşfet'te Paylaş
                          </h4>
                          <p className="text-[var(--color-brand-dark)]/60 text-[10px] mt-1 leading-relaxed">
                            Tasarımını toplulukla buluştur, puan topla.
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 mt-auto w-full">
                        {vitrindeYayinlandi ? (
                          <button
                            disabled
                            className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-[11px] border border-emerald-500/30 cursor-default flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Yayında!
                          </button>
                        ) : (
                          <button
                            disabled={yayinlaniyor}
                            onClick={async () => {
                              setYayinlaniyor(true);
                              const basarili = await vitrindeYayinla();
                              if (basarili) {
                                setTimeout(() => {
                                  setGorunum('vitrin');
                                  setYayinlaniyor(false);
                                }, 1500);
                              } else {
                                setYayinlaniyor(false);
                              }
                            }}
                            className={`w-full py-3 rounded-xl text-white font-bold text-[11px] transition-all flex items-center justify-center gap-2 shadow-sm ${yayinlaniyor ? 'bg-[var(--color-brand-dark)]/10 cursor-not-allowed border border-[var(--color-brand-dark)]/20 text-[var(--color-brand-dark)]/50' : 'bg-[var(--color-brand-orange)] hover:scale-[1.02] active:scale-[0.98]'}`}
                          >
                            {yayinlaniyor ? (
                              <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Yayınlanıyor...</>
                            ) : (
                              <>Keşfet'te Yayınla! <ChevronRight className="w-3 h-3" /></>
                            )}
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Score & General Summary Card */}
                  <GlassCard glowColor="blue" delay={0.3}>
                    <div className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
                      <div className="flex-shrink-0 scale-90 md:scale-100">
                        <ScoreRing score={sonuc.genelPuan} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <h3 className="text-xl font-bold text-[var(--color-brand-dark)] tracking-tight">Analiz Sonucu</h3>
                          {sonuc.genelDegerlendirme && (
                            <span className="inline-flex w-fit text-[9px] font-bold uppercase tracking-widest text-[#ff4d00] bg-[#ff4d00]/10 px-2 py-1 rounded-full border border-[#ff4d00]/20">
                              {sonuc.genelDegerlendirme}
                            </span>
                          )}
                        </div>
                        <p className="text-[var(--color-brand-dark)]/70 text-[13px] leading-relaxed text-left line-clamp-3 hover:line-clamp-none transition-all duration-300">
                          "{sonuc.genelYorum}"
                        </p>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Criteria Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {kriterler.map((k, i) => {
                      const puan = sonuc[k.key]?.puan || 0;
                      const pct = (puan / 25) * 100;
                      const color = pct >= 75 ? "#38bdf8" : pct >= 50 ? "#fbbf24" : "#f87171";
                      const glowColors = ["cyan", "blue", "purple", "green"];
                      return (
                        <GlassCard key={k.key} glowColor={glowColors[i]} delay={0.4 + (i * 0.1)}>
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-light)] border border-[var(--color-brand-dark)]/5 flex items-center justify-center text-[var(--color-brand-dark)]/50">
                                  {k.emoji}
                                </div>
                                <span className="text-[var(--color-brand-dark)]/70 font-semibold text-[13px]">{k.label}</span>
                              </div>
                            </div>
                            {/* Big score number */}
                            <div className="flex items-baseline gap-1.5 mb-3">
                              <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                                className="text-[var(--color-brand-dark)] text-3xl font-extrabold tracking-tight"
                              >
                                {puan}
                              </motion.span>
                              <span className="text-[var(--color-brand-dark)]/30 text-sm font-semibold">/25</span>
                            </div>
                            <ScoreBar puan={puan} />
                            <div className="mt-4">
                              <p className={`text-[var(--color-brand-dark)]/60 text-[11px] leading-relaxed transition-all duration-300 ${acikKriter === k.key ? '' : 'line-clamp-2'}`}>
                                {sonuc[k.key]?.aciklama}
                              </p>
                              {sonuc[k.key]?.aciklama && sonuc[k.key].aciklama.length > 80 && (
                                <button
                                  onClick={() => setAcikKriter(acikKriter === k.key ? null : k.key)}
                                  className="mt-1.5 text-[10px] font-semibold tracking-wide transition-colors"
                                  style={{ color: "var(--color-brand-orange)" }}
                                >
                                  {acikKriter === k.key ? '↑ Kapat' : '↓ Devamını gör'}
                                </button>
                              )}
                            </div>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>

                  {/* Color Palette + Technical Summary Row */}
                  {(sonuc.renkPaleti?.length > 0 || sonuc.teknikOzet) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* Color Palette */}
                      {sonuc.renkPaleti?.length > 0 && (
                        <GlassCard glowColor="blue" delay={0.7}>
                          <div className="p-4 border-b border-white/[0.06] flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-blue-400" style={{ boxShadow: '0 0 8px rgba(96,165,250,0.6)' }} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-dark)]/40">Renk Paleti</span>
                          </div>
                          <div className="p-5 flex flex-col gap-4">
                            <div className="flex flex-wrap gap-3 items-center">
                              {sonuc.renkPaleti.slice(0, 6).map((hex: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex flex-col items-center gap-1.5 group cursor-pointer relative"
                                  onClick={() => {
                                    navigator.clipboard.writeText(hex.toUpperCase());
                                    setKopyalananRenk(hex);
                                    setTimeout(() => setKopyalananRenk(null), 1800);
                                  }}
                                  title={`Kopyala: ${hex.toUpperCase()}`}
                                >
                                  {/* Tooltip */}
                                  {kopyalananRenk === hex && (
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--color-brand-dark)] text-white text-[9px] font-semibold px-2 py-1 rounded-md border-none whitespace-nowrap z-20 animate-fade-in">
                                      ✓ Kopyalandı
                                    </div>
                                  )}
                                  <div
                                    className="w-9 h-9 rounded-xl border border-[var(--color-brand-dark)]/10 shadow-sm transition-all duration-200 group-hover:scale-125 group-hover:rounded-2xl"
                                    style={{ backgroundColor: hex, boxShadow: `0 4px 16px ${hex}55` }}
                                  />
                                  <span className="text-[9px] text-[var(--color-brand-dark)]/40 font-mono tracking-wider group-hover:text-[var(--color-brand-dark)] transition-colors">{hex.toUpperCase()}</span>
                                </div>
                              ))}
                            </div>
                            {/* Güçlü / Zayıf yön */}
                            {(sonuc.gucluYon || sonuc.zayifYon) && (
                              <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                                {sonuc.gucluYon && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-emerald-500/80 text-[10px] mt-0.5">✦</span>
                                    <span className="text-[var(--color-brand-dark)]/60 text-[10px] leading-relaxed">{sonuc.gucluYon}</span>
                                  </div>
                                )}
                                {sonuc.zayifYon && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-amber-500/80 text-[10px] mt-0.5">△</span>
                                    <span className="text-[var(--color-brand-dark)]/60 text-[10px] leading-relaxed">{sonuc.zayifYon}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </GlassCard>
                      )}

                      {/* Technical Summary */}
                      {sonuc.teknikOzet && (
                        <GlassCard glowColor="purple" delay={0.75}>
                          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-purple-400" style={{ boxShadow: '0 0 8px rgba(168,85,247,0.5)' }} />
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-dark)]/40">Teknik Özet</span>
                            </div>
                          </div>
                          <div className="p-5 space-y-4">
                            {[
                              {
                                label: 'Baskın Renk Sayısı',
                                value: `${sonuc.teknikOzet.baskınRenkSayisi ?? '—'} renk`,
                                bar: false,
                              },
                              {
                                label: 'Detay Yoğunluğu',
                                value: `%${sonuc.teknikOzet.detayYogunlugu ?? 0}`,
                                bar: true,
                                pct: sonuc.teknikOzet.detayYogunlugu ?? 0,
                                color: '#818cf8',
                              },
                              {
                                label: 'Negatif Alan Oranı',
                                value: `%${sonuc.teknikOzet.negatifAlanOrani ?? 0}`,
                                bar: true,
                                pct: sonuc.teknikOzet.negatifAlanOrani ?? 0,
                                color: '#34d399',
                              },
                            ].map((item) => (
                              <div key={item.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[var(--color-brand-dark)]/40 text-[10px]">{item.label}</span>
                                  <span className="text-[var(--color-brand-dark)]/70 text-[10px] font-semibold font-mono">{item.value}</span>
                                </div>
                                {item.bar && (
                                  <div className="h-[3px] bg-[var(--color-brand-dark)]/5 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.pct}%` }}
                                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}66` }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </GlassCard>
                      )}
                    </div>
                  )}

                  {/* PRO Feature & Oneri Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Suggestion Card */}
                    <GlassCard glowColor="green" delay={0.8}>
                      <div className="p-4 border-b border-[var(--color-brand-dark)]/10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-dark)]/40">Gelişim Önerisi</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-[var(--color-brand-dark)]/70 text-[14px] leading-relaxed">
                          {sonuc.oneri}
                        </p>
                      </div>
                    </GlassCard>

                    {/* PRO Feature: AI Revize */}
                    <GlassCard glowColor="pink" delay={0.9} className="relative overflow-hidden group">
                      {/* Arka plan efektleri */}
                      <div className="absolute top-[-50%] right-[-10%] w-[150%] h-[150%] bg-gradient-to-br from-fuchsia-600/10 via-purple-600/5 to-transparent blur-3xl rounded-full transform rotate-12 group-hover:opacity-100 opacity-60 transition-opacity duration-700"></div>
                      <div className="relative p-6 px-8 h-full flex flex-col justify-between min-h-[220px] z-10">
                        <div>
                          <div className="flex items-center justify-between mb-5">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                              <Sparkles className="w-6 h-6 text-fuchsia-400" />
                            </div>
                            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 shadow-[0_0_20px_rgba(217,70,239,0.5)]">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                PRO Özellik
                              </span>
                            </div>
                          </div>
                          <h4 className="text-2xl font-black text-[var(--color-brand-dark)] mb-3">AI Tasarım Revizyonu</h4>
                          <p className="text-[var(--color-brand-dark)]/60 text-[14px] leading-relaxed pr-4">Tasarımınızı yapay zekaya emanet edin. Saniyeler içinde kusurları düzeltsin ve alternatif, mükemmel varyasyonlar üretsin!</p>
                        </div>
                        <button className="mt-8 w-full py-4 rounded-xl bg-[var(--color-brand-dark)] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 hover:bg-[var(--color-brand-dark)]/90 shadow-sm">
                          Şimdi PRO'ya Geç <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </>
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

      {/* ── SHARE FLOATING BUTTON (sadece sonuç ekranında) ── */}
      <AnimatePresence>
        {adim === 3 && sonuc?._analiz_id && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={paylasimLinkiKopyala}
            className="fixed bottom-8 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--color-brand-dark)] backdrop-blur-xl border border-[var(--color-brand-dark)]/10 text-white text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {paylasimKopyalandi ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[var(--color-brand-orange)]" />}
            {paylasimKopyalandi ? 'Link Kopyalandı!' : 'Paylaş'}
          </motion.button>
        )}
      </AnimatePresence>

      <Footer onLogoClick={goHome} />
    </div>
  );
}
