import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Image as ImageIcon, MessageSquare, Flag, LogOut, ExternalLink, Trophy, Flame, Megaphone, BarChart2, Mail, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const menuItems = [
    { name: 'Dashboard', path: '/mutfak', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { name: 'Revizeleş!', path: '/mutfak/revizeles', icon: <Flame className="w-5 h-5 text-[#FF5500]" /> },
    { name: 'Yarışmalar', path: '/mutfak/contests', icon: <Trophy className="w-5 h-5" /> },
    { name: 'Duyurular', path: '/mutfak/announcements', icon: <Megaphone className="w-5 h-5" /> },
    { name: 'Kullanıcılar', path: '/mutfak/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Bülten', path: '/mutfak/newsletter', icon: <Mail className="w-5 h-5" /> },
    { name: 'Gönderiler', path: '/mutfak/posts', icon: <ImageIcon className="w-5 h-5" /> },
    { name: 'Yorumlar', path: '/mutfak/comments', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Anketler', path: '/mutfak/surveys', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Şikayetler', path: '/mutfak/reports', icon: <Flag className="w-5 h-5" /> },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col lg:flex-row">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--card-bg)] border-b border-[var(--border-primary)] z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <img src="/Revizelesene-logo.png" alt="Revizelesene" className="h-6 w-auto object-contain" />
                    <span className="text-[10px] bg-[#FF5500] text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">ADMIN</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[var(--text-secondary)]">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-[var(--card-bg)] border-r border-[var(--border-primary)] flex flex-col fixed h-full z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/Revizelesene-logo.png" alt="Revizelesene" className="h-7 w-auto object-contain" />
                        <span className="text-[10px] bg-[#FF5500] text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">ADMIN</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 text-[var(--text-secondary)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setIsMobileMenuOpen(false)}
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
            <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen overflow-x-hidden w-full max-w-[100vw]">
                <div className="max-w-6xl mx-auto overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
