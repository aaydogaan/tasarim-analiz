import React from 'react';
import { Crown } from 'lucide-react';

interface ProBadgeProps {
  isPro?: boolean;
  role?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'chip' | 'iconOnly';
  className?: string;
}

export const ProBadge: React.FC<ProBadgeProps> = ({ 
  isPro, 
  role, 
  size = 'sm', 
  variant = 'pill',
  className = '' 
}) => {
  const activePro = Boolean(isPro || role === 'pro' || role === 'admin');
  if (!activePro) return null;

  const isAdmin = role === 'admin';

  if (variant === 'iconOnly') {
    return (
      <span 
        title={isAdmin ? "Admin Kullanıcı" : "PRO Tasarımcı"}
        className={`inline-flex items-center justify-center shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase text-white ${isAdmin ? 'bg-amber-500' : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm'} ${className}`}
      >
        {isAdmin ? <Crown className="w-3 h-3 fill-white" /> : 'PRO'}
      </span>
    );
  }

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[9px]',
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (isAdmin) {
    return (
      <span 
        title="Admin Kullanıcı"
        className={`inline-flex items-center font-extrabold uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0 gap-1 ${sizeClasses[size]} ${className}`}
      >
        <Crown className={`${iconSizes[size]} fill-amber-500`} />
        <span>ADMİN</span>
      </span>
    );
  }

  return (
    <span 
      title="PRO Tasarımcı — Revizelesene Premium Üye"
      className={`inline-flex items-center font-black uppercase tracking-widest rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.35)] border border-white/20 select-none shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <span>PRO</span>
    </span>
  );
};
