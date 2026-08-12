'use strict';

const ContainerKeys = require('../../constants/ContainerKeys');
const NodeBBSearchRepository = require('../../repositories/NodeBBSearchRepository');
const NodeBBTopicRepository = require('../../repositories/NodeBBTopicRepository');
const NodeBBPostRepository = require('../../repositories/NodeBBPostRepository');
const NodeBBUserRepository = require('../../repositories/NodeBBUserRepository');
const SearchService = require('../../services/SearchService');

module.exports = function registerSearchModule(container) {

    const searchRepository = new NodeBBSearchRepository();
    const topicRepository = new NodeBBTopicRepository();
    const postRepository = new NodeBBPostRepository();
    const userRepository = new NodeBBUserRepository();

    const searchService = new SearchService(searchRepository, topicRepository, postRepository, userRepository);

    container.set(ContainerKeys.REPOSITORIES.SEARCH, searchRepository);
    container.set(ContainerKeys.SERVICES.SEARCH, searchService);

};
