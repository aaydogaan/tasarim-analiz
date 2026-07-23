import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, 
  Users, 
  Award, 
  Flame, 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  ArrowUp, 
  ArrowDown, 
  Medal, 
  Info,
  Check
} from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  userIdTag: string;
  tasksCompleted: number;  // number of analyses in selected period
  totalPoints: string;     // formatted XP string
  pointsNum: number;       // raw XP for sorting
  trend: 'up' | 'down';
  isCurrentUser?: boolean;
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('all');
  const [sortOption, setSortOption] = useState<'tasks' | 'points'>('points');
  const [isSortOpen, setIsSortOpen] = useState(false);
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

      // 1. Total analysis count (all time) for the stat card
      const { count: totalAnalysisCount } = await supabase
        .from('analizler')
        .select('*', { count: 'exact', head: true });

      setRealAnalysisCount(totalAnalysisCount || 0);

      // 2. Canonical XP data from user_xp_stats view (same as Community page)
      const { data: xpStatsData } = await supabase
        .from('user_xp_stats')
        .select('*')
        .order('total_xp', { ascending: false });

      // 3. Fetch analyses with date filter for the selected period
      let analysesQuery = supabase.from('analizler').select('user_id, created_at');
      
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

      // Count analyses per user for the selected period
      const periodAnalizCountMap: Record<string, number> = {};
      if (periodAnalizler) {
        periodAnalizler.forEach(a => {
          if (a.user_id) {
            periodAnalizCountMap[a.user_id] = (periodAnalizCountMap[a.user_id] || 0) + 1;
          }
        });
      }

      // 4. Build registry from user_xp_stats
      const userMetaRegistry: Record<string, { name: string; avatar: string; xp: number }> = {};

      if (xpStatsData) {
        xpStatsData.forEach(u => {
          if (u.id) {
            userMetaRegistry[u.id] = {
              name: u.display_name || u.full_name || 'Tasarımcı',
              avatar: u.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`,
              xp: u.total_xp || 0
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
          xp: periodTasks * 250
        };
      }

      const allUserIds = Object.keys(userMetaRegistry);
      setRealMemberCount(allUserIds.length);

      const liveList: LeaderboardUser[] = allUserIds.map((userId, idx) => {
        const meta = userMetaRegistry[userId];
        const periodTasks = periodAnalizCountMap[userId] || 0;

        // For week/month: use period analysis count to determine XP shown in that period
        // For all time: use canonical total_xp from user_xp_stats
        const xp = tab === 'all'
          ? meta.xp
          : (periodTasks * 250);

        return {
          rank: 0,
          id: userId,
          name: meta.name,
          userIdTag: `ID ${userId.slice(0, 7).toUpperCase()}`,
          avatar: meta.avatar,
          tasksCompleted: tab === 'all' ? (periodAnalizCountMap[userId] || 0) : periodTasks,
          totalPoints: `${xp.toLocaleString('tr-TR')} XP`,
          pointsNum: xp,
          trend: idx % 2 === 0 ? 'up' : 'down',
          isCurrentUser: currentUser ? currentUser.id === userId : false
        };
      });

      // Sort by XP descending, assign ranks
      liveList.sort((a, b) => b.pointsNum - a.pointsNum);
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

  // Determine top three from XP-sorted list (always from full data)
  const topThree = users.slice(0, 3);

  const filteredUsers = [...users]
    .filter(u => {
      if (overallFilter === 'Topluluk Liderleri' && u.rank > 5) return false;
      if (overallFilter === 'Kurucu Üyeler' && u.rank > 3) return false;
      return (
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.userIdTag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOption === 'tasks') return b.tasksCompleted - a.tasksCompleted;
      return b.pointsNum - a.pointsNum;
    });

  const overallFilterOptions = ['Genel Bakış', 'Topluluk Liderleri', 'Kurucu Üyeler'];
  const sortOptionsConfig = [
    { id: 'points', label: 'Sırala: Toplam Puan (XP)' },
    { id: 'tasks', label: 'Sırala: Analiz Sayısı' },
  ];

  const PodiumCard = ({ user, rank }: { user: LeaderboardUser; rank: 1 | 2 | 3 }) => {
    const avatarBorder = rank === 1 ? 'ring-2 ring-amber-400 ring-offset-2' : rank === 2 ? 'ring-2 ring-slate-300 ring-offset-2' : 'ring-2 ring-orange-400/50 ring-offset-2';

    // Clean rank badge: background color + Lucide icon (stroke only, no fill)
    const badgeBg = rank === 1
      ? 'bg-amber-50 border border-amber-200'
      : rank === 2
        ? 'bg-slate-50 border border-slate-200'
        : 'bg-orange-50 border border-orange-200';
    const badgeNumColor = rank === 1 ? 'text-amber-700' : rank === 2 ? 'text-slate-600' : 'text-orange-700';
    const badgeIconColor = rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-orange-500';
    const Icon = rank === 1 ? Trophy : rank === 2 ? Medal : Award;

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
                <span className="text-lg font-extrabold text-slate-900">{user.totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Clean rank badge: icon above number, no fill */}
          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl ${badgeBg} shrink-0 gap-0.5`}>
            <Icon className={`w-4 h-4 ${badgeIconColor} shrink-0`} strokeWidth={2} />
            <span className={`text-[11px] font-black ${badgeNumColor} leading-none`}>#{rank}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Analiz</span>
            <span className="text-base font-extrabold text-slate-900">{user.tasksCompleted}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">XP Puanı</span>
            <span className="text-base font-extrabold text-slate-900">{user.pointsNum.toLocaleString('tr-TR')}</span>
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
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                <Users className="w-6 h-6" />
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
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
                <Award className="w-6 h-6" />
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
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
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
                <Trophy className="w-7 h-7" />
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

            {/* Time Filter Pills — trigger real re-fetch */}
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
              <EmptySlot rank={1} icon={<Trophy className="w-8 h-8 text-amber-400 opacity-60" />} msg="Analiz yaparak 1. sıraya yüksel!" />
            )}
            {topThree[1] ? <PodiumCard user={topThree[1]} rank={2} /> : (
              <EmptySlot rank={2} icon={<Medal className="w-8 h-8 text-slate-400 opacity-60" />} msg="Analiz yaparak dereceye gir!" />
            )}
            {topThree[2] ? <PodiumCard user={topThree[2]} rank={3} /> : (
              <EmptySlot rank={3} icon={<Award className="w-8 h-8 text-amber-600 opacity-60" />} msg="Puan kazan ve podyuma çık!" />
            )}
          </div>
        </div>

        {/* GENEL SIRALAMA */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Genel Sıralama</h2>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Sort Dropdown */}
              <div className="relative w-full sm:w-auto min-w-[240px]">
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full whitespace-nowrap flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-5 py-3 text-xs md:text-sm font-bold text-slate-800 shadow-sm hover:border-slate-300 transition-colors"
                >
                  <span>{sortOptionsConfig.find(s => s.id === sortOption)?.label}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isSortOpen ? 'rotate-180 text-slate-700' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 min-w-full w-max bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1.5 space-y-1"
                      >
                        {sortOptionsConfig.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => { setSortOption(opt.id as any); setIsSortOpen(false); }}
                            className={`w-full whitespace-nowrap text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between gap-3 ${
                              sortOption === opt.id ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {sortOption === opt.id && <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
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
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50 text-sm font-bold text-slate-500 tracking-wide">
                    <th className="py-4 px-6">Sıra</th>
                    <th className="py-4 px-6">Kullanıcı</th>
                    <th className="py-4 px-6 text-center">Tamamlanan analiz</th>
                    <th className="py-4 px-6 text-right">Toplam puan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs md:text-sm font-semibold text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-400 font-medium">
                        Liderlik verileri yükleniyor...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-400 font-medium">
                        Aramaya uygun kayıtlı kullanıcı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        className={`transition-colors group ${
                          user.isCurrentUser ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Rank + trend badge */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.trend === 'up' ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-rose-100/80 text-rose-500 flex items-center justify-center shrink-0">
                                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            )}
                            <span className="text-sm font-extrabold text-slate-900">{user.rank}</span>
                          </div>
                        </td>

                        {/* Avatar + name + ID */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {user.isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">SEN</span>}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400">{user.userIdTag}</p>
                            </div>
                          </div>
                        </td>

                        {/* Analysis count */}
                        <td className="py-4 px-6 text-center whitespace-nowrap font-bold text-slate-800">
                          {user.tasksCompleted}
                        </td>

                        {/* Total XP */}
                        <td className="py-4 px-6 text-right whitespace-nowrap font-extrabold text-slate-900 text-sm md:text-base">
                          {user.totalPoints}
                        </td>
                      </tr>
                    ))
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
