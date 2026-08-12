'use strict';

const ApiRoutes = require('../constants/ApiRoutes');
const SearchController = require('../controllers/SearchController');
const AsyncHandler = require('../helpers/AsyncHandler');

module.exports = (router) => {

    // GET /api/v1/search
    router.get(
        ApiRoutes.SEARCH,
        AsyncHandler((req, res, next) => SearchController.search(req, res, next))
    );

};
