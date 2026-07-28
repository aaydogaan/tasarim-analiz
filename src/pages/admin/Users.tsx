import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, ShieldBan, CheckCircle2, ChevronDown, Zap } from 'lucide-react';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import toast from 'react-hot-toast';

function BadgeSelectDropdown({ value, onChange }: { value: string | null, onChange: (val: string | null) => void }) {
    return (
        <div className="flex items-center gap-2">
            <VerifiedBadge badge={value} size="xs" />
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value || null)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-[#FF5500] w-40"
            >
                <option value="">Rozet Yok</option>
                <option value="gold">🥇 Altın Tik (Kurucu)</option>
                <option value="blue">🔹 Mavi Tik (Tasarımcı)</option>
            </select>
        </div>
    );
}

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBanToggle = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', userId);
        if (error) {
            toast.error('İşlem başarısız');
        } else {
            toast.success(currentStatus ? 'Kullanıcı yasağı kaldırıldı' : 'Kullanıcı yasaklandı');
            fetchUsers();
        }
    };

    const handleBadgeChange = async (userId: string, newBadge: string | null) => {
        const { error } = await supabase.from('profiles').update({ verification_badge: newBadge }).eq('id', userId);
        if (error) {
            console.error('Rozet güncelleme hatası:', error);
            toast.error(`Rozet güncellenemedi: ${error.message}`);
        } else {
            toast.success('Doğrulama rozeti güncellendi');
            fetchUsers();
        }
    };

    const handleProToggle = async (userId: string, currentProStatus: boolean) => {
        const newProState = !currentProStatus;
        const newRole = newProState ? 'pro' : 'user';
        
        let { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        
        // Also update is_pro if column exists in database
        try {
            await supabase.from('profiles').update({ is_pro: newProState }).eq('id', userId);
        } catch (_) {}

        if (error) {
            toast.error('PRO durumu güncellenemedi: ' + error.message);
        } else {
            toast.success(newProState ? '⚡ PRO üyelik başarıyla verildi!' : 'PRO üyelik kaldırıldı');
            fetchUsers();
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kullanıcı Yönetimi</h1>

            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] text-[var(--text-secondary)] font-bold">
                            <tr>
                                <th className="p-4">Kullanıcı</th>
                                <th className="p-4">Unvan</th>
                                <th className="p-4">Doğrulama Rozeti</th>
                                <th className="p-4">Kayıt Tarihi</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--text-secondary)]" />
                                    </td>
                                </tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`} alt="" className="w-12 h-12 rounded-full border-2 border-[var(--bg-primary)] shadow-sm" />
                                                {user.is_admin && (
                                                    <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-[var(--bg-primary)]" title="Yönetici">
                                                        <ShieldBan className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                                    <span>{user.display_name}</span>
                                                    <VerifiedBadge badge={user.verification_badge} size="xs" />
                                                    {user.is_admin && <span className="text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black">ADMİN</span>}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)]">{user.email || 'Email yok'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[var(--text-secondary)]">{user.design_rank || 'Tasarımcı'}</td>
                                    <td className="p-4">
                                        <BadgeSelectDropdown 
                                            value={user.verification_badge} 
                                            onChange={(val) => handleBadgeChange(user.id, val)} 
                                        />
                                    </td>
                                    <td className="p-4 text-[var(--text-secondary)]">{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                                    <td className="p-4">
                                        {user.is_banned ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-500">
                                                Yasaklı
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-500">
                                                Aktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        {(() => {
                                            const isUserPro = Boolean(user.is_pro || user.role === 'pro' || user.role === 'admin');
                                            return (
                                                <button
                                                    onClick={() => handleProToggle(user.id, isUserPro)}
                                                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${isUserPro ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]'}`}
                                                    title={isUserPro ? "PRO Üyeliği İptal Et" : "Kullanıcıya PRO Üyelik Ver"}
                                                >
                                                    <Zap className="w-3.5 h-3.5" />
                                                    <span>{isUserPro ? 'PRO Üye' : 'PRO Yap'}</span>
                                                </button>
                                            );
                                        })()}
                                        {!user.is_admin && (
                                            <button 
                                                onClick={() => handleBanToggle(user.id, user.is_banned)}
                                                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 inline-flex text-xs font-bold ${user.is_banned ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                                                title={user.is_banned ? "Yasağı Kaldır" : "Kullanıcıyı Yasakla"}
                                            >
                                                {user.is_banned ? <><CheckCircle2 className="w-4 h-4" /> Yasağı Kaldır</> : <><ShieldBan className="w-4 h-4" /> Yasakla</>}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
