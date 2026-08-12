'use strict';

module.exports = {

    SERVICES: {
        HEALTH: 'HealthService',
        CATEGORY: 'CategoryService',
        TOPIC: 'TopicService',
        POST: 'PostService',
        USER: 'UserService',
        SEARCH: 'SearchService'
    },

    REPOSITORIES: {
        HEALTH: 'SystemRepository',
        CATEGORY: 'NodeBBCategoryRepository',
        TOPIC: 'NodeBBTopicRepository',
        POST: 'NodeBBPostRepository',
        USER: 'NodeBBUserRepository',
        SEARCH: 'NodeBBSearchRepository'
    }

};