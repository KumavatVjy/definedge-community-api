'use strict';

class PostTransformer {

    /**
     * Transform single post object according to frontend contract
     * @param {Object} post
     * @returns {Object}
     */
    static transform(post) {
        if (!post) return null;

        return {
            id: post.pid,
            tid: post.tid,
            content: post.content || '',
            author: {
                uid: post.uid,
                username: post.user ? post.user.username : '',
                slug: post.user ? post.user.userslug : '',
                picture: post.user ? post.user.picture : null
            },
            likes: post.upvotes || 0,
            timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : null,
            deleted: Boolean(post.deleted)
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
