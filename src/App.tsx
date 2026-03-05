import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, ChevronRight, ChevronLeft, RotateCcw, Palette, Type as TypeIcon, Layout, Grid, Sparkles, Zap } from "lucide-react";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const kriterler = [
  { key: "renk", label: "Renk Uyumu", emoji: <Palette className="w-4 h-4" />, color: "#0EA5E9" },
  { key: "font", label: "Tipografi", emoji: <TypeIcon className="w-4 h-4" />, color: "#38BDF8" },
  { key: "butunluk", label: "Bütünlük", emoji: <Layout className="w-4 h-4" />, color: "#06B6D4" },
  { key: "kompozisyon", label: "Kompozisyon", emoji: <Grid className="w-4 h-4" />, color: "#22D3EE" },
];

const isletmeTurleri = [
  "Cafe", "Restoran", "Butik", "Spor Salonu", "Güzellik Salonu",
  "Teknoloji", "Sanayi", "Gıda", "Sağlık & Klinik", "Eğitim",
  "Otel & Konaklama", "E-Ticaret", "Hukuk & Finans", "Diğer"
];

const gc = {
  card: "bg-[#0A1628]/80 backdrop-blur-2xl border border-[#1E3A5F]/50 rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.03)]",
  input: "bg-[#0A1628] border border-[#1E3A5F]/60 rounded-xl text-white text-sm p-3.5 w-full outline-none focus:border-[#0EA5E9]/60 focus:shadow-[0_0_15px_rgba(14,165,233,0.1)] transition-all placeholder:text-white/15",
  label: "text-[#38BDF8]/60 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2.5 block",
};

function ScoreRing({ score }: { score: number }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#0EA5E9" : score >= 50 ? "#F59E0B" : "#EF4444";
  const glowColor = score >= 75 ? "0,180,216" : score >= 50 ? "245,158,11" : "239,68,68";
  const label = score >= 75 ? "Harika" : score >= 50 ? "İyi" : "Geliştirilebilir";

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative w-36 h-36">
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 40px rgba(${glowColor},0.15)` }} />
        <svg width={144} height={144} viewBox="0 0 128 128" className="transform -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(14,165,233,0.06)" strokeWidth="7" />
          <motion.circle
            cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px rgba(${glowColor},0.5))` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-4xl font-bold leading-none">{score}</span>
          <span className="text-[#38BDF8]/30 text-[10px] font-medium mt-1">/100</span>
        </div>
      </div>
      <span style={{ color, textShadow: `0 0 20px rgba(${glowColor},0.4)` }} className="text-base font-bold mt-4">{label}</span>
    </div>
  );
}

function ScoreBar({ puan, max = 25 }: { puan: number; max?: number }) {
  const pct = (puan / max) * 100;
  const color = pct >= 75 ? "#0EA5E9" : pct >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="h-1.5 bg-[#0EA5E9]/8 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}55` }}
      />
    </div>
  );
}

