import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ContestAnnouncementBar() {
  const [announcement, setAnnouncement] = useState<any | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchLatestWinner = async () => {
      try {
        const { data } = await supabase
          .from('contest_entries')
          .select(`
            *,
            contests:contest_id(title, slug, id),
            profiles:user_id(display_name)
          `)
          .eq('is_winner', true)
          .eq('winner_rank', 1)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.contests) {
          setAnnouncement(data);
        }
      } catch (err) {
        console.error('Announcement bar fetch error:', err);
      }
    };

    fetchLatestWinner();
  }, []);

  if (!announcement || dismissed) return null;

  const contestTitle = announcement.contests?.title || 'Tasarım Yarışması';
  const contestSlug = announcement.contests?.slug || announcement.contest_id;
  const winnerName = announcement.profiles?.display_name || 'Tasarımcı';
  const score = announcement.jury_score;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-[#FF5500] to-orange-600 text-white text-xs sm:text-sm font-extrabold py-2.5 px-4 text-center relative z-[100] shadow-md flex items-center justify-center gap-2">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Crown className="w-4 h-4 animate-bounce shrink-0 text-amber-200" />
        <span>
          🎉 <strong>{contestTitle}</strong> Sonuçları Açıklandı! 🏆 1.lik Kazananı: <strong>{winnerName}</strong> {score ? `(${score}/100 Puan)` : ''}
        </span>
        <Link
          to={`/yarisma/${contestSlug}`}
          className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 border border-white/30 shadow-xs"
        >
          Sonuçları & Kazananları İncele <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
        title="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
