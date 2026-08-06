'use strict';

const config = require('../config');

module.exports = {

    HEALTH: `${config.API_PREFIX}/health`,

    CATEGORIES: `${config.API_PREFIX}/categories`,

    CATEGORY_DETAILS: `${config.API_PREFIX}/categories/:cid`,

    CATEGORY_TOPICS: `${config.API_PREFIX}/categories/:cid/topics`,

    CATEGORY_STATISTICS: `${config.API_PREFIX}/categories/:cid/statistics`,

    TOPICS_LATEST: `${config.API_PREFIX}/topics/latest`,

    TOPICS_POPULAR: `${config.API_PREFIX}/topics/popular`,

    TOPIC_DETAILS: `${config.API_PREFIX}/topics/:tid`,

    TOPIC_POSTS: `${config.API_PREFIX}/topics/:tid/posts`,

};