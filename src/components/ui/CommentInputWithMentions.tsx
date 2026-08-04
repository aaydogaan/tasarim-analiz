import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, X, CornerDownRight } from 'lucide-react';

interface ProfileSuggestion {
    id: string;
    display_name: string;
    avatar_url: string | null;
    slug: string | null;
}

interface CommentInputWithMentionsProps {
    value: string;
    onChange: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    placeholder?: string;
    submitting?: boolean;
    replyTarget?: { name: string; slug: string } | null;
    onCancelReply?: () => void;
    inputRef?: React.RefObject<HTMLInputElement>;
}

export const CommentInputWithMentions: React.FC<CommentInputWithMentionsProps> = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Yorumunuzu yazın... (@ ile kişi etiketleyin)",
    submitting = false,
    replyTarget = null,
    onCancelReply,
    inputRef: externalInputRef
}) => {
    const internalInputRef = useRef<HTMLInputElement>(null);
    const inputRef = externalInputRef || internalInputRef;

    const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<ProfileSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);

    // Fetch all profiles for mention suggestions once
    useEffect(() => {
        const loadProfiles = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, display_name, avatar_url, slug')
                .limit(50);

            if (data) {
                setSuggestions(data);
            }
        };
        loadProfiles();
    }, []);

    // Handle text input change & detect @ trigger
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart || newValue.length;
        onChange(newValue);

        // Check if cursor is right after an '@' or typing a mention
        const textBeforeCursor = newValue.slice(0, cursorPos);
        const lastAtPos = textBeforeCursor.lastIndexOf('@');

        if (lastAtPos !== -1) {
            // Check if there is no space between '@' and cursor
            const query = textBeforeCursor.slice(lastAtPos + 1);
            if (!query.includes(' ') && !query.includes('\n')) {
                setMentionSearch(query.toLowerCase());
                setMentionStartIndex(lastAtPos);
                setShowSuggestions(true);

                // Filter profiles by display_name or slug
                const filtered = suggestions.filter(p =>
                    (p.display_name && p.display_name.toLowerCase().includes(query.toLowerCase())) ||
                    (p.slug && p.slug.toLowerCase().includes(query.toLowerCase()))
                );
                setFilteredSuggestions(filtered.slice(0, 5));
                return;
            }
        }

        setShowSuggestions(false);
    };

    // Select a user from mention popup
    const selectUser = (profile: ProfileSuggestion) => {
        if (mentionStartIndex === null) return;

        const tag = profile.slug ? `@${profile.slug}` : `@${profile.display_name.replace(/\s+/g, '')}`;
        const textBeforeAt = value.slice(0, mentionStartIndex);
        const textAfterCursor = value.slice(inputRef.current?.selectionStart || value.length);

        const updatedValue = `${textBeforeAt}${tag} ${textAfterCursor}`;
        onChange(updatedValue);

        setShowSuggestions(false);

        // Keep input focused
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newPos = (textBeforeAt + tag + ' ').length;
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 10);
    };

    return (
        <div className="relative w-full">
            {/* Replying Banner */}
            {replyTarget && (
                <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-xl text-xs font-semibold text-[#FF5500] animate-fadeIn">
                    <div className="flex items-center gap-1.5 truncate">
                        <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Cevaplanan: <strong>@{replyTarget.slug || replyTarget.name}</strong></span>
                    </div>
                    {onCancelReply && (
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="p-1 hover:bg-[#FF5500]/20 rounded-full transition-colors shrink-0"
                            title="İptal et"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Mention Auto-complete Popup */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl shadow-xl z-50 overflow-hidden backdrop-blur-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-[var(--border-primary)] text-[10px] font-extrabold uppercase text-[var(--text-secondary)] tracking-wider">
                        Kişi Etiketle (@)
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((profile) => (
                            <button
                                key={profile.id}
                                type="button"
                                onClick={() => selectUser(profile)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#FF5500]/10 transition-colors group cursor-pointer border-b border-[var(--border-primary)]/50 last:border-0"
                            >
                                <img
                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.id}`}
                                    alt={profile.display_name}
                                    className="w-6 h-6 rounded-full object-cover border border-[var(--border-primary)]"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#FF5500] truncate transition-colors">
                                        {profile.display_name}
                                    </p>
                                    <p className="text-[10px] font-semibold text-[#FF5500] truncate">
                                        @{profile.slug || 'tasarimci'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Input Form */}
            <form onSubmit={onSubmit} className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[#FF5500] transition-colors"
                />
                <button
                    type="submit"
                    disabled={submitting || !value.trim()}
                    className="px-4 py-2.5 bg-[#FF5500] hover:bg-[#e64d00] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1 cursor-pointer"
                >
                    <span>Gönder</span>
                </button>
            </form>
        </div>
    );
};