function StepIndicator({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
        ${done
          ? "bg-[#0EA5E9] text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]"
          : active
            ? "bg-[#0EA5E9]/15 border-2 border-[#0EA5E9] text-[#38BDF8] shadow-[0_0_15px_rgba(14,165,233,0.2)]"
            : "bg-[#0A1628] border border-[#1E3A5F]/50 text-white/20"
        }
      `}>
        {done ? "✓" : n}
      </div>
    </div>
  );
}

export default function App() {
  const [adim, setAdim] = useState(1);
  const [gorsel, setGorsel] = useState<string | null>(null);
  const [gorselBase64, setGorselBase64] = useState<string | null>(null);
  const [revizeGorsel, setRevizeGorsel] = useState<string | null>(null);
  const [isletme, setIsletme] = useState("Cafe");
  const [sorular, setSorular] = useState({ markaAdi: "", kurumselRenk: "", isYapisi: "", hedefKitle: "", slogan: "" });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [revizeYukleniyor, setRevizeYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<any>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [seciliGorsel, setSeciliGorsel] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDosya = (f: File) => {
    if (!f) return;
    setSonuc(null); setHata(null); setRevizeGorsel(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const d = e.target?.result as string;
      setGorsel(d);
      setGorselBase64(d.split(",")[1]);
    };
    reader.readAsDataURL(f);
  };

  const analiz = async () => {
    if (!gorselBase64) return;
    setYukleniyor(true); setHata(null); setRevizeGorsel(null);
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          imageBase64: gorselBase64,
          isletme,
          sorular,
        }),
      });

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
          isletme,
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
    setAdim(1); setGorsel(null); setGorselBase64(null); setRevizeGorsel(null); setSonuc(null); setHata(null);
    setSorular({ markaAdi: "", kurumselRenk: "", isYapisi: "", hedefKitle: "", slogan: "" });
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-white selection:bg-[#0EA5E9]/30 font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-[#0EA5E9]/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[10%] w-[600px] h-[600px] bg-[#0EA5E9]/5 blur-[180px] rounded-full" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-[#06B6D4]/4 blur-[140px] rounded-full" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className={`relative z-10 max-w-screen-xl mx-auto px-4 py-16 transition-all duration-500 ${adim === 3 ? 'max-w-6xl' : 'max-w-lg'}`}>
        {/* Header */}
        <header className="text-center mb-14">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#0EA5E9]/30 rounded-xl blur-lg" />
              <div className="relative w-10 h-10 rounded-xl bg-[#0EA5E9] flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.5)]">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">RevizeAI</span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight"
          >
            Tasarımlarınızı <br />
            <span className="bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#06B6D4] bg-clip-text text-transparent">
              AI ile analiz edin.
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/35 text-base max-w-md mx-auto leading-relaxed"
          >
            Yapay zeka destekli profesyonel grafik tasarım analizi ve değerlendirme aracı
          </motion.p>
        </header>

        {/* Stepper */}
        {adim < 3 && (
          <div className="flex items-center justify-center mb-12">
            <StepIndicator n={1} active={adim === 1} done={adim > 1} />
            <div className={`w-14 h-[2px] mx-3 rounded-full transition-all duration-500 ${adim > 1 ? "bg-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.4)]" : "bg-[#1E3A5F]/50"}`} />
            <StepIndicator n={2} active={adim === 2} done={adim > 2} />
            <div className={`w-14 h-[2px] mx-3 rounded-full transition-all duration-500 ${adim > 2 ? "bg-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.4)]" : "bg-[#1E3A5F]/50"}`} />
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
                  className={`cursor-pointer min-h-[220px] flex flex-col items-center justify-center p-8 transition-all duration-500 ${gorsel ? 'p-0' : 'hover:bg-[#0EA5E9]/3'}`}
                >
                  {gorsel ? (
                    <img src={gorsel} alt="Tasarım" className="w-full max-h-[400px] object-contain block" />
                  ) : (
                    <>
                      <div className="relative mb-5">
                        <div className="absolute inset-0 bg-[#0EA5E9]/20 rounded-2xl blur-xl" />
                        <div className="relative w-16 h-16 rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-7 h-7" />
                        </div>
                      </div>
                      <p className="text-white font-semibold text-lg">Görsel Yükle</p>
                      <p className="text-white/25 text-sm mt-1.5">Sürükle bırak veya tıkla · PNG, JPG</p>
                    </>
                  )}
                </div>
                {gorsel && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="py-3 bg-[#0EA5E9]/5 hover:bg-[#0EA5E9]/10 transition-colors cursor-pointer text-center border-t border-[#1E3A5F]/50"
                  >
                    <span className="text-[#38BDF8] text-sm font-medium">Görseli Değiştir</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleDosya(e.target.files[0])} />

              <div className={`${gc.card} p-6`}>
                <span className={gc.label}>İşletme Türü</span>
                <div className="flex flex-wrap gap-2">
                  {isletmeTurleri.map(t => (
                    <button
                      key={t}
                      onClick={() => setIsletme(t)}
                      className={`
                        px-4 py-2 rounded-full text-xs font-medium transition-all duration-300
                        ${isletme === t
                          ? "bg-[#0EA5E9] text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                          : "bg-[#0A1628] border border-[#1E3A5F]/50 text-white/40 hover:border-[#0EA5E9]/30 hover:text-white/60"
                        }
                      `}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setAdim(2)}
                disabled={!gorsel}
                className={`
                  w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300
                  ${gorsel
                    ? "bg-[#0EA5E9] text-white shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-[#0A1628] border border-[#1E3A5F]/50 text-white/15 cursor-not-allowed"
                  }
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
              <div className={`${gc.card} p-8 space-y-5`}>
                <p className="text-white/40 text-sm leading-relaxed">Daha isabetli analiz için firmanız hakkında birkaç bilgi verin.</p>
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
                  className="p-4 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm"
                >
                  {hata}
                </motion.div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setAdim(1)}
                  className="flex-1 py-4 rounded-xl bg-[#0A1628] border border-[#1E3A5F]/50 text-white/50 font-semibold hover:border-[#0EA5E9]/30 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" /> Geri
                </button>
                <button
                  onClick={analiz}
                  disabled={yukleniyor}
                  className={`
                    flex-[2] py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2
                    ${yukleniyor
                      ? "bg-[#0A1628] border border-[#1E3A5F]/50 text-white/20 cursor-not-allowed"
                      : "bg-[#0EA5E9] shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                    }
                  `}
                >
                  {yukleniyor ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#38BDF8]/30 border-t-[#38BDF8] rounded-full animate-spin" />
                      Analiz ediliyor...
                    </>
                  ) : (
                    <>Tasarımı Analiz Et <Sparkles className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ADIM 3 */}
          {adim === 3 && sonuc && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Visual Comparison */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original */}
                    <div className={`${gc.card} overflow-hidden flex flex-col`}>
                      <div className="p-3.5 bg-[#0A1628]/60 border-b border-[#1E3A5F]/40 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Orijinal Tasarım</span>
                      </div>
                      <div
                        onClick={() => gorsel && setSeciliGorsel(gorsel)}
                        className="cursor-zoom-in group relative"
                      >
                        <img src={gorsel!} alt="Orijinal" className="w-full h-[300px] object-contain bg-[#060B18] transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-[#060B18]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium bg-[#0A1628]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#1E3A5F]/50">Büyütmek için tıkla</span>
                        </div>
                      </div>
                    </div>

                    {/* Revised - Coming Soon */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#0EA5E9]/15 bg-gradient-to-br from-[#0A1628]/90 via-[#0A1628]/70 to-[#0A1628]/90 backdrop-blur-2xl shadow-[0_0_30px_rgba(14,165,233,0.03)] flex flex-col">
                      <div className="p-3.5 bg-[#0EA5E9]/5 border-b border-[#0EA5E9]/15 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#38BDF8]/60">AI Revize Tasarım</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#0EA5E9] bg-[#0EA5E9]/10 px-2.5 py-0.5 rounded-full border border-[#0EA5E9]/20">Yakında</span>
                      </div>
                      <div className="relative flex-1 min-h-[300px] flex items-center justify-center p-8">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-[#0EA5E9]/6 rounded-full blur-[70px]" />
                        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-[#06B6D4]/5 rounded-full blur-[50px] animate-pulse" style={{ animationDelay: '1s' }} />

                        <div className="relative z-10 flex flex-col items-center gap-5 text-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="relative"
                          >
                            <div className="absolute inset-0 bg-[#0EA5E9]/15 rounded-2xl blur-xl" />
                            <div className="relative w-16 h-16 rounded-2xl bg-[#0EA5E9]/8 border border-[#0EA5E9]/20 flex items-center justify-center">
                              <Sparkles className="w-7 h-7 text-[#38BDF8]" />
                            </div>
                          </motion.div>

                          <div className="space-y-2">
                            <motion.p
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-white font-semibold text-base"
                            >
                              AI Tasarım Revizyonu
                            </motion.p>
                            <motion.p
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.35 }}
                              className="text-white/25 text-xs leading-relaxed max-w-[200px]"
                            >
                              Yapay zeka destekli otomatik tasarım revizyonu çok yakında sizlerle
                            </motion.p>
                          </div>

                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0EA5E9]/5 border border-[#0EA5E9]/15"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-pulse shadow-[0_0_6px_rgba(14,165,233,0.5)]" />
                            <span className="text-white/35 text-[10px] font-semibold uppercase tracking-wider">Geliştiriliyor</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Criteria Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kriterler.map((k, i) => (
                      <motion.div
                        key={k.key}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${gc.card} p-6 hover:border-[#0EA5E9]/20 transition-all duration-300`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#0EA5E9]/8 border border-[#0EA5E9]/15 flex items-center justify-center text-[#38BDF8]">
                              {k.emoji}
                            </div>
                            <span className="text-white font-semibold text-sm">{k.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold text-xl">{sonuc[k.key]?.puan}</span>
                            <span className="text-[#38BDF8]/20 text-xs ml-1">/25</span>
                          </div>
                        </div>
                        <ScoreBar puan={sonuc[k.key]?.puan || 0} />
                        <p className="mt-4 text-white/30 text-xs leading-relaxed">
                          {sonuc[k.key]?.aciklama}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                  <div className={`${gc.card} p-8 flex flex-col items-center text-center`}>
                    <span className={gc.label}>Genel Puan</span>
                    <ScoreRing score={sonuc.genelPuan} />
                    <div className="mt-2 p-4 bg-[#0EA5E9]/3 rounded-xl border border-[#1E3A5F]/30">
                      <p className="text-white/45 text-xs italic leading-relaxed">
                        "{sonuc.genelYorum}"
                      </p>
                    </div>
                  </div>

                  <div className={`${gc.card} p-6`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
                      <span className={gc.label}>Gelişim Önerisi</span>
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed">
                      {sonuc.oneri}
                    </p>
                  </div>

                  <button
                    onClick={sifirla}
                    className="w-full py-4 rounded-xl bg-[#0A1628] border border-[#1E3A5F]/50 text-white/50 font-semibold hover:border-[#0EA5E9]/30 hover:text-[#38BDF8] transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Yeni Analiz Yap
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {seciliGorsel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSeciliGorsel(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-[#060B18]/95 backdrop-blur-2xl cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={seciliGorsel}
                alt="Büyütülmüş Görsel"
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_60px_rgba(14,165,233,0.1)] border border-[#1E3A5F]/30"
              />
              <button
                onClick={() => setSeciliGorsel(null)}
                className="absolute -top-12 right-0 text-white/40 hover:text-[#38BDF8] transition-colors flex items-center gap-2 text-sm font-medium"
              >
                Kapat <RotateCcw className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
