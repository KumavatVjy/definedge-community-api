'use strict';

const BaseService = require('../base/BaseService');
const NotFoundException = require('../exceptions/NotFoundException');
const ApiMessages = require('../constants/ApiMessages');
const CategoryTransformer = require('../transformers/CategoryTransformer');
const TopicTransformer = require('../transformers/TopicTransformer');

class CategoryService extends BaseService {

    constructor(categoryRepository, postRepository = null, userRepository = null, topicRepository = null) {
        super(categoryRepository);
        this.categoryRepository = categoryRepository;
        this.postRepository = postRepository || new (require('../repositories/NodeBBPostRepository'))();
        this.userRepository = userRepository || new (require('../repositories/NodeBBUserRepository'))();
        this.topicRepository = topicRepository || new (require('../repositories/NodeBBTopicRepository'))();
    }

    /**
     * Reusable helper to enrich raw topics with batch moderation metadata (flags, bans, deletions)
     * @param {Array} rawTopics
     * @param {number} viewerUid
     * @returns {Promise<Array>}
     */
    async enrichTopicsWithModeration(rawTopics = [], viewerUid = 0) {
        if (!Array.isArray(rawTopics) || rawTopics.length === 0) {
            return [];
        }

        const mainPids = rawTopics.map(t => t && t.mainPid).filter(Boolean);
        const authorUids = [...new Set(rawTopics.map(t => t && (t.uid || (t.user && t.user.uid))).filter(Boolean))];
        const topicIds = rawTopics.map(t => t && t.tid).filter(Boolean);

        const [flagStatuses, banStatuses, deletionStatuses] = await Promise.all([
            mainPids.length > 0 && this.postRepository
                ? this.postRepository.getFlagStatuses(mainPids, viewerUid)
                : {},
            authorUids.length > 0 && this.userRepository
                ? this.userRepository.getBanStatuses(authorUids)
                : {},
            topicIds.length > 0 && this.topicRepository
                ? this.topicRepository.getDeletionStatuses(topicIds)
                : {}
        ]);

        return rawTopics.map(topic => {
            const flagStatus = flagStatuses[topic.mainPid] || {};
            const authorUid = topic.uid || (topic.user && topic.user.uid);
            const banStatus = banStatuses[authorUid] || {};
            const deletionStatus = deletionStatuses[topic.tid] || {
                deleted: Boolean(topic.deleted),
                deletedTimestamp: topic.deletedTimestamp || null
            };

            return {
                ...topic,
                deletion: deletionStatus,
                user: {
                    ...(topic.user || {}),
                    uid: authorUid,
                    moderation: banStatus
                },
                moderation: {
                    flagged: Boolean(flagStatus.flagged),
                    reportedByMe: Boolean(flagStatus.reportedByMe),
                    flagState: flagStatus.flagState || null
                }
            };
        });
    }

    /**
     * Get all categories list
     * @param {Object} options
     * @returns {Promise<Array>}
     */
    async getCategories(options = {}) {
        const rawCategories = await this.categoryRepository.findAll(options);
        return CategoryTransformer.collection(rawCategories);
    }

    /**
     * Get category details by CID with enriched embedded topics
     * @param {number|string} cid
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async getCategoryById(cid, options = {}) {
        const category = await this.categoryRepository.findById(cid, options);
        if (!category) {
            throw new NotFoundException(ApiMessages.CATEGORY_NOT_FOUND);
        }

        const viewerUid = options.uid || 0;
        const enrichedTopics = await this.enrichTopicsWithModeration(category.topics || [], viewerUid);

        return CategoryTransformer.transformDetails({
            ...category,
            topics: enrichedTopics
        });
    }

    /**
     * Get topics within a category with pagination and batch moderation metadata
     * @param {number|string} cid
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async getCategoryTopics(cid, options = {}) {
        const category = await this.categoryRepository.findById(cid, options);
        if (!category) {
            throw new NotFoundException(ApiMessages.CATEGORY_NOT_FOUND);
        }

        const page = options.page || 1;
        const limit = options.limit || 20;
        const sort = options.sort || 'newest_to_oldest';
        const viewerUid = options.uid || 0;

        const result = await this.categoryRepository.findTopics({
            cid,
            page,
            limit,
            sort,
            uid: viewerUid
        });

        const rawTopics = result.topics || [];
        const topicsWithModeration = await this.enrichTopicsWithModeration(rawTopics, viewerUid);

        const topics = TopicTransformer.collection(topicsWithModeration);
        const total = category.topic_count || 0;
        const totalPages = Math.ceil(total / limit) || 1;

        return {
            cid: parseInt(cid, 10),
            topics,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasMore: page < totalPages
            }
        };
    }

    /**
     * Get category statistics
     * @param {number|string} cid
     * @returns {Promise<Object>}
     */
    async getCategoryStats(cid) {
        const stats = await this.categoryRepository.findStats(cid);
        if (!stats) {
            throw new NotFoundException(ApiMessages.CATEGORY_NOT_FOUND);
        }

        return CategoryTransformer.transformStats(stats);
    }

}

module.exports = CategoryService;
