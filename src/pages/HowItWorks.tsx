import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, UploadCloud, MessageCircle, Heart, Trophy, Zap, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const [demoStep, setDemoStep] = useState(0);

  // Auto-play AI Demo
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev >= 3 ? 0 : prev + 1));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-24 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#FF5500]/5 to-transparent pointer-events-none" />
      <div className="absolute top-40 left-10 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#FF5500]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] text-sm font-bold mb-6"
          >
            Revizelesene Rehberi
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-tight mb-6"
          >
            Tasarım Sürecini <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] to-amber-500">
              Oyunlaştır.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed"
          >
            Revizelesene sadece bir analiz aracı değil; yapay zeka ile tasarımlarını mükemmelleştirdiğin, topluluktan ilham aldığın ve XP kazanarak seviye atladığın interaktif bir platformdur.
          </motion.p>
        </div>

        {/* Content Area - Stacked Vertically */}
        <div className="space-y-24">
          
          {/* 1. AI Analysis Demo */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[40px] p-8 md:p-16 shadow-2xl shadow-black/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 md:order-1 relative">
                {/* Fake UI */}
                <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">Tasarım Yükleniyor...</h4>
                      <p className="text-xs text-[var(--text-secondary)]">Sosyal Medya Formatı</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <DemoProgressBar label="Görsel Okunuyor" active={demoStep >= 1} done={demoStep > 1} />
                    <DemoProgressBar label="Renkler Analiz Ediliyor" active={demoStep >= 2} done={demoStep > 2} />
                    <DemoProgressBar label="Puan Hesaplanıyor" active={demoStep >= 3} done={false} highlight={demoStep >= 3} />
                  </div>

                  <AnimatePresence>
                    {demoStep >= 3 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-amber-500 text-white text-center shadow-lg shadow-[#FF5500]/20"
                      >
                        <div className="text-sm font-medium opacity-90 mb-1">Genel Skor</div>
                        <div className="text-5xl font-black">84<span className="text-2xl opacity-70">/100</span></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="order-1 md:order-2 space-y-6">
                <h2 className="text-3xl font-black text-[var(--text-primary)]">Saniyeler İçinde Tasarım Geri Bildirimi</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Sistemimiz, tasarımınızı renk uyumu, tipografi, kompozisyon ve bütünlük açısından yapay zeka ile profesyonel bir gözden geçirir. 
                </p>
                <ul className="space-y-4">
                  <FeatureListItem text="İnsan gözünden kaçabilecek teknik hataları yakalar." />
                  <FeatureListItem text="Mantıksız değerlendirmeler yapmaz, formatına göre eleştirir (Örn: Logoda buton aramaz)." />
                  <FeatureListItem text="Güçlü ve zayıf yönlerini doğrudan gösterir." />
                </ul>
                <Link to="/" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:scale-105 transition-transform">
                  Hemen Analiz Et <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* 2. Community Demo */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[40px] p-8 md:p-16 shadow-2xl shadow-black/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-[var(--text-primary)]">Sadece Bir Araç Değil, Bir Topluluk</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Yaptığınız analizleri <b>Vitrin</b> (Keşfet) bölümünde paylaşarak diğer tasarımcıların ilham almasını sağlayabilirsiniz.
                </p>
                <ul className="space-y-4">
                  <FeatureListItem text="İlham veren referans renk paletlerini doğrudan kaydedin." />
                  <FeatureListItem text="Yorumlaşarak diğer tasarımcıların fikirlerini öğrenin." />
                  <FeatureListItem text="En iyi skorları vitrinde sergileyin ve puan toplayın." />
                </ul>
                <Link to="/community" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:scale-105 transition-transform">
                  Keşfete Göz At <ArrowRight size={18} />
                </Link>
              </div>

              <div className="relative flex justify-center">
                {/* Fake Post UI */}
                <div className="w-full max-w-sm bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl p-5 shadow-lg relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">Tasarımcı</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">2 saat önce</div>
                    </div>
                    <div className="ml-auto px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                      92 Puan
                    </div>
                  </div>
                  <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 mb-4 flex items-center justify-center text-indigo-300">
                    <ImageIcon size={48} />
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">Mobil Uygulama Arayüzü</h3>
                  <div className="flex items-center gap-4 border-t border-[var(--border-primary)] pt-4 mt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 font-bold text-sm">
                      <Heart size={16} className="fill-current" /> 42
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 font-bold text-sm">
                      <MessageCircle size={16} /> 5
                    </div>
                  </div>
                </div>
                {/* Floating Action */}
                <motion.div 
                  initial={{ scale: 0, x: -20, y: 20 }}
                  whileInView={{ scale: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute right-0 md:-right-6 -bottom-6 bg-[var(--card-bg)] p-4 rounded-2xl shadow-xl shadow-emerald-500/20 border border-emerald-100 flex items-center gap-3 z-20"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Zap size={20} className="fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">+200 XP Kazandın!</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">Tasarımın vitrinde paylaşıldı</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* 3. Leaderboard Demo */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[40px] p-8 md:p-16 shadow-2xl shadow-black/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 md:order-1 relative">
                {/* Fake Leaderboard UI */}
                <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-lg text-[var(--text-primary)] flex items-center gap-2">
                      <Trophy className="text-amber-500" size={20} /> Haftanın Liderleri
                    </h3>
                  </div>
                  
                  {[
                    { rank: 1, name: "Ahmet", xp: 12450, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { rank: 2, name: "Zeynep", xp: 8840, color: "text-slate-400", bg: "bg-slate-500/10" },
                    { rank: 3, name: "Can", xp: 7200, color: "text-amber-700", bg: "bg-amber-700/10" },
                  ].map((user) => (
                    <div key={user.rank} className={`flex items-center gap-4 p-3 rounded-2xl ${user.rank === 1 ? 'border-2 border-amber-500/20 bg-amber-50/50' : 'border border-[var(--border-primary)]'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${user.color} ${user.bg}`}>
                        {user.rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-[var(--text-primary)]">{user.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">Tasarımcı</div>
                      </div>
                      <div className="font-black text-sm text-[var(--color-brand-orange)]">{user.xp} <span className="text-[10px] font-medium text-[var(--text-secondary)]">XP</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 md:order-2 space-y-6">
                <h2 className="text-3xl font-black text-[var(--text-primary)]">XP Kazan, Seviye Atla</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Sistemdeki her aktif hareketin seni liderlik tablosunda yukarı taşır ve profilinde yeni başarı rozetleri açar. İşte gerçek XP kazanma kuralları:
                </p>
                <ul className="space-y-4">
                  <FeatureListItem text="Tasarım Analizi Yapmak: +150 XP" />
                  <FeatureListItem text="Tasarımı Keşfet'te (Vitrin) Paylaşmak: +200 XP" />
                  <FeatureListItem text="Diğer tasarımlara yorum yapmak: +50 XP" />
                  <FeatureListItem text="Sisteme yeni kayıt olmak: +100 XP Başlangıç Ödülü" />
                </ul>
                <Link to="/liderlik" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:scale-105 transition-transform">
                  Liderlik Tablosuna Git <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* 4. Sıkça Sorulan Sorular (FAQ) & Derinlemesine Bilgi */}
          <div className="max-w-4xl mx-auto pt-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-4">Detaylı Bilgi & SSS</h2>
              <p className="text-[var(--text-secondary)]">Sistem hakkında en çok merak edilenler ve arka planda çalışan yapay zeka teknolojimiz.</p>
            </div>
            
            <div className="space-y-6">
              <FaqItem 
                question="Analizlerde hangi yapay zeka modelini kullanıyorsunuz?"
                answer="Revizelesene, analiz işlemlerinde dünyanın en gelişmiş görsel (multimodal) algılama yeteneğine sahip modellerinden biri olan Google Gemini Pro Vision teknolojisini temel alır. Bu teknoloji; gönderdiğiniz tasarımın renk teorisini (kontrast oranları, palet uyumu), tipografik hiyerarşisini, negatif boşluk kullanımını ve odak noktası yerleşimini adeta deneyimli bir sanat yönetmeni gibi inceler."
              />
              <FaqItem 
                question="Puanlama sistemi neye göre hesaplanıyor?"
                answer="Tasarımınız 100 üzerinden değerlendirilirken belirli alt kriterler göz önüne alınır. Seçtiğiniz kategoriye göre (örneğin 'Sosyal Medya' vs 'Logo') bu ağırlıklar değişir. Genel olarak: Renk Uyumu (%25), Tipografi ve Okunabilirlik (%25), Kompozisyon ve Yerleşim (%25) ve Kullanıcı Deneyimi/Mesaj İletimi (%25) üzerinden kusurlar tespit edilerek puan kırılır. Sistem sadece hata bulmaz, aynı zamanda 'nelerin iyi yapıldığını' da size söyler."
              />
              <FaqItem 
                question="Kazandığım XP'ler ne işe yarıyor?"
                answer="XP (Deneyim Puanları), sizin platformdaki aktifliğinizi ve tasarım deneyiminizi temsil eder. XP kazandıkça profilinizdeki seviyeniz (örneğin 'Çırak' seviyesinden 'Kıdemli Tasarımcı' seviyesine) yükselir. Ayrıca, Liderlik tablosunda üst sıralara çıkarak profilinizin ve tasarımlarınızın diğer kullanıcılar tarafından daha fazla görüntülenmesini sağlarsınız."
              />
              <FaqItem 
                question="Analiz ettiğim tasarımlar herkes tarafından görülür mü?"
                answer="Hayır. Analiz ettiğiniz tüm tasarımlar varsayılan olarak gizlidir ve sadece Profilinizdeki 'Analizlerim' sekmesinden sizin tarafınızdan görülebilir. Eğer isterseniz, bu tasarımları 'Keşfette Paylaş' butonuna basarak topluluğun görebileceği Vitrin sayfasına (ve liderlik yarışına) dahil edebilirsiniz."
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponents

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-[var(--border-primary)] rounded-2xl bg-[var(--bg-primary)] overflow-hidden transition-all hover:border-[var(--color-brand-orange)]/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-[var(--text-primary)]"
      >
        <span className="flex items-center gap-3">
          <HelpCircle size={20} className="text-[var(--color-brand-orange)]" />
          {question}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ArrowRight size={18} className="text-[var(--text-secondary)] rotate-90" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 text-[var(--text-secondary)] leading-relaxed"
          >
            <div className="pt-2 border-t border-[var(--border-primary)]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DemoProgressBar({ label, active, done, highlight }: { label: string; active: boolean; done: boolean; highlight?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className={active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50'}>{label}</span>
        {done && <CheckCircle2 size={14} className="text-emerald-500" />}
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${highlight ? 'bg-gradient-to-r from-[#FF5500] to-amber-500' : 'bg-emerald-500'}`}
          initial={{ width: "0%" }}
          animate={{ width: active ? "100%" : "0%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function FeatureListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1 w-5 h-5 rounded-full bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] flex items-center justify-center shrink-0">
        <CheckCircle2 size={12} />
      </div>
      <span className="text-sm font-medium text-[var(--text-primary)]">{text}</span>
    </li>
  );
}
