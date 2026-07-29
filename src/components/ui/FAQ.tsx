import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: "Tasarım analizi ne kadar sürüyor?",
    answer: "Yapay zeka motorumuz sayesinde analiz işleminiz sadece saniyeler içinde tamamlanır ve kapsamlı raporunuz anında ekrana gelir."
  },
  {
    question: "Hangi tasarım türlerini destekliyorsunuz?",
    answer: "Şu anda sosyal medya gönderileri, web arayüzleri (UI/UX), kurumsal kimlik, afiş/poster ve banner gibi tüm statik dijital tasarımları destekliyoruz."
  },
  {
    question: "Analiz sonuçlarım gizli kalıyor mu?",
    answer: "Evet. Tasarımlarınız sizin izniniz olmadan topluluk vitrininde veya başka hiçbir yerde paylaşılmaz. Sadece siz görebilirsiniz."
  },
  {
    question: "Tamamen ücretsiz mi?",
    answer: "Sisteme üye olarak yapay zeka destekli tasarım analizini ilk aşamada ücretsiz olarak deneyebilirsiniz."
  },
  {
    question: "Yapay zeka hangi kriterlere göre değerlendiriyor?",
    answer: "Tasarımınız 4 ana metrik üzerinden değerlendirilir: Renk Hiyerarşisi, Tipografi, Kompozisyon ve Marka Bütünlüğü. Bu metrikler profesyonel standartlara göre hesaplanır."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-24 md:py-32">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-brand-dark)]/5 text-[var(--color-brand-dark)] text-xs font-bold uppercase tracking-wider mb-4 border border-[var(--color-brand-dark)]/10">
          S.S.S
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-[var(--color-brand-dark)] tracking-tight">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-[var(--color-brand-dark)]/60 font-medium mt-4 max-w-2xl">
          Revizelesene hakkında en çok merak edilen soruları sizin için yanıtladık.
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`border border-[var(--color-brand-dark)]/10 rounded-2xl overflow-hidden transition-colors ${isOpen ? 'bg-white shadow-sm' : 'bg-[var(--color-brand-light)] hover:bg-white/50'}`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-sans font-bold text-[var(--color-brand-dark)] text-base md:text-lg pr-8">
                  {item.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-[#FF4D00] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-[var(--color-brand-dark)]/70 font-medium leading-relaxed">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
