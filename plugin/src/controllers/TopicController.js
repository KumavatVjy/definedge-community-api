'use strict';

const BaseController = require('./BaseController');
const Container = require('../container');
const ContainerKeys = require('../constants/ContainerKeys');
const ApiMessages = require('../constants/ApiMessages');
const HttpStatus = require('../constants/HttpStatus');
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
     * POST /api/v1/topics
     */
    async createTopic(req, res, next) {
        const payload = TopicValidator.validateCreate(req.body);
        const uid = req.uid || 0;
        const service = this.getTopicService();

        const result = await service.createTopic({
            ...payload,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.TOPIC_CREATED_SUCCESSFULLY,
            result,
            HttpStatus.CREATED
        );
    }

    /**
     * POST /api/v1/topics/:tid/reply
     */
    async reply(req, res, next) {
        const payload = TopicValidator.validateReply(req.params.tid, req.body);
        const uid = req.uid || 0;
        const service = this.getTopicService();

        const result = await service.replyToTopic({
            ...payload,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.TOPIC_REPLIED_SUCCESSFULLY,
            result,
            HttpStatus.CREATED
        );
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
            topics,
            HttpStatus.OK
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
            topics,
            HttpStatus.OK
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
            topic,
            HttpStatus.OK
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
            data,
            HttpStatus.OK
        );
    }

    /**
     * POST /api/v1/topics/:tid/watch
     */
    async watch(req, res, next) {
        const tid = TopicValidator.validateTid(req.params.tid);
        const uid = this.getUserId(req);
        const service = this.getTopicService();

        const result = await service.watchTopic(uid, tid);

        return this.sendSuccess(
            res,
            ApiMessages.TOPIC_WATCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * DELETE /api/v1/topics/:tid/watch
     */
    async unwatch(req, res, next) {
        const tid = TopicValidator.validateTid(req.params.tid);
        const uid = this.getUserId(req);
        const service = this.getTopicService();

        const result = await service.unwatchTopic(uid, tid);

        return this.sendSuccess(
            res,
            ApiMessages.TOPIC_UNWATCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/topics/:tid/watch
     */
    async watchStatus(req, res, next) {
        const tid = TopicValidator.validateTid(req.params.tid);
        const uid = this.getUserId(req);
        const service = this.getTopicService();

        const result = await service.getWatchStatus(uid, tid);

        return this.sendSuccess(
            res,
            ApiMessages.TOPIC_WATCH_STATUS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

}

module.exports = new TopicController();
