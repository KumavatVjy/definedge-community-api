'use strict';

const BaseRepository = require('../base/BaseRepository');

class NodeBBSearchRepository extends BaseRepository {

    constructor() {
        super();
        this.search = require.main.require('./src/search');
        this.topics = require.main.require('./src/topics');
        this.posts = require.main.require('./src/posts');
        this.db = require.main.require('./src/database');
    }

    /**
     * Search forum content using NodeBB search engine with fallback
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async searchContent(options = {}) {
        const query = options.query;
        const page = options.page || 1;
        const limit = options.limit || 20;
        const uid = options.uid || 0;
        const type = options.type || 'topics';

        let searchIn = 'titles';
        if (type === 'posts') {
            searchIn = 'posts';
        } else if (type === 'all') {
            searchIn = 'titlesposts';
        }

        try {
            const rawResult = await this.search.search({
                query,
                searchIn,
                uid,
                page,
                itemsPerPage: limit
            });

            const rawPosts = (rawResult && Array.isArray(rawResult.posts)) ? rawResult.posts : [];
            if (rawPosts.length > 0) {
                const matchCount = (rawResult && Number.isInteger(rawResult.matchCount)) ? rawResult.matchCount : rawPosts.length;
                const pageCount = (rawResult && Number.isInteger(rawResult.pageCount)) ? rawResult.pageCount : 1;

                return {
                    posts: rawPosts,
                    total: matchCount,
                    page,
                    limit,
                    totalPages: pageCount,
                    hasMore: page < pageCount
                };
            }
        } catch (err) {
            // Fall through to database scan fallback
        }

        // Fallback for environments where external search plugin is not initialized
        const searchLower = String(query || '').toLowerCase();
        const start = (page - 1) * limit;

        if (type === 'posts') {
            const pids = await this.db.getSortedSetRevRange('posts:pid', 0, 500);
            const postsData = await this.posts.getPostSummaryByPids(pids, uid, {});
            const matchedPosts = (postsData || []).filter(p => p && p.content && p.content.toLowerCase().includes(searchLower));
            const paginatedPosts = matchedPosts.slice(start, start + limit);
            const total = matchedPosts.length;
            const totalPages = Math.ceil(total / limit) || 1;

            return {
                posts: paginatedPosts,
                total,
                page,
                limit,
                totalPages,
                hasMore: page < totalPages
            };
        }

        // Topics fallback
        const recentData = await this.topics.getRecentTopics(null, uid, 0, 500);
        const topicsList = (recentData && Array.isArray(recentData.topics)) ? recentData.topics : [];
        const matchedTopics = topicsList.filter(t => t && t.title && t.title.toLowerCase().includes(searchLower));
        const paginatedTopics = matchedTopics.slice(start, start + limit);
        const total = matchedTopics.length;
        const totalPages = Math.ceil(total / limit) || 1;

        return {
            posts: paginatedTopics.map(t => ({ topic: t, pid: t.mainPid, tid: t.tid, uid: t.uid })),
            total,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages
        };
    }

}

module.exports = NodeBBSearchRepository;
