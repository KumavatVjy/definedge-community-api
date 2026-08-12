'use strict';

class PostLikeTransformer {

    /**
     * Transform upvote/unvote result object from NodeBB
     * @param {Object} result
     * @returns {Object}
     */
    static transform(result) {
        if (!result) return null;

        const post = result.post || {};
        const upvotes = post.upvotes || 0;
        const downvotes = post.downvotes || 0;

        return {
            pid: post.pid || result.pid,
            liked: result.upvote === true,
            upvotes: upvotes,
            downvotes: downvotes,
            votes: upvotes - downvotes
        };
    }

}

module.exports = PostLikeTransformer;
