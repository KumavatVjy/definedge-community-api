'use strict';

const BaseRepository = require('../base/BaseRepository');

class NodeBBUserRepository extends BaseRepository {

    constructor() {
        super();
        this.user = require.main.require('./src/user');
        this.topics = require.main.require('./src/topics');
        this.posts = require.main.require('./src/posts');
        this.db = require.main.require('./src/database');
    }

    /**
     * Find user profile data by UID
     * @param {number|string} uid
     * @returns {Promise<Object|null>}
     */
    async findById(uid) {
        const numericUid = parseInt(uid, 10);
        if (isNaN(numericUid) || numericUid <= 0) {
            return null;
        }

        const userData = await this.user.getUserData(numericUid);

        if (!userData || !userData.uid) {
            return null;
        }

        return userData;
    }

    /**
     * Find topics created by a user
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async findTopics({ uid, page = 1, limit = 20 }) {
        const start = (page - 1) * limit;
        const stop = start + limit - 1;

        const result = await this.topics.getTopicsFromSet(
            `uid:${uid}:topics`,
            0,
            start,
            stop
        );

        return result;
    }

    /**
     * Find posts created by a user
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async findPosts({ uid, page = 1, limit = 20 }) {
        const start = (page - 1) * limit;
        const stop = start + limit - 1;

        const result = await this.posts.getPostSummariesFromSet(
            `uid:${uid}:posts`,
            0,
            start,
            stop
        );

        return result;
    }

    /**
     * Find followers of a target user
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async findFollowers({ uid, page = 1, limit = 20 }) {
        const start = (page - 1) * limit;
        const stop = start + limit - 1;

        const users = await this.user.getFollowers(
            uid,
            start,
            stop
        );

        return {
            users,
            nextStart: stop + 1
        };
    }

    /**
     * Find users followed by a target user
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async findFollowing({ uid, page = 1, limit = 20 }) {
        const start = (page - 1) * limit;
        const stop = start + limit - 1;

        const users = await this.user.getFollowing(
            uid,
            start,
            stop
        );

        return {
            users,
            nextStart: stop + 1
        };
    }

    /**
     * Find user statistics by UID
     * @param {number|string} uid
     * @returns {Promise<Object|null>}
     */
    async findStatistics(uid) {
        const numericUid = parseInt(uid, 10);
        if (isNaN(numericUid) || numericUid <= 0) {
            return null;
        }

        const userData = await this.user.getUserFields(numericUid, [
            'uid',
            'topiccount',
            'postcount',
            'reputation',
            'followerCount',
            'followingCount'
        ]);

        if (!userData || !userData.uid) {
            return null;
        }

        return {
            topics: userData.topiccount || 0,
            posts: userData.postcount || 0,
            reputation: userData.reputation || 0,
            followers: userData.followerCount || 0,
            following: userData.followingCount || 0
        };
    }

    /**
     * Find combined user activity feed (topics + posts)
     * Note: Implements offset-based pagination up to MAX_ACTIVITY_DEPTH (500 records per source).
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async findActivity({ uid, page = 1, limit = 20 }) {
        const MAX_ACTIVITY_DEPTH = 500;
        const fetchLimit = Math.min(page * limit, MAX_ACTIVITY_DEPTH);

        const [topicsResult, postsResult] = await Promise.all([
            this.findTopics({ uid, page: 1, limit: fetchLimit }),
            this.findPosts({ uid, page: 1, limit: fetchLimit })
        ]);

        const topicItems = (topicsResult.topics || []).map(topic => ({
            type: 'topic_created',
            timestamp: topic.timestamp || 0,
            topic
        }));

        const postItems = (postsResult.posts || []).map(post => ({
            type: 'post_created',
            timestamp: post.timestamp || 0,
            post
        }));

        const combined = [...topicItems, ...postItems]
            .sort((a, b) => b.timestamp - a.timestamp);

        const start = (page - 1) * limit;
        const activities = combined.slice(start, start + limit);

        return {
            activities,
            hasMore: combined.length > start + limit
        };
    }

    /**
     * Follow a target user in NodeBB
     * @param {number} uid
     * @param {number} targetUid
     * @returns {Promise<Object>}
     */
    async follow(uid, targetUid) {
        return await this.user.follow(uid, targetUid);
    }

    /**
     * Unfollow a target user in NodeBB
     * @param {number} uid
     * @param {number} targetUid
     * @returns {Promise<Object>}
     */
    async unfollow(uid, targetUid) {
        return await this.user.unfollow(uid, targetUid);
    }

    /**
     * Check if a user is following a target user in NodeBB
     * @param {number} uid
     * @param {number} targetUid
     * @returns {Promise<boolean>}
     */
    async isFollowing(uid, targetUid) {
        return await this.user.isFollowing(uid, targetUid);
    }

    /**
     * Find engagement statistics for a user (likes given, likes received, bookmarks)
     * @param {number|string} uid
     * @returns {Promise<Object>}
     */
    async findEngagement(uid) {
        const numericUid = parseInt(uid, 10);

        if (isNaN(numericUid) || numericUid <= 0) {
            return {
                likesGiven: 0,
                likesReceived: 0,
                bookmarks: 0
            };
        }

        const [likesGiven, bookmarks, pids] = await Promise.all([
            this.db.sortedSetCard(`uid:${numericUid}:upvote`),
            this.db.sortedSetCard(`uid:${numericUid}:bookmarks`),
            this.db.getSortedSetRevRange(`uid:${numericUid}:posts`, 0, -1)
        ]);

        let likesReceived = 0;

        if (pids && pids.length) {
            const postsData = await this.posts.getPostsFields(pids, ['upvotes']);

            likesReceived = postsData.reduce(
                (sum, post) => sum + (parseInt(post?.upvotes, 10) || 0),
                0
            );
        }

        return {
            likesGiven: Number(likesGiven || 0),
            likesReceived,
            bookmarks: Number(bookmarks || 0)
        };
    }

    /**
     * Get ban status of a target user in NodeBB
     * @param {number|string} uid
     * @returns {Promise<Object>}
     */
    async getBanStatus(uid) {
        const numericUid = parseInt(uid, 10);

        if (!numericUid || numericUid <= 0) {
            return {
                banned: false,
                banExpiresAt: null
            };
        }

        const data = await this.user.bans.unbanIfExpired([numericUid]);
        const banData = data && data[0] ? data[0] : {};
        const isBanned = Boolean(banData.banned);
        const banExpiresAt = parseInt(banData['banned:expire'], 10);

        return {
            banned: isBanned,
            banExpiresAt: isBanned && banExpiresAt > 0 ? banExpiresAt : null
        };
    }

    /**
     * Get ban status for multiple users in batch
     * @param {Array<number|string>} uids
     * @returns {Promise<Object<number, Object>>}
     */
    async getBanStatuses(uids = []) {
        if (!Array.isArray(uids) || !uids.length) {
            return {};
        }

        const numericUids = [...new Set(
            uids
                .map(uid => parseInt(uid, 10))
                .filter(uid => uid > 0)
        )];

        if (!numericUids.length) {
            return {};
        }

        const banData = await this.user.bans.unbanIfExpired(numericUids);

        const result = {};

        numericUids.forEach((uid, index) => {
            const data = (banData && banData[index]) || {};

            const isBanned = Boolean(data.banned);
            const banExpiresAt = parseInt(data['banned:expire'], 10);

            result[uid] = {
                banned: isBanned,
                banExpiresAt: isBanned && banExpiresAt > 0 ? banExpiresAt : null
            };
        });

        return result;
    }

}

module.exports = NodeBBUserRepository;


