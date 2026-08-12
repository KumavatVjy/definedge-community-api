'use strict';

const BaseRepository = require('../base/BaseRepository');

class NodeBBTopicRepository extends BaseRepository {

    constructor() {
        super();
        this.topics = require.main.require('./src/topics');
    }

    /**
     * Find latest topics
     * @param {Object} options
     * @param {number} options.limit
     * @param {number} options.page
     * @param {number} options.uid
     * @returns {Promise<Array>}
     */
    async findLatest(options = {}) {
        const uid = options.uid || 0;
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 20));
        const start = (page - 1) * limit;
        const stop = start + limit - 1;

        const data = await this.topics.getRecentTopics(null, uid, start, stop);

        return data && Array.isArray(data.topics) ? data.topics : [];
    }

    /**
     * Find popular topics
     * @param {Object} options
     * @param {number} options.limit
     * @param {number} options.page
     * @param {number} options.uid
     * @returns {Promise<Array>}
     */
    async findPopular(options = {}) {
        const uid = options.uid || 0;
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 20));
        const start = (page - 1) * limit;
        const stop = start + limit - 1;

        let data = await this.topics.getSortedTopics({
            uid,
            start,
            stop,
            sort: 'posts',
            term: 'alltime'
        });

        if (!data || !Array.isArray(data.topics) || data.topics.length === 0) {
            data = await this.topics.getRecentTopics(null, uid, start, stop, 'popular');
        }

        return data && Array.isArray(data.topics) ? data.topics : [];
    }

    /**
     * Find single topic by TID
     * @param {number|string} tid
     * @param {Object} options
     * @param {number} options.uid
     * @returns {Promise<Object|null>}
     */
    async findById(tid, options = {}) {
        const numericTid = parseInt(tid, 10);
        const uid = options.uid || 0;
        const topicsList = await this.topics.getTopicsByTids([numericTid], uid);

        return topicsList && topicsList.length && topicsList[0] && topicsList[0].tid ? topicsList[0] : null;
    }

    /**
     * Find posts for a topic by TID
     * @param {number|string} tid
     * @param {Object} options
     * @param {number} options.limit
     * @param {number} options.page
     * @param {number} options.uid
     * @returns {Promise<Array>}
     */
    async findPosts(tid, options = {}) {
        const numericTid = parseInt(tid, 10);
        const uid = options.uid || 0;
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 20));
        const start = (page - 1) * limit;
        const stop = start + limit - 1;

        const posts = await this.topics.getTopicPosts(numericTid, `tid:${numericTid}:posts`, start, stop, uid, true);

        return posts || [];
    }

    /**
     * Create a topic in NodeBB
     * @param {Object} options
     * @param {number} options.cid
     * @param {string} options.title
     * @param {string} options.content
     * @param {number} options.uid
     * @returns {Promise<Object>}
     */
    async createTopic(options = {}) {
        const result = await this.topics.post({
            cid: options.cid,
            title: options.title,
            content: options.content,
            uid: options.uid
        });

        return {
            tid: result.topicData.tid,
            slug: result.topicData.slug
        };
    }

    /**
     * Reply to a topic in NodeBB
     * @param {Object} options
     * @param {number} options.tid
     * @param {string} options.content
     * @param {number} options.uid
     * @param {number} [options.toPid]
     * @returns {Promise<Object>}
     */
    async replyToTopic(options = {}) {
        const payload = {
            tid: options.tid,
            content: options.content,
            uid: options.uid
        };

        if (options.toPid) {
            payload.toPid = options.toPid;
        }

        const postData = await this.topics.reply(payload);
        return postData;
    }

    /**
     * Watch/Follow a topic in NodeBB
     * @param {number} tid
     * @param {number} uid
     * @returns {Promise<void>}
     */
    async watch(tid, uid) {
        return await this.topics.follow(tid, uid);
    }

    /**
     * Unwatch/Unfollow a topic in NodeBB
     * @param {number} tid
     * @param {number} uid
     * @returns {Promise<void>}
     */
    async unwatch(tid, uid) {
        return await this.topics.unfollow(tid, uid);
    }

    /**
     * Check if user is watching/following a topic in NodeBB
     * @param {number} tid
     * @param {number} uid
     * @returns {Promise<boolean>}
     */
    async isWatching(tid, uid) {
        const result = await this.topics.isFollowing([tid], uid);
        return Array.isArray(result) ? result[0] === true : false;
    }

    /**
     * Get deletion status of a topic in NodeBB
     * @param {number|string} tid
     * @returns {Promise<Object>}
     */
    async getDeletionStatus(tid) {
        const numericTid = parseInt(tid, 10);

        if (!numericTid || numericTid <= 0) {
            return {
                deleted: false,
                deleterUid: null,
                deletedTimestamp: null
            };
        }

        const data = await this.topics.getTopicsFields(
            [numericTid],
            ['deleted', 'deleterUid', 'deletedTimestamp']
        );

        const topic = data && data[0];

        return {
            deleted: Boolean(topic && Number(topic.deleted)),
            deleterUid:
                topic && Number(topic.deleterUid) > 0
                    ? Number(topic.deleterUid)
                    : null,
            deletedTimestamp:
                topic && Number(topic.deletedTimestamp) > 0
                    ? Number(topic.deletedTimestamp)
                    : null
        };
    }

    /**
     * Get deletion status for multiple topics in batch
     * @param {Array<number|string>} tids
     * @returns {Promise<Object<number, Object>>}
     */
    async getDeletionStatuses(tids = []) {
        if (!Array.isArray(tids) || !tids.length) {
            return {};
        }

        const numericTids = [...new Set(
            tids
                .map(tid => parseInt(tid, 10))
                .filter(tid => tid > 0)
        )];

        if (!numericTids.length) {
            return {};
        }

        const topicsData = await this.topics.getTopicsFields(
            numericTids,
            ['deleted', 'deleterUid', 'deletedTimestamp']
        );

        const result = {};

        numericTids.forEach((tid, index) => {
            const topic = (topicsData && topicsData[index]) || {};

            result[tid] = {
                deleted: Boolean(topic && Number(topic.deleted)),
                deleterUid:
                    topic && Number(topic.deleterUid) > 0
                        ? Number(topic.deleterUid)
                        : null,
                deletedTimestamp:
                    topic && Number(topic.deletedTimestamp) > 0
                        ? Number(topic.deletedTimestamp)
                        : null
            };
        });

        return result;
    }

}

module.exports = NodeBBTopicRepository;
