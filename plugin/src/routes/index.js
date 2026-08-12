'use strict';

const authMiddleware = require('../middleware/AuthMiddleware');
const AsyncHandler = require('../helpers/AsyncHandler');
const healthRoutes = require('./health.routes');
const categoryRoutes = require('./category.routes');
const topicRoutes = require('./topic.routes');
const postRoutes = require('./post.routes');
const userRoutes = require('./user.routes');
const searchRoutes = require('./search.routes');
const errorMiddleware = require('../middleware/ErrorMiddleware');

module.exports = (router) => {
    // Register session auth normalization middleware for all API routes
    router.use(AsyncHandler(authMiddleware));

    healthRoutes(router);
    categoryRoutes(router);
    topicRoutes(router);
    postRoutes(router);
    userRoutes(router);
    searchRoutes(router);

    // Register global error middleware for API routes
    router.use(errorMiddleware);
};