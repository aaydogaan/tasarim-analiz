import React, { useEffect } from 'react';
import { ShieldCheck, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IptalIadeKosullari() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8"
            >
                <ArrowLeft size={16} /> Ana Sayfaya Dön
            </button>

            <div className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-[32px] p-6 sm:p-10 shadow-xl space-y-8">
                <div className="border-b border-[var(--border-primary)] pb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-wider mb-3">
                        <RefreshCw size={14} /> Müşteri Hakları
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">İptal ve İade Politikası</h1>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">Son Güncelleme: 27 Temmuz 2026</p>
                </div>

                <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] font-medium">
                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">1. Abonelik İptali Nasıl Yapılır?</h2>
                        <p>
                            Revizelesene PRO üyeliğinizi istediğiniz zaman hiçbir taahhüt ve ceza ödemeksizin iptal edebilirsiniz. İptal işlemi için:
                        </p>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Hesabınıza giriş yapın.</li>
                            <li><strong>Profilim</strong> sayfasına gidin.</li>
                            <li><strong>Abonelik & Haklarım</strong> bölümündeki <strong>"Aboneliğimi İptal Et / Yenilemeyi Durdur"</strong> butonuna tıklayın.</li>
                        </ol>
                        <p className="pt-2">
                            İptal butonuna bastığınız anda gelecek aylara ait otomatik yenileme ve karttan çekim işlemleri anında durdurulur. Mevcut ödediğiniz dönemin sonuna kadar PRO ayrıcalıklarınızı kullanmaya devam edebilirsiniz.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">2. İade Şartları ve Cayma Hakkı</h2>
                        <p>
                            Revizelesene.com üzerinde sunulan PRO üyelikler, anında ifa edilen dijital içerik ve yapay zeka analiz hizmetleri kapsamındadır. 6563 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15. Maddesi uyarınca anında teslim edilen dijital hizmetlerde yasal cayma ve ücret iadesi hakkı bulunmamaktadır.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">3. Yanlışlıkla / Mükerrer Çekim Durumu</h2>
                        <p>
                            Sistem kaynaklı teknik bir arıza nedeniyle kartınızdan mükerrer (birden fazla) çekim yapılması halinde, durumu <strong>revizelesene@gmail.com</strong> adresine bildirmeniz durumunda fazla çekilen tutar 1-3 iş günü içerisinde kartınıza eksiksiz iade edilir.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">4. İletişim ve Destek</h2>
                        <p>
                            Abonelik veya iade süreçleriyle ilgili her türlü soru ve talebiniz için <strong>revizelesene@gmail.com</strong> e-posta adresinden veya site üzerindeki iletişim kanallarından 7/24 bize ulaşabilirsiniz.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

