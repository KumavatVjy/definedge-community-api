'use strict';

class TopicTransformer {

    /**
     * Transform single topic object according to frontend contract
     * @param {Object} topic
     * @returns {Object}
     */
    static transform(topic) {
        if (!topic) return null;

        const authorName = topic.user
            ? (topic.user.username || topic.user.displayname || topic.user.userslug || `user_${topic.uid}`)
            : (topic.username || `user_${topic.uid || 0}`);

        const postCount = topic.postcount || 0;
        const replyCount = postCount > 1 ? postCount - 1 : 0;

        const teaserUser = topic.teaser ? topic.teaser.user : null;
        const lastPostUser = teaserUser ? {
            uid: teaserUser.uid,
            username: teaserUser.username || teaserUser.displayname || teaserUser.userslug || '',
            slug: teaserUser.userslug || '',
            picture: teaserUser.picture || null
        } : (topic.user ? {
            uid: topic.user.uid,
            username: authorName,
            slug: topic.user.userslug || '',
            picture: topic.user.picture || null
        } : null);

        return {
            id: topic.tid,
            title: topic.title,
            slug: topic.slug,
            category: {
                id: topic.cid,
                name: topic.category ? topic.category.name : ''
            },
            author: {
                uid: topic.uid || 0,
                username: authorName
            },
            posts: postCount,
            replyCount,
            views: topic.viewcount || 0,
            likes: topic.upvotes || 0,
            isPinned: Boolean(topic.pinned),
            isLocked: Boolean(topic.locked),
            lastReplyAt: topic.lastposttime ? new Date(topic.lastposttime).toISOString() : null,
            lastPostTimestamp: topic.lastposttime ? new Date(topic.lastposttime).toISOString() : null,
            lastPostUser
        };
    }

    /**
     * Transform array of topic objects
     * @param {Array} topics
     * @returns {Array}
     */
    static collection(topics) {
        if (!Array.isArray(topics)) return [];
        return topics.map(topic => this.transform(topic));
    }

}

module.exports = TopicTransformer;
