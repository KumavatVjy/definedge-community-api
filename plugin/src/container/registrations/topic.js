'use strict';

const ContainerKeys = require('../../constants/ContainerKeys');
const NodeBBTopicRepository = require('../../repositories/NodeBBTopicRepository');
const TopicService = require('../../services/TopicService');
const Logger = require('../../helpers/Logger');

/**
 * Register Topic module dependencies into DI Container
 * @param {import('../index')} container
 */
module.exports = function registerTopicModule(container) {

    Logger.info('Registering Topic module dependencies...');

    const topicRepository = new NodeBBTopicRepository();

    const topicService = new TopicService(topicRepository);

    container.set(ContainerKeys.REPOSITORIES.TOPIC, topicRepository);

    container.set(ContainerKeys.SERVICES.TOPIC, topicService);

};
