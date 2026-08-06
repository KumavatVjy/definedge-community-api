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

}

module.exports = NodeBBTopicRepository;
