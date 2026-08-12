'use strict';

class PostBookmarkTransformer {

    /**
     * Transform bookmark/unbookmark result object from NodeBB
     * @param {Object} result
     * @returns {Object}
     */
    static transform(result) {
        if (!result) return null;

        const post = result.post || {};

        return {
            pid: Number(post.pid || result.pid),
            bookmarked: result.isBookmarked === true,
            bookmarks: Number(post.bookmarks || 0)
        };
    }

}

module.exports = PostBookmarkTransformer;
