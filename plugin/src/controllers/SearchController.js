'use strict';

const BaseController = require('./BaseController');
const Container = require('../container');
const ContainerKeys = require('../constants/ContainerKeys');
const ApiMessages = require('../constants/ApiMessages');
const HttpStatus = require('../constants/HttpStatus');
const SearchValidator = require('../validators/SearchValidator');

class SearchController extends BaseController {

    /**
     * Get SearchService instance from DI Container
     * @returns {import('../services/SearchService')}
     */
    getSearchService() {
        return Container.get(ContainerKeys.SERVICES.SEARCH);
    }

    /**
     * GET /api/v1/search
     */
    async search(req, res, next) {
        const validatedQuery = SearchValidator.validateSearch(req.query);
        const uid = req.uid || 0;
        const service = this.getSearchService();

        const result = await service.search({
            ...validatedQuery,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.SEARCH_RESULTS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

}

module.exports = new SearchController();
