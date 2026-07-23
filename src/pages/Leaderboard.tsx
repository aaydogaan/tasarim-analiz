import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Flame, 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  ArrowUp, 
  ArrowDown, 
  Info,
  Check,
  Trophy as TrophyLucide,
  Medal as MedalLucide,
  Award as AwardLucide,
  Sparkles,
  Heart,
  Star
} from 'lucide-react';
import {
  Trophy,
  Medal,
  CrownSimple,
  UsersThree,
  ChartLineUp
} from '@phosphor-icons/react';

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  userIdTag: string;
  slug: string;
  tasksCompleted: number;   // analyses in selected period
  totalScore: number;       // total hybrid score
  totalAiScore: number;     // sum of AI score from analizler.genel_puan
  communityLikes: number;   // sum of community scores
  totalPoints: string;      // formatted XP string
  pointsNum: number;        // raw XP for sorting
  trend: 'up' | 'down';
  isCurrentUser?: boolean;
}

type SortOption = 'total_score' | 'ai_score' | 'community';

const SORT_CONFIG: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  {
    id: 'total_score',
    label: 'Total Skor',
    icon: <TrophyLucide className="w-4 h-4" />,
  },
  {
    id: 'ai_score',
    label: 'Yapay Zeka',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'community',
    label: 'Topluluk',
    icon: <Heart className="w-4 h-4" />,
  },
];

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('total_score');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [realMemberCount, setRealMemberCount] = useState<number>(0);
  const [realAnalysisCount, setRealAnalysisCount] = useState<number>(0);

  const [overallFilter, setOverallFilter] = useState('Genel Bakış');
  const [isOverallOpen, setIsOverallOpen] = useState(false);

  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 6, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLeaderboardData = useCallback(async (tab: 'week' | 'month' | 'all') => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      // 1. Total analysis count for stat card
      const { count: totalAnalysisCount } = await supabase
        .from('analizler')
        .select('*', { count: 'exact', head: true });
      setRealAnalysisCount(totalAnalysisCount || 0);

      // 2. Canonical XP data from user_xp_stats view
      const { data: xpStatsData } = await supabase
        .from('user_xp_stats')
        .select('*')
        .order('total_xp', { ascending: false });

      // 3. Analyses with date filter — count + AI score per user
      let analysesQuery = supabase
        .from('analizler')
        .select('id, user_id, created_at, genel_puan');

      const now = new Date();
      if (tab === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        analysesQuery = analysesQuery.gte('created_at', weekAgo.toISOString());
      } else if (tab === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        analysesQuery = analysesQuery.gte('created_at', monthAgo.toISOString());
      }

      const { data: periodAnalizler } = await analysesQuery;

      // Build per-user analysis count + cumulative AI score
      // Calculate analysis stats
      const analizOwnerMap: Record<string, string> = {};
      const periodAnalizCountMap: Record<string, number> = {};
      const analizStatsMap: Record<string, { aiPuan: number; upvotes: number; totalVotes: number }> = {};

      if (periodAnalizler) {
        periodAnalizler.forEach(a => {
          if (!a.user_id) return;
          analizOwnerMap[a.id] = a.user_id;
          periodAnalizCountMap[a.user_id] = (periodAnalizCountMap[a.user_id] || 0) + 1;
          
          analizStatsMap[a.id] = { aiPuan: a.genel_puan || 0, upvotes: 0, totalVotes: 0 };
        });
      }

      // 4. Community score (begeniler) via vote_type
      const { data: begenilerData } = await supabase
        .from('begeniler')
        .select('analiz_id, vote_type');

      if (begenilerData) {
        begenilerData.forEach(b => {
          if (b.analiz_id && b.vote_type) {
            const stats = analizStatsMap[b.analiz_id];
            if (stats) {
                stats.totalVotes += 1;
                if (b.vote_type === 1) stats.upvotes += 1;
            }
          }
        });
      }

      const userHybridScoreMap: Record<string, number> = {};
      const userTotalAiScoreMap: Record<string, number> = {};
      const userTotalCommunityScoreMap: Record<string, number> = {};

      Object.keys(analizStatsMap).forEach(analizId => {
          const stats = analizStatsMap[analizId];
          const ownerId = analizOwnerMap[analizId];
          if (!ownerId) return;

          const toplulukPuan = stats.totalVotes > 0 ? Math.round((stats.upvotes / stats.totalVotes) * 100) : 0;
          const hybridPuan = Math.round((stats.aiPuan * 0.4) + (toplulukPuan * 0.6));

          userHybridScoreMap[ownerId] = (userHybridScoreMap[ownerId] || 0) + hybridPuan;
          userTotalAiScoreMap[ownerId] = (userTotalAiScoreMap[ownerId] || 0) + stats.aiPuan;
          userTotalCommunityScoreMap[ownerId] = (userTotalCommunityScoreMap[ownerId] || 0) + stats.upvotes;
      });

      // 5. Build user registry from user_xp_stats
      const userMetaRegistry: Record<string, { name: string; avatar: string; xp: number; slug: string }> = {};

      if (xpStatsData) {
        xpStatsData.forEach(u => {
          if (u.id) {
            userMetaRegistry[u.id] = {
              name: u.display_name || u.full_name || 'Tasarımcı',
              avatar: u.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`,
              xp: u.total_xp || 0,
              slug: u.slug || 'tasarimci'
            };
          }
        });
      }

      // Ensure current user is always included
      if (currentUser && !userMetaRegistry[currentUser.id]) {
        const periodTasks = periodAnalizCountMap[currentUser.id] || 0;
        userMetaRegistry[currentUser.id] = {
          name: currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Tasarımcı',
          avatar: currentUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.id}`,
          xp: periodTasks * 250,
          slug: 'tasarimci'
        };
      }

      const allUserIds = Object.keys(userMetaRegistry).filter(id => (periodAnalizCountMap[id] || 0) > 0);
      setRealMemberCount(allUserIds.length);

      const liveList: LeaderboardUser[] = allUserIds.map((userId, idx) => {
        const meta = userMetaRegistry[userId];
        const periodTasks = periodAnalizCountMap[userId] || 0;

        const xp = tab === 'all' ? meta.xp : (periodTasks * 250);

        // Average AI score
        const totalAiScore = periodTasks > 0 ? Math.round(userTotalAiScoreMap[userId] / periodTasks) : 0;

        // Community score received
        const communityLikes = userTotalCommunityScoreMap[userId] || 0;
        
        // Hybrid Total Score
        const totalScore = userHybridScoreMap[userId] || 0;

        return {
          rank: 0,
          id: userId,
          name: meta.name,
          slug: meta.slug,
          userIdTag: `ID ${userId.slice(0, 7).toUpperCase()}`,
          avatar: meta.avatar,
          tasksCompleted: periodTasks,
          totalScore,
          totalAiScore,
          communityLikes,
          totalPoints: `${xp.toLocaleString('tr-TR')} XP`,
          pointsNum: xp,
          trend: idx % 2 === 0 ? 'up' : 'down',
          isCurrentUser: currentUser ? currentUser.id === userId : false
        };
      });

      // Default sort: Total Score descending
      liveList.sort((a, b) => b.totalScore - a.totalScore);
      liveList.forEach((u, index) => { u.rank = index + 1; });

      setUsers(liveList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData(activeTab);
  }, [activeTab, fetchLeaderboardData]);

  const getSortValue = (u: LeaderboardUser) => {
    if (sortOption === 'community') return u.communityLikes;
    if (sortOption === 'ai_score') return u.totalAiScore;
    return u.totalScore; // Default to total_score
  };

  const sortedUsers = [...users].sort((a, b) => getSortValue(b) - getSortValue(a));
  const topThree = sortedUsers.slice(0, 3);

  const filteredUsers = sortedUsers
    .filter(u => {
      if (overallFilter === 'Topluluk Liderleri' && u.rank > 5) return false;
      if (overallFilter === 'Kurucu Üyeler' && u.rank > 3) return false;
      return (
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.userIdTag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const overallFilterOptions = ['Genel Bakış', 'Topluluk Liderleri', 'Kurucu Üyeler'];
  const activeSortConfig = SORT_CONFIG.find(s => s.id === sortOption)!;

  const PodiumCard = ({ user, rank }: { user: LeaderboardUser; rank: 1 | 2 | 3 }) => {
    const avatarBorder = rank === 1
      ? 'ring-2 ring-amber-400 ring-offset-2'
      : rank === 2
        ? 'ring-2 ring-slate-300 ring-offset-2'
        : 'ring-2 ring-orange-300/60 ring-offset-2';

    const badgeConfig = rank === 1
      ? { bg: 'bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200', numColor: 'text-amber-700', icon: <Trophy size={28} weight="duotone" color="#f59e0b" /> }
      : rank === 2
        ? { bg: 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200', numColor: 'text-slate-600', icon: <Medal size={28} weight="duotone" color="#94a3b8" /> }
        : { bg: 'bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200', numColor: 'text-orange-700', icon: <CrownSimple size={28} weight="duotone" color="#f97316" /> };

    // Show score relevant to active sort
    const scoreLabel = sortOption === 'community' ? 'Topluluk Beğenisi' : sortOption === 'ai_score' ? 'Toplam YZ Puanı' : 'Total Skor';
    const scoreValue = sortOption === 'ai_score'
      ? user.totalAiScore.toLocaleString('tr-TR')
      : sortOption === 'community'
        ? '%' + user.communityLikes.toLocaleString('tr-TR')
        : user.totalScore.toLocaleString('tr-TR');

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className={`w-14 h-14 rounded-full object-cover ${avatarBorder}`}
            />
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <span>{user.name}</span>
                {user.isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">SEN</span>}
              </h3>
              <div className="mt-0.5">
                <span className="text-lg font-extrabold text-slate-900">{scoreValue} {sortOption === 'community' ? '' : 'Puan'}</span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl ${badgeConfig.bg} shrink-0 gap-0.5`}>
            {badgeConfig.icon}
            <span className={`text-[11px] font-black ${badgeConfig.numColor} leading-none`}>#{rank}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Analiz</span>
            <span className="text-base font-extrabold text-slate-900">{user.tasksCompleted}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{scoreLabel}</span>
            <span className="text-base font-extrabold text-slate-900">{scoreValue}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f6f9] text-slate-800 pt-24 pb-20 px-4 md:px-8 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP TITLE ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Liderlik Tablosu</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Sisteme kayıtlı aktif kullanıcılar ve dereceleri.</p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOverallOpen(!isOverallOpen)}
              className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-700 hover:border-slate-300 transition-colors"
            >
              <span>{overallFilter}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOverallOpen ? 'rotate-180 text-slate-700' : ''}`} />
            </button>

            <AnimatePresence>
              {isOverallOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsOverallOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1.5 space-y-1"
                  >
                    {overallFilterOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setOverallFilter(opt); setIsOverallOpen(false); }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                          overallFilter === opt ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {overallFilter === opt && <Check className="w-3.5 h-3.5 text-slate-900" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                <UsersThree size={28} weight="duotone" color="#059669" />
              </div>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Katılan üyeler</span>
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{realMemberCount}</span>
            </div>
          </div>

          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm">
                <ChartLineUp size={28} weight="duotone" color="#0284c7" />
              </div>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Tamamlanan analizler</span>
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{realAnalysisCount}</span>
            </div>
          </div>

          {/* Countdown Timer Banner */}
          <div className="md:col-span-6 bg-amber-50/70 border border-amber-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Yarışma Bitimine Kalan Süre</span>
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                </div>
                <div className="flex items-center gap-3 text-slate-900 font-extrabold text-2xl md:text-3xl tracking-tight">
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">Gün</span>
                  </div>
                  <span className="text-slate-300 pb-2">:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">Saat</span>
                  </div>
                  <span className="text-slate-300 pb-2">:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">Dakika</span>
                  </div>
                </div>
              </div>
              <div className="w-14 h-14 bg-amber-100/80 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0 self-start sm:self-center">
                <TrophyLucide className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center gap-1.5 text-xs text-amber-800/80 font-medium">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Sadece ilk üç dereceye giren tasarımcılara özel rozet ve ödüller verilecektir.</span>
            </div>
          </div>

        </div>

        {/* MEVCUT LİDERLER */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Mevcut Liderler</h2>

            <div className="bg-white border border-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-sm self-start sm:self-auto">
              {(['week', 'month', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'week' ? 'Bu Hafta' : tab === 'month' ? 'Bu Ay' : 'Tüm Zamanlar'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree[0] ? <PodiumCard user={topThree[0]} rank={1} /> : (
              <EmptySlot rank={1} icon={<TrophyLucide className="w-8 h-8 text-amber-400 opacity-60" />} msg="Analiz yaparak 1. sıraya yüksel!" />
            )}
            {topThree[1] ? <PodiumCard user={topThree[1]} rank={2} /> : (
              <EmptySlot rank={2} icon={<MedalLucide className="w-8 h-8 text-slate-400 opacity-60" />} msg="Analiz yaparak dereceye gir!" />
            )}
            {topThree[2] ? <PodiumCard user={topThree[2]} rank={3} /> : (
              <EmptySlot rank={3} icon={<AwardLucide className="w-8 h-8 text-amber-600 opacity-60" />} msg="Puan kazan ve podyuma çık!" />
            )}
          </div>
        </div>

        {/* GENEL SIRALAMA */}
        <div className="space-y-5 pt-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Genel Sıralama</h2>

              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kullanıcı adına göre ara..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            {/* Sort Pill Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider self-center shrink-0 hidden sm:block">Sırala:</span>
              
              {/* Segmented Control Container */}
              <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
                {SORT_CONFIG.map((opt) => {
                  const isActive = sortOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortOption(opt.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                      }`}
                    >
                      <span className={isActive ? 'text-slate-800' : 'text-slate-400'}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Active sort indicator bar - corporate styling */}
            <div className={`h-1 w-full bg-slate-800`} />

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50 text-sm font-bold text-slate-500 tracking-wide">
                    <th className="py-4 px-6">Sıra</th>
                    <th className="py-4 px-6">Kullanıcı</th>
                    <th className="py-4 px-6 text-center">Tamamlanan analiz</th>
                    <th className={`py-4 px-6 text-center ${sortOption === 'total_score' ? 'text-slate-800' : 'text-slate-400'}`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {sortOption === 'total_score' && <TrophyLucide className="w-4 h-4 text-slate-700" />}
                        Total Skor
                      </div>
                    </th>
                    <th className={`py-4 px-6 text-center ${sortOption === 'ai_score' ? 'text-slate-800' : 'text-slate-400'}`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {sortOption === 'ai_score' && <Sparkles className="w-4 h-4 text-slate-700" />}
                        Ort. Yapay Zeka
                      </div>
                    </th>
                    <th className={`py-4 px-6 text-center ${sortOption === 'community' ? 'text-slate-800' : 'text-slate-400'}`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {sortOption === 'community' && <Heart className="w-4 h-4 text-slate-700" />}
                        Toplam Beğeni
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs md:text-sm font-semibold text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                        Liderlik verileri yükleniyor...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                        Aramaya uygun kayıtlı kullanıcı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, i) => {
                      const displayRank = i + 1;
                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors group ${
                            user.isCurrentUser ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="text-sm font-extrabold text-slate-900 ml-2">{displayRank}</span>
                          </td>

                          {/* Avatar + name + ID */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <Link to={`/${user.slug}`} className="flex items-center gap-3 group/profile">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover/profile:border-blue-500 transition-colors"
                              />
                              <div>
                                <p className="font-bold text-slate-900 text-sm group-hover/profile:text-blue-600 transition-colors flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {user.isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">SEN</span>}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400">{user.userIdTag}</p>
                              </div>
                            </Link>
                          </td>

                          {/* Analysis count */}
                          <td className="py-4 px-6 text-center whitespace-nowrap font-bold text-slate-800">
                            {user.tasksCompleted}
                          </td>

                          {/* Total Score */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            {user.totalScore > 0 ? (
                              <span className="font-extrabold text-blue-600 text-sm">{user.totalScore.toLocaleString('tr-TR')}</span>
                            ) : (
                              <span className="text-slate-300 font-medium">—</span>
                            )}
                          </td>

                          {/* AI Score */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            {user.totalAiScore > 0 ? (
                              <span className="font-bold text-slate-700 text-sm">{user.totalAiScore.toLocaleString('tr-TR')}</span>
                            ) : (
                              <span className="text-slate-300 font-medium">—</span>
                            )}
                          </td>

                          {/* Community likes */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            {user.communityLikes > 0 ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                                <span className="font-bold text-slate-700">{user.communityLikes.toLocaleString('tr-TR')}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-medium">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function EmptySlot({ rank, icon, msg }: { rank: number; icon: React.ReactNode; msg: string }) {
  return (
    <div className="bg-white/60 border border-dashed border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
      {icon}
      <p className="font-bold text-slate-700 text-sm">{rank}. Sıra Boş</p>
      <p className="text-slate-400 text-xs">{msg}</p>
    </div>
  );
}

export default Leaderboard;
