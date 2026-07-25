import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Target, 
  Eye, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Layers,
  Palette,
  Type
} from 'lucide-react';

const ROTATING_WORDS = ["Yeniden Tanımlandı", "Nesnelleşti", "Tarafsızlaştı", "Hızlandı", "Güçlendi"];

export default function About() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    document.title = 'Hakkımızda — Revizelesene';
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[var(--bg-primary)] min-h-screen font-sans selection:bg-[#FF5500] selection:text-white pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FF5500]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[25%] right-10 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] text-xs font-extrabold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hakkımızda & Hikayemiz</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[var(--text-primary)] tracking-tight leading-[1.15] mb-8">
            Tasarımda Geri Bildirim <br className="hidden sm:inline" />
            <span className="relative inline-block text-[#FF5500]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -25, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="inline-block"
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-[var(--text-secondary)] font-medium max-w-3xl mx-auto leading-relaxed mb-10">
            Revizelesene; grafik tasarımcıların, sosyal medya yöneticilerinin ve markaların görsel çalışmalarındaki kör noktaları nesnel ve tarafsız biçimde tespit eden yapay zeka platformudur.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app"
              className="px-8 py-4 rounded-2xl bg-[#FF5500] hover:bg-[#e04b00] text-white font-extrabold text-base transition-all shadow-lg shadow-[#FF5500]/25 flex items-center gap-2"
            >
              <span>Hemen Analiz Et</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/community"
              className="px-8 py-4 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-extrabold text-base transition-all"
            >
              Topluluğu Keşfet
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. FİKİR NASIL DOĞDU? (ORIGIN STORY) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF5500]">
              <Eye className="w-4 h-4" />
              <span>Fikir Nasıl Doğdu?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              Tasarımcı Körlüğüne ve Belirsiz Revizyonlara Son.
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-normal">
              Günlerce üzerinde çalışılan bir tasarımda göz, zamanla detaylara alışır. Renk uyumsuzlukları, okunabilirlik sorunları ve oran dengesizlikleri "tasarımcı körlüğü" nedeniyle fark edilemeyebilir. Gelen müşteri revizyonları ise genellikle kişisel beğenilere dayanır ve net bir yön göstermez.
            </p>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-normal">
              İşte **Revizelesene**, bu belirsizliği ortadan kaldırmak için geliştirildi. Yapay zekanın tarafsız, analitik ve akademik gözünü tasarım dünyasıyla buluşturarak; renk teorisi, Gestalt prensipleri ve tipografi kurallarına göre anında nesnel geri bildirim sağlıyoruz.
            </p>

            <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] border-l-4 border-l-[#FF5500] shadow-sm">
              <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                "Amacımız tasarımcıların yerine tasarım yapmak değil; onların yaratıcı potansiyelini teknik doğrularla en üst seviyeye çıkarmaktır."
              </p>
            </div>
          </motion.div>

          {/* Right Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-3xl p-8 shadow-xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5500]/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FF5500]" />
                Temel Değerlerimiz
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Tarafsız & Veriye Dayalı Analiz</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Kişisel yorumlar yerine tasarım biliminin kuralları.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Saniyeler İçinde Sonuç</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Günlerce revizyon beklemek yerine anında raporlama.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Adil Yarışma & Ödüllendirme</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Topluluk içindeki yetenekleri jüri puanıyla öne çıkarma.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. PLATFORMUN 4 ANA SÜTUNU (FEATURES & PILLARS) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-primary)]">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF5500] mb-3">
            <Layers className="w-4 h-4" />
            <span>Revizelesene Ekosistemi</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Neler Sunuyoruz?
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] space-y-4 hover:border-[#FF5500]/40 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center font-bold group-hover:bg-[#FF5500] group-hover:text-white transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Tasarım Analizi</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Yüklenen görseldeki renk dengesini, hizalamayı ve tipografiyi 4 kritik kategoride (0-100 Puan) analiz eder.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] space-y-4 hover:border-blue-500/40 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Görsel Revizyon Önerisi</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Sadece hataları listelemekle kalmaz, tasarımın ideal ve düzeltilmiş versiyonunu yapay zeka ile üretir.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] space-y-4 hover:border-amber-500/40 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Ödüllü Yarışmalar</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Tasarımcıların yeteneklerini sergileyebileceği, detaylı jüri puanlamalı adil yarışma platformu.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] space-y-4 hover:border-emerald-500/40 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">XP & Rozet Sistemi</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Katılım sağladıkça XP ve seviye kazanılan, liderlik tablosu ile sıralamaların göründüğü gamification sistemi.
            </p>
          </motion.div>

        </div>
      </section>

      {/* 4. SAYILARLA REVİZELESENE STATS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-xs">
            <p className="text-3xl sm:text-4xl font-black text-[#FF5500]">0-100</p>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">Detaylı Jüri Puanı</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-xs">
            <p className="text-3xl sm:text-4xl font-black text-[#FF5500]">4</p>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">Analiz Kriteri</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-xs">
            <p className="text-3xl sm:text-4xl font-black text-[#FF5500]">%100</p>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">Nesnel Geri Bildirim</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-primary)] shadow-xs">
            <p className="text-3xl sm:text-4xl font-black text-[#FF5500]">7/24</p>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">Yapay Zeka Erişimi</p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="pt-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[var(--card-bg)] to-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4 relative z-10">
            Tasarımını Bir Üst Seviyeye Taşı.
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8 relative z-10">
            İlk analizini ücretsiz hemen yap veya tasarım yarışmalarında yeteneğini göster!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link
              to="/app"
              className="px-8 py-4 rounded-2xl bg-[#FF5500] hover:bg-[#e04b00] text-white font-extrabold text-base transition-all shadow-lg shadow-[#FF5500]/25 flex items-center gap-2"
            >
              <span>Hemen Analiz Yap</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
