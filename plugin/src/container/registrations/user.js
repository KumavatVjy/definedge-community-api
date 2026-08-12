'use strict';

const ContainerKeys = require('../../constants/ContainerKeys');
const NodeBBUserRepository = require('../../repositories/NodeBBUserRepository');
const NodeBBPostRepository = require('../../repositories/NodeBBPostRepository');
const NodeBBTopicRepository = require('../../repositories/NodeBBTopicRepository');
const UserService = require('../../services/UserService');
const Logger = require('../../helpers/Logger');

/**
 * Register User module dependencies into DI Container
 * @param {import('../index')} container
 */
module.exports = function registerUserModule(container) {

    Logger.info('Registering User module dependencies...');

    const userRepository = new NodeBBUserRepository();
    const postRepository = new NodeBBPostRepository();
    const topicRepository = new NodeBBTopicRepository();

    const userService = new UserService(
        userRepository,
        postRepository,
        topicRepository
    );

    container.set(ContainerKeys.REPOSITORIES.USER, userRepository);
    container.set(ContainerKeys.SERVICES.USER, userService);

};
