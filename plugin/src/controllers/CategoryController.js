'use strict';

const BaseController = require('./BaseController');
const Container = require('../container');
const ContainerKeys = require('../constants/ContainerKeys');
const ApiMessages = require('../constants/ApiMessages');
const CategoryValidator = require('../validators/CategoryValidator');

class CategoryController extends BaseController {

    /**
     * Get CategoryService instance from DI container
     * @returns {import('../services/CategoryService')}
     */
    getCategoryService() {
        return Container.get(ContainerKeys.SERVICES.CATEGORY);
    }

    /**
     * GET /api/v1/categories
     */
    async getCategories(req, res, next) {
        const uid = req.uid || 0;
        const service = this.getCategoryService();
        const categories = await service.getCategories({ uid });

        return this.sendSuccess(res, ApiMessages.CATEGORIES_FETCHED, categories);
    }

    /**
     * GET /api/v1/categories/:cid
     */
    async getCategoryById(req, res, next) {
        const cid = CategoryValidator.validateCid(req.params.cid);
        const uid = req.uid || 0;
        const service = this.getCategoryService();
        const category = await service.getCategoryById(cid, { uid });

        return this.sendSuccess(res, ApiMessages.CATEGORY_DETAILS_FETCHED, category);
    }

    /**
     * GET /api/v1/categories/:cid/topics
     */
    async getCategoryTopics(req, res, next) {
        const cid = CategoryValidator.validateCid(req.params.cid);
        const pagination = CategoryValidator.validatePagination(req.query);
        const uid = req.uid || 0;
        const service = this.getCategoryService();

        const data = await service.getCategoryTopics(cid, {
            ...pagination,
            uid
        });

        return this.sendSuccess(res, ApiMessages.CATEGORY_TOPICS_FETCHED, data);
    }

    /**
     * GET /api/v1/categories/:cid/statistics
     */
    async getCategoryStatistics(req, res, next) {
        const cid = CategoryValidator.validateCid(req.params.cid);
        const service = this.getCategoryService();
        const stats = await service.getCategoryStats(cid);

        return this.sendSuccess(res, ApiMessages.CATEGORY_STATISTICS_FETCHED, stats);
    }

}

module.exports = new CategoryController();
