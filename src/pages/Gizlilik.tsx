import React from 'react';

export default function Gizlilik() {
    return (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] pt-32 pb-20 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-8">Gizlilik Sözleşmesi</h1>
                
                <div className="prose prose-invert max-w-none text-[var(--text-secondary)] space-y-6">
                    <p className="font-medium text-lg">Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}</p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">1. Giriş</h2>
                    <p>
                        Revizelesene olarak gizliliğinize değer veriyoruz. Bu Gizlilik Sözleşmesi, sitemizi ziyaret ettiğinizde, hizmetlerimizi kullandığınızda veya platforma kayıt olduğunuzda bilgilerinizin nasıl toplandığını, korunduğunu ve kullanıldığını detaylandırmaktadır.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">2. Hangi Bilgileri Topluyoruz?</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Kişisel Tanımlayıcı Bilgiler:</strong> İsim, soyisim, e-posta adresiniz, profil fotoğrafınız vb.</li>
                        <li><strong>Kullanım Verileri:</strong> Tarayıcı tipiniz, IP adresiniz, platformda geçirdiğiniz süre, ziyaret ettiğiniz sayfalar ve platform içi eylemleriniz (beğeni, yorum vb.).</li>
                        <li><strong>İçerik Verileri:</strong> Geri bildirim almak amacıyla yüklediğiniz tasarımlar ve yaptığınız yorumlar.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">3. Çerezler (Cookies) ve İzleme Teknolojileri</h2>
                    <p>
                        Google Analytics, Google Search Console, Meta Pixel gibi üçüncü taraf analitik ve pazarlama araçlarını kullanmaktayız. Bu araçlar, platformun kullanımını analiz etmek, performansı ölçmek ve size daha iyi bir deneyim sunmak için çerezleri (cookies) ve benzer izleme teknolojilerini kullanır. Çerez tercihlerinizi tarayıcınızın ayarlarından yönetebilirsiniz.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">4. Bilgilerinizi Nasıl Kullanıyoruz?</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Platform hizmetlerini sunmak ve kişiselleştirmek.</li>
                        <li>Teknik destek sağlamak ve sorunları gidermek.</li>
                        <li>Güvenliği sağlamak ve yetkisiz erişimleri önlemek.</li>
                        <li>İstatistiksel analizler yaparak ürün geliştirme süreçlerini yönlendirmek.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">5. Bilgilerin Üçüncü Taraflarla Paylaşımı</h2>
                    <p>
                        Kişisel bilgileriniz ticari amaçlarla satılmaz. Yalnızca yasal zorunluluklar, altyapı sağlayıcıları (sunucu ve veritabanı yönetimi) ve anonimleştirilmiş ölçümleme araçları (Google, Meta) ile sözleşmeler çerçevesinde paylaşılır.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">6. Veri Güvenliği</h2>
                    <p>
                        Verilerinizin güvenliğini sağlamak için endüstri standardı şifreleme ve güvenlik önlemleri almaktayız. Ancak internet üzerindeki hiçbir veri iletimi veya depolama yönteminin %100 güvenli olduğunu garanti edemeyiz.
                    </p>
                </div>
            </div>
        </div>
    );
}
