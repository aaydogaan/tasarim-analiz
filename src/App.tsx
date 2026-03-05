import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, ChevronRight, ChevronLeft, RotateCcw, Palette, Type as TypeIcon, Layout, Grid, Sparkles } from "lucide-react";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const kriterler = [
  { key: "renk", label: "Renk Uyumu", emoji: <Palette className="w-4 h-4" /> },
  { key: "font", label: "Tipografi", emoji: <TypeIcon className="w-4 h-4" /> },
  { key: "butunluk", label: "Bütünlük", emoji: <Layout className="w-4 h-4" /> },
  { key: "kompozisyon", label: "Kompozisyon", emoji: <Grid className="w-4 h-4" /> },
];

const isletmeTurleri = [
  "Cafe", "Restoran", "Butik", "Spor Salonu", "Güzellik Salonu",
  "Teknoloji", "Sanayi", "Gıda", "Sağlık & Klinik", "Eğitim",
  "Otel & Konaklama", "E-Ticaret", "Hukuk & Finans", "Diğer"
];

const gc = {
  card: "bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl",
  input: "bg-white/5 border border-white/10 rounded-xl text-white text-sm p-3 w-full outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/20",
  label: "text-white/40 text-[10px] font-bold tracking-widest uppercase mb-2 block",
};

function ScoreRing({ score }: { score: number }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#30d158" : score >= 50 ? "#ffd60a" : "#ff453a";
  const label = score >= 75 ? "Harika" : score >= 50 ? "İyi" : "Geliştirilebilir";

  return (
    <div className="flex flex-col items-center py-5">
      <div className="relative w-32 h-32">
        <svg width={128} height={128} viewBox="0 0 128 128" className="transform -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(var(--color-rgb),0.5)]"
            style={{ '--color-rgb': color === "#30d158" ? '48,209,88' : color === "#ffd60a" ? '255,214,10' : '255,69,58' } as any}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-3xl font-bold leading-none">{score}</span>
          <span className="text-white/30 text-[10px] font-medium mt-1">/100</span>
        </div>
      </div>
      <span style={{ color }} className="text-base font-semibold mt-3">{label}</span>
    </div>
  );
}

function ScoreBar({ puan, max = 25 }: { puan: number; max?: number }) {
  const pct = (puan / max) * 100;
  const color = pct >= 75 ? "#30d158" : pct >= 50 ? "#ffd60a" : "#ff453a";

  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}66` }}
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
    <div className="min-h-screen bg-[#050508] text-white selection:bg-blue-500/30 font-sans">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className={`max-w-screen-xl mx-auto px-4 py-12 transition-all duration-500 ${adim === 3 ? 'max-w-6xl' : 'max-w-lg'}`}>
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 backdrop-blur-xl"
          >
            <Sparkles className="w-7 h-7" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">RevizeAI</h1>
          <p className="text-white/40 text-sm">AI destekli profesyonel tasarım analizi ve revizyonu</p>
        </header>

        {/* Stepper */}
        {adim < 3 && (
          <div className="flex items-center justify-center mb-10">
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
                  className={`cursor-pointer min-h-[200px] flex flex-col items-center justify-center p-8 transition-all duration-300 ${gorsel ? 'p-0' : 'hover:bg-white/5'}`}
                >
                  {gorsel ? (
                    <img src={gorsel} alt="Tasarım" className="w-full max-h-[400px] object-contain block" />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-white font-semibold text-lg">Görsel Yükle</p>
                      <p className="text-white/30 text-sm mt-1">Sürükle bırak veya tıkla · PNG, JPG</p>
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

              <div className={`${gc.card} p-6`}>
                <span className={gc.label}>İşletme Türü</span>
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
                      <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Orijinal Tasarım</span>
                      </div>
                      <div
                        onClick={() => gorsel && setSeciliGorsel(gorsel)}
                        className="cursor-zoom-in group relative"
                      >
                        <img src={gorsel!} alt="Orijinal" className="w-full h-[300px] object-contain bg-black/20 transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">Büyütmek için tıkla</span>
                        </div>
                      </div>
                    </div>

                    {/* Revised - Coming Soon */}
                    <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/40 backdrop-blur-3xl shadow-2xl flex flex-col">
                      <div className="p-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">AI Revize Tasarım</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Yakında</span>
                      </div>
                      <div className="relative flex-1 min-h-[300px] flex items-center justify-center p-8">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] animate-pulse" />
                        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-[40px] animate-pulse" style={{ animationDelay: '1s' }} />

                        <div className="relative z-10 flex flex-col items-center gap-5 text-center">
                          {/* Icon with glow */}
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="relative"
                          >
                            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl" />
                            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                              <Sparkles className="w-7 h-7 text-blue-400" />
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
                              className="text-white/30 text-xs leading-relaxed max-w-[200px]"
                            >
                              Yapay zeka destekli otomatik tasarım revizyonu çok yakında sizlerle
                            </motion.p>
                          </div>

                          {/* Animated badge */}
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Geliştiriliyor</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Criteria Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kriterler.map(k => (
                      <motion.div
                        key={k.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${gc.card} p-6`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                              {k.emoji}
                            </div>
                            <span className="text-white font-semibold text-sm">{k.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold text-lg">{sonuc[k.key]?.puan}</span>
                            <span className="text-white/20 text-xs ml-1">/25</span>
                          </div>
                        </div>
                        <ScoreBar puan={sonuc[k.key]?.puan || 0} />
                        <p className="mt-4 text-white/40 text-xs leading-relaxed">
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
                    <div className="mt-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-white/60 text-xs italic leading-relaxed">
                        "{sonuc.genelYorum}"
                      </p>
                    </div>
                  </div>

                  <div className={`${gc.card} p-6`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className={gc.label}>Gelişim Önerisi</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {sonuc.oneri}
                    </p>
                  </div>

                  <button
                    onClick={sifirla}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-[#050508]/90 backdrop-blur-xl cursor-zoom-out"
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
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <button
                onClick={() => setSeciliGorsel(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
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
