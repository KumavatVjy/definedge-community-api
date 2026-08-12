'use strict';

const config = require('../config');

module.exports = {

    HEALTH: `${config.API_PREFIX}/health`,

    SEARCH: `${config.API_PREFIX}/search`,

    CATEGORIES: `${config.API_PREFIX}/categories`,

    CATEGORY_DETAILS: `${config.API_PREFIX}/categories/:cid`,

    CATEGORY_TOPICS: `${config.API_PREFIX}/categories/:cid/topics`,

    CATEGORY_STATISTICS: `${config.API_PREFIX}/categories/:cid/statistics`,

    TOPICS_CREATE: `${config.API_PREFIX}/topics`,

    TOPICS_LATEST: `${config.API_PREFIX}/topics/latest`,

    TOPICS_POPULAR: `${config.API_PREFIX}/topics/popular`,

    TOPIC_DETAILS: `${config.API_PREFIX}/topics/:tid`,

    TOPIC_POSTS: `${config.API_PREFIX}/topics/:tid/posts`,

    TOPIC_REPLY: `${config.API_PREFIX}/topics/:tid/reply`,

    TOPIC_WATCH: `${config.API_PREFIX}/topics/:tid/watch`,

    POST_EDIT: `${config.API_PREFIX}/posts/:pid`,

    POST_DELETE: `${config.API_PREFIX}/posts/:pid`,

    POST_RESTORE: `${config.API_PREFIX}/posts/:pid/restore`,

    POST_LIKE: `${config.API_PREFIX}/posts/:pid/like`,

    POST_BOOKMARK: `${config.API_PREFIX}/posts/:pid/bookmark`,

    POST_FLAG: `${config.API_PREFIX}/posts/:pid/flag`,

    USER_ME: `${config.API_PREFIX}/users/me`,

    USER_PROFILE: `${config.API_PREFIX}/users/:uid`,

    USER_TOPICS: `${config.API_PREFIX}/users/:uid/topics`,

    USER_POSTS: `${config.API_PREFIX}/users/:uid/posts`,

    USER_FOLLOWERS: `${config.API_PREFIX}/users/:uid/followers`,

    USER_FOLLOWING: `${config.API_PREFIX}/users/:uid/following`,

    USER_STATISTICS: `${config.API_PREFIX}/users/:uid/statistics`,

    USER_ENGAGEMENT: `${config.API_PREFIX}/users/:uid/engagement`,

    USER_ACTIVITY: `${config.API_PREFIX}/users/:uid/activity`,

    USER_FOLLOW: `${config.API_PREFIX}/users/:uid/follow`,

};