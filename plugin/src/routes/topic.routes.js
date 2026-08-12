'use strict';

const ApiRoutes = require('../constants/ApiRoutes');
const TopicController = require('../controllers/TopicController');
const AsyncHandler = require('../helpers/AsyncHandler');

module.exports = (router) => {

    // POST /api/v1/topics (Create Topic)
    router.post(
        ApiRoutes.TOPICS_CREATE,
        AsyncHandler((req, res, next) => TopicController.createTopic(req, res, next))
    );

    // POST /api/v1/topics/:tid/reply (Reply to Topic)
    router.post(
        ApiRoutes.TOPIC_REPLY,
        AsyncHandler((req, res, next) => TopicController.reply(req, res, next))
    );

    // GET /api/v1/topics/latest
    router.get(
        ApiRoutes.TOPICS_LATEST,
        AsyncHandler((req, res, next) => TopicController.latest(req, res, next))
    );

    // GET /api/v1/topics/popular
    router.get(
        ApiRoutes.TOPICS_POPULAR,
        AsyncHandler((req, res, next) => TopicController.popular(req, res, next))
    );

    // POST /api/v1/topics/:tid/watch (Watch Topic)
    router.post(
        ApiRoutes.TOPIC_WATCH,
        AsyncHandler((req, res, next) => TopicController.watch(req, res, next))
    );

    // DELETE /api/v1/topics/:tid/watch (Unwatch Topic)
    router.delete(
        ApiRoutes.TOPIC_WATCH,
        AsyncHandler((req, res, next) => TopicController.unwatch(req, res, next))
    );

    // GET /api/v1/topics/:tid/watch (Get Topic Watch Status)
    router.get(
        ApiRoutes.TOPIC_WATCH,
        AsyncHandler((req, res, next) => TopicController.watchStatus(req, res, next))
    );

    // GET /api/v1/topics/:tid/posts (Must be registered before :tid)
    router.get(
        ApiRoutes.TOPIC_POSTS,
        AsyncHandler((req, res, next) => TopicController.getTopicPosts(req, res, next))
    );

    // GET /api/v1/topics/:tid
    router.get(
        ApiRoutes.TOPIC_DETAILS,
        AsyncHandler((req, res, next) => TopicController.getTopicById(req, res, next))
    );

};
