import React from 'react';

interface VerifiedBadgeProps {
    badge?: string | null;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ badge, className = '', size = 'sm' }) => {
    if (!badge || (badge !== 'gold' && badge !== 'blue')) return null;

    const sizeClasses = {
        xs: 'w-4 h-4',
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const iconSize = sizeClasses[size] || sizeClasses.sm;
    const isGold = badge === 'gold';
    const title = isGold ? 'Revizelesene Kurucusu / Ekip' : 'Doğrulanmış Tasarımcı';

    return (
        <span 
            className={`inline-flex items-center justify-center shrink-0 cursor-help select-none ${className}`} 
            title={title}
        >
            <svg className={`${iconSize} filter drop-shadow-sm`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="goldBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="50%" stopColor="#D97706" />
                        <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                    <linearGradient id="blueBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0095F6" />
                        <stop offset="100%" stopColor="#0072E6" />
                    </linearGradient>
                </defs>
                <path 
                    d="M22.25 12c0-1.43-.88-2.67-2.19-3.19.16-.45.24-.93.24-1.43 0-2.28-1.84-4.13-4.13-4.13-.5 0-.98.08-1.43.24C13.62 2.18 12.38 1.3 10.95 1.3s-2.67.88-3.19 2.19c-.45-.16-.93-.24-1.43-.24-2.28 0-4.13 1.85-4.13 4.13 0 .5.08.98.24 1.43C1.13 9.33.25 10.57.25 12s.88 2.67 2.19 3.19c-.16.45-.24.93-.24 1.43 0 2.28 1.84 4.13 4.13 4.13.5 0 .98-.08 1.43-.24 1.07 1.31 2.31 2.19 3.74 2.19s2.67-.88 3.19-2.19c.45.16.93.24 1.43.24 2.28 0 4.13-1.85 4.13-4.13 0-.5-.08-.98-.24-1.43 1.31-1.07 2.19-2.31 2.19-3.74z" 
                    fill={isGold ? "url(#goldBadgeGradient)" : "url(#blueBadgeGradient)"}
                />
                <path 
                    d="M9.75 15.651l-3.6-3.6 1.414-1.414 2.186 2.186 6.386-6.386 1.414 1.414z" 
                    fill="#FFFFFF"
                />
            </svg>
        </span>
    );
};
