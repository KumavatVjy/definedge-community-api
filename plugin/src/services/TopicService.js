'use strict';

const BaseService = require('../base/BaseService');
const NotFoundException = require('../exceptions/NotFoundException');
const ApiMessages = require('../constants/ApiMessages');
const TopicTransformer = require('../transformers/TopicTransformer');
const PostTransformer = require('../transformers/PostTransformer');

class TopicService extends BaseService {

    constructor(topicRepository) {
        super(topicRepository);
        this.topicRepository = topicRepository;
    }

    /**
     * Get latest topics list
     * @param {Object} options
     * @returns {Promise<Array>}
     */
    async latest(options = {}) {
        const topics = await this.topicRepository.findLatest(options);

        return TopicTransformer.collection(topics);
    }

    /**
     * Get popular topics list
     * @param {Object} options
     * @returns {Promise<Array>}
     */
    async popular(options = {}) {
        const topics = await this.topicRepository.findPopular(options);

        return TopicTransformer.collection(topics);
    }

    /**
     * Get single topic details by TID
     * @param {number|string} tid
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async getTopicById(tid, options = {}) {
        const topic = await this.topicRepository.findById(tid, options);
        if (!topic) {
            throw new NotFoundException(ApiMessages.TOPIC_NOT_FOUND);
        }

        return TopicTransformer.transform(topic);
    }

    /**
     * Get topic posts with pagination
     * @param {number|string} tid
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async getTopicPosts(tid, options = {}) {
        const topic = await this.topicRepository.findById(tid, options);
        if (!topic) {
            throw new NotFoundException(ApiMessages.TOPIC_NOT_FOUND);
        }

        const page = options.page || 1;
        const limit = options.limit || 20;

        const rawPosts = await this.topicRepository.findPosts(tid, {
            page,
            limit,
            uid: options.uid || 0
        });

        const posts = PostTransformer.collection(rawPosts);
        const total = topic.postcount || 0;
        const totalPages = Math.ceil(total / limit) || 1;

        return {
            tid: parseInt(tid, 10),
            posts,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasMore: page < totalPages
            }
        };
    }

}

module.exports = TopicService;
