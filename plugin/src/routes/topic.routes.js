'use strict';

const ApiRoutes = require('../constants/ApiRoutes');
const TopicController = require('../controllers/TopicController');
const AsyncHandler = require('../helpers/AsyncHandler');

module.exports = (router) => {

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
