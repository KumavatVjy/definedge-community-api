'use strict';

const BaseService = require('../base/BaseService');
const config = require('../config');

class HealthService extends BaseService {

    async getStatus() {

        const connected = await this.repository.ping();

        const ApiStatus = require('../constants/ApiStatus');

        return {
            plugin: config.PLUGIN_NAME,
            version: config.PLUGIN_VERSION,
            status: connected
                ? ApiStatus.HEALTHY
                : ApiStatus.UNHEALTHY
        };

    }

}

module.exports = HealthService;