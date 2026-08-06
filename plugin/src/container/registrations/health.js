'use strict';

const ContainerKeys = require('../../constants/ContainerKeys');
const SystemRepository = require('../../repositories/SystemRepository');
const HealthService = require('../../services/HealthService');
const Logger = require('../../helpers/Logger');

/**
 * Register Health module dependencies into the DI container
 * @param {import('../index')} container
 */
module.exports = (container) => {

    Logger.info('Registering Health module dependencies...');

    const repository = new SystemRepository();

    const service = new HealthService(repository);

    container.set(ContainerKeys.REPOSITORIES.HEALTH, repository);

    container.set(ContainerKeys.SERVICES.HEALTH, service);

};
