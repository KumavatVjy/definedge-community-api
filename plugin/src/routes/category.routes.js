'use strict';

const ApiRoutes = require('../constants/ApiRoutes');
const CategoryController = require('../controllers/CategoryController');
const AsyncHandler = require('../helpers/AsyncHandler');

module.exports = (router) => {

    // GET /api/v1/categories
    router.get(
        ApiRoutes.CATEGORIES,
        AsyncHandler((req, res, next) => CategoryController.getCategories(req, res, next))
    );

    // GET /api/v1/categories/:cid/topics (Must be registered before :cid)
    router.get(
        ApiRoutes.CATEGORY_TOPICS,
        AsyncHandler((req, res, next) => CategoryController.getCategoryTopics(req, res, next))
    );

    // GET /api/v1/categories/:cid/statistics (Must be registered before :cid)
    router.get(
        ApiRoutes.CATEGORY_STATISTICS,
        AsyncHandler((req, res, next) => CategoryController.getCategoryStatistics(req, res, next))
    );

    // GET /api/v1/categories/:cid
    router.get(
        ApiRoutes.CATEGORY_DETAILS,
        AsyncHandler((req, res, next) => CategoryController.getCategoryById(req, res, next))
    );

};
