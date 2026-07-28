import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Image as ImageIcon, MessageSquare, Flag, LogOut, ExternalLink, Trophy, Flame, Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const menuItems = [
    { name: 'Dashboard', path: '/mutfak', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { name: 'Revizeleş!', path: '/mutfak/revizeles', icon: <Flame className="w-5 h-5 text-[#FF5500]" /> },
    { name: 'Yarışmalar', path: '/mutfak/contests', icon: <Trophy className="w-5 h-5" /> },
    { name: 'Duyurular', path: '/mutfak/announcements', icon: <Megaphone className="w-5 h-5" /> },
    { name: 'Kullanıcılar', path: '/mutfak/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Gönderiler', path: '/mutfak/posts', icon: <ImageIcon className="w-5 h-5" /> },
    { name: 'Yorumlar', path: '/mutfak/comments', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Şikayetler', path: '/mutfak/reports', icon: <Flag className="w-5 h-5" /> },
];

export default function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[var(--card-bg)] border-r border-[var(--border-primary)] flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-[var(--border-primary)] flex items-center gap-3">
                    <img src="/Revizelesene-logo.png" alt="Revizelesene" className="h-7 w-auto object-contain" />
                    <span className="text-[10px] bg-[#FF5500] text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">ADMIN</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                                    isActive
                                        ? 'bg-[#FF5500]/10 text-[#FF5500] font-bold'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                                }`
                            }
                        >
                            {item.icon}
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--border-primary)] space-y-2">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl transition-colors font-medium text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                    >
                        <ExternalLink className="w-5 h-5" />
                        Siteye Dön
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl transition-colors font-medium text-sm text-red-500 hover:bg-red-500/10"
                    >
                        <LogOut className="w-5 h-5" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 min-h-screen overflow-x-hidden">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
