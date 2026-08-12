'use strict';

class UserEngagementTransformer {

    /**
     * Transform user engagement data into public API payload
     * @param {Object} data
     * @returns {Object}
     */
    static transform(data) {
        if (!data) return null;

        return {
            likes: {
                given: Number(data.likesGiven || 0),
                received: Number(data.likesReceived || 0)
            },
            bookmarks: Number(data.bookmarks || 0)
        };
    }

}

module.exports = UserEngagementTransformer;
