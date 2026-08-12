'use strict';

const ContainerKeys = require('../../constants/ContainerKeys');
const NodeBBPostRepository = require('../../repositories/NodeBBPostRepository');
const PostService = require('../../services/PostService');
const Logger = require('../../helpers/Logger');

/**
 * Register Post module dependencies into DI Container
 * @param {import('../index')} container
 */
module.exports = function registerPostModule(container) {

    Logger.info('Registering Post module dependencies...');

    const postRepository = new NodeBBPostRepository();
    const postService = new PostService(postRepository);

    container.set(ContainerKeys.REPOSITORIES.POST, postRepository);
    container.set(ContainerKeys.SERVICES.POST, postService);

};
