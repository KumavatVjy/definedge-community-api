'use strict';

const UserBanTransformer = require('./UserBanTransformer');
const PostDeletionTransformer = require('./PostDeletionTransformer');

class PostTransformer {

    /**
     * Transform single post object according to frontend contract
     * @param {Object} post
     * @returns {Object}
     */
    static transform(post) {
        if (!post) return null;

        const moderation = post.moderation || {
            flagged: Boolean(post.flagId || post.flagged),
            reportedByMe: Boolean(post.reportedByMe),
            flagState: post.flagState || null
        };

        const authorUser = post.user || {};
        const authorModeration = authorUser.moderation
            ? UserBanTransformer.transform(authorUser.moderation)
            : UserBanTransformer.transform({
                banned: Boolean(authorUser.banned),
                banExpiresAt: authorUser['banned:expire'] || authorUser.banExpiresAt || null
            });

        const deletionStatus = post.deletion
            ? PostDeletionTransformer.transform(post.deletion)
            : PostDeletionTransformer.transform({ deleted: post.deleted });

        return {
            id: post.pid,
            tid: post.tid,
            content: post.content || '',
            author: {
                uid: post.uid || authorUser.uid || 0,
                username: authorUser.username || '',
                slug: authorUser.userslug || '',
                picture: authorUser.picture || null,
                moderation: authorModeration
            },
            likes: post.upvotes || 0,
            timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : null,
            deleted: Boolean(deletionStatus.deleted),
            moderation
        };
    }

    /**
     * Transform array of post objects
     * @param {Array} posts
     * @returns {Array}
     */
    static collection(posts) {
        if (!Array.isArray(posts)) return [];
        return posts.map(post => this.transform(post));
    }

}

module.exports = PostTransformer;
