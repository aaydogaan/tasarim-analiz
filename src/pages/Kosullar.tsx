import React from 'react';

export default function Kosullar() {
    return (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] pt-32 pb-20 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-8">Kullanım Koşulları</h1>
                
                <div className="prose prose-invert max-w-none text-[var(--text-secondary)] space-y-6">
                    <p className="font-medium text-lg">Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}</p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">1. Taraflar ve Kapsam</h2>
                    <p>
                        Bu Kullanım Koşulları sözleşmesi, "Revizelesene" platformu ("Platform") ile platforma üye olan veya ziyaret eden kullanıcı ("Kullanıcı") arasındaki yasal hak ve yükümlülükleri düzenler. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">2. Hizmetin İçeriği</h2>
                    <p>
                        Revizelesene, tasarımcıların tasarımlarını paylaşarak geri bildirim (revize) alabilecekleri, oylama ve yorum yapabilecekleri bir topluluk ve araçlar platformudur. Sunulan özellikler haber verilmeksizin değiştirilebilir veya güncellenebilir.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">3. Kullanıcı Yükümlülükleri</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Kullanıcılar platforma yükledikleri içeriklerin (tasarımlar, metinler vb.) fikri mülkiyet haklarına sahip olduklarını beyan ederler.</li>
                        <li>Başkalarına ait, telif hakkı ihlali içeren, yasa dışı, tehditkar, hakaret içeren veya genel ahlaka aykırı içeriklerin yüklenmesi kesinlikle yasaktır.</li>
                        <li>Kullanıcılar, platform üzerindeki diğer kullanıcılara saygı çerçevesinde geri bildirim vermelidir.</li>
                        <li>Platformun işleyişini bozacak, sunuculara aşırı yük bindirecek bot veya otomatik script kullanımı yasaktır.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">4. İçerik ve Fikri Mülkiyet</h2>
                    <p>
                        Platforma yüklediğiniz içeriklerin mülkiyeti size aittir. Ancak yüklediğiniz içerikleri, platformun tanıtımı, işleyişi ve gösterimi amacıyla kullanmamız için bize dünya çapında, bedelsiz ve alt lisanslanabilir bir kullanım hakkı vermiş olursunuz.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">5. Sorumluluk Reddi</h2>
                    <p>
                        Platform "olduğu gibi" sunulmaktadır. Platformda yer alan içeriklerin doğruluğu veya kesintisiz hizmet sağlanacağı garanti edilmemektedir. Revizelesene, kullanıcıların yüklediği içeriklerden veya diğer kullanıcılarla olan etkileşimlerinden doğabilecek doğrudan veya dolaylı zararlardan sorumlu tutulamaz.
                    </p>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8">6. Hesabın Kapatılması</h2>
                    <p>
                        Revizelesene, bu Kullanım Koşulları'nı ihlal eden kullanıcıların hesaplarını askıya alma veya kalıcı olarak silme hakkını saklı tutar.
                    </p>
                </div>
            </div>
        </div>
    );
}
