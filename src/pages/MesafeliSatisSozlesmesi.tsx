import React, { useEffect } from 'react';
import { ShieldCheck, FileText, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MesafeliSatisSozlesmesi() {
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-xs font-black uppercase tracking-wider mb-3">
                        <FileText size={14} /> Yasal Bildirim
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu</h1>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">Son Güncelleme: 27 Temmuz 2026</p>
                </div>

                <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] font-medium">
                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">MADDE 1: TARAFLAR</h2>
                        <p>
                            İşbu Sözleşme, bir tarafta <strong>Revizelesene Dijital Hizmetler</strong> (Bundan böyle "SATICI" olarak anılacaktır) ile diğer tarafta revizelesene.com web sitesi üzerinden PRO üyelik aboneliği satın alan kullanıcı (Bundan böyle "ALICI" olarak anılacaktır) arasında aşağıdaki şartlar çerçevesinde elektronik ortamda akdedilmiştir.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">MADDE 2: SÖZLEŞMENİN KONUSU</h2>
                        <p>
                            İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait <strong>revizelesene.com</strong> web sitesinden elektronik ortamda siparişini yaptığı dijital yapay zeka tasarım analiz abonelik hizmetinin satışı ve teslimi ile ilgili olarak 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">MADDE 3: HİZMET VE ÖDEME BİLGİLERİ</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Hizmet Adı:</strong> Revizelesene PRO Aylık Dijital Abonelik Paketi</li>
                            <li><strong>Hizmet Kapsamı:</strong> Sınırsız AI Tasarım Analizi, Kıdemli Tasarım Direktörü Derin Raporları, AI Revizyon Önerileri, Yüksek Çözünürlüklü PDF İndirme.</li>
                            <li><strong>Abonelik Ücreti:</strong> 59,00 TL / Ay (+ %20 KDV dahil toplam 70,80 TL)</li>
                            <li><strong>Ödeme Yöntemi:</strong> Shopier Güvenli Ödeme Altyapısı (Kredi / Banka Kartı)</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">MADDE 4: CAYMA HAKKI VE İSTİSNALARI</h2>
                        <p>
                            Mesafeli Sözleşmeler Yönetmeliği'nin 15. Maddesinin (ğ) bendi uyarınca; <em>"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde cayma hakkı kullanılamaz."</em>
                        </p>
                        <p>
                            Revizelesene dijital yapay zeka analiz hizmetleri satın alma anında anında aktifleştiği için cayma hakkı kapsamında iade edilemez. Ancak kullanıcı istediği an profil sayfasından otomatik yenilemeyi iptal etme hakkına sahiptir.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">MADDE 5: ABONELİK İPTALİ</h2>
                        <p>
                            ALICI, dilediği an herhangi bir taahhüt olmaksızın revizelesene.com üzerindeki <strong>Profilim ➡️ Abonelik & Haklarım</strong> bölümünden *"Aboneliğimi İptal Et"* butonuna basarak aboneliğini sonraki dönemler için otomatik yenilemeye kapatabilir. İptal durumunda mevcut ödenmiş dönemin sonuna kadar hizmet kullanımı devam eder.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-black text-[var(--text-primary)]">MADDE 6: YETKİLİ MAHKEME</h2>
                        <p>
                            İşbu sözleşmeden doğan uyuşmazlıklarda Gümrük ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

