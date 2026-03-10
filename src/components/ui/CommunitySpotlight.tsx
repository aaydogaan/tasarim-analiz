import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Star, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VitrinItem {
    id: string;
    tasarim_turu: string;
    isletme: string;
    gorsel_url: string;
    ai_puan: number;
    topluluk_puan: number;
    user_name: string | null;
    user_avatar: string | null;
}

const VitrinCard: React.FC<{ item: VitrinItem }> = ({ item }) => (
    <div className="w-[260px] md:w-[300px] flex-shrink-0">
        <div className="relative group rounded-[20px] overflow-hidden bg-white border border-[var(--color-brand-dark)]/5 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={item.gorsel_url}
                    alt={item.isletme}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-dark)] border border-white/10 shadow-sm">
                        {item.tasarim_turu}
                    </span>
                </div>
            </div>
        </div>

        {/* Info Area matches Vitrin.tsx (Explore) page exactly */}
        <div className="flex justify-between items-center mt-3 px-1.5">
            <div className="flex items-center gap-3">
                <img
                    src={item.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                    alt="Designer"
                    className="w-7 h-7 rounded-full bg-[var(--color-brand-light)] border border-[var(--color-brand-dark)]/5 object-cover"
                />
                <span className="text-[var(--color-brand-dark)]/80 hover:text-[var(--color-brand-dark)] cursor-pointer transition-colors text-sm font-medium leading-none">
                    {item.user_name || "Gizli Tasarımcı"}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 group cursor-help">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500/20 group-hover:fill-amber-500 transition-colors" />
                    <span className="text-[var(--color-brand-dark)]/60 text-xs font-semibold tabular-nums">{item.ai_puan}</span>
                </div>
                <div className="flex items-center gap-1.5 group cursor-help">
                    <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500/20 group-hover:fill-emerald-500 transition-colors" />
                    <span className="text-[var(--color-brand-dark)]/60 text-xs font-semibold tabular-nums tracking-tighter">{item.topluluk_puan || 0}</span>
                </div>
            </div>
        </div>
    </div>
);

const MarqueeRow = ({ items, direction, speed = 40 }: { items: VitrinItem[], direction: 'left' | 'right', speed?: number }) => {
    // If we have few items, multiply to fill the row
    const list = [...items, ...items, ...items, ...items, ...items];

    return (
        <div className="flex overflow-hidden py-3 select-none">
            <motion.div
                animate={{
                    x: direction === 'left' ? [0, -1280] : [-1280, 0]
                }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="flex items-center gap-6"
            >
                {list.map((item, i) => (
                    <VitrinCard key={`${item.id}-${i}`} item={item} />
                ))}
            </motion.div>
        </div>
    );
};

export default function CommunitySpotlight({ onExploreClick }: { onExploreClick: () => void }) {
    const [vitrinItems, setVitrinItems] = useState<VitrinItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVitrin = async () => {
            const { data, error } = await supabase
                .from("vitrin_view")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

            if (data && data.length > 0) {
                setVitrinItems(data);
            } else {
                // Fallback sample data if DB is empty
                setVitrinItems([
                    {
                        id: 's1',
                        isletme: 'Sample Design 1',
                        user_name: 'Arda Yılmaz',
                        user_avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Arda',
                        gorsel_url: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=600',
                        tasarim_turu: 'Mobil',
                        ai_puan: 92,
                        topluluk_puan: 85
                    },
                    {
                        id: 's2',
                        isletme: 'Sample Design 2',
                        user_name: 'Selin Demir',
                        user_avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Selin',
                        gorsel_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600',
                        tasarim_turu: 'E-ticaret',
                        ai_puan: 88,
                        topluluk_puan: 90
                    },
                    {
                        id: 's3',
                        isletme: 'Sample Design 3',
                        user_name: 'Murat Can',
                        user_avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Murat',
                        gorsel_url: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=600',
                        tasarim_turu: 'SaaS',
                        ai_puan: 95,
                        topluluk_puan: 92
                    }
                ]);
            }
            setLoading(false);
        };

        fetchVitrin();
    }, []);

    const Row1 = vitrinItems;
    const Row2 = [...vitrinItems].reverse();

    return (
        <section className="w-full py-24 bg-[var(--color-brand-light)] border-t border-[var(--color-brand-dark)]/5 overflow-hidden relative">
            {/* Grid Background */}
            <div
                className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,rgba(0,0,0,0)_1px),linear-gradient(to_bottom,var(--grid-color)_1px,rgba(0,0,0,0)_1px)] bg-[size:32px_32px] pointer-events-none"
                style={{
                    maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                }}
            />

            <div className="max-w-screen-xl mx-auto px-8 md:px-16 mb-16 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                >
                    <span className="text-[var(--color-brand-orange)] font-bold text-[11px] uppercase tracking-[0.3em] mb-4">
                        Topluluk Vitrini
                    </span>
                    <h2 className="text-[32px] md:text-[42px] font-bold text-[var(--color-brand-dark)] leading-tight tracking-tight mb-8">
                        Haftanın Öne Çıkanları<span className="text-[var(--color-brand-orange)]">.</span>
                    </h2>
                </motion.div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[var(--color-brand-dark)]/10 border-t-[var(--color-brand-orange)] rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <MarqueeRow items={Row1} direction="left" speed={55} />
                    <MarqueeRow items={Row2} direction="right" speed={50} />
                </div>
            )}

            <div className="mt-20 flex justify-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onExploreClick}
                    className="flex items-center gap-3 px-10 py-4 bg-[var(--color-brand-dark)] text-white rounded-full text-[15px] font-bold hover:bg-[var(--color-brand-orange)] transition-all shadow-xl shadow-black/5"
                >
                    Tüm Vitrine Göz At
                    <ArrowUpRight size={20} />
                </motion.button>
            </div>

        </section>
    );
}
