'use strict';

const BaseRepository = require('../base/BaseRepository');

class NodeBBCategoryRepository extends BaseRepository {

    constructor() {
        super();
        this.categories = require.main.require('./src/categories');
    }

    /**
     * Find all accessible categories for user
     * @param {Object} options
     * @param {number} options.uid
     * @returns {Promise<Array>}
     */
    async findAll(options = {}) {
        const uid = options.uid || 0;
        return await this.categories.getAllCategories(uid);
    }

    /**
     * Find single category data by CID
     * @param {number|string} cid
     * @param {Object} options
     * @param {number} options.uid
     * @returns {Promise<Object|null>}
     */
    async findById(cid, options = {}) {
        const numericCid = parseInt(cid, 10);
        const uid = options.uid || 0;

        return await this.categories.getCategoryById({
            cid: numericCid,
            uid,
            start: 0,
            stop: 0
        });
    }

    /**
     * Find category topics with pagination and sorting
     * @param {Object} options
     * @param {number|string} options.cid
     * @param {number} options.uid
     * @param {number} options.page
     * @param {number} options.limit
     * @param {string} options.sort
     * @returns {Promise<Object>}
     */
    async findTopics(options = {}) {
        const cid = parseInt(options.cid, 10);
        const uid = options.uid || 0;
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 20));
        const start = (page - 1) * limit;
        const stop = start + limit - 1;
        const sort = options.sort || 'newest_to_oldest';

        return await this.categories.getCategoryTopics({
            cid,
            uid,
            start,
            stop,
            sort
        });
    }

    /**
     * Find statistics for a category by CID
     * @param {number|string} cid
     * @returns {Promise<Object>}
     */
    async findStats(cid) {
        const numericCid = parseInt(cid, 10);
        const [data, activeUsers] = await Promise.all([
            this.categories.getCategoryData(numericCid),
            this.categories.getActiveUsers(numericCid)
        ]);

        if (!data || !data.cid) {
            return null;
        }

        return {
            categoryData: data,
            activeUsers: activeUsers || []
        };
    }

}

module.exports = NodeBBCategoryRepository;
