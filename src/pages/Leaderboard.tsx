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
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Medal, 
  Info,
  ShieldCheck
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
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
  const [sortOption, setSortOption] = useState<'tasks' | 'points' | 'victories'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallFilter, setOverallFilter] = useState('Genel Bakış');

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
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(20);

      const defaultMockUsers: LeaderboardUser[] = [
        {
          rank: 1,
          id: '1',
          name: 'Theresa Webb',
          userIdTag: 'ID 1591245',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          tasksCompleted: 236,
          spentTime: '36:40',
          victories: 43,
          achievements: 476,
          totalPoints: '5.67532',
          pointsNum: 5675.32,
          trend: 'up'
        },
        {
          rank: 2,
          id: '2',
          name: 'Floyd Miles',
          userIdTag: 'ID 1391245',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          tasksCompleted: 167,
          spentTime: '28:16',
          victories: 37,
          achievements: 237,
          totalPoints: '4.47512',
          pointsNum: 4475.12,
          trend: 'up'
        },
        {
          rank: 3,
          id: '3',
          name: 'Jacob Jones',
          userIdTag: 'ID 1892245',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          tasksCompleted: 146,
          spentTime: '27:15',
          victories: 35,
          achievements: 178,
          totalPoints: '4.21484',
          pointsNum: 4214.84,
          trend: 'down'
        },
        {
          rank: 4,
          id: '4',
          name: 'Courtney Henry',
          userIdTag: 'ID 1928341',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          tasksCompleted: 128,
          spentTime: '24:10',
          victories: 29,
          achievements: 142,
          totalPoints: '3.98210',
          pointsNum: 3982.10,
          trend: 'up'
        },
        {
          rank: 5,
          id: '5',
          name: 'Albert Flores',
          userIdTag: 'ID 1102934',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          tasksCompleted: 114,
          spentTime: '21:45',
          victories: 24,
          achievements: 119,
          totalPoints: '3.65420',
          pointsNum: 3654.20,
          trend: 'up'
        },
        {
          rank: 6,
          id: '6',
          name: 'Eleanor Pena',
          userIdTag: 'ID 1445920',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          tasksCompleted: 98,
          spentTime: '19:30',
          victories: 21,
          achievements: 95,
          totalPoints: '3.12050',
          pointsNum: 3120.50,
          trend: 'down'
        }
      ];

      if (profilesData && profilesData.length > 0) {
        const liveUsers: LeaderboardUser[] = profilesData.map((p, index) => {
          const xp = p.xp || 100;
          return {
            rank: index + 1,
            id: p.id,
            name: p.display_name || p.full_name || 'Tasarımcı',
            userIdTag: `ID ${p.id.slice(0, 7).toUpperCase()}`,
            avatar: p.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${p.id}`,
            tasksCompleted: Math.floor(xp / 15) || 10,
            spentTime: `${Math.floor(xp / 100) + 12}:${(index * 7 + 15) % 60}`,
            victories: Math.floor(xp / 100) || 3,
            achievements: Math.floor(xp / 10) || 25,
            totalPoints: (xp / 1000).toFixed(5),
            pointsNum: xp,
            trend: index % 2 === 0 ? 'up' : 'down'
          };
        });

        // Merge live users with defaults if fewer than 6
        if (liveUsers.length >= 3) {
          setUsers(liveUsers);
        } else {
          setUsers([...liveUsers, ...defaultMockUsers.slice(liveUsers.length)]);
        }
      } else {
        setUsers(defaultMockUsers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const topThree = users.slice(0, 3);

  const filteredUsers = users
    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.userIdTag.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'tasks') return b.tasksCompleted - a.tasksCompleted;
      if (sortOption === 'victories') return b.victories - a.victories;
      return b.pointsNum - a.pointsNum;
    });

  return (
    <div className="w-full min-h-screen bg-[#f4f6f9] text-slate-800 pt-24 pb-20 px-4 md:px-8 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP TITLE ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Leaderboard</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Topluluk içerisindeki en aktif tasarımcılar ve derece alanlar.</p>
          </div>

          <div className="relative">
            <select
              value={overallFilter}
              onChange={(e) => setOverallFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 pr-10 text-xs md:text-sm font-bold text-slate-700 focus:outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="Genel Bakış">Overall</option>
              <option value="Bu Ay">Bu Ay</option>
              <option value="Tüm Zamanlar">Tüm Zamanlar</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* TOP SUMMARY CARDS (ROW 1) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Joined Members */}
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
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Joined Members</span>
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">346+</span>
            </div>
          </div>

          {/* Card 2: Achieved Goals */}
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
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Achieved goals</span>
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">732+</span>
            </div>
          </div>

          {/* Card 3: Countdown Timer Banner */}
          <div className="md:col-span-6 bg-amber-50/70 border border-amber-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Remaining time to completion</span>
                  <span className="text-base">🔥</span>
                </div>

                <div className="flex items-center gap-3 text-slate-900 font-extrabold text-2xl md:text-3xl tracking-tight">
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">DAYS</span>
                  </div>
                  <span className="text-slate-300 pb-2">:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">HOURS</span>
                  </div>
                  <span className="text-slate-300 pb-2">:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">MINUTE</span>
                  </div>
                </div>
              </div>

              <div className="w-14 h-14 bg-amber-100/80 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0 self-start sm:self-center">
                <Trophy className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center gap-1.5 text-xs text-amber-800/80 font-medium">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Only the first three positions will be awarded prizes</span>
            </div>
          </div>

        </div>

        {/* SECTION 2: CURRENT LEADERS PODIUM */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Current Leaders</h2>

            {/* Time Filter Pills */}
            <div className="bg-white border border-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('week')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setActiveTab('month')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setActiveTab('today')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'today' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Today
              </button>
            </div>
          </div>

          {/* 3 TOP LEADER CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Rank 1 Card */}
            {topThree[0] && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={topThree[0].avatar}
                      alt={topThree[0].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-300 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{topThree[0].name}</h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-extrabold text-slate-900">{topThree[0].totalPoints}</span>
                        <span className="text-xs font-semibold text-slate-500">pts.</span>
                      </div>
                    </div>
                  </div>

                  {/* Gold Laurels Emblem */}
                  <div className="w-10 h-10 rounded-full bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-600 font-extrabold text-sm shadow-sm shrink-0">
                    🥇 1
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">WINS</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[0].victories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">TASKS</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[0].tasksCompleted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ACH.</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[0].achievements}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 2 Card */}
            {topThree[1] && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={topThree[1].avatar}
                      alt={topThree[1].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-300 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{topThree[1].name}</h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-extrabold text-slate-900">{topThree[1].totalPoints}</span>
                        <span className="text-xs font-semibold text-slate-500">pts.</span>
                      </div>
                    </div>
                  </div>

                  {/* Silver Laurels Emblem */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 font-extrabold text-sm shadow-sm shrink-0">
                    🥈 2
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">WINS</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[1].victories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">TASKS</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[1].tasksCompleted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ACH.</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[1].achievements}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 Card */}
            {topThree[2] && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={topThree[2].avatar}
                      alt={topThree[2].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-600/40 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{topThree[2].name}</h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-extrabold text-slate-900">{topThree[2].totalPoints}</span>
                        <span className="text-xs font-semibold text-slate-500">pts.</span>
                      </div>
                    </div>
                  </div>

                  {/* Bronze Laurels Emblem */}
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-600/30 flex items-center justify-center text-amber-700 font-extrabold text-sm shadow-sm shrink-0">
                    🥉 3
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">WINS</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[2].victories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">TASKS</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[2].tasksCompleted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ACH.</span>
                    <span className="text-base font-extrabold text-slate-900">{topThree[2].achievements}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SECTION 3: GLOBAL RANKING TABLE */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Global Ranking</h2>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Sort selector */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={sortOption}
                  onChange={(e: any) => setSortOption(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs md:text-sm font-bold text-slate-700 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="tasks">Sort by Task completed</option>
                  <option value="points">Sort by Total points</option>
                  <option value="victories">Sort by Victories</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by user name"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Rank</th>
                    <th className="py-4 px-6">User name</th>
                    <th className="py-4 px-6 text-center">Task completed</th>
                    <th className="py-4 px-6 text-center">Spent time</th>
                    <th className="py-4 px-6 text-center">Victories</th>
                    <th className="py-4 px-6 text-center">Achievements</th>
                    <th className="py-4 px-6 text-right">Total points</th>
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
                        Aramaya uygun kullanıcı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors group">
                        
                        {/* Rank + Trend indicator */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            {user.trend === 'up' ? (
                              <span className="flex items-center text-emerald-500 text-xs gap-0.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="flex items-center text-rose-400 text-xs gap-0.5">
                                <TrendingDown className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className="text-sm font-extrabold">{user.rank}</span>
                          </div>
                        </td>

                        {/* User name & avatar & ID tag */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{user.name}</p>
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
