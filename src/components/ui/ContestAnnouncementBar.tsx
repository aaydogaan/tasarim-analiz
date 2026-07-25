import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ContestAnnouncementBar() {
  const [announcementData, setAnnouncementData] = useState<{
    contestTitle: string;
    contestSlug: string;
    winnerName: string;
    score: number | null;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchLatestWinner = async () => {
      try {
        // 1. Fetch winning entry
        const { data: entry } = await supabase
          .from('contest_entries')
          .select('id, contest_id, user_id, jury_score, winner_rank')
          .eq('is_winner', true)
          .eq('winner_rank', 1)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!entry) return;

        // 2. Fetch contest details
        const { data: contest } = await supabase
          .from('contests')
          .select('id, title, slug')
          .eq('id', entry.contest_id)
          .maybeSingle();

        // 3. Fetch winner profile details
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', entry.user_id)
          .maybeSingle();

        if (contest) {
          setAnnouncementData({
            contestTitle: contest.title || 'Tasarım Yarışması',
            contestSlug: contest.slug || contest.id,
            winnerName: profile?.display_name || 'Tasarımcı',
            score: entry.jury_score ?? null,
          });
        }
      } catch (err) {
        console.error('Announcement bar fetch error:', err);
      }
    };

    fetchLatestWinner();
  }, []);

  if (!announcementData || dismissed) return null;

  return (
    <div className="bg-[#18181b] border-b border-zinc-800 text-white text-xs sm:text-sm font-bold py-2.5 px-4 text-center relative z-[100] shadow-sm flex items-center justify-center gap-2">
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        <Trophy className="w-4 h-4 text-[#FF5500] shrink-0" />
        <span className="text-zinc-200">
          <strong>{announcementData.contestTitle}</strong> sonuçlandı. 1.lik Kazananı: <strong className="text-white">{announcementData.winnerName}</strong> {announcementData.score ? `(${announcementData.score} / 100 Puan)` : ''}
        </span>
        <Link
          to={`/yarisma/${announcementData.contestSlug}`}
          className="inline-flex items-center gap-1 bg-[#FF5500] hover:bg-[#e64d00] text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs ml-1"
        >
          Kazananı İncele <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white cursor-pointer"
        title="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
