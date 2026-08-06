'use strict';

const ContainerKeys = require('../../constants/ContainerKeys');
const NodeBBCategoryRepository = require('../../repositories/NodeBBCategoryRepository');
const CategoryService = require('../../services/CategoryService');
const Logger = require('../../helpers/Logger');

/**
 * Register Category module dependencies into the DI container
 * @param {import('../index')} container
 */
module.exports = function registerCategoryModule(container) {

    Logger.info('Registering Category module dependencies...');

    const categoryRepository = new NodeBBCategoryRepository();

    const categoryService = new CategoryService(categoryRepository);

    container.set(ContainerKeys.REPOSITORIES.CATEGORY, categoryRepository);

    container.set(ContainerKeys.SERVICES.CATEGORY, categoryService);

};
