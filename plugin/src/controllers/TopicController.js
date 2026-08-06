'use strict';

const BaseController = require('./BaseController');
const Container = require('../container');
const ContainerKeys = require('../constants/ContainerKeys');
const ApiMessages = require('../constants/ApiMessages');
const TopicValidator = require('../validators/TopicValidator');

class TopicController extends BaseController {

    /**
     * Get TopicService instance from DI Container
     * @returns {import('../services/TopicService')}
     */
    getTopicService() {
        return Container.get(ContainerKeys.SERVICES.TOPIC);
    }

    /**
     * GET /api/v1/topics/latest
     */
    async latest(req, res, next) {
        const query = TopicValidator.validateQuery(req.query);
        const uid = req.uid || 0;
        const service = this.getTopicService();
        const topics = await service.latest({ ...query, uid });

        return this.sendSuccess(
            res,
            ApiMessages.LATEST_TOPICS_FETCHED,
            topics
        );
    }

    /**
     * GET /api/v1/topics/popular
     */
    async popular(req, res, next) {
        const query = TopicValidator.validateQuery(req.query);
        const uid = req.uid || 0;
        const service = this.getTopicService();
        const topics = await service.popular({ ...query, uid });

        return this.sendSuccess(
            res,
            ApiMessages.POPULAR_TOPICS_FETCHED,
            topics
        );
    }

    /**
     * GET /api/v1/topics/:tid
     */
    async getTopicById(req, res, next) {
        const tid = TopicValidator.validateTid(req.params.tid);
        const uid = req.uid || 0;
        const service = this.getTopicService();
        const topic = await service.getTopicById(tid, { uid });

        return this.sendSuccess(
            res,
            ApiMessages.TOPIC_FETCHED,
            topic
        );
    }

    /**
     * GET /api/v1/topics/:tid/posts
     */
    async getTopicPosts(req, res, next) {
        const tid = TopicValidator.validateTid(req.params.tid);
        const query = TopicValidator.validateQuery(req.query);
        const uid = req.uid || 0;
        const service = this.getTopicService();

        const data = await service.getTopicPosts(tid, { ...query, uid });

        return this.sendSuccess(
            res,
            ApiMessages.TOPIC_POSTS_FETCHED,
            data
        );
    }

}

module.exports = new TopicController();
