import React from 'react';
import { Link } from 'react-router-dom';

interface FormattedCommentTextProps {
    text: string;
    onUserClick?: () => void;
    className?: string;
}

export const FormattedCommentText: React.FC<FormattedCommentTextProps> = ({ text, onUserClick, className = '' }) => {
    if (!text) return null;

    // Regex to match @mentions (e.g., @username or @Recep Aydogan)
    // Matches @ followed by word characters, dots, underscores, dashes or Turkish letters
    const parts = text.split(/(@[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ.-]+)/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.startsWith('@')) {
                    const cleanSlug = part.slice(1).toLowerCase().replace(/[^a-z0-9_-]/g, '');
                    return (
                        <Link
                            key={index}
                            to={`/${cleanSlug || part.slice(1)}`}
                            onClick={onUserClick}
                            className="text-[#FF5500] font-bold hover:underline inline-block px-0.5"
                        >
                            {part}
                        </Link>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};
