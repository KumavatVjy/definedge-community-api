'use strict';

class UserStatisticsTransformer {

    /**
     * Transform user statistics object according to contract
     * @param {Object} stats
     * @returns {Object|null}
     */
    static transform(stats) {
        if (!stats) return null;

        return {
            topics: stats.topics !== undefined ? stats.topics : (stats.topiccount || 0),
            posts: stats.posts !== undefined ? stats.posts : (stats.postcount || 0),
            reputation: stats.reputation || 0,
            followers: stats.followers !== undefined ? stats.followers : (stats.followerCount || 0),
            following: stats.following !== undefined ? stats.following : (stats.followingCount || 0)
        };
    }

}

module.exports = UserStatisticsTransformer;
