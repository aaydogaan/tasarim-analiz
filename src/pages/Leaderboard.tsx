import React, { useState, useEffect } from 'react';
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
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Medal, 
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  userIdTag: string;
  tasksCompleted: number;
  spentTime: string;
  victories: number;
  achievements: number;
  totalPoints: string;
  pointsNum: number;
  trend: 'up' | 'down';
  isCurrentUser?: boolean;
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('all');
  const [sortOption, setSortOption] = useState<'tasks' | 'points' | 'victories'>('tasks');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real statistics counters
  const [realMemberCount, setRealMemberCount] = useState<number>(0);
  const [realGoalCount, setRealGoalCount] = useState<number>(0);

  // Custom Dropdown State
  const [overallFilter, setOverallFilter] = useState('Genel Bakış');
  const [isOverallOpen, setIsOverallOpen] = useState(false);

  // Countdown timer state for completion banner
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

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Get current logged-in user session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      // 1. Fetch exact real total member count
      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Fetch exact real total analyses count
      const { count: goalCount } = await supabase
        .from('analizler')
        .select('*', { count: 'exact', head: true });

      setRealGoalCount(goalCount || 0);

      // 3. Fetch real user profiles sorted by xp
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false });

      // 4. Fetch community posts & comments to discover all registered platform users
      const { data: postsData } = await supabase
        .from('community_posts')
        .select('user_id, user_name, user_avatar');

      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('user_id, user_name, user_avatar');

      const { data: vitrinData } = await supabase
        .from('vitrin_items')
        .select('user_id');

      // Fetch analyses count per user
      const { data: userAnalizler } = await supabase
        .from('analizler')
        .select('user_id');

      const analizCountMap: Record<string, number> = {};
      if (userAnalizler) {
        userAnalizler.forEach(a => {
          if (a.user_id) {
            analizCountMap[a.user_id] = (analizCountMap[a.user_id] || 0) + 1;
          }
        });
      }

      // Fetch showcase/post votes per user
      const { data: userBegeniler } = await supabase
        .from('begeniler')
        .select('user_id');

      const victoriesMap: Record<string, number> = {};
      if (userBegeniler) {
        userBegeniler.forEach(b => {
          if (b.user_id) {
            victoriesMap[b.user_id] = (victoriesMap[b.user_id] || 0) + 1;
          }
        });
      }

      // User Metadata Registry
      const userMetaRegistry: Record<string, { name: string; avatar: string; xp: number }> = {};

      if (profilesData) {
        profilesData.forEach(p => {
          if (p.id) {
            userMetaRegistry[p.id] = {
              name: p.display_name || p.full_name || 'Tasarımcı',
              avatar: p.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${p.id}`,
              xp: p.xp || p.total_xp || 0
            };
          }
        });
      }

      if (postsData) {
        postsData.forEach(post => {
          if (post.user_id && !userMetaRegistry[post.user_id]) {
            userMetaRegistry[post.user_id] = {
              name: post.user_name || 'Tasarımcı',
              avatar: post.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${post.user_id}`,
              xp: 0
            };
          }
        });
      }

      if (commentsData) {
        commentsData.forEach(c => {
          if (c.user_id && !userMetaRegistry[c.user_id]) {
            userMetaRegistry[c.user_id] = {
              name: c.user_name || 'Tasarımcı',
              avatar: c.user_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${c.user_id}`,
              xp: 0
            };
          }
        });
      }

      if (vitrinData) {
        vitrinData.forEach(v => {
          if (v.user_id && !userMetaRegistry[v.user_id]) {
            userMetaRegistry[v.user_id] = {
              name: 'Tasarımcı',
              avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${v.user_id}`,
              xp: 0
            };
          }
        });
      }

      // Ensure current user is in registry
      if (currentUser && !userMetaRegistry[currentUser.id]) {
        userMetaRegistry[currentUser.id] = {
          name: currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Tasarımcı',
          avatar: currentUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.id}`,
          xp: 0
        };
      }

      const allUserIds = Object.keys(userMetaRegistry);
      setRealMemberCount(Math.max(memberCount || 0, allUserIds.length));

      const liveList: LeaderboardUser[] = allUserIds.map((userId, idx) => {
        const meta = userMetaRegistry[userId];
        const realTasks = analizCountMap[userId] || 0;
        const realVictories = victoriesMap[userId] || 0;
        const xp = meta.xp > 0 ? meta.xp : (realTasks * 250 + realVictories * 150 + (userId === currentUser?.id ? 500 : 250));
        
        return {
          rank: 0,
          id: userId,
          name: meta.name,
          userIdTag: `ID ${userId.slice(0, 7).toUpperCase()}`,
          avatar: meta.avatar,
          tasksCompleted: realTasks,
          spentTime: `${Math.floor(xp / 80) + 10}:${((idx + 1) * 17) % 60}`,
          victories: realVictories,
          achievements: Math.floor(xp / 30) || (realTasks > 0 ? 5 : 1),
          totalPoints: `${xp.toLocaleString('tr-TR')} XP`,
          pointsNum: xp,
          trend: idx % 2 === 0 ? 'up' : 'down',
          isCurrentUser: currentUser && currentUser.id === userId
        };
      });

      // Sort by pointsNum initially
      liveList.sort((a, b) => b.pointsNum - a.pointsNum);
      liveList.forEach((u, index) => {
        u.rank = index + 1;
      });

      setUsers(liveList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const topThree = users.slice(0, 3);

  // Sorting and Search filtering across real registered users
  const filteredUsers = [...users]
    .filter(u => {
      // Category Filter
      if (overallFilter === 'Topluluk Liderleri' && u.rank > 5) return false;
      if (overallFilter === 'Kurucu Üyeler' && u.rank > 3) return false;

      // Search Query
      return (
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.userIdTag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOption === 'tasks') return b.tasksCompleted - a.tasksCompleted;
      if (sortOption === 'victories') return b.victories - a.victories;
      return b.pointsNum - a.pointsNum;
    });

  const overallFilterOptions = ['Genel Bakış', 'Topluluk Liderleri', 'Kurucu Üyeler'];
  const sortOptionsConfig = [
    { id: 'tasks', label: 'Sırala: Tamamlanan Analiz' },
    { id: 'points', label: 'Sırala: Toplam Puan (XP)' },
    { id: 'victories', label: 'Sırala: Zaferler' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f4f6f9] text-slate-800 pt-24 pb-20 px-4 md:px-8 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP TITLE ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Liderlik Tablosu</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Sisteme kayıtlı aktif kullanıcılar ve dereceleri.</p>
          </div>

          {/* Custom Animated Overall Filter Dropdown */}
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
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1.5 space-y-1"
                  >
                    {overallFilterOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setOverallFilter(opt);
                          setIsOverallOpen(false);
                        }}
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

        {/* TOP SUMMARY CARDS (ROW 1) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Katılan Üyeler */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Katılan Üyeler</span>
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{realMemberCount}+</span>
            </div>
          </div>

          {/* Card 2: Tamamlanan Hedefler */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Tamamlanan Hedefler</span>
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{realGoalCount}+</span>
            </div>
          </div>

          {/* Card 3: Countdown Timer Banner */}
          <div className="md:col-span-6 bg-amber-50/70 border border-amber-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Yarışma Bitimine Kalan Süre</span>
                  <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500 shrink-0" />
                </div>

                <div className="flex items-center gap-3 text-slate-900 font-extrabold text-2xl md:text-3xl tracking-tight">
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">GÜN</span>
                  </div>
                  <span className="text-slate-300 pb-2">:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">SAAT</span>
                  </div>
                  <span className="text-slate-300 pb-2">:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">DAKİKA</span>
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

        {/* SECTION 2: MEVCUT LİDERLER PODIUM */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Mevcut Liderler</h2>

            {/* Time Filter Pills */}
            <div className="bg-white border border-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('week')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bu Hafta
              </button>
              <button
                onClick={() => setActiveTab('month')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bu Ay
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tüm Zamanlar
              </button>
            </div>
          </div>

          {/* 3 TOP LEADER CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Rank 1 Card */}
            {topThree[0] ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={topThree[0].avatar}
                      alt={topThree[0].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-300 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                        <span>{topThree[0].name}</span>
                        {topThree[0].isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">SEN</span>}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-extrabold text-slate-900">{topThree[0].totalPoints}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gold Laurels Emblem */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center text-amber-700 font-extrabold text-xs shadow-xs shrink-0 gap-1">
                    <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>1</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ZAFER</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[0].victories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ANALİZ</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[0].tasksCompleted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ROZET</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[0].achievements}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 border border-dashed border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
                <Trophy className="w-8 h-8 text-amber-400 opacity-60" />
                <p className="font-bold text-slate-700 text-sm">1. Sıra Boş</p>
                <p className="text-slate-400 text-xs">Analiz yaparak 1. sıraya yüksel!</p>
              </div>
            )}

            {/* Rank 2 Card */}
            {topThree[1] ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={topThree[1].avatar}
                      alt={topThree[1].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-300 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                        <span>{topThree[1].name}</span>
                        {topThree[1].isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">SEN</span>}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-extrabold text-slate-900">{topThree[1].totalPoints}</span>
                      </div>
                    </div>
                  </div>

                  {/* Silver Laurels Emblem */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-extrabold text-xs shadow-xs shrink-0 gap-1">
                    <Medal className="w-4 h-4 text-slate-500 fill-slate-300" />
                    <span>2</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ZAFER</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[1].victories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ANALİZ</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[1].tasksCompleted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ROZET</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[1].achievements}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 border border-dashed border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
                <Medal className="w-8 h-8 text-slate-400 opacity-60" />
                <p className="font-bold text-slate-700 text-sm">2. Sıra Boş</p>
                <p className="text-slate-400 text-xs">Analiz yaparak dereceye gir!</p>
              </div>
            )}

            {/* Rank 3 Card */}
            {topThree[2] ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={topThree[2].avatar}
                      alt={topThree[2].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-600/40 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                        <span>{topThree[2].name}</span>
                        {topThree[2].isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">SEN</span>}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-extrabold text-slate-900">{topThree[2].totalPoints}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bronze Laurels Emblem */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-600/30 flex items-center justify-center text-amber-800 font-extrabold text-xs shadow-xs shrink-0 gap-1">
                    <Award className="w-4 h-4 text-amber-700 fill-amber-600" />
                    <span>3</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ZAFER</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[2].victories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ANALİZ</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[2].tasksCompleted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ROZET</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[2].achievements}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 border border-dashed border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
                <Award className="w-8 h-8 text-amber-600 opacity-60" />
                <p className="font-bold text-slate-700 text-sm">3. Sıra Boş</p>
                <p className="text-slate-400 text-xs">Puan kazan ve podyuma çık!</p>
              </div>
            )}

          </div>
        </div>

        {/* SECTION 3: GENEL SIRALAMA TABLOSU */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Genel Sıralama</h2>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Custom Animated Sort Selector - Extended width & single line text */}
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
                            onClick={() => {
                              setSortOption(opt.id as any);
                              setIsSortOpen(false);
                            }}
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

              {/* Search input */}
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

          {/* TABLE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">SIRA</th>
                    <th className="py-4 px-6">KULLANICI</th>
                    <th className="py-4 px-6 text-center">TAMAMLANAN ANALİZ</th>
                    <th className="py-4 px-6 text-center">GEÇİRİLEN SÜRE</th>
                    <th className="py-4 px-6 text-center">ZAFERLER</th>
                    <th className="py-4 px-6 text-center">BAŞARIMLAR</th>
                    <th className="py-4 px-6 text-right">TOPLAM PUAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs md:text-sm font-semibold text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        Liderlik verileri yükleniyor...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
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
                        
                        {/* Rank + Circular Translucent Trend Badge */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3 font-bold text-slate-800">
                            {user.trend === 'up' ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-rose-100/80 text-rose-500 flex items-center justify-center shrink-0 shadow-2xs">
                                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            )}
                            <span className="text-sm font-extrabold text-slate-900">{user.rank}</span>
                          </div>
                        </td>

                        {/* User name & avatar & ID tag */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
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

                        {/* Task completed */}
                        <td className="py-4 px-6 text-center whitespace-nowrap font-bold text-slate-800">
                          {user.tasksCompleted}
                        </td>

                        {/* Spent time */}
                        <td className="py-4 px-6 text-center whitespace-nowrap font-medium text-slate-600">
                          {user.spentTime}
                        </td>

                        {/* Victories */}
                        <td className="py-4 px-6 text-center whitespace-nowrap font-bold text-slate-800">
                          {user.victories}
                        </td>

                        {/* Achievements */}
                        <td className="py-4 px-6 text-center whitespace-nowrap font-medium text-slate-600">
                          {user.achievements}
                        </td>

                        {/* Total points */}
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

export default Leaderboard;
