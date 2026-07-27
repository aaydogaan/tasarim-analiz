import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Flame, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';

export default function RevizelesBanner() {
    const [activeTopic, setActiveTopic] = useState<any>(null);

    useEffect(() => {
        supabase
            .from('revizeles_topics')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
            .then(({ data }) => {
                if (data) setActiveTopic(data);
            });
    }, []);

    if (!activeTopic) return null;

    return (
        <div className="w-full max-w-5xl mx-auto mb-8 px-4 sm:px-0">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-gray-950 via-zinc-900 to-stone-900 border border-zinc-800 p-6 sm:p-8 shadow-xl text-white">
                {/* Background ambient light */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#FF5500]/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 min-w-0">
                        {activeTopic.image_url && (
                            <img
                                src={activeTopic.image_url}
                                alt={activeTopic.title}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-zinc-700/80 bg-zinc-950 shrink-0 p-1.5"
                            />
                        )}
                        <div className="min-w-0 space-y-1.5 text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FF5500]/20 border border-[#FF5500]/40 text-[#FF5500] text-[11px] font-black uppercase tracking-wider">
                                <Flame className="w-3.5 h-3.5" /> GÜNDEM REVİZYONU
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-white leading-snug truncate">
                                {activeTopic.title}
                            </h3>
                            <p className="text-xs text-zinc-400 line-clamp-1 font-medium">
                                {activeTopic.description}
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/revizeles/${activeTopic.id}`}
                        className="px-6 py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#e64d00] text-white text-xs font-black shadow-lg shadow-[#FF5500]/25 transition-all hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
                    >
                        <span>Tasarımı Eleştir & Revize Et</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
