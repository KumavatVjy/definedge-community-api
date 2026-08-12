'use strict';

class UserTransformer {

    /**
     * Transform single user object according to frontend contract
     * @param {Object} user
     * @returns {Object}
     */
    static transform(user) {
        if (!user) return null;

        const displayName = user.displayname || user.fullname || user.username || `user_${user.uid || 0}`;

        const moderation = user.moderation || {
            banned: Boolean(user.banned),
            banExpiresAt: user['banned:expire'] && Number(user['banned:expire']) > 0 ? Number(user['banned:expire']) : (user.banExpiresAt || null)
        };

        return {
            id: user.uid || 0,
            username: user.username || '',
            displayName,
            picture: user.picture || user.uploadedpicture || null,
            cover: user['cover:url'] || user.coverUrl || null,
            about: user.aboutme || user.signature || '',
            joinedAt: user.joindate ? new Date(user.joindate).toISOString() : null,
            lastSeen: user.lastonline ? new Date(user.lastonline).toISOString() : null,
            reputation: user.reputation || 0,
            postCount: user.postcount || 0,
            topicCount: user.topiccount || 0,
            followerCount: user.followerCount || 0,
            followingCount: user.followingCount || 0,
            group: user.groupTitle || (Array.isArray(user.groupTitleArray) && user.groupTitleArray.length ? user.groupTitleArray[0] : 'Members'),
            moderation
        };
    }

    /**
     * Transform array of user objects
     * @param {Array} users
     * @returns {Array}
     */
    static collection(users) {
        if (!Array.isArray(users)) return [];
        return users.map(user => this.transform(user));
    }

}

module.exports = UserTransformer;
