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
