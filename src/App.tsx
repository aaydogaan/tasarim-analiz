import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, ChevronRight, ChevronLeft, RotateCcw, Palette, Type as TypeIcon, Layout, Grid, Sparkles, Smartphone, Building2, ShoppingBag, Printer, BarChart2, Share2, User, X, LogOut, Copy, Check, AlertCircle, Globe, BrainCircuit } from "lucide-react";
import { supabase } from "./lib/supabase";
import { Vitrin } from "./components/Vitrin";

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
  card: "bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl",
  input: "bg-white/5 border border-white/10 rounded-xl text-white text-sm p-3 w-full outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/20",
  label: "text-white/40 text-[10px] font-bold tracking-widest uppercase mb-2 block",
};

function GlassCard({ children, className = "", glowColor = "blue", delay = 0 }: { children: React.ReactNode; className?: string; glowColor?: string; delay?: number; key?: string }) {
  const glowMap: Record<string, string> = {
    blue: "from-blue-500/30 via-blue-400/10",
    purple: "from-purple-500/30 via-purple-400/10",
    green: "from-emerald-500/30 via-emerald-400/10",
    cyan: "from-cyan-500/30 via-cyan-400/10",
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
            className="text-white text-4xl font-extrabold leading-none tracking-tight"
          >
            {score}
          </motion.span>
          <span className="text-white/20 text-[11px] font-semibold mt-1 tracking-wider">/100</span>
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
    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
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
        ${done ? "bg-blue-500 text-white" : active ? "bg-blue-500/20 border-2 border-blue-500 text-white" : "bg-white/5 border border-white/10 text-white/30"}
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
  const initGorsel = getSessionData('ra_gorsel', null);
  const initGorselBase64 = getSessionData('ra_gorselBase64', null);
  let initAdim = getSessionData('ra_adim', 1);

  // Eğer session'dan adım 2 veya 3 geliyorsa ancak görsel boyuttan dolayı kaydedilememişse başa döndür.
  if (initAdim > 1 && (!initGorsel || !initGorselBase64)) {
    initAdim = 1;
  }

  const [adim, setAdim] = useState(initAdim);
  const [gorunum, setGorunum] = useState<'app' | 'vitrin'>('app'); // App or Showcase mode
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
    if (!sonuc?._analiz_id) return;

    // Güvenlik: Eğer guest iseler veya login olmadan yapmışlarsa _analiz_id olmayabilir veya supabase izin vermeyebilir,
    // Ancak zaten guestMode false olduğunda ekleniyor.
    const { error } = await supabase
      .from('analizler')
      .update({ paylasim_aktif: true })
      .eq('id', sonuc._analiz_id);

    if (!error) {
      setVitrindeYayinlandi(true);
    } else {
      console.error(error);
      alert('Yayınlanırken bir hata oluştu.');
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

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-blue-500/30 font-sans flex flex-col justify-between overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <nav className="relative z-30 w-full flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-[#050508]/50 backdrop-blur-lg">
        {/* Logo (Left Component) */}
        <div className="font-bold text-xl tracking-tight text-white cursor-pointer z-10" onClick={() => setGorunum('app')}>
          Revize<span className="text-blue-500">AI</span>
        </div>

        {/* Center Tabs (Absolute centered on desktop for perfect symmetry) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05] z-0">
          <button
            onClick={() => setGorunum('app')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${gorunum === 'app' ? 'bg-white/10 text-white shadow-sm shadow-blue-500/10' : 'text-white/40 hover:text-white/70'}`}
          >
            Yeni Analiz
          </button>
          <button
            onClick={() => setGorunum('vitrin')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${gorunum === 'vitrin' ? 'bg-white/10 text-white shadow-sm shadow-blue-500/10' : 'text-white/40 hover:text-white/70'}`}
          >
            🌟 İlham Vitrini
          </button>
        </div>


        {/* Right Side Auth/Stats */}
        <div className="flex items-center gap-2">
          {kullanici && (
            <button
              onClick={statsAc}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-all text-[11px] font-medium"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Stats</span>
            </button>
          )}
          {kullanici ? (
            <div className="flex items-center gap-2">
              <span className="text-white/25 text-[10px] hidden md:block max-w-[100px] truncate">{kullanici.email}</span>
              <button onClick={cikisYap} className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-red-400 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setAuthAcik(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-all text-[11px] font-medium">
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Giriş Yap</span>
            </button>
          )}
        </div>
      </nav>

      {gorunum === 'vitrin' ? (
        <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4">
          <Vitrin />
        </main>
      ) : (
        <main className={`flex-1 flex flex-col justify-center w-full max-w-screen-xl mx-auto px-4 py-6 md:py-8 transition-all duration-500 ${adim === 3 ? 'max-w-6xl' : 'max-w-lg'}`}>
          {/* Header */}
          <header className="text-center mb-8 md:mb-12 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex flex-col items-center"
            >
              {adim === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 backdrop-blur-xl"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-200/80 text-[10px] md:text-xs font-bold tracking-widest uppercase">Yapay Zeka Destekli Tasarım Asistanı</span>
                </motion.div>
              )}

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                Revize<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">AI</span>
              </h1>

              {adim === 1 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-white/50 text-sm md:text-base max-w-xl mx-auto leading-relaxed mt-2 font-medium"
                >
                  Tasarımlarınızı profesyonel kriterlere göre saniyeler içinde analiz edin.
                  Renk uyumu, tipografi, kompozisyon ve marka bütünlüğü açısından
                  kapsamlı geri bildirim ve gelişim önerileri alın.
                </motion.p>
              ) : (
                <p className="text-white/40 text-sm mt-2 font-medium">Profesyonel Tasarım Analizi</p>
              )}
            </motion.div>
          </header>

          {/* Header Action Buttons */}
          <div className="absolute top-6 right-4 md:right-8 flex items-center gap-2 z-20">
            {kullanici && (
              <button
                onClick={statsAc}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-all text-[11px] font-medium"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Stats</span>
              </button>
            )}
            {kullanici ? (
              <div className="flex items-center gap-2">
                <span className="text-white/25 text-[10px] hidden md:block max-w-[100px] truncate">{kullanici.email}</span>
                <button onClick={cikisYap} className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-red-400 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setAuthAcik(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-all text-[11px] font-medium">
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Giriş Yap</span>
              </button>
            )}
          </div>

          {/* Stepper */}
          {adim < 3 && (
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <StepIndicator n={1} active={adim === 1} done={adim > 1} />
              <div className={`w-12 h-[1px] mx-2 ${adim > 1 ? "bg-blue-500" : "bg-white/10"}`} />
              <StepIndicator n={2} active={adim === 2} done={adim > 2} />
              <div className={`w-12 h-[1px] mx-2 ${adim > 2 ? "bg-blue-500" : "bg-white/10"}`} />
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
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className={`${gc.card} overflow-hidden group`}>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDrop={e => { e.preventDefault(); handleDosya(e.dataTransfer.files[0]); }}
                    onDragOver={e => e.preventDefault()}
                    className={`cursor-pointer flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-300 ${gorsel ? 'p-0 md:p-0' : 'hover:bg-white/5 min-h-[160px] md:min-h-[200px]'}`}
                  >
                    {gorsel ? (
                      <img src={gorsel} alt="Tasarım" className="w-full max-h-[25vh] md:max-h-[30vh] object-contain block" />
                    ) : (
                      <>
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <p className="text-white font-semibold text-base md:text-lg">Görsel Yükle</p>
                        <p className="text-white/30 text-xs md:text-sm mt-1">Sürükle bırak veya tıkla · PNG, JPG</p>
                      </>
                    )}
                  </div>
                  {gorsel && (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="py-3 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-center border-t border-white/10"
                    >
                      <span className="text-blue-400 text-sm font-medium">Görseli Değiştir</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleDosya(e.target.files[0])} />

                {/* Tasarım Türü Seçimi */}
                <div className={`${gc.card} p-5`}>
                  <span className={gc.label}>Tasarım Türü</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {tasarimTuruConfig.map(({ id, icon, desc }) => (
                      <button
                        key={id}
                        onClick={() => setTasarimTuru(id)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-300 ${tasarimTuru === id
                          ? "bg-blue-500/15 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                          : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]"
                          }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${tasarimTuru === id ? "bg-blue-500/20 text-blue-300" : "bg-white/[0.05] text-white/30"
                          }`}>
                          {icon}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold transition-colors ${tasarimTuru === id ? "text-white" : "text-white/50"}`}>{id}</p>
                          <p className="text-[9px] text-white/25 mt-0.5">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Sosyal Medya Platform Seçimi */}
                  <AnimatePresence>
                    {tasarimTuru === "Sosyal Medya" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-white/[0.05]">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest block mb-2.5">Platform</span>
                          <div className="flex flex-wrap gap-2">
                            {sosyalMedyaPlatformlari.map(p => (
                              <button
                                key={p}
                                onClick={() => setPlatform(p)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 ${platform === p ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/[0.04] text-white/35 hover:bg-white/[0.08] border border-transparent"
                                  }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* İşletme Türü */}
                <div className={`${gc.card} p-5`}>
                  <span className={gc.label}>Sektör</span>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {isletmeTurleri.map(t => (
                        <button
                          key={t}
                          onClick={() => setIsletme(t)}
                          className={`
                          px-4 py-2 rounded-full text-xs font-medium transition-all duration-300
                          ${isletme === t ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-white/5 text-white/50 hover:bg-white/10"}
                        `}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {isletme === "Diğer" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <input
                            type="text"
                            placeholder="Lütfen sektörünüzü veya işletme türünüzü yazın..."
                            value={digerIsletme}
                            onChange={(e) => setDigerIsletme(e.target.value)}
                            className={gc.input}
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  onClick={() => setAdim(2)}
                  disabled={!gorsel}
                  className={`
                  w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
                  ${gorsel ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]" : "bg-white/5 text-white/20 cursor-not-allowed"}
                `}
                >
                  Devam Et <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* ADIM 2 */}
            {adim === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className={`${gc.card} p-8 space-y-6`}>
                  <p className="text-white/50 text-sm leading-relaxed">Daha isabetli analiz için firmanız hakkında birkaç bilgi verin.</p>
                  {[
                    { key: "markaAdi", label: "Marka / Firma Adı", ph: "örn. Brew & Co." },
                    { key: "kurumselRenk", label: "Kurumsal Renk(ler)", ph: "örn. Koyu yeşil, krem beyazı" },
                    { key: "isYapisi", label: "Ne iş yapıyorsunuz?", ph: "örn. Organik kahve ve tatlı sunan butik cafe" },
                    { key: "hedefKitle", label: "Hedef Kitleniz", ph: "örn. 25-40 yaş, profesyoneller" },
                    { key: "slogan", label: "Slogan / Özel Mesaj (opsiyonel)", ph: "örn. Her yudumda huzur" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className={gc.label}>{f.label}</label>
                      <input
                        value={(sorular as any)[f.key]}
                        onChange={e => setSorular(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.ph}
                        className={gc.input}
                      />
                    </div>
                  ))}
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
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" /> Geri
                  </button>
                  <button
                    onClick={analiz}
                    disabled={yukleniyor}
                    className={`
                    flex-[2] py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2
                    ${yukleniyor ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"}
                  `}
                  >
                    {yukleniyor ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                className="space-y-8"
              >
                {/* Demo Mode Banner */}
                {sonuc._demo && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[11px] font-medium">
                    <span className="text-lg">⚡</span>
                    <span><strong>Demo Modu</strong> — Gemini API kotası doldu. Sabah 03:00'da sıfırlanır. Gösterilen sonuçlar örnek verilerdir.</span>
                  </div>
                )}

                {/* Top Row: Image + Score Ring */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Original Image Card */}
                  <GlassCard className="lg:col-span-2" glowColor="cyan" delay={0.1}>
                    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 8px rgba(56,189,248,0.6)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Orijinal Tasarım</span>
                      </div>
                      <span className="text-[9px] font-semibold text-white/20 bg-white/[0.04] px-3 py-1 rounded-full">{isletme}</span>
                    </div>
                    <div
                      onClick={() => gorsel && setSeciliGorsel(gorsel)}
                      className="cursor-zoom-in group relative"
                    >
                      <img src={gorsel!} alt="Orijinal" className="w-full h-[340px] object-contain bg-black/20 transition-all duration-700 group-hover:scale-[1.03]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                        <span className="text-white text-xs font-medium bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">Büyütmek için tıkla</span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Score Ring Card */}
                  <GlassCard glowColor="blue" delay={0.2}>
                    <div className="p-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400" style={{ boxShadow: '0 0 8px rgba(56,189,248,0.6)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Genel Puan</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                      <ScoreRing score={sonuc.genelPuan} />
                      <div className="mt-4 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] w-full">
                        <p className="text-white/50 text-[11px] italic leading-relaxed text-center">
                          "{sonuc.genelYorum}"
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Criteria Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {kriterler.map((k, i) => {
                    const puan = sonuc[k.key]?.puan || 0;
                    const pct = (puan / 25) * 100;
                    const color = pct >= 75 ? "#38bdf8" : pct >= 50 ? "#fbbf24" : "#f87171";
                    const glowColors = ["cyan", "blue", "purple", "green"];
                    return (
                      <GlassCard key={k.key} glowColor={glowColors[i]} delay={0.15 * (i + 1)}>
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50">
                                {k.emoji}
                              </div>
                              <span className="text-white/70 font-semibold text-[13px]">{k.label}</span>
                            </div>
                          </div>
                          {/* Big score number */}
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <motion.span
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                              className="text-white text-3xl font-extrabold tracking-tight"
                              style={{ textShadow: `0 0 30px ${color}33` }}
                            >
                              {puan}
                            </motion.span>
                            <span className="text-white/15 text-sm font-semibold">/25</span>
                          </div>
                          <ScoreBar puan={puan} />
                          <div className="mt-4">
                            <p className={`text-white/30 text-[11px] leading-relaxed transition-all duration-300 ${acikKriter === k.key ? '' : 'line-clamp-2'}`}>
                              {sonuc[k.key]?.aciklama}
                            </p>
                            {sonuc[k.key]?.aciklama && sonuc[k.key].aciklama.length > 80 && (
                              <button
                                onClick={() => setAcikKriter(acikKriter === k.key ? null : k.key)}
                                className="mt-1.5 text-[10px] font-semibold tracking-wide transition-colors"
                                style={{ color }}
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
                      <GlassCard glowColor="blue" delay={0.5}>
                        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-blue-400" style={{ boxShadow: '0 0 8px rgba(96,165,250,0.6)' }} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Renk Paleti</span>
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
                                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl text-white text-[9px] font-semibold px-2 py-1 rounded-md border border-white/10 whitespace-nowrap z-20 animate-fade-in">
                                    ✓ Kopyalandı
                                  </div>
                                )}
                                <div
                                  className="w-9 h-9 rounded-xl border border-white/[0.12] shadow-lg transition-all duration-200 group-hover:scale-125 group-hover:rounded-2xl"
                                  style={{ backgroundColor: hex, boxShadow: `0 4px 16px ${hex}55` }}
                                />
                                <span className="text-[9px] text-white/25 font-mono tracking-wider group-hover:text-white/50 transition-colors">{hex.toUpperCase()}</span>
                              </div>
                            ))}
                          </div>
                          {/* Güçlü / Zayıf yön */}
                          {(sonuc.gucluYon || sonuc.zayifYon) && (
                            <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                              {sonuc.gucluYon && (
                                <div className="flex items-start gap-2">
                                  <span className="text-emerald-400/80 text-[10px] mt-0.5">✦</span>
                                  <span className="text-white/35 text-[10px] leading-relaxed">{sonuc.gucluYon}</span>
                                </div>
                              )}
                              {sonuc.zayifYon && (
                                <div className="flex items-start gap-2">
                                  <span className="text-amber-400/80 text-[10px] mt-0.5">△</span>
                                  <span className="text-white/35 text-[10px] leading-relaxed">{sonuc.zayifYon}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    )}

                    {/* Technical Summary */}
                    {sonuc.teknikOzet && (
                      <GlassCard glowColor="purple" delay={0.55}>
                        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-purple-400" style={{ boxShadow: '0 0 8px rgba(168,85,247,0.5)' }} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Teknik Özet</span>
                          </div>
                          {sonuc.genelDegerlendirme && (
                            <span className="text-[8px] font-bold uppercase tracking-widest text-purple-200/70 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/15">
                              {sonuc.genelDegerlendirme}
                            </span>
                          )}
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
                                <span className="text-white/30 text-[10px]">{item.label}</span>
                                <span className="text-white/55 text-[10px] font-semibold font-mono">{item.value}</span>
                              </div>
                              {item.bar && (
                                <div className="h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
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

                {/* Bottom Row: Coming Soon + Suggestion + New Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AI Revize Coming Soon */}
                  <GlassCard glowColor="purple" delay={0.6}>
                    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-purple-400" style={{ boxShadow: '0 0 8px rgba(168,85,247,0.6)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">AI Revize</span>
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">Yakında</span>
                    </div>
                    <div className="relative p-8 flex flex-col items-center justify-center min-h-[180px]">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] animate-pulse" />
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/15 to-blue-500/15 border border-white/[0.08] flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="text-white/60 text-sm font-semibold">AI Tasarım Revizyonu</p>
                        <p className="text-white/25 text-[10px] leading-relaxed text-center max-w-[180px]">Yapay zeka destekli otomatik revizyon çok yakında</p>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                          <span className="text-white/30 text-[9px] font-semibold uppercase tracking-wider">Geliştiriliyor</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Suggestion Card */}
                  <GlassCard className="lg:col-span-1" glowColor="green" delay={0.7}>
                    <div className="p-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Gelişim Önerisi</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-white/60 text-[13px] leading-relaxed">
                        {sonuc.oneri}
                      </p>
                    </div>
                  </GlassCard>

                  {/* New Analysis Button Card */}
                  <GlassCard glowColor="blue" delay={0.8}>
                    <div className="p-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400" style={{ boxShadow: '0 0 8px rgba(56,189,248,0.6)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">İşlem</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col items-center justify-center min-h-[180px] gap-5">
                      <p className="text-white/30 text-xs text-center">Başka bir tasarımı analiz etmek ister misiniz?</p>
                      <button
                        onClick={sifirla}
                        className="group relative w-full py-4 rounded-xl font-bold text-sm overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                        <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                          <RotateCcw className="w-4 h-4" /> Yeni Analiz Yap
                        </span>
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-[#050508]/95 backdrop-blur-2xl cursor-zoom-out"
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
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/[0.08]"
              />
              <button
                onClick={() => setSeciliGorsel(null)}
                className="absolute -top-14 right-0 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-white/[0.04] backdrop-blur-xl px-4 py-2 rounded-full border border-white/[0.08]"
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
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-[#050508]/95 backdrop-blur-3xl"
          >
            {/* AI Beyin / Tarama Animasyonu */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 rgba(59, 130, 246, 0)",
                  "0 0 60px rgba(59, 130, 246, 0.4)",
                  "0 0 0 rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full border border-blue-500/30 flex items-center justify-center bg-blue-500/10 mb-8"
            >
              <BrainCircuit className="w-12 h-12 text-blue-400" />
            </motion.div>

            {/* Başlık */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4 text-center">
              Yapay Zeka Tasarımınızı İnceleyip Ölçüyor
            </h2>
            <div className="flex items-center gap-2 mb-12">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>

            {/* Dinamik İpuçları (Karusel) */}
            <div className="h-24 w-full max-w-lg flex items-center justify-center overflow-hidden relative border border-white/5 bg-white/[0.02] rounded-3xl p-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingTipIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                  className="text-white/60 text-sm md:text-base text-center leading-relaxed font-medium absolute w-full px-6"
                >
                  {KARUSEL_IPUCLARI[loadingTipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <p className="fixed bottom-10 text-white/20 text-xs font-medium tracking-widest uppercase">
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-3xl text-center shadow-2xl shadow-blue-500/10"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Giriş Yapmadınız</h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Misafir olarak analiz yapabilirsiniz ancak analiziniz <strong>kaydedilmeyecek</strong>, istatistiklerinize yansımayacak ve daha sonra erişilemeyecektir.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setAuthUyariAcik(false);
                    setAuthAcik(true);
                    setAuthMod('kayit');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold transition-transform hover:scale-[1.02]"
                >
                  Kayıt Ol / Giriş Yap
                </button>
                <button
                  onClick={() => {
                    setAuthUyariAcik(false);
                    analiziBaslat(true);
                  }}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-semibold transition-colors border border-white/5"
                >
                  Kayıt Olmadan Devam Et
                </button>
                <button
                  onClick={() => setAuthUyariAcik(false)}
                  className="w-full py-2 mt-2 text-white/30 hover:text-white/50 text-xs transition-colors underline decoration-white/20 underline-offset-2"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/90 backdrop-blur-2xl"
            onClick={() => setStatsAcik(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white/[0.05] border border-white/[0.10] rounded-3xl backdrop-blur-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-bold">Benim İstatistiklerim</span>
                </div>
                <button onClick={() => setStatsAcik(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                {statsYukleniyor ? (
                  <div className="flex items-center justify-center py-10 gap-3 text-white/30">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
                    <span className="text-sm">Yükleniyor...</span>
                  </div>
                ) : statsData ? (
                  <div className="space-y-6">
                    {/* Daha önce burada olan userStats kısmı kaldırıldı çünkü root objesi zaten user_id'ye ait */}

                    {/* Ana sayılar */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Toplam Analiz', value: statsData.toplamAnaliz, color: 'text-blue-400' },
                        { label: 'Bu Hafta', value: statsData.buHafta, color: 'text-emerald-400' },
                        { label: 'Ort. Puan', value: `${statsData.ortalamaGenel}/100`, color: 'text-purple-400' },
                      ].map(s => (
                        <div key={s.label} className="bg-white/[0.04] rounded-2xl p-3 text-center border border-white/[0.06]">
                          <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                          <div className="text-white/30 text-[10px] mt-1">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tasarım türü dağılımı */}
                    {Object.keys(statsData.turDagilim || {}).length > 0 && (
                      <div>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2.5">Dağılım İstatistikleri</p>
                        <div className="space-y-2">
                          {Object.entries(statsData.turDagilim as Record<string, number>)
                            .sort(([, a], [, b]) => b - a)
                            .map(([tur, sayi]) => {
                              const pct = Math.round((sayi / statsData.toplamAnaliz) * 100);
                              return (
                                <div key={tur}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-white/50 text-[11px]">{tur}</span>
                                    <span className="text-white/35 text-[11px] font-mono">{sayi} ({pct}%)</span>
                                  </div>
                                  <div className="h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
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
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2.5">Popüler Sektörler</p>
                        <div className="flex flex-wrap gap-2">
                          {statsData.enPopulerSektor.map((s: any, i: number) => (
                            <span key={i} className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-white/[0.05] border border-white/[0.08] text-white/50">
                              {s.isletme} <span className="text-white/25">({s.sayi})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Değerlendirme dağılımı */}
                    {Object.keys(statsData.degDagilim || {}).length > 0 && (
                      <div>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2.5">Değerlendirmeler</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(statsData.degDagilim as Record<string, number>).map(([deg, sayi]) => (
                            <span key={deg} className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-white/[0.05] border border-white/[0.08] text-white/50">
                              {deg} <span className="text-white/25">× {sayi}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-white/30 py-8 text-sm">Veri yüklenemedi.</p>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/90 backdrop-blur-2xl"
            onClick={() => setAuthAcik(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white/[0.05] border border-white/[0.10] rounded-3xl backdrop-blur-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-blue-400" />
                  <div className="flex gap-1">
                    {(['giris', 'kayit'] as const).map(m => (
                      <button key={m} onClick={() => setAuthMod(m)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${authMod === m ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/30 hover:text-white/50'}`}>
                        {m === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setAuthAcik(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={e => { e.preventDefault(); girisYap(); }} className="p-5 space-y-3">
                <input type="email" placeholder="E-posta" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white text-sm p-3 w-full outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/20" />
                <input type="password" placeholder="Şifre" value={authSifre} onChange={e => setAuthSifre(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white text-sm p-3 w-full outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/20" />

                {authHata && <p className="text-red-400/80 text-[11px] px-1">{authHata}</p>}

                <button type="submit" disabled={authYukleniyor || !authEmail || !authSifre}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {authYukleniyor ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {authMod === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'}
                </button>

                {authMod === 'kayit' && (
                  <p className="text-white/20 text-[10px] text-center leading-relaxed">
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
            className="fixed bottom-8 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-xl border border-white/10 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            {paylasimKopyalandi ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            {paylasimKopyalandi ? 'Link Kopyalandı!' : 'Paylaş'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center py-4 md:py-6 border-t border-white/[0.04] mt-auto">
        <p className="text-white/20 text-[11px] tracking-wider">
          Designed & Developed by{" "}
          <a
            href="https://www.instagram.com/_selmanaydgn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 font-medium hover:text-blue-400 transition-colors duration-300"
          >
            Selman Aydoğan
          </a>
        </p>
      </footer>
    </div>
  );
}
