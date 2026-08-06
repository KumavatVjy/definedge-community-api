'use strict';

const healthRoutes = require('./health.routes');
const categoryRoutes = require('./category.routes');
const topicRoutes = require('./topic.routes');
const errorMiddleware = require('../middleware/ErrorMiddleware');

module.exports = (router) => {
    healthRoutes(router);
    categoryRoutes(router);
    topicRoutes(router);

    // Register global error middleware for API routes
    router.use(errorMiddleware);
};