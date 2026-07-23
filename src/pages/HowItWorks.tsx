import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Heart, ArrowRight, CheckCircle2, Zap, UploadCloud, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'ai' | 'community' | 'leaderboard'>('ai');
  const [demoStep, setDemoStep] = useState(0);

  // Auto-play AI Demo
  useEffect(() => {
    if (activeTab === 'ai') {
      const timer = setInterval(() => {
        setDemoStep((prev) => (prev >= 3 ? 0 : prev + 1));
      }, 2500);
      return () => clearInterval(timer);
    } else {
      setDemoStep(0);
    }
  }, [activeTab]);

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
            <Sparkles size={16} />
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

        {/* Interactive Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <TabButton 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
            icon={<Zap size={18} />} 
            label="Yapay Zeka Analizi" 
          />
          <TabButton 
            active={activeTab === 'community'} 
            onClick={() => setActiveTab('community')} 
            icon={<Heart size={18} />} 
            label="Keşfet ve Topluluk" 
          />
          <TabButton 
            active={activeTab === 'leaderboard'} 
            onClick={() => setActiveTab('leaderboard')} 
            icon={<Trophy size={18} />} 
            label="Liderlik ve XP" 
          />
        </div>

        {/* Content Area */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[40px] p-8 md:p-16 shadow-2xl shadow-black/5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* 1. AI Analysis Demo */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF5500]/10 text-[#FF5500] mb-2">
                    <Zap size={24} />
                  </div>
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
            )}

            {/* 2. Community Demo */}
            {activeTab === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mb-2">
                    <Heart size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-[var(--text-primary)]">Sadece Bir Araç Değil, Bir Topluluk</h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Yaptığınız analizleri <b>Vitrin</b> (Keşfet) bölümünde paylaşarak diğer tasarımcıların ilham almasını sağlayabilirsiniz.
                  </p>
                  <ul className="space-y-4">
                    <FeatureListItem text="Reddit tarzı Upvote (Beğeni) sistemiyle ön plana çıkın." />
                    <FeatureListItem text="Topluluğun ilgisini çeken tasarımlar ekstra XP kazandırır." />
                    <FeatureListItem text="İlham veren referans renk paletlerini doğrudan kaydedin." />
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
                    animate={{ scale: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute right-0 md:-right-6 -bottom-6 bg-[var(--card-bg)] p-4 rounded-2xl shadow-xl shadow-rose-500/20 border border-rose-100 flex items-center gap-3 z-20"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white">
                      <Heart size={20} className="fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">+10 XP Kazandın!</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Tasarımın upvote aldı</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* 3. Leaderboard Demo */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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
                      { rank: 1, name: "Ahmet", xp: 2450, color: "text-amber-500", bg: "bg-amber-500/10" },
                      { rank: 2, name: "Zeynep", xp: 1840, color: "text-slate-400", bg: "bg-slate-500/10" },
                      { rank: 3, name: "Can", xp: 1200, color: "text-amber-700", bg: "bg-amber-700/10" },
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
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mb-2">
                    <Trophy size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-[var(--text-primary)]">XP Kazan, Seviye Atla</h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Sistemdeki her aktif hareketin seni liderlik tablosunda yukarı taşır. XP kazandıran başlıca eylemler şunlardır:
                  </p>
                  <ul className="space-y-4">
                    <FeatureListItem text="Tasarım Analizi Yapmak: +15 XP" />
                    <FeatureListItem text="Tasarımları Vitrinde Paylaşmak: +20 XP" />
                    <FeatureListItem text="Beğeni (Upvote) Almak: Her upvote için +10 XP" />
                  </ul>
                  <Link to="/liderlik" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:scale-105 transition-transform">
                    Liderlik Tablosuna Git <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

// Subcomponents

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 ${
        active 
          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg scale-105' 
          : 'bg-[var(--card-bg)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {icon}
      {label}
    </button>
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
