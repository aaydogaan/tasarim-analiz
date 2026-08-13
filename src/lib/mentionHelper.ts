import { supabase } from './supabase';

/**
 * Extracts @mentions from comment text and sends in-app notifications
 */
export async function sendMentionNotifications({
    text,
    actorId,
    postId,
    replyAuthorId
}: {
    text: string;
    actorId: string;
    postId?: string;
    replyAuthorId?: string;
}) {
    if (!actorId || !text) return;

    try {
        const notifiedUserIds = new Set<string>();

        // 1. Extract @mentions
        const matches = text.match(/@[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ.-]+/g) || [];
        const rawTags = Array.from(new Set(matches.map(m => m.slice(1).trim()).filter(Boolean)));

        if (rawTags.length > 0) {
            // Find user_ids for these tags from profiles table
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, slug, display_name');

            if (profiles && profiles.length > 0) {
                for (const tag of rawTags) {
                    const cleanTag = tag.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                    const matchedUser = profiles.find(p => {
                        const pSlug = (p.slug || '').toLowerCase();
                        const pName = (p.display_name || '').toLowerCase().replace(/\s+/g, '');
                        return pSlug === cleanTag || pName === cleanTag || pSlug === tag.toLowerCase();
                    });

                    if (matchedUser && matchedUser.id !== actorId && !notifiedUserIds.has(matchedUser.id)) {
                        notifiedUserIds.add(matchedUser.id);
                        await supabase.from('notifications').insert({
                            user_id: matchedUser.id,
                            actor_id: actorId,
                            type: 'mention_user',
                            post_id: postId,
                            is_read: false
                        });
                    }
                }
            }
        }

        // 2. Send comment_reply notification to replyAuthorId if not already tagged
        if (replyAuthorId && replyAuthorId !== actorId && !notifiedUserIds.has(replyAuthorId)) {
            await supabase.from('notifications').insert({
                user_id: replyAuthorId,
                actor_id: actorId,
                type: 'comment_reply',
                post_id: postId,
                is_read: false
            });
        }
    } catch (err) {
        console.error("sendMentionNotifications error:", err);
    }
}

/**
 * Format a human-readable clean tag for a profile
 */
export function getCleanUserTag(prof: { display_name?: string; slug?: string; user_name?: string }): string {
    if (prof.slug && !prof.slug.includes('-')) {
        return prof.slug;
    }
    const name = prof.display_name || prof.user_name || 'tasarimci';
    return name.replace(/\s+/g, '');
}

export interface ThreadComment {
    id: string;
    parent_id?: string | null;
    user_id: string;
    content: string;
    comment?: string;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
    user_slug?: string;
    verification_badge?: string | null;
    is_pro?: boolean;
    role?: string | null;
    profiles?: any;
    replies?: ThreadComment[];
}

/**
 * Groups comments into parent threads and nested replies
 */
export function organizeCommentsIntoThreads(comments: any[]): ThreadComment[] {
    if (!comments || comments.length === 0) return [];

    const threadMap = new Map<string, ThreadComment>();
    const topLevelComments: ThreadComment[] = [];

    // Map each comment with initialized replies array
    comments.forEach(c => {
        threadMap.set(c.id, { ...c, replies: [] });
    });

    comments.forEach(c => {
        const item = threadMap.get(c.id)!;

        // 1. Check explicit parent_id
        if (c.parent_id && threadMap.has(c.parent_id) && c.parent_id !== c.id) {
            threadMap.get(c.parent_id)!.replies!.push(item);
            return;
        }

        // 2. Check implicit @mention matching at start of text
        const text = (c.content || c.comment || '').trim();
        const match = text.match(/^@([a-zA-Z0-9_çğıöşüÇĞİÖŞÜ.-]+)/);
        if (match) {
            const tag = match[1].toLowerCase();
            // Find parent comment before this one whose slug or display_name matches tag
            const parent = comments.find(p => {
                if (p.id === c.id) return false;
                const pSlug = (p.profiles?.slug || p.user_slug || '').toLowerCase();
                const pName = (p.profiles?.display_name || p.user_name || '').toLowerCase().replace(/\s+/g, '');
                return (pSlug && pSlug === tag) || (pName && pName === tag);
            });

            if (parent && threadMap.has(parent.id)) {
                threadMap.get(parent.id)!.replies!.push(item);
                return;
            }
        }

        topLevelComments.push(item);
    });

    return topLevelComments;
}
