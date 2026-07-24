import React, { useEffect } from 'react';

export default function CerezPolitikasi() {
    useEffect(() => {
        document.title = 'Çerez Politikası - Revizelesene';
    }, []);

    return (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] pt-32 pb-20 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-8">Çerez Politikası</h1>
                
                <div className="prose prose-invert max-w-none text-[var(--text-secondary)] space-y-6">
                    <p className="font-medium text-lg">Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}</p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">1. Çerez (Cookie) Nedir?</h2>
                    <p>
                        Çerezler, bir internet sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza (bilgisayar, tablet, mobil cihaz vb.) depolanan küçük metin dosyalarıdır. Çerezler, sitemizin daha verimli çalışmasını sağlamak, kişiselleştirilmiş bir deneyim sunmak ve ziyaretçilerin siteyi nasıl kullandığını anlamak amacıyla kullanılmaktadır.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">2. Hangi Çerezleri Kullanıyoruz?</h2>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>Zorunlu Çerezler:</strong> Sitemizin temel işlevlerini yerine getirebilmesi için kesinlikle gerekli olan çerezlerdir. Kullanıcı girişi, güvenlik ve ağ yönetimi gibi temel özellikleri etkinleştirir.</li>
                        <li><strong>Analiz ve Performans Çerezleri:</strong> Ziyaretçilerin sitemizi nasıl kullandığını analiz etmek, en çok hangi sayfaların ziyaret edildiğini anlamak ve sitemizin performansını artırmak amacıyla kullanılır (Örn: Google Analytics).</li>
                        <li><strong>İşlevsellik Çerezleri:</strong> Sitemizdeki tercihlerinizi (dil seçimi, kullanıcı adı vb.) hatırlayarak size daha kişiselleştirilmiş bir deneyim sunmamızı sağlar.</li>
                        <li><strong>Hedefleme ve Reklam Çerezleri:</strong> İlgi alanlarınıza uygun reklamlar sunmak ve reklam kampanyalarımızın etkinliğini ölçmek amacıyla, genellikle reklam ağları tarafından bizim iznimizle yerleştirilir.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">3. Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
                    <p>
                        Tarayıcınızın ayarlarını değiştirerek çerezlere ilişkin tercihlerinizi yönetebilirsiniz. Çoğu tarayıcı, çerezleri otomatik olarak kabul edecek şekilde ayarlanmıştır, ancak bu ayarları çerezleri reddedecek veya cihazınıza bir çerez gönderildiğinde sizi uyaracak şekilde yapılandırabilirsiniz. Çerezleri devre dışı bırakmanız halinde, sitemizin bazı özelliklerinden tam olarak yararlanamayabileceğinizi unutmayın.
                    </p>
                    
                    <p>Farklı tarayıcılarda çerez yönetiminin nasıl yapılacağına dair bilgilere ilgili tarayıcının yardım/destek sayfalarından ulaşabilirsiniz.</p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">4. Politikadaki Değişiklikler</h2>
                    <p>
                        İşbu Çerez Politikası, değişen yasal gereksinimler veya sitemizdeki güncellemeler doğrultusunda zaman zaman güncellenebilir. Politikada yapılacak önemli değişiklikler sitemiz üzerinden sizlere duyurulacaktır.
                    </p>

                    <div className="mt-12 p-6 bg-gray-50/5 border border-gray-200/10 rounded-2xl">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Bize Ulaşın</h3>
                        <p>
                            Çerez politikamızla ilgili her türlü soru, görüş ve öneriniz için bizimle <strong>iletisim@revizelesene.com</strong> adresi üzerinden iletişime geçebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
