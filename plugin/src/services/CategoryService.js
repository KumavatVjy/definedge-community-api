'use strict';

const BaseService = require('../base/BaseService');
const NotFoundException = require('../exceptions/NotFoundException');
const ApiMessages = require('../constants/ApiMessages');
const CategoryTransformer = require('../transformers/CategoryTransformer');
const TopicTransformer = require('../transformers/TopicTransformer');

class CategoryService extends BaseService {

    constructor(categoryRepository) {
        super(categoryRepository);
        this.categoryRepository = categoryRepository;
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
     * Get category details by CID
     * @param {number|string} cid
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async getCategoryById(cid, options = {}) {
        const category = await this.categoryRepository.findById(cid, options);
        if (!category) {
            throw new NotFoundException(ApiMessages.CATEGORY_NOT_FOUND);
        }

        return CategoryTransformer.transformDetails(category);
    }

    /**
     * Get topics within a category with pagination
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

        const result = await this.categoryRepository.findTopics({
            cid,
            page,
            limit,
            sort,
            uid: options.uid || 0
        });

        const topics = TopicTransformer.collection(result.topics);
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
