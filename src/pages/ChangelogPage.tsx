import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: {
    type: 'Yeni' | 'İyileştirme' | 'Düzeltme' | 'Güvenlik';
    text: string;
  }[];
}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: 'v1.4.0',
    date: '4 Ağustos 2026',
    title: 'Portfolyo PDF Desteği ve Kimlik Doğrulama İyileştirmeleri',
    summary: 'Tasarımcı profillerinin niteliğini artırmak amacıyla PDF portfolyo yükleme özelliği yayına alındı. Google OAuth kimlik senkronizasyonu güncellendi.',
    changes: [
      { type: 'Yeni', text: 'Tasarımcı profillerine doğrudan Cloudflare R2 altyapısı ile çalışan PDF portfolyo ekleme desteği getirildi.' },
      { type: 'Yeni', text: 'Ziyaretçilerin tek tıkla portfolyoları inceleyebileceği kurumsal Portfolyoyu İncele erişim butonu eklendi.' },
      { type: 'İyileştirme', text: 'Google OAuth ile giriş yapan kullanıcıların profil resmi senkronizasyonu optimize edildi.' },
      { type: 'Güvenlik', text: 'Supabase RLS güvenlik kuralları ve veri erişim politikaları güncellendi.' }
    ]
  },
  {
    version: 'v1.3.5',
    date: '1 Ağustos 2026',
    title: 'Mobil Arayüz ve Layout Optimizasyonları',
    summary: 'Platform genelinde mobil cihaz uyumluluğunu artırmak ve taşma sorunlarını gidermek için kapsamlı tipografi ve düzen güncellemeleri yapıldı.',
    changes: [
      { type: 'İyileştirme', text: 'Profil kartlarının ve içerik modüllerinin mobil cihazlardaki kapsayıcı yükseklikleri (aspect-ratio) yeniden düzenlendi.' },
      { type: 'İyileştirme', text: 'Profil düzenleme modülü ve buton konumlandırmaları kullanıcı deneyimi standartlarına uygun hale getirildi.' },
      { type: 'Düzeltme', text: 'Küçük ekranlı cihazlarda oluşan yatay kaydırma (horizontal scroll) sorunu giderildi.' }
    ]
  },
  {
    version: 'v1.3.0',
    date: '28 Temmuz 2026',
    title: 'Tasarım Yarışmaları ve Arama Altyapısı',
    summary: 'Tasarımcıların ödüllü yarışmalara katılabileceği etkinlik sistemi ve gelişmiş platform içi arama entegre edildi.',
    changes: [
      { type: 'Yeni', text: 'Topluluğa özel ödüllü Tasarım Yarışmaları ve katılım altyapısı aktif edildi.' },
      { type: 'Yeni', text: 'Platform içi kullanıcı, tasarım ve içerik arama (⌘K) hızlı arama sistemi eklendi.' },
      { type: 'İyileştirme', text: 'Kullanıcı ve analiz raporu sorgu süreleri optimize edildi.' }
    ]
  },
  {
    version: 'v1.2.0',
    date: '22 Temmuz 2026',
    title: 'Oyunlaştırma (Gamification), Rozet ve Seviye Sistemi',
    summary: 'Topluluk içi etkileşimi teşvik etmek ve tasarımcı gelişimini ödüllendirmek amacıyla puanlama ve başarım altyapısı inşa edildi.',
    changes: [
      { type: 'Yeni', text: 'Kullanıcı aktivitelerine göre XP kazanımı ve dinamik seviye (Level) sistemi eklendi.' },
      { type: 'Yeni', text: 'Platformdaki başarıları simgeleyen 20+ özgün rozet ve Kurucu üye belirteci devreye alındı.' },
      { type: 'İyileştirme', text: 'Liderlik tablosu (Leaderboard) canlı sıralama mimarisi ile güncellendi.' }
    ]
  },
  {
    version: 'v1.1.0',
    date: '18 Temmuz 2026',
    title: 'Topluluk Vitrini ve İnteraktif Etkileşim Akışı',
    summary: 'Tasarımcıların çalışmalarını sergileyebileceği ve topluluktan geri bildirim alabileceği keşfet vitrini hizmete girdi.',
    changes: [
      { type: 'Yeni', text: 'Çoklu görsel destekli tasarım paylaşım modülü ve detaylı inceleme modalı eklendi.' },
      { type: 'Yeni', text: 'Revize (Yorum) akışı ve kullanıcı takip sistemi entegre edildi.' },
      { type: 'Yeni', text: 'Günün Tasarımı öne çıkarma ve değerlendirme algoritması aktif edildi.' }
    ]
  },
  {
    version: 'v1.0.0',
    date: '15 Temmuz 2026',
    title: 'Revizelesene Platform Lansmanı ve AI Analiz Motoru',
    summary: 'Türkiye’nin yapay zeka destekli ilk tasarım analiz ve topluluk platformu ilk sürümü ile yayına başladı.',
    changes: [
      { type: 'Yeni', text: 'Google Gemini altyapılı 7 farklı kategoride anlık tasarım analiz ve değerlendirme motoru kuruldu.' },
      { type: 'Yeni', text: 'PDF formatında profesyonel tasarım analiz raporu indirme altyapısı oluşturuldu.' },
      { type: 'Yeni', text: 'Kullanıcı kimlik doğrulama, profil yönetimi ve temel altyapı servisleri tamamlandı.' }
    ]
  }
];

