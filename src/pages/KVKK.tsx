import React from 'react';

export default function KVKK() {
    return (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] pt-32 pb-20 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-8">Kişisel Verilerin Korunması (KVKK)</h1>
                
                <div className="prose prose-invert max-w-none text-[var(--text-secondary)] space-y-6">
                    <p className="font-medium text-lg">Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}</p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">1. Veri Sorumlusu</h2>
                    <p>
                        Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, "Revizelesene" olarak kişisel verilerinizi veri sorumlusu sıfatıyla işlemekteyiz. Bu aydınlatma metni, kişisel verilerinizin nasıl toplandığını, kullanıldığını, paylaşıldığını ve korunduğunu açıklamaktadır.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">2. İşlenen Kişisel Verileriniz</h2>
                    <p>
                        Hizmetlerimizden yararlanmanız kapsamında aşağıdaki kişisel verileriniz işlenmektedir:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, e-posta adresi.</li>
                        <li><strong>Kullanıcı İşlem Bilgileri:</strong> Profil bilgileri, platforma yüklenen tasarımlar, yorumlar, oylar.</li>
                        <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı bilgileri, log kayıtları.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">3. Kişisel Verilerin İşlenme Amaçları</h2>
                    <p>
                        Kişisel verileriniz, aşağıdaki amaçlarla işlenmektedir:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Kullanıcı hesabı oluşturulması ve yönetimi.</li>
                        <li>Platform içi etkileşimlerin (tasarım yükleme, yorum, oylama) sağlanması.</li>
                        <li>Sistem güvenliğinin sağlanması ve yasal yükümlülüklerin yerine getirilmesi.</li>
                        <li>Google Analytics ve benzeri araçlar vasıtasıyla site kullanımının analiz edilmesi ve kullanıcı deneyiminin iyileştirilmesi.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">4. Kişisel Verilerin Aktarılması</h2>
                    <p>
                        Kişisel verileriniz; sunucu ve altyapı hizmeti aldığımız yurt içi/yurt dışı firmalarla (ör: Supabase, Google), yasal zorunluluklar kapsamında yetkili kamu kurum ve kuruluşlarıyla, ölçümleme ve analiz araçları (Google Analytics, Meta Pixel vb.) ile anonimleştirilerek veya şifrelenerek paylaşılabilmektedir.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
                    <p>
                        Kişisel verileriniz, platformumuzu kullanımınız sırasında otomatik veya kısmen otomatik yöntemlerle toplanmaktadır. Bu veriler, sözleşmenin kurulması ve ifası, yasal yükümlülüklerin yerine getirilmesi ve veri sorumlusunun meşru menfaatleri hukuki sebeplerine dayanılarak işlenmektedir.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">6. İlgili Kişi Hakları</h2>
                    <p>
                        KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme haklarına sahipsiniz. Haklarınızı kullanmak için iletişim kanallarımız üzerinden bizimle irtibata geçebilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
}
