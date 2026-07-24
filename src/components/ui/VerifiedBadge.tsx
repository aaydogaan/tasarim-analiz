import React from 'react';

interface VerifiedBadgeProps {
    badge?: string | null;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ badge, className = '', size = 'sm' }) => {
    if (!badge || (badge !== 'gold' && badge !== 'blue')) return null;

    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const iconSize = sizeClasses[size] || sizeClasses.sm;
    const isGold = badge === 'gold';
    const title = isGold ? 'Revizelesene Kurucusu / Ekip' : 'Doğrulanmış Tasarımcı';

    return (
        <span 
            className={`inline-flex items-center justify-center shrink-0 cursor-help ${className}`} 
            title={title}
        >
            {isGold ? (
                <svg className={`${iconSize} text-amber-500 drop-shadow-sm`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 2.4 3.4-.4 1 3.2 3.2 1-.4 3.4L22 12l-2.4 2.4.4 3.4-3.2 1-1 3.2-3.4-.4L12 22l-2.4-2.4-3.4.4-1-3.2-3.2-1 .4-3.4L2 12l2.4-2.4-.4-3.4 3.2-1 1-3.2 3.4.4L12 2z" />
                    <path fill="#FFF" d="M10 15.5l-3.5-3.5 1.4-1.4L10 12.7l6.1-6.1 1.4 1.4z" />
                </svg>
            ) : (
                <svg className={`${iconSize} text-blue-500 drop-shadow-sm`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 2.4 3.4-.4 1 3.2 3.2 1-.4 3.4L22 12l-2.4 2.4.4 3.4-3.2 1-1 3.2-3.4-.4L12 22l-2.4-2.4-3.4.4-1-3.2-3.2-1 .4-3.4L2 12l2.4-2.4-.4-3.4 3.2-1 1-3.2 3.4.4L12 2z" />
                    <path fill="#FFF" d="M10 15.5l-3.5-3.5 1.4-1.4L10 12.7l6.1-6.1 1.4 1.4z" />
                </svg>
            )}
        </span>
    );
};
