'use strict';

const BaseController = require('./BaseController');
const Container = require('../container');
const ContainerKeys = require('../constants/ContainerKeys');
const ApiMessages = require('../constants/ApiMessages');

class HealthController extends BaseController {

    async health(req, res) {

        const healthService = Container.get(
            ContainerKeys.SERVICES.HEALTH
        );

        const result = await healthService.getStatus();

        return this.sendSuccess(
            res,
            ApiMessages.HEALTH_OK,
            result
        );

    }

}

module.exports = new HealthController();