export default function ChangelogPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = 'Yenilikler & Güncelleme Notları | Revizelesene';
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased selection:bg-[#FF5500]/20 selection:text-[#FF5500]">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Ana Sayfaya Dön
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-1 text-[11px] font-bold tracking-wide text-[var(--text-primary)] shadow-sm">
              <Sparkles className="h-3 w-3 text-[var(--text-secondary)]" />
              Sistem Güncellemeleri
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Title Section */}
        <div className="mb-12 border-b border-[var(--border-primary)] pb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] border border-[var(--border-primary)] shadow-sm">
            <span>Sürüm Geçmişi</span>
            <span className="text-[var(--text-secondary)]">•</span>
            <span>Değişiklik Günlüğü</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Yenilikler & Güncelleme Notları
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base max-w-2xl">
            Revizelesene platformunun gelişim süreci, yayınlanan sistem güncellemeleri, performans iyileştirmeleri ve güvenlik değişiklikleri aşağıda kronolojik olarak sunulmaktadır.
          </p>
        </div>

        {/* Timeline Entries */}
        <div className="relative border-l-2 border-[var(--border-primary)] sm:ml-4 ml-2 space-y-12 pl-6 sm:pl-8">
          {CHANGELOG_DATA.map((entry, index) => (
            <motion.article
              key={entry.version}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative group"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--border-primary)] bg-[var(--bg-primary)] group-hover:border-[#FF5500] group-hover:bg-[#FF5500] transition-colors shadow-sm" />

              {/* Version & Date */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-2.5 py-1 text-xs font-mono font-bold text-[var(--text-primary)] shadow-sm">
                  {entry.version}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-semibold">
                  <Calendar className="h-3.5 w-3.5" />
                  {entry.date}
                </span>
              </div>

              {/* Title & Summary */}
              <h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                {entry.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                {entry.summary}
              </p>

              {/* Changes List */}
              <div className="mt-4 rounded-xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-4 sm:p-5 shadow-sm">
                <ul className="space-y-3">
                  {entry.changes.map((change, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-3 text-xs sm:text-sm">
                      <span
                        className="inline-block shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] shadow-xs"
                      >
                        {change.type}
                      </span>
                      <span className="text-[var(--text-primary)] leading-normal font-medium">
                        {change.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            Öneri, bildirim ve teknik geri bildirimleriniz için topluluk kanalımızı ziyaret edebilir veya bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      </main>
    </div>
  );
}
