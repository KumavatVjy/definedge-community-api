'use strict';

const ApiRoutes = require('../constants/ApiRoutes');
const HealthController = require('../controllers/HealthController');
const AsyncHandler = require('../helpers/AsyncHandler');

module.exports = (router) => {

    router.get(ApiRoutes.HEALTH, AsyncHandler((req, res, next) => HealthController.health(req, res, next)));

};